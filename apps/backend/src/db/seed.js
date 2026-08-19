import fs from 'node:fs';
import { DATA_DIR, EVIDENCE_DB_PATH } from './connection.js';
import { openEvidenceDb } from './connection.js';
import { getEpisodeDefs } from '../data/episodes/index.js';
import { ensureProgressionDb, openProgressionDb } from './progression.js';

// Rebuild the evidence database from the episode schema definitions.
// Destructive by design: it is the source of truth for all evidence data.
fs.mkdirSync(DATA_DIR, { recursive: true });
if (fs.existsSync(EVIDENCE_DB_PATH)) fs.rmSync(EVIDENCE_DB_PATH);

const db = openEvidenceDb({ writable: true });
db.pragma('foreign_keys = ON');

const defs = getEpisodeDefs();
for (const def of defs) {
  for (const table of def.tables) {
    const colDefs = table.columns.map((c) => `"${c.name}"`).join(', ');
    db.exec(`CREATE TABLE "${table.name}" (${colDefs})`);
    const cols = table.columns.map((c) => `"${c.name}"`).join(', ');
    const placeholders = table.columns.map(() => '?').join(', ');
    const insert = db.prepare(
      `INSERT INTO "${table.name}" (${cols}) VALUES (${placeholders})`
    );
    const insertMany = db.transaction((rows) => {
      for (const row of rows) insert.run(...row);
    });
    insertMany(table.rows);
  }
}

// Foreign keys + PRAGMA integrity_check validate the datasets.
db.pragma('foreign_key_check');
const integrity = db.pragma('integrity_check', { simple: true });
console.log(`Seeded ${defs.length} episodes into ${EVIDENCE_DB_PATH}`);
for (const def of defs) {
  const counts = def.tables.map((t) => `${t.name}=${t.rows.length}`);
  console.log(`  ${def.id}: ${counts.join(' ')}`);
}
console.log(`integrity_check: ${integrity}`);

db.close();

// Reset player progression so a fresh seed starts the game over.
ensureProgressionDb();
const pdb = openProgressionDb();
pdb.exec('DELETE FROM progress');
const defsById = new Map(defs.map((d) => [d.id, d]));
for (let i = 0; i < defs.length; i++) {
  const def = defs[i];
  const status = i === 0 ? 'available' : 'locked';
  pdb.prepare(
    'INSERT INTO progress (episode_id, status) VALUES (?, ?)'
  ).run(def.id, status);
}
console.log('Progression reset: episode 1 available, rest locked.');
pdb.close();
