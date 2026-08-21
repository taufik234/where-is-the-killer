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

export function ensureSeasonProgress() {
  // Season tidak butuh kolom baru, hanya view logika. Guard idempoten agar aman dipanggil dua kali.
  try {
    const db = new Database(PROGRESSION_DB_PATH);
    // Pastikan tabel progress ada sebelum buat helper
    const exists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='progress'").get();
    db.close();
    return !!exists;
  } catch {
    return false;
  }
}

export function getSeasonSummary(seasons) {
  const db = new Database(PROGRESSION_DB_PATH);
  try {
    const rows = db.prepare('SELECT episode_id, status FROM progress').all();
    const statusMap = new Map(rows.map((r) => [r.episode_id, r.status]));
    return seasons.map((s) => {
      const total = s.episodeIds.length;
      const solved = s.episodeIds.filter((id) => statusMap.get(id) === 'solved').length;
      const available = s.episodeIds.filter((id) => statusMap.get(id) === 'available').length;
      return { ...s, episodeCount: total, solvedCount: solved, availableCount: available };
    });
  } finally {
    db.close();
  }
}

export function resetProgress() {
  const db = new Database(PROGRESSION_DB_PATH);
  try {
    db.exec('DELETE FROM progress');
    const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const stmt = db.prepare('INSERT INTO progress (episode_id, status) VALUES (?, ?)');
    const tx = db.transaction((list) => {
      for (const id of list) {
        const status = id === 1 ? 'available' : 'locked';
        stmt.run(id, status);
      }
    });
    tx(ids);
    return true;
  } finally {
    db.close();
  }
}

export function openProgressionDb() {
  return new Database(PROGRESSION_DB_PATH);
}
