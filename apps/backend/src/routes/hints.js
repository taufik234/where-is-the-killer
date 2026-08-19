import { Router } from 'express';
import { getEpisodeDefs } from '../data/episodes/index.js';

export const hintRouter = Router();
const EPISODE_DEFS = getEpisodeDefs();

hintRouter.get('/:episodeId', (req, res) => {
  const episodeId = Number(req.params.episodeId);
  const def = EPISODE_DEFS.find((d) => d.id === episodeId);
  if (!def) return res.status(404).json({ error: 'Episode tidak ditemukan.' });

  const index = Number(req.query.n ?? 0);
  const hint = def.hints[Math.min(Math.max(index, 0), def.hints.length - 1)];
  res.json({ episodeId, hint, index });
});
