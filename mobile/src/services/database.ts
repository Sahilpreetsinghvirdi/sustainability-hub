// mobile/src/services/database.ts
import * as SQLite from 'expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite/legacy';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import * as schema from './schema';
import { initSchema } from './migrations';

// Database instance
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
let rawDb: SQLite.SQLiteDatabase | null = null;

export function getDatabase() {
  if (!dbInstance) {
    rawDb = openDatabaseSync('sustainability.db');
    dbInstance = drizzle(rawDb, { schema });
    // Run migrations
    initSchema(rawDb);
  }
  return dbInstance;
}

export function getRawDatabase() {
  if (!rawDb) {
    rawDb = openDatabaseSync('sustainability.db');
    initSchema(rawDb);
  }
  return rawDb;
}

export function closeDatabase() {
  if (rawDb) {
    rawDb.closeSync();
    rawDb = null;
    dbInstance = null;
  }
}

// Transaction helper
export async function withTransaction<T>(
  fn: (tx: ReturnType<typeof drizzle<typeof schema>>) => Promise<T>
): Promise<T> {
  const db = getDatabase();
  // Note: expo-sqlite doesn't support true transactions in drizzle yet
  // Use raw DB for transactions
  const raw = getRawDatabase();
  return raw.withTransactionSync(() => fn(db));
}

// Batch operations
export function batchInsert<T>(
  table: string,
  rows: Record<string, unknown>[],
  conflictColumns?: string[]
): void {
  const raw = getRawDatabase();
  if (rows.length === 0) return;
  
  const columns = Object.keys(rows[0]);
  const placeholders = columns.map(() => '?').join(', ');
  const columnNames = columns.join(', ');
  
  let sql = `INSERT OR ${conflictColumns ? `IGNORE` : 'REPLACE'} INTO ${table} (${columnNames}) VALUES (${placeholders})`;
  
  if (conflictColumns && conflictColumns.length > 0) {
    const updateCols = columns.filter(c => !conflictColumns.includes(c));
    if (updateCols.length > 0) {
      const updates = updateCols.map(c => `${c} = excluded.${c}`).join(', ');
      sql = `INSERT INTO ${table} (${columnNames}) VALUES (${placeholders}) 
             ON CONFLICT(${conflictColumns.join(', ')}) DO UPDATE SET ${updates}`;
    }
  }
  
  const stmt = raw.prepareSync(sql);
  try {
    for (const row of rows) {
      const values = columns.map(col => row[col]);
      stmt.executeSync(values);
    }
  } finally {
    stmt.finalizeSync();
  }
}

// Query helpers
export function queryFirst<T>(sql: string, params: unknown[] = []): T | null {
  const raw = getRawDatabase();
  const stmt = raw.prepareSync(sql);
  try {
    const result = stmt.getSync(params) as T | null;
    return result;
  } finally {
    stmt.finalizeSync();
  }
}

export function queryAll<T>(sql: string, params: unknown[] = []): T[] {
  const raw = getRawDatabase();
  const stmt = raw.prepareSync(sql);
  try {
    return stmt.getAllSync(params) as T[];
  } finally {
    stmt.finalizeSync();
  }
}

export function executeSync(sql: string, params: unknown[] = []): void {
  const raw = getRawDatabase();
  raw.execSync(sql);
}

// Sync queue operations
export interface SyncQueueItem {
  id: number;
  table_name: string;
  record_id: string;
  operation: 'insert' | 'update' | 'delete';
  payload_json: string | null;
  created_at: string;
  retries: number;
  last_error: string | null;
}

export function enqueueSync(
  tableName: string,
  recordId: string,
  operation: 'insert' | 'update' | 'delete',
  payload?: Record<string, unknown>
): void {
  const raw = getRawDatabase();
  const stmt = raw.prepareSync(
    `INSERT INTO sync_queue (table_name, record_id, operation, payload_json) VALUES (?, ?, ?, ?)`
  );
  try {
    stmt.executeSync([tableName, recordId, operation, payload ? JSON.stringify(payload) : null]);
  } finally {
    stmt.finalizeSync();
  }
}

export function getPendingSync(limit = 100): SyncQueueItem[] {
  return queryAll<SyncQueueItem>(
    `SELECT * FROM sync_queue WHERE retries < 5 ORDER BY created_at ASC LIMIT ?`,
    [limit]
  );
}

export function markSyncSuccess(id: number): void {
  const raw = getRawDatabase();
  raw.execSync(`DELETE FROM sync_queue WHERE id = ${id}`);
}

export function markSyncFailed(id: number, error: string): void {
  const raw = getRawDatabase();
  raw.execSync(`UPDATE sync_queue SET retries = retries + 1, last_error = '${error.replace(/'/g, "''")}' WHERE id = ${id}`);
}

// App metadata
export function setMetadata(key: string, value: unknown): void {
  const raw = getRawDatabase();
  raw.execSync(
    `INSERT OR REPLACE INTO app_metadata (key, value_json, updated_at) VALUES (?, ?, datetime('now'))`,
    [key, JSON.stringify(value)]
  );
}

export function getMetadata<T>(key: string, defaultValue: T): T {
  const raw = getRawDatabase();
  const stmt = raw.prepareSync(`SELECT value_json FROM app_metadata WHERE key = ?`);
  try {
    const row = stmt.getSync([key]) as { value_json: string } | null;
    return row ? JSON.parse(row.value_json) : defaultValue;
  } finally {
    stmt.finalizeSync();
  }
}
