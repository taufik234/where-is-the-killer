import { episode1 } from './episode-1.js';
import { episode2 } from './episode-2.js';
import { episode3 } from './episode-3.js';
import { episode4 } from './episode-4.js';
import { episode5 } from './episode-5.js';
import { episode6 } from './episode-6.js';
import { episode7 } from './episode-7.js';
import { episode8 } from './episode-8.js';
import { episode9 } from './episode-9.js';
import { episode10 } from './episode-10.js';

// Order matters: episode.id indexes into progression & solve/unlock logic.
const EPISODES = [episode1, episode2, episode3, episode4, episode5, episode6, episode7, episode8, episode9, episode10];

export const SEASONS = [
  {
    id: 1,
    title: 'Pabrik Sterling',
    episodeIds: [1, 2, 3, 4, 5],
  },
  {
    id: 2,
    title: 'Lubang di Neraca',
    episodeIds: [6, 7, 8, 9, 10],
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
  return EPISODES.map((ep) => {
    const season = SEASONS.find((s) => s.episodeIds.includes(ep.id));
    return { ...ep, seasonId: season ? season.id : 1 };
  });
}