import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.join(here, '..', '..', 'data');
export const EVIDENCE_DB_PATH = path.join(DATA_DIR, 'evidence.db');
export const PROGRESSION_DB_PATH = path.join(DATA_DIR, 'progression.db');

// Read-only database handle for the evidence DB. The evidence DB only ever
// contains read-only datasets; all writes (player state) go to progression.db.
// Pass { writable: true } from the seed script, which builds the DB once.
export function openEvidenceDb(opts = {}) {
  return new Database(
    EVIDENCE_DB_PATH,
    opts.writable === true ? {} : { readonly: true }
  );
}
