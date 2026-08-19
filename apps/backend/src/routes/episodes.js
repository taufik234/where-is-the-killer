import { Router } from 'express';
import { getEpisodeDefs } from '../data/episodes/index.js';
import { openProgressionDb } from '../db/progression.js';

export const episodeRouter = Router();
const EPISODE_DEFS = getEpisodeDefs();

function progressMap() {
  const db = openProgressionDb();
  try {
    const rows = db.prepare('SELECT * FROM progress').all();
    return new Map(rows.map((r) => [r.episode_id, r.status]));
  } finally {
    db.close();
  }
}

episodeRouter.get('/', (_req, res) => {
  const statuses = progressMap();
  res.json({
    episodes: EPISODE_DEFS.map((d) => ({
      id: d.id,
      title: d.title,
      focus: d.focus,
      status: statuses.get(d.id) ?? 'locked',
      tables: d.tables.map((t) => t.name),
    })),
  });
});

episodeRouter.get('/:episodeId', (req, res) => {
  const episodeId = Number(req.params.episodeId);
  const def = EPISODE_DEFS.find((d) => d.id === episodeId);
  if (!def) return res.status(404).json({ error: 'Episode tidak ditemukan.' });

  const statuses = progressMap();
  const status = statuses.get(episodeId) ?? 'locked';

  res.json({
    id: def.id,
    title: def.title,
    focus: def.focus,
    brief: def.brief,
    goal: def.goal,
    status,
    hints: def.hints,
    tables: def.tables.map((t) => ({ name: t.name, columns: t.columns.map((c) => c.name) })),
    solution: status === 'solved' ? { query: def.solution.query, explanation: def.solution.explanation } : undefined,
  });
});
