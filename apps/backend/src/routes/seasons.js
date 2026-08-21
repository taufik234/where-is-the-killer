import { Router } from 'express';
import { SEASONS, getSeason, getEpisodesBySeason, getEpisodeDefs } from '../data/episodes/index.js';
import { openProgressionDb, getSeasonSummary } from '../db/progression.js';

export const seasonRouter = Router();

function progressMap() {
  const db = openProgressionDb();
  try {
    const rows = db.prepare('SELECT * FROM progress').all();
    return new Map(rows.map((r) => [r.episode_id, r]));
  } finally {
    db.close();
  }
}

seasonRouter.get('/', (_req, res) => {
  const statuses = progressMap();
  const summaries = getSeasonSummary(SEASONS);
  const defs = getEpisodeDefs();
  const seasons = summaries.map((s) => {
    const episodes = getEpisodesBySeason(s.id).map((d) => {
      const p = statuses.get(d.id);
      return {
        id: d.id,
        title: d.title,
        focus: d.focus,
        status: p?.status ?? 'locked',
        best_score: p?.best_score ?? 0,
        seasonId: s.id,
      };
    });
    return {
      id: s.id,
      title: s.title,
      episodeIds: s.episodeIds,
      episodeCount: s.episodeCount,
      solvedCount: s.solvedCount,
      availableCount: s.availableCount,
      episodes,
    };
  });
  res.json({ seasons });
});

seasonRouter.get('/:seasonId', (req, res) => {
  const seasonId = Number(req.params.seasonId);
  if (!Number.isInteger(seasonId)) {
    return res.status(400).json({ error: 'Season id harus angka.' });
  }
  const season = getSeason(seasonId);
  if (!season) return res.status(404).json({ error: 'Season tidak ditemukan.' });

  const statuses = progressMap();
  const summary = getSeasonSummary(SEASONS).find((s) => s.id === seasonId);
  const defs = getEpisodeDefs();
  const episodes = getEpisodesBySeason(seasonId).map((d) => {
    const p = statuses.get(d.id);
    return {
      id: d.id,
      title: d.title,
      focus: d.focus,
      status: p?.status ?? 'locked',
      best_score: p?.best_score ?? 0,
      seasonId,
      brief: d.brief,
      goal: d.goal,
      tables: d.tables.map((t) => t.name),
    };
  });

  res.json({
    id: season.id,
    title: season.title,
    episodeIds: season.episodeIds,
    episodeCount: summary.episodeCount,
    solvedCount: summary.solvedCount,
    episodes,
  });
});
