import { Router } from 'express';
import { runQuery, QueryError } from '../services/executor.js';
import { openProgressionDb } from '../db/progression.js';

export const executeRouter = Router();

// Naikkan query_count pada attempt aktif bila episode valid & aktif.
function countQuery(episodeId) {
  if (!Number.isInteger(episodeId)) return;
  const db = openProgressionDb();
  try {
    db.prepare(
      `UPDATE progress SET query_count = query_count + 1
       WHERE episode_id = ? AND status IN ('available','solved')`
    ).run(episodeId);
  } finally {
    db.close();
  }
}

executeRouter.post('/', (req, res) => {
  const { sql, episodeId } = req.body ?? {};
  try {
    const result = runQuery(sql);
    countQuery(episodeId);
    res.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof QueryError) {
      res.status(400).json({ ok: false, error: err.message });
    } else {
      throw err;
    }
  }
});
