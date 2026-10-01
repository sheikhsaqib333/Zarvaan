import { DEFAULT_SITE_CONFIG } from './src/types/siteConfig.ts';
import type { Product } from './src/types/clothing.ts';
import { PRODUCTS, INITIAL_REVIEWS } from './src/data/products.ts';

interface D1Result<T = unknown> {
  results?: T[];
  meta?: { changes?: number };
}

interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  all<T = unknown>(): Promise<D1Result<T>>;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<D1Result>;
}

interface D1Database {
  prepare(query: string): D1Statement;
  batch(statements: D1Statement[]): Promise<D1Result[]>;
}

interface StaticAssets {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  DB: D1Database;
  ASSETS: StaticAssets;
  ADMIN_PASSCODE?: string;
  ADMIN_SESSION_SECRET?: string;
  ALLOWED_ORIGINS?: string;
}

const publicCache = 'public, max-age=0, s-maxage=30, stale-while-revalidate=60';
const reviewCache = 'public, max-age=0, s-maxage=10, stale-while-revalidate=30';
const privateCache = 'private, no-store';
const uploadChunkSize = 32 * 1024;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function json(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(normalized + '='.repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function equalBytes(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left[index] ^ right[index];
  return difference === 0;
}

async function derivePasscodeHash(passcode: string, salt: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(passcode), 'PBKDF2', false, ['deriveBits']);
  const saltBuffer = new ArrayBuffer(salt.byteLength);
  new Uint8Array(saltBuffer).set(salt);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBuffer, iterations: 100_000 },
    key,
    256,
  );
  return new Uint8Array(bits);
}

async function savePasscode(db: D1Database, passcode: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasscodeHash(passcode, salt);
  await db.prepare('INSERT OR REPLACE INTO admin_auth (id, salt, password_hash) VALUES (1, ?, ?)')
    .bind(encodeBase64Url(salt), encodeBase64Url(hash))
    .run();
}

async function initializeStore(env: Env): Promise<void> {
  const initialState: Array<[string, unknown]> = [
    ['site_config', DEFAULT_SITE_CONFIG],
    ['products', PRODUCTS],
    ['reviews', INITIAL_REVIEWS],
    ['appointments', []],
  ];
  await env.DB.batch(initialState.map(([key, value]) =>
    env.DB.prepare('INSERT OR IGNORE INTO store_state (key, value) VALUES (?, ?)')
      .bind(key, JSON.stringify(value))));

  const auth = await env.DB.prepare('SELECT id FROM admin_auth WHERE id = 1').first();
  if (!auth && env.ADMIN_PASSCODE) await savePasscode(env.DB, env.ADMIN_PASSCODE);
}

async function signToken(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return `${payload}.${encodeBase64Url(new Uint8Array(signature))}`;
}

async function requireAdmin(request: Request, env: Env): Promise<boolean> {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra || !env.ADMIN_SESSION_SECRET) return false;

  try {
    const expected = await signToken(env.ADMIN_SESSION_SECRET, payload);
    const expectedSignature = decodeBase64Url(expected.split('.')[1]);
    const receivedSignature = decodeBase64Url(signature);
    const expiry = Number(decoder.decode(decodeBase64Url(payload)));
    return equalBytes(expectedSignature, receivedSignature) && Number.isFinite(expiry) && expiry > Date.now();
  } catch {
    return false;
  }
}

async function verifyPasscode(db: D1Database, passcode: string): Promise<boolean> {
  const record = await db.prepare('SELECT salt, password_hash FROM admin_auth WHERE id = 1')
    .first<{ salt: string; password_hash: string }>();
  if (!record) return false;
  try {
    const actual = await derivePasscodeHash(passcode, decodeBase64Url(record.salt));
    return equalBytes(actual, decodeBase64Url(record.password_hash));
  } catch {
    return false;
  }
}

async function rateLimit(env: Env, request: Request, scope: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const bucket = `${scope}:${ip}`;
  await env.DB.prepare(`
    INSERT INTO rate_limits (bucket, window_start, count) VALUES (?, ?, 1)
    ON CONFLICT(bucket) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start = excluded.window_start THEN rate_limits.count + 1 ELSE 1 END,
      window_start = excluded.window_start
  `).bind(bucket, windowStart).run();
  const row = await env.DB.prepare('SELECT count FROM rate_limits WHERE bucket = ?').bind(bucket)
    .first<{ count: number }>();
  return (row?.count ?? 0) <= limit;
}

async function readState<T>(db: D1Database, key: string, fallback: T): Promise<T> {
  const row = await db.prepare('SELECT value FROM store_state WHERE key = ?').bind(key)
    .first<{ value: string }>();
  if (!row?.value) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

async function writeState(db: D1Database, key: string, value: unknown): Promise<void> {
  await db.prepare('INSERT OR REPLACE INTO store_state (key, value) VALUES (?, ?)')
    .bind(key, JSON.stringify(value)).run();
}

async function storePayload(db: D1Database) {
  const config = await readState<typeof DEFAULT_SITE_CONFIG & { adminPasscode?: string }>(
    db,
    'site_config',
    DEFAULT_SITE_CONFIG,
  );
  const { adminPasscode: _privatePasscode, ...siteConfig } = config;
  return {
    siteConfig,
    products: await readState<Product[]>(db, 'products', PRODUCTS),
    reviews: await readState<unknown[]>(db, 'reviews', INITIAL_REVIEWS),
    appointments: await readState<unknown[]>(db, 'appointments', []),
  };
}

function escapeSql(value: string): string {
  return value.replace(/'/g, "''").replace(/\r/g, '');
}

function withCors(response: Response, request: Request, env: Env): Response {
  const requestOrigin = request.headers.get('Origin');
  if (!requestOrigin) return response;
  const allowed = requestOrigin === new URL(request.url).origin
    || (env.ALLOWED_ORIGINS ?? '').split(',').map((origin) => origin.trim()).includes(requestOrigin);
  if (!allowed) return response;

  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', requestOrigin);
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Visitor-Id');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  headers.append('Vary', 'Origin');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const admin = method !== 'OPTIONS' && await requireAdmin(request, env);

  if (path === '/api/health' && method === 'GET') return json({ ok: true, message: 'Zavraan backend is up.' });

  if (path === '/api/admin/login' && method === 'POST') {
    if (!await rateLimit(env, request, 'admin-login', 10, 15 * 60 * 1000)) {
      return json({ error: 'Too many login attempts. Try again later.' }, 429);
    }
    const body = await request.json().catch(() => ({})) as { passcode?: unknown };
    const passcode = typeof body.passcode === 'string' ? body.passcode : '';
    if (!passcode || !await verifyPasscode(env.DB, passcode)) {
      return json({ error: 'Incorrect admin passcode.' }, 401);
    }
    if (!env.ADMIN_SESSION_SECRET) return json({ error: 'Admin session is not configured.' }, 503);
    const payload = encodeBase64Url(encoder.encode(String(Date.now() + 12 * 60 * 60 * 1000)));
    return json({ token: await signToken(env.ADMIN_SESSION_SECRET, payload) });
  }

  if (path === '/api/admin/passcode' && method === 'PUT') {
    if (!admin) return json({ error: 'Admin authentication required.' }, 401);
    const body = await request.json().catch(() => ({})) as { passcode?: unknown };
    const passcode = typeof body.passcode === 'string' ? body.passcode.trim() : '';
    if (passcode.length < 8) return json({ error: 'Admin passcodes must be at least 8 characters.' }, 400);
    await savePasscode(env.DB, passcode);
    return json({ ok: true });
  }

  if (path === '/api/site-config' && method === 'GET') {
    const config = await readState<typeof DEFAULT_SITE_CONFIG & { adminPasscode?: string }>(env.DB, 'site_config', DEFAULT_SITE_CONFIG);
    const { adminPasscode: _privatePasscode, ...publicConfig } = config;
    return json(publicConfig, 200, { 'Cache-Control': publicCache });
  }
  if (path === '/api/site-config' && method === 'PUT') {
    if (!admin) return json({ error: 'Admin authentication required.' }, 401);
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const { adminPasscode: _privatePasscode, ...publicConfig } = body;
    await writeState(env.DB, 'site_config', publicConfig);
    return json(publicConfig);
  }

  if (path === '/api/products' && method === 'GET') {
    return json(await readState<Product[]>(env.DB, 'products', PRODUCTS), 200, { 'Cache-Control': publicCache });
  }
  if (path === '/api/products' && method === 'PUT') {
    if (!admin) return json({ error: 'Admin authentication required.' }, 401);
    const body = await request.json().catch(() => []);
    await writeState(env.DB, 'products', body);
    return json(body);
  }

  if (path === '/api/likes' && method === 'GET') {
    const result = await env.DB.prepare('SELECT product_id, COUNT(*) AS count FROM product_likes GROUP BY product_id').all<{ product_id: string; count: number }>();
    return json(Object.fromEntries((result.results ?? []).map((row) => [row.product_id, row.count])), 200, { 'Cache-Control': reviewCache });
  }
  const likeMatch = path.match(/^\/api\/products\/([^/]+)\/like$/);
  if (likeMatch && method === 'POST') {
    if (!await rateLimit(env, request, 'public-submit', 30, 60_000)) return json({ error: 'Submission rate limit exceeded. Try again shortly.' }, 429);
    const productId = decodeURIComponent(likeMatch[1]);
    const visitorId = request.headers.get('X-Visitor-Id') ?? '';
    if (!/^[a-zA-Z0-9_-]{16,80}$/.test(visitorId)) return json({ error: 'A valid visitor id is required.' }, 400);
    const products = await readState<Product[]>(env.DB, 'products', PRODUCTS);
    if (!products.some((product) => product.id === productId)) return json({ error: 'Product not found.' }, 404);
    const inserted = await env.DB.prepare('INSERT OR IGNORE INTO product_likes (product_id, visitor_id, created_at) VALUES (?, ?, ?)')
      .bind(productId, visitorId, Date.now()).run();
    const liked = (inserted.meta?.changes ?? 0) > 0;
    if (!liked) {
      await env.DB.prepare('DELETE FROM product_likes WHERE product_id = ? AND visitor_id = ?').bind(productId, visitorId).run();
    }
    const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM product_likes WHERE product_id = ?').bind(productId)
      .first<{ count: number }>();
    return json({ count: count?.count ?? 0, liked });
  }

  if (path === '/api/reviews' && method === 'GET') {
    return json(await readState<unknown[]>(env.DB, 'reviews', INITIAL_REVIEWS), 200, { 'Cache-Control': reviewCache });
  }
  if (path === '/api/reviews' && method === 'POST') {
    if (!await rateLimit(env, request, 'public-submit', 30, 60_000)) return json({ error: 'Submission rate limit exceeded. Try again shortly.' }, 429);
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const review = {
      ...body,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    const reviews = await readState<unknown[]>(env.DB, 'reviews', INITIAL_REVIEWS);
    await writeState(env.DB, 'reviews', [review, ...reviews]);
    return json(review, 201);
  }
  if (path === '/api/reviews' && method === 'PUT') {
    if (!admin) return json({ error: 'Admin authentication required.' }, 401);
    const body = await request.json().catch(() => []);
    await writeState(env.DB, 'reviews', body);
    return json(body);
  }

  if (path === '/api/appointments' && method === 'GET') {
    if (!admin) return json({ error: 'Admin authentication required.' }, 401);
    return json(await readState<unknown[]>(env.DB, 'appointments', []), 200, { 'Cache-Control': privateCache });
  }
  if (path === '/api/appointments' && method === 'POST') {
    if (!await rateLimit(env, request, 'public-submit', 30, 60_000)) return json({ error: 'Submission rate limit exceeded. Try again shortly.' }, 429);
    const appointment = await request.json().catch(() => ({}));
    const appointments = await readState<unknown[]>(env.DB, 'appointments', []);
    await writeState(env.DB, 'appointments', [appointment, ...appointments]);
    return json(appointment, 201);
  }
  if (path === '/api/appointments' && method === 'PUT') {
    if (!admin) return json({ error: 'Admin authentication required.' }, 401);
    const body = await request.json().catch(() => []);
    await writeState(env.DB, 'appointments', body);
    return json(body);
  }

  if (path === '/api/export' && method === 'GET') {
    if (!admin) return json({ error: 'Admin authentication required.' }, 401);
    return json(await storePayload(env.DB));
  }
  if (path === '/api/import' && method === 'POST') {
    if (!admin) return json({ error: 'Admin authentication required.' }, 401);
    const payload = await request.json().catch(() => ({})) as Record<string, unknown>;
    const { adminPasscode: _privatePasscode, ...siteConfig } = (payload.siteConfig ?? DEFAULT_SITE_CONFIG) as Record<string, unknown>;
    const values: Array<[string, unknown]> = [
      ['site_config', siteConfig],
      ['products', payload.products ?? PRODUCTS],
      ['reviews', payload.reviews ?? INITIAL_REVIEWS],
      ['appointments', payload.appointments ?? []],
    ];
    await env.DB.batch(values.map(([key, value]) =>
      env.DB.prepare('INSERT OR REPLACE INTO store_state (key, value) VALUES (?, ?)').bind(key, JSON.stringify(value))));
    return json({ ok: true });
  }

  if (path === '/api/upload' && method === 'POST') {
    if (!admin) return json({ error: 'Admin authentication required.' }, 401);
    if (!await rateLimit(env, request, 'upload', 20, 60_000)) return json({ error: 'Upload rate limit exceeded. Try again shortly.' }, 429);
    const form = await request.formData().catch(() => null);
    const file = form?.get('file');
    if (!(file instanceof File) || file.size > 10 * 1024 * 1024) {
      return json({ error: 'Image upload failed or exceeds the 10 MB limit.' }, 400);
    }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    await env.DB.prepare('INSERT INTO upload_files (id, content_type, original_name, size) VALUES (?, ?, ?, ?)')
      .bind(key, file.type || 'application/octet-stream', safeName, file.size)
      .run();
    const chunks = [];
    for (let offset = 0, partIndex = 0; offset < bytes.length; offset += uploadChunkSize, partIndex += 1) {
      chunks.push(env.DB.prepare('INSERT INTO upload_chunks (file_id, part_index, content) VALUES (?, ?, ?)')
        .bind(key, partIndex, bytes.slice(offset, offset + uploadChunkSize)));
    }
    if (chunks.length) await env.DB.batch(chunks);
    return json({ url: `${new URL(request.url).origin}/uploads/${encodeURIComponent(key)}`, filename: key });
  }

  if (path === '/api/migration/firebase' && method === 'GET') {
    if (!admin) return json({ error: 'Admin authentication required.' }, 401);
    return json({ firebase: await storePayload(env.DB) });
  }
  if (path === '/api/migration/sql' && method === 'GET') {
    if (!admin) return json({ error: 'Admin authentication required.' }, 401);
    const payload = await storePayload(env.DB);
    const sql = Object.entries(payload).map(([key, value]) =>
      `INSERT OR REPLACE INTO store_state (key, value) VALUES ('${key}', '${escapeSql(JSON.stringify(value))}');`).join('\n');
    return json({ sql: `BEGIN;\n${sql}\nCOMMIT;` });
  }

  return json({ error: 'Not found.' }, 404);
}

async function handleUpload(request: Request, env: Env): Promise<Response> {
  const key = decodeURIComponent(new URL(request.url).pathname.slice('/uploads/'.length));
  if (!key || key.includes('/') || key.includes('..')) return new Response('Not found.', { status: 404 });
  const file = await env.DB.prepare('SELECT content_type, size FROM upload_files WHERE id = ?')
    .bind(key)
    .first<{ content_type: string; size: number }>();
  if (!file) return new Response('Not found.', { status: 404 });
  const result = await env.DB.prepare('SELECT part_index, content FROM upload_chunks WHERE file_id = ? ORDER BY part_index')
    .bind(key)
    .all<{ part_index: number; content: ArrayBuffer | Uint8Array }>();
  const bytes = new Uint8Array(file.size);
  for (const part of result.results ?? []) {
    const content = part.content instanceof Uint8Array ? part.content : new Uint8Array(part.content);
    bytes.set(content, part.part_index * uploadChunkSize);
  }
  const headers = new Headers({
    'Cache-Control': 'public, max-age=31536000, immutable',
    ETag: `"${key}"`,
    'Content-Type': file.content_type,
  });
  return new Response(request.method === 'HEAD' ? null : bytes, { headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }), request, env);
    }

    try {
      if (url.pathname === '/api/health' && request.method === 'GET') {
        return withCors(json({ ok: true, message: 'Zavraan backend is up.' }), request, env);
      }
      if (url.pathname.startsWith('/api/')) {
        if (request.method !== 'GET' && Number(request.headers.get('Content-Length') ?? 0) > 11 * 1024 * 1024) {
          return withCors(json({ error: 'Request body is too large.' }, 413), request, env);
        }
        await initializeStore(env);
        return withCors(await handleApi(request, env), request, env);
      }
      if (url.pathname.startsWith('/uploads/')) return handleUpload(request, env);
      return env.ASSETS.fetch(request);
    } catch (error) {
      console.error('Cloudflare Worker request failed:', error);
      return withCors(json({ error: 'The store service is temporarily unavailable.' }, 500), request, env);
    }
  },
};