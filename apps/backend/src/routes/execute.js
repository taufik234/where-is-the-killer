import { Router } from 'express';
import { runQuery, QueryError } from '../services/executor.js';

export const executeRouter = Router();

executeRouter.post('/', (req, res) => {
  const { sql } = req.body ?? {};
  try {
    const result = runQuery(sql);
    res.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof QueryError) {
      res.status(400).json({ ok: false, error: err.message });
    } else {
      throw err;
    }
  }
});
