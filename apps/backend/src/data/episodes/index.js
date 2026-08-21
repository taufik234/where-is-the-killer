import { episode1 } from './episode-1.js';
import { episode2 } from './episode-2.js';
import { episode3 } from './episode-3.js';
import { episode4 } from './episode-4.js';
import { episode5 } from './episode-5.js';

// Order matters: episode.id indexes into progression & solve/unlock logic.
const EPISODES = [episode1, episode2, episode3, episode4, episode5];

export const SEASONS = [
  {
    id: 1,
    title: 'Pabrik Sterling',
    episodeIds: [1, 2, 3, 4, 5],
  },
];

export function getSeason(id) {
  return SEASONS.find((s) => s.id === id);
}

export function getEpisodesBySeason(seasonId) {
  const season = getSeason(seasonId);
  if (!season) return [];
  return EPISODES.filter((ep) => season.episodeIds.includes(ep.id));
}

export function getEpisodeDefs() {
  return EPISODES.map((ep) => ({ ...ep, seasonId: 1 }));
}