import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { PROGRESSION_DB_PATH, DATA_DIR } from './connection.js';

// Player save data — separate from evidence, so reseeding evidence never
// wipes progress. schema_version future-proofs migrations.
const SCHEMA_VERSION = 2;

export function ensureProgressionDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(PROGRESSION_DB_PATH);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER NOT NULL
    );
    INSERT OR IGNORE INTO schema_version (version) VALUES (${SCHEMA_VERSION});

    CREATE TABLE IF NOT EXISTS player (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT
    );
    INSERT OR IGNORE INTO player (id, name) VALUES (1, 'Detective');

    CREATE TABLE IF NOT EXISTS progress (
      episode_id INTEGER PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked','available','solved')),
      solved_at TEXT
    );
  `);

  // Migrasi v1 → v2: tambah kolom skor/counter. SQLite tak punya ADD COLUMN
  // IF NOT EXISTS → guard lewat PRAGMA table_info.
  const cols = new Set(
    db.prepare('PRAGMA table_info(progress)').all().map((c) => c.name)
  );
  const adds = [
    ['query_count', 'INTEGER NOT NULL DEFAULT 0'],
    ['wrong_attempts', 'INTEGER NOT NULL DEFAULT 0'],
    ['best_score', 'INTEGER NOT NULL DEFAULT 0'],
  ];
  for (const [name, def] of adds) {
    if (!cols.has(name)) db.exec(`ALTER TABLE progress ADD COLUMN ${name} ${def}`);
  }

  db.close();
  return PROGRESSION_DB_PATH;
}

export function openProgressionDb() {
  return new Database(PROGRESSION_DB_PATH);
}
