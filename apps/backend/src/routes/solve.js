import { Router } from 'express';
import { getEpisodeDefs } from '../data/episodes/index.js';
import {
  evaluateSolution,
  isEpisodeSolved,
  markSolved,
  unlockNext,
} from '../services/solver.js';
import { QueryError } from '../services/executor.js';

export const solveRouter = Router();
const EPISODE_DEFS = getEpisodeDefs();

solveRouter.post('/:episodeId', (req, res) => {
  const episodeId = Number(req.params.episodeId);
  const def = EPISODE_DEFS.find((d) => d.id === episodeId);
  if (!def) return res.status(404).json({ error: 'Episode tidak ditemukan.' });

  if (isEpisodeSolved(episodeId)) {
    return res.json({
      correct: true,
      message: 'Bab ini sudah kamu pecahkan.',
      alreadySolved: true,
      verdict: def.culprit.verdict,
    });
  }

  const { sql } = req.body ?? {};
  let outcome;
  try {
    outcome = evaluateSolution(episodeId, sql);
  } catch (err) {
    if (err instanceof QueryError) {
      return res.status(400).json({ ok: false, error: err.message });
    }
    throw err;
  }

  if (outcome.correct) {
    markSolved(episodeId);
    unlockNext(episodeId);
  }
  res.json({ ...outcome, verdict: outcome.correct ? def.culprit.verdict : undefined });
});
