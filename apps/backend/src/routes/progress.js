import { Router } from 'express';
import { resetProgress } from '../db/progression.js';

export const progressRouter = Router();

progressRouter.post('/reset', (_req, res) => {
  try {
    resetProgress();
    res.json({ ok: true, message: 'Progres direset. Bab 1 kembali available.' });
  } catch (e) {
    res.status(500).json({ error: 'Gagal reset progres.' });
  }
});
