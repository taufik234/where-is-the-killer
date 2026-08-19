// Shared client types mirroring the backend API responses.

export interface EpisodeSummary {
  id: number;
  title: string;
  focus: string;
  status: 'locked' | 'available' | 'solved';
  tables: string[];
}

export interface EpisodeDetail {
  id: number;
  title: string;
  focus: string;
  brief: string;
  goal: string;
  status: 'locked' | 'available' | 'solved';
  hints: string[];
  tables: { name: string; columns: string[] }[];
  solution?: { query: string; explanation: string };
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
}

const API_URL = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:8787';

export const api = {
  async episodes(): Promise<EpisodeSummary[]> {
    const res = await fetch(`${API_URL}/api/episodes`);
    const body = (await res.json()) as { episodes: EpisodeSummary[] };
    return body.episodes;
  },
  async episode(id: number): Promise<EpisodeDetail> {
    return (await fetch(`${API_URL}/api/episodes/${id}`)).json() as Promise<EpisodeDetail>;
  },
  async execute(sql: string): Promise<QueryResponse> {
    return (await fetch(`${API_URL}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    })).json() as Promise<QueryResponse>;
  },
  async solve(id: number, sql: string): Promise<SolveResponse> {
    return (await fetch(`${API_URL}/api/solve/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql }),
    })).json() as Promise<SolveResponse>;
  },
};