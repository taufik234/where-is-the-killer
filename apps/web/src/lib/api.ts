// Shared client types mirroring the backend API responses.

export interface EpisodeSummary {
  id: number;
  title: string;
  focus: string;
  status: 'locked' | 'available' | 'solved';
  best_score: number;
  tables: string[];
}

export interface EpisodeDetail {
  id: number;
  title: string;
  focus: string;
  brief: string;
  goal: string;
  status: 'locked' | 'available' | 'solved';
  seasonId?: number;
  hints: string[];
  tables: { name: string; columns: string[] }[];
  solution?: { query: string; explanation: string };
}

export interface SeasonSummary {
  id: number;
  title: string;
  episodeIds: number[];
  episodeCount: number;
  solvedCount: number;
  availableCount: number;
  episodes: EpisodeSummary[];
}

export interface SeasonDetail {
  id: number;
  title: string;
  episodeIds: number[];
  episodeCount: number;
  solvedCount: number;
  episodes: (EpisodeSummary & { brief: string; goal: string; tables: string[] })[];
}

export interface QueryResponse {
  ok: boolean;
  columns: string[];
  rows: Record<string, unknown>[];
  truncated: boolean;
  error?: string;
}

export interface SolveResponse {
  correct: boolean;
  rows: Record<string, unknown>[];
  rowCount: number;
  message: string;
  verdict?: string;
  alreadySolved?: boolean;
  score?: number;
  breakdown?: { queryCount: number; wrongAttempts: number };
}

// Relative by default: API dan frontend disajikan dari port yang sama (produksi).
// Dev: setel PUBLIC_API_URL (mis. http://localhost:8787) bila frontend di port berbeda.
const API_URL = import.meta.env.PUBLIC_API_URL ?? '';

export const api = {
  async episodes(): Promise<EpisodeSummary[]> {
    const res = await fetch(`${API_URL}/api/episodes`);
    const body = (await res.json()) as { episodes: EpisodeSummary[] };
    return body.episodes;
  },
  async episode(id: number): Promise<EpisodeDetail> {
    return (await fetch(`${API_URL}/api/episodes/${id}`)).json() as Promise<EpisodeDetail>;
  },
  async execute(episodeId: number, sql: string): Promise<QueryResponse> {
    return (await fetch(`${API_URL}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ episodeId, sql }),
    })).json() as Promise<QueryResponse>;
  },
  async start(id: number): Promise<{ episodeId: number; queryCount: number; wrongAttempts: number }> {
    return (await fetch(`${API_URL}/api/episodes/${id}/start`, { method: 'POST' })).json() as Promise<{
      episodeId: number;
      queryCount: number;
      wrongAttempts: number;
    }>;
  },
  async solve(id: number, answer: string): Promise<SolveResponse> {
    return (await fetch(`${API_URL}/api/solve/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer }),
    })).json() as Promise<SolveResponse>;
  },
  async seasons(): Promise<SeasonSummary[]> {
    const res = await fetch(`${API_URL}/api/seasons`);
    const body = (await res.json()) as { seasons: SeasonSummary[] };
    return body.seasons;
  },
  async season(id: number): Promise<SeasonDetail> {
    return (await fetch(`${API_URL}/api/seasons/${id}`)).json() as Promise<SeasonDetail>;
  },
  async resetProgress(): Promise<{ ok: boolean; message: string }> {
    return (await fetch(`${API_URL}/api/progress/reset`, { method: 'POST' })).json() as Promise<{ ok: boolean; message: string }>;
  },
};