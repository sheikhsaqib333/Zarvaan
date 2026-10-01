import Database from 'better-sqlite3';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const databasePath = path.join(projectRoot, 'data', 'store.db');
const uploadsPath = path.join(projectRoot, 'uploads');
const wranglerPath = path.join(projectRoot, 'node_modules', 'wrangler', 'bin', 'wrangler.js');
const chunkSize = 32 * 1024;
const statementsPerFile = 4;

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''").replace(/\r/g, '')}'`;
}

function insertState(key: string, value: string): string {
  return `INSERT OR REPLACE INTO store_state (key, value) VALUES (${sqlString(key)}, ${sqlString(value)});`;
}

function contentType(filename: string): string {
  const extension = path.extname(filename).toLowerCase();
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.gif') return 'image/gif';
  return 'application/octet-stream';
}

async function applySqlFiles(statements: string[], tempPath: string): Promise<void> {
  for (let start = 0; start < statements.length; start += statementsPerFile) {
    const filename = path.join(tempPath, `batch-${start / statementsPerFile}.sql`);
    await writeFile(filename, statements.slice(start, start + statementsPerFile).join('\n'), 'utf8');
    const result = spawnSync(process.execPath, [
      wranglerPath,
      'd1',
      'execute',
      'zarvaan-store',
      '--remote',
      `--file=${filename}`,
    ], {
      cwd: projectRoot,
      stdio: 'inherit',
      windowsHide: true,
      env: { ...process.env, CI: 'true' },
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Wrangler failed while applying SQL batch ${start / statementsPerFile}.`);
  }
}

async function main(): Promise<void> {
  if (!fs.existsSync(databasePath)) throw new Error(`Local database not found at ${databasePath}.`);
  if (!fs.existsSync(wranglerPath)) throw new Error('Wrangler CLI entry point is missing; reinstall dependencies first.');

  const database = new Database(databasePath, { readonly: true, fileMustExist: true });
  const tempPath = await mkdtemp(path.join(tmpdir(), 'zarvaan-d1-migration-'));
  try {
    const statements: string[] = [];
    for (const table of ['site_config', 'products', 'reviews', 'appointments']) {
      const row = database.prepare(`SELECT data FROM ${table} WHERE id = 1`).get() as { data?: string } | undefined;
      if (!row?.data) continue;
      if (table === 'site_config') {
        const config = JSON.parse(row.data) as Record<string, unknown>;
        delete config.adminPasscode;
        statements.push(insertState(table, JSON.stringify(config)));
      } else {
        statements.push(insertState(table, row.data));
      }
    }

    const likes = database.prepare('SELECT product_id, visitor_id, created_at FROM product_likes').all() as Array<{
      product_id: string;
      visitor_id: string;
      created_at: number;
    }>;
    for (let start = 0; start < likes.length; start += 100) {
      const values = likes.slice(start, start + 100).map((like) =>
        `(${sqlString(like.product_id)}, ${sqlString(like.visitor_id)}, ${Number(like.created_at)})`);
      statements.push(`INSERT OR IGNORE INTO product_likes (product_id, visitor_id, created_at) VALUES ${values.join(', ')};`);
    }

    const uploadedFiles = (await readdir(uploadsPath, { withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
    for (const filename of uploadedFiles) {
      const bytes = await readFile(path.join(uploadsPath, filename));
      if (bytes.byteLength > 10 * 1024 * 1024) throw new Error(`Upload exceeds 10 MB: ${filename}`);
      statements.push(
        `INSERT OR REPLACE INTO upload_files (id, content_type, original_name, size) VALUES (${sqlString(filename)}, ${sqlString(contentType(filename))}, ${sqlString(filename)}, ${bytes.byteLength});`,
      );
      for (let offset = 0, partIndex = 0; offset < bytes.length; offset += chunkSize, partIndex += 1) {
        const hex = bytes.subarray(offset, offset + chunkSize).toString('hex');
        statements.push(
          `INSERT OR REPLACE INTO upload_chunks (file_id, part_index, content) VALUES (${sqlString(filename)}, ${partIndex}, X'${hex}');`,
        );
      }
    }

    console.log(`Migrating ${likes.length} likes and ${uploadedFiles.length} uploaded files; store records remain private.`);
    await applySqlFiles(statements, tempPath);
    console.log('Local store data and uploads were copied to Cloudflare D1.');
  } finally {
    database.close();
    await rm(tempPath, { recursive: true, force: true });
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Local store migration failed.');
  process.exitCode = 1;
});