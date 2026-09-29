import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

import { DEFAULT_SITE_CONFIG } from './src/types/siteConfig.ts';
import { PRODUCTS, INITIAL_REVIEWS } from './src/data/products.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = process.env.STORE_DATA_DIR
  ? path.resolve(process.env.STORE_DATA_DIR)
  : path.join(__dirname, 'data');
const uploadsDir = process.env.STORE_DATA_DIR
  ? path.join(dataDir, 'uploads')
  : path.join(__dirname, 'uploads');

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

const db = new Database(path.join(dataDir, 'store.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS site_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS admin_auth (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    salt TEXT NOT NULL,
    password_hash TEXT NOT NULL
  );
`);

if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSCODE) {
  throw new Error('ADMIN_PASSCODE must be set in production.');
}

const sessionSecret = process.env.ADMIN_SESSION_SECRET || randomBytes(32).toString('hex');
if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_SESSION_SECRET) {
  throw new Error('ADMIN_SESSION_SECRET must be set in production.');
}

const hashPasscode = (passcode: string, salt: string) =>
  scryptSync(passcode, salt, 64).toString('hex');

const saveAdminPasscode = (passcode: string) => {
  const salt = randomBytes(16).toString('hex');
  db.prepare('INSERT OR REPLACE INTO admin_auth (id, salt, password_hash) VALUES (1, ?, ?)')
    .run(salt, hashPasscode(passcode, salt));
};

const readLegacyAdminPasscode = (): string | null => {
  const row = db.prepare('SELECT data FROM site_config WHERE id = 1').get() as { data?: string } | undefined;
  if (!row?.data) {
    return null;
  }

  try {
    const config = JSON.parse(row.data) as { adminPasscode?: unknown };
    return typeof config.adminPasscode === 'string' && config.adminPasscode
      ? config.adminPasscode
      : null;
  } catch {
    return null;
  }
};

const ensureSeed = () => {
  const tables = [
    ['site_config', JSON.stringify(DEFAULT_SITE_CONFIG)],
    ['products', JSON.stringify(PRODUCTS)],
    ['reviews', JSON.stringify(INITIAL_REVIEWS)],
    ['appointments', JSON.stringify([])],
  ] as const;

  for (const [tableName, payload] of tables) {
    const existing = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get() as { count: number };
    if (existing.count === 0) {
      db.prepare(`INSERT INTO ${tableName} (id, data) VALUES (1, ?)`).run(payload);
    }
  }
};

ensureSeed();

const adminAuthRecord = db.prepare('SELECT salt, password_hash FROM admin_auth WHERE id = 1').get() as
  | { salt: string; password_hash: string }
  | undefined;
if (!adminAuthRecord) {
  const legacyConfig = readLegacyAdminPasscode();
  const bootstrapPasscode = process.env.ADMIN_PASSCODE || legacyConfig || randomBytes(18).toString('base64url');
  saveAdminPasscode(bootstrapPasscode);
  if (!process.env.ADMIN_PASSCODE && !legacyConfig) {
    console.log(`Generated local admin passcode: ${bootstrapPasscode}`);
  }
}

const app = express();
const port = Number(process.env.PORT ?? 4000);
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const publicBackendUrl = process.env.PUBLIC_BACKEND_URL?.replace(/\/+$/, '');

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin is not allowed by CORS.'));
  },
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '20mb' }));
app.use('/uploads', express.static(uploadsDir));

const issueAdminToken = () => {
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
  const payload = Buffer.from(String(expiresAt)).toString('base64url');
  const signature = createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
};

const requireAdmin: express.RequestHandler = (req, res, next) => {
  const [payload, signature, extra] = (req.header('Authorization') ?? '')
    .replace(/^Bearer\s+/i, '')
    .split('.');
  if (!payload || !signature || extra) {
    res.status(401).json({ error: 'Admin authentication required.' });
    return;
  }

  const expectedSignature = createHmac('sha256', sessionSecret).update(payload).digest();
  const receivedSignature = Buffer.from(signature, 'base64url');
  const expiresAt = Number(Buffer.from(payload, 'base64url').toString());
  if (
    receivedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(receivedSignature, expectedSignature) ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Date.now()
  ) {
    res.status(401).json({ error: 'Admin session is invalid or expired.' });
    return;
  }

  next();
};

const verifyAdminPasscode = (passcode: string) => {
  const record = db.prepare('SELECT salt, password_hash FROM admin_auth WHERE id = 1').get() as
    | { salt: string; password_hash: string }
    | undefined;
  if (!record) {
    return false;
  }

  const expected = Buffer.from(record.password_hash, 'hex');
  const supplied = Buffer.from(hashPasscode(passcode, record.salt), 'hex');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
};

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadsDir),
  filename: (_req, file, callback) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueName = `${Date.now()}-${Math.random().toString(16).slice(2)}-${safeName}`;
    callback(null, uniqueName);
  },
});

const upload = multer({ storage });

const readTable = <T>(tableName: string, fallback: T): T => {
  const row = db.prepare(`SELECT data FROM ${tableName} WHERE id = 1`).get() as { data?: string } | undefined;
  if (!row?.data) {
    return fallback;
  }

  try {
    return JSON.parse(row.data) as T;
  } catch {
    return fallback;
  }
};

app.post('/api/admin/login', (req, res) => {
  const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode : '';
  if (!passcode || !verifyAdminPasscode(passcode)) {
    res.status(401).json({ error: 'Incorrect admin passcode.' });
    return;
  }
  res.json({ token: issueAdminToken() });
});

app.put('/api/admin/passcode', requireAdmin, (req, res) => {
  const passcode = typeof req.body?.passcode === 'string' ? req.body.passcode.trim() : '';
  if (passcode.length < 8) {
    res.status(400).json({ error: 'Admin passcodes must be at least 8 characters.' });
    return;
  }
  saveAdminPasscode(passcode);
  res.json({ ok: true });
});

const writeTable = (tableName: string, value: unknown) => {
  db.prepare(`UPDATE ${tableName} SET data = ? WHERE id = 1`).run(JSON.stringify(value));
};

const getStorePayload = () => ({
  siteConfig: (() => {
    const config = readTable('site_config', DEFAULT_SITE_CONFIG) as typeof DEFAULT_SITE_CONFIG & {
      adminPasscode?: string;
    };
    const { adminPasscode: _privatePasscode, ...publicConfig } = config;
    return publicConfig;
  })(),
  products: readTable('products', PRODUCTS),
  reviews: readTable('reviews', INITIAL_REVIEWS),
  appointments: readTable('appointments', []),
});

const escapeSqlValue = (value: string) =>
  value
    .replace(/'/g, "''")
    .replace(/\r/g, '');

const generateSqlMigration = () => {
  const payload = getStorePayload();
  const siteConfigSql = `INSERT OR REPLACE INTO site_config (id, data) VALUES (1, '${escapeSqlValue(JSON.stringify(payload.siteConfig))}');`;
  const productsSql = `INSERT OR REPLACE INTO products (id, data) VALUES (1, '${escapeSqlValue(JSON.stringify(payload.products))}');`;
  const reviewsSql = `INSERT OR REPLACE INTO reviews (id, data) VALUES (1, '${escapeSqlValue(JSON.stringify(payload.reviews))}');`;
  const appointmentsSql = `INSERT OR REPLACE INTO appointments (id, data) VALUES (1, '${escapeSqlValue(JSON.stringify(payload.appointments))}');`;

  return `-- Zavraan SQLite migration\nBEGIN;\nCREATE TABLE IF NOT EXISTS site_config (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL);\nCREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL);\nCREATE TABLE IF NOT EXISTS reviews (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL);\nCREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL);\n${siteConfigSql}\n${productsSql}\n${reviewsSql}\n${appointmentsSql}\nCOMMIT;`;
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Zavraan backend is up.' });
});

app.get('/api/site-config', (_req, res) => {
  const config = readTable('site_config', DEFAULT_SITE_CONFIG) as typeof DEFAULT_SITE_CONFIG & {
    adminPasscode?: string;
  };
  const { adminPasscode: _privatePasscode, ...publicConfig } = config;
  res.json(publicConfig);
});

app.put('/api/site-config', requireAdmin, (req, res) => {
  const { adminPasscode: _privatePasscode, ...publicConfig } = req.body ?? {};
  writeTable('site_config', publicConfig);
  res.json(publicConfig);
});

app.get('/api/products', (_req, res) => {
  res.json(readTable('products', PRODUCTS));
});

app.put('/api/products', requireAdmin, (req, res) => {
  writeTable('products', req.body);
  res.json(req.body);
});

app.get('/api/reviews', (_req, res) => {
  res.json(readTable('reviews', INITIAL_REVIEWS));
});

app.post('/api/reviews', (req, res) => {
  const review = {
    ...req.body,
    id: `rev-${Date.now()}`,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  };
  const reviews = readTable('reviews', INITIAL_REVIEWS);
  writeTable('reviews', [review, ...reviews]);
  res.status(201).json(review);
});

app.put('/api/reviews', requireAdmin, (req, res) => {
  writeTable('reviews', req.body);
  res.json(req.body);
});

app.get('/api/appointments', (_req, res) => {
  res.json(readTable('appointments', []));
});

app.post('/api/appointments', (req, res) => {
  const appointments = readTable('appointments', [] as unknown[]);
  writeTable('appointments', [req.body, ...appointments]);
  res.status(201).json(req.body);
});

app.put('/api/appointments', requireAdmin, (req, res) => {
  writeTable('appointments', req.body);
  res.json(req.body);
});

app.get('/api/export', requireAdmin, (_req, res) => {
  res.json(getStorePayload());
});

app.post('/api/import', requireAdmin, (req, res) => {
  const payload = req.body ?? {};
  const { adminPasscode: _privatePasscode, ...siteConfig } = payload.siteConfig ?? DEFAULT_SITE_CONFIG;
  const products = payload.products ?? PRODUCTS;
  const reviews = payload.reviews ?? INITIAL_REVIEWS;
  const appointments = payload.appointments ?? [];

  writeTable('site_config', siteConfig);
  writeTable('products', products);
  writeTable('reviews', reviews);
  writeTable('appointments', appointments);

  res.json({ ok: true });
});

app.post('/api/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  return res.json({
    url: publicBackendUrl
      ? `${publicBackendUrl}/uploads/${req.file.filename}`
      : `/uploads/${req.file.filename}`,
    filename: req.file.filename,
  });
});

app.get('/api/migration/sql', requireAdmin, (_req, res) => {
  res.json({ sql: generateSqlMigration() });
});

app.get('/api/migration/firebase', requireAdmin, (_req, res) => {
  res.json({ firebase: getStorePayload() });
});

app.listen(port, () => {
  console.log(`Zavraan backend running on http://localhost:${port}`);
});
