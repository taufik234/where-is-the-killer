import { episode1 } from './episode-1.js';
import { episode2 } from './episode-2.js';
import { episode3 } from './episode-3.js';
import { episode4 } from './episode-4.js';
import { episode5 } from './episode-5.js';

// Order matters: episode.id indexes into progression & solve/unlock logic.
const EPISODES = [episode1, episode2, episode3, episode4, episode5];

export function getEpisodeDefs() {
  return EPISODES;
}