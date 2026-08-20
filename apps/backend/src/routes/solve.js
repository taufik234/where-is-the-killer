import { Router } from 'express';
import { getEpisodeDefs } from '../data/episodes/index.js';
import {
  evaluateSolution,
  isEpisodeSolved,
  recordWrongAttempt,
  recordSolved,
  unlockNext,
} from '../services/solver.js';
import { QueryError } from '../services/executor.js';

export const solveRouter = Router();
const EPISODE_DEFS = getEpisodeDefs();

solveRouter.post('/:episodeId', (req, res) => {
  const episodeId = Number(req.params.episodeId);
  const def = EPISODE_DEFS.find((d) => d.id === episodeId);
  if (!def) return res.status(404).json({ error: 'Episode tidak ditemukan.' });

  const wasSolved = isEpisodeSolved(episodeId);

  const { answer } = req.body ?? {};
  let outcome;
  try {
    outcome = evaluateSolution(episodeId, answer);
  } catch (err) {
    if (err instanceof QueryError) {
      return res.status(400).json({ ok: false, error: err.message });
    }
    throw err;
  }

  if (outcome.correct) {
    // Bab sudah pernah solved di attempt sebelumnya -> replay. Skor dihitung
    // ulang; recordSolved memakai MAX sehingga best_score tak pernah turun.
    const scored = recordSolved(episodeId);
    unlockNext(episodeId);
    res.json({
      ...outcome,
      ...scored,
      alreadySolved: wasSolved,
      verdict: def.culprit.verdict,
    });
  } else {
    recordWrongAttempt(episodeId);
    res.json(outcome);
  }
});
