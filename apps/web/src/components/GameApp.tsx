import { useCallback, useEffect, useState } from 'react';
import { api, type EpisodeDetail, type EpisodeSummary, type QueryResponse, type SolveResponse } from '../lib/api';
import SqlEditor from './SqlEditor';
import ResultTable from './ResultTable';
import StoryPanel from './StoryPanel';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function GameApp() {
  const [episodes, setEpisodes] = useState<EpisodeSummary[] | null>(null);
  const [episode, setEpisode] = useState<EpisodeDetail | null>(null);
  const [sql, setSql] = useState<string>('');
  const [query, setQuery] = useState<QueryResponse | null>(null);
  const [solve, setSolve] = useState<SolveResponse | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const loadEpisode = useCallback(async (id: number) => {
    const detail = await api.episode(id);
    setEpisode(detail);
    if (detail.status === 'solved') {
      api.execute(detail.solution!.query).then(setQuery).catch(() => {});
    } else {
      setQuery(null);
      setSql('');
    }
    setSolve(null);
    setStatus('idle');
  }, []);

  useEffect(() => {
    api
      .episodes()
      .then((list) => {
        setEpisodes(list);
        const active = list.find((e) => e.status !== 'locked') ?? list[0];
        if (active) {
          setActive(active.id);
          api.episode(active.id).then(setEpisode).catch(() => {});
        }
      })
      .catch((err) => setError(String(err)));
  }, []);

  
  const selectEpisode = async (id: number) => {
    setError(null);
    try {
      await loadEpisode(id);
    } catch (err) {
      setError(String(err));
    }
  };

  const runQuery = async () => {
    if (!sql.trim() || !episode) return;
    setStatus('loading');
    setError(null);
    try {
      const res = await api.execute(sql);
      if (!res.ok) {
        setStatus('error');
        setError(res.error ?? 'Query gagal.');
      } else {
        setStatus('success');
        setQuery(res);
      }
    } catch (err) {
      setStatus('error');
      setError(String(err));
    }
  };

  const submitAnswer = async () => {
    if (!sql.trim() || !episode) return;
    setStatus('loading');
    setError(null);
    try {
      const res = await api.solve(episode.id, sql);
      setSolve(res);
      setStatus(res.correct ? 'success' : 'error');
      if (res.correct) {
        const list = await api.episodes();
        setEpisodes(list);
        const active = list.find((e) => e.status === 'available');
        if (active && active.id !== episode.id) {
          await loadEpisode(active.id);
        }
      }
    } catch (err) {
      setStatus('error');
      setError(String(err));
    }
  };

  const handleChange = (value: string) => {
    setSql(value);
    setSolve(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-black tracking-tight text-slate-100">
          <span className="text-sky-400">Query</span> Noir
        </h1>
        <div className="flex gap-2">
          {episodes?.map((ep) => (
            <button
              key={ep.id}
              onClick={() => selectEpisode(ep.id)}
              disabled={ep.status === 'locked'}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium transition ${
                episode?.id === ep.id
                  ? 'border-sky-500 bg-sky-500/20 text-sky-300'
                  : ep.status === 'solved'
                    ? 'border-lime-700 bg-lime-900/20 text-lime-400'
                    : ep.status === 'available'
                      ? 'border-slate-600 text-slate-200 hover:border-sky-500'
                      : 'cursor-not-allowed border-slate-800 text-slate-600'
              }`}>
              Bab {ep.id}
              {ep.status === 'solved' ? ' ✓' : ep.status === 'locked' ? ' 🔒' : ''}
            </button>
          ))}
        </div>
      </header>

      {error && !episode && (
        <div className="mb-6 rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
          Gagal memuat episode: {error}
        </div>
      )}

      {episode ? (
        <main className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,5fr)]">
          <StoryPanel title={episode.title} focus={episode.focus} brief={episode.brief} goal={episode.goal}>
            {episode.hints.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Petunjuk</p>
                <ol className="mt-1 list-inside list-decimal space-y-1 text-sm text-slate-300">
                  {episode.hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ol>
              </div>
            )}
          </StoryPanel>

          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
            <SqlEditor value={sql} onChange={handleChange} onSubmit={runQuery} />

            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={runQuery}
                disabled={status === 'loading' || !sql.trim()}
                className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50">
                {status === 'loading' ? 'Menjalankan…' : 'Run Query'}
              </button>
              <button
                onClick={submitAnswer}
                disabled={status === 'loading' || !sql.trim()}
                className="rounded-lg border border-lime-600 px-4 py-2 text-sm font-semibold text-lime-400 transition hover:bg-lime-600/20 disabled:cursor-not-allowed disabled:opacity-50">
                Tebak Pelaku
              </button>
            </div>

            {error && episode && (
              <div className="mb-4 rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-300">{error}</div>
            )}

            {solve && (
              <div
                className={`mb-4 rounded-lg border p-4 text-sm ${
                  solve.correct
                    ? 'border-lime-700 bg-lime-950/40 text-lime-300'
                    : 'border-amber-700 bg-amber-950/40 text-amber-300'
                }`}>
                <p className="font-semibold">{solve.correct ? '✔ Kasus terpecahkan!' : '✘ Belum benar'}</p>
                <p className="mt-1">{solve.message}</p>
                {solve.verdict && <p className="mt-2 italic">{solve.verdict}</p>}
              </div>
            )}

            <ResultTable columns={query?.columns ?? []} rows={query?.rows ?? []} />
            {query?.truncated && (
              <p className="mt-2 text-xs text-slate-500">Hasil dibatasi 500 baris — persempit query kamu.</p>
            )}
          </section>
        </main>
      ) : (
        <p className="text-slate-400">Memuat kasus…</p>
      )}
    </div>
  );
}