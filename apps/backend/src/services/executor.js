import { openEvidenceDb } from '../db/connection.js';

// Allowlist of SQL statements a player may run against the evidence DB.
// Read-only statements only — the DB itself is opened readonly, so DML/DDL
// fails anyway; the allowlist just produces a friendlier error first.
const ALLOWED = new Set([
  'SELECT',
  'PRAGMA',
  'WITH',
  'VALUES',
  'EXPLAIN',
  'EXPLAIN QUERY PLAN',
]);

export class QueryError extends Error {}

// Executes a single SQL statement against the read-only evidence DB.
// Returns { columns, rows, truncated } where rows is capped at 500.
export function runQuery(sql) {
  if (typeof sql !== 'string' || sql.trim() === '') {
    throw new QueryError('Query kosong.');
  }
  const keyword = sql.trim().split(/\s+/)[0].toUpperCase();
  if (!ALLOWED.has(keyword)) {
    throw new QueryError(
      `Perintah "${keyword}" tidak diizinkan. Kamu hanya bisa membaca bukti (SELECT).`
    );
  }
  const db = openEvidenceDb();
  try {
    const stmt = db.prepare(sql);
    const all = stmt.all();
    const truncated = all.length > 500;
    const rows = truncated ? all.slice(0, 500) : all;
    const columns = rows.length
      ? Object.keys(rows[0])
      : stmt.columns().map((c) => c.name);
    return { columns, rows, truncated };
  } catch (err) {
    // A malformed player query is a client error, not a server fault.
    throw new QueryError(`Query tidak valid: ${err.message}`);
  } finally {
    db.close();
  }
}
