import { openEvidenceDb } from '../db/connection.js';
import { QueryError } from './executor.js';
import { getEpisodeDefs } from '../data/episodes/index.js';
import { openProgressionDb } from '../db/progression.js';

const EPISODE_DEFS = getEpisodeDefs();

// Pre-compute the canonical answer-set for each episode so "solve" never runs
// player SQL for validation — only fixed queries we authored.
const CULPRITS = (() => {
  const db = openEvidenceDb();
  try {
    const map = {};
    for (const def of EPISODE_DEFS) {
      map[def.id] = { tokens: def.culprit.tokens ?? [def.culprit.employee_code] };
    }
    return map;
  } finally {
    db.close();
  }
})();

// Check whether the player's submitted SQL actually surfaces the culprit code.
export function evaluateSolution(episodeId, sql) {
  if (typeof sql !== 'string' || sql.trim() === '') {
    throw new QueryError('Jawaban kosong.');
  }
  const def = EPISODE_DEFS.find((d) => d.id === Number(episodeId));
  if (!def) throw new QueryError(`Episode ${episodeId} tidak ditemukan.`);

  const db = openEvidenceDb();
  try {
    const rows = db.prepare(sql).all();
    const tokens = CULPRITS[Number(episodeId)].tokens;

    // A row "surfaces the culprit" if any of its cell values contains one of
    // the culprit tokens (employee code, name, vendor, or chat id).
    const found = rows.some((row) =>
      Object.values(row).some(
        (v) => typeof v === 'string' && tokens.some((tok) => v.includes(tok))
      )
    );

    // Anti-scatter: a query that just dumps the whole evidence table isn't a
    // "solution". The returned rows must be a real filter — fewer than the
    // full row count of the episode's primary table.
    const targetTable = def.tables[0].name;
    const total = db.prepare(`SELECT COUNT(*) AS c FROM "${targetTable}"`).get().c;
    const isolates = rows.length < total;
    const correct = found && isolates;

    return {
      correct,
      rows: rows.slice(0, 20),
      rowCount: rows.length,
      message: correct
        ? `Query kamu menemukan pelaku — bukti cukup.`
        : 'Query kamu belum menemukan pelaku. Periksa kembali data dan pendekatanmu.',
    };
  } catch (err) {
    // A failed player query is feedback, not a crash.
    return {
      correct: false,
      rows: [],
      rowCount: 0,
      message: `Query tidak dapat dijalankan: ${err.message}`,
    };
  } finally {
    db.close();
  }
}

export function isEpisodeSolved(episodeId) {
  const db = openProgressionDb();
  try {
    const row = db
      .prepare('SELECT status FROM progress WHERE episode_id = ?')
      .get(episodeId);
    return row?.status === 'solved';
  } finally {
    db.close();
  }
}

export function markSolved(episodeId) {
  const db = openProgressionDb();
  try {
    db.prepare(
      "UPDATE progress SET status = 'solved', solved_at = ? WHERE episode_id = ?"
    ).run(new Date().toISOString(), episodeId);
  } finally {
    db.close();
  }
}

export function unlockNext(episodeId) {
  const db = openProgressionDb();
  try {
    const next = Number(episodeId) + 1;
    if (EPISODE_DEFS.some((d) => d.id === next)) {
      db.prepare(
        "UPDATE progress SET status = 'available' WHERE episode_id = ? AND status = 'locked'"
      ).run(next);
    }
  } finally {
    db.close();
  }
}
