import { useCallback, useEffect, useState } from 'react';
import { api, type EpisodeDetail, type EpisodeSummary, type QueryResponse, type SolveResponse } from '../lib/api';
import SqlEditor from './SqlEditor';
import ResultTable from './ResultTable';
import StoryPanel from './StoryPanel';

type Status = 'idle' | 'loading' | 'success' | 'error';

const STATUS_LABEL = {
  solved: 'TERPECAHKAN',
  available: 'SIAP DIIKUTI',
  locked: 'TERKUNCI',
} as const;

export default function GameApp() {
  const [episodes, setEpisodes] = useState<EpisodeSummary[] | null>(null);
  const [episode, setEpisode] = useState<EpisodeDetail | null>(null);
  const [sql, setSql] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [query, setQuery] = useState<QueryResponse | null>(null);
  const [solve, setSolve] = useState<SolveResponse | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  const loadEpisode = useCallback(async (id: number) => {
    const detail = await api.episode(id);
    setEpisode(detail);
    // Mulai attempt baru: reset counter query/wrong (idempoten).
    api.start(id).then(() => {}).catch(() => {});
    if (detail.status === 'solved') {
      api.execute(id, detail.solution!.query).then(setQuery).catch(() => {});
    } else {
      setQuery(null);
      setSql('');
    }
    setSolve(null);
    setAnswer('');
    setStatus('idle');
  }, []);

  useEffect(() => {
    api
      .episodes()
      .then((list) => {
        setEpisodes(list);
        const active = list.find((e) => e.status !== 'locked') ?? list[0];
        if (active) {
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
      const res = await api.execute(episode.id, sql);
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
    if (!answer.trim() || !episode) return;
    setStatus('loading');
    setError(null);
    try {
      const res = await api.solve(episode.id, answer);
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

  const tabClass = (ep: EpisodeSummary) => {
    const base = 'min-h-[44px] cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium transition active:scale-[0.98]';
    if (episode?.id === ep.id) {
      return `${base} border-accent bg-accent/10 text-accent`;
    }
    if (ep.status === 'solved') {
      return `${base} border-accent/30 bg-surface-1 text-accent/80 hover:border-accent`;
    }
    if (ep.status === 'available') {
      return `${base} border-white/15 text-ink hover:border-accent/60`;
    }
    return `${base} cursor-not-allowed border-white/5 text-slate-600`;
  };

  const actionBtn =
    'min-h-[44px] cursor-pointer rounded-md bg-accent px-4 py-2 text-sm font-semibold text-surface-0 transition hover:bg-accent-strong active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            <span className="text-accent">Query</span> Noir
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Kasus {episode ? String(episode.id).padStart(2, '0') : '--'}
          </p>
        </div>
        <nav className="flex gap-2" aria-label="Pilih kasus">
          {episodes?.map((ep) => (
            <button
              key={ep.id}
              onClick={() => selectEpisode(ep.id)}
              disabled={ep.status === 'locked'}
              title={ep.title}
              className={tabClass(ep)}>
              Bab {ep.id}
            </button>
          ))}
        </nav>
      </header>

      {error && !episode && (
        <div className="mb-6 rounded-md border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">
          Gagal memuat episode: {error}
        </div>
      )}

      {episode ? (
        <main className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,5fr)]">
          <StoryPanel title={episode.title} focus={episode.focus} brief={episode.brief} goal={episode.goal}>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
              {STATUS_LABEL[episode.status]}
            </p>
            {episode.hints.length > 0 && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Petunjuk</p>
                <ol className="mt-1 list-inside list-decimal space-y-1 text-sm text-slate-300">
                  {episode.hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ol>
              </div>
            )}
          </StoryPanel>

          <section className="rounded-lg border border-white/10 bg-surface-1/60 p-6">
            <SqlEditor value={sql} onChange={handleChange} onSubmit={runQuery} />

            <div className="mb-4">
              <button onClick={runQuery} disabled={status === 'loading' || !sql.trim()} className={actionBtn}>
                {status === 'loading' ? 'Menjalankan…' : 'Run Query'}
              </button>
            </div>

            <div className="mb-4 rounded-lg border border-white/10 bg-surface-1 p-3">
              <label htmlFor="answer-input" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Tebak pelaku, tulis nama atau kode
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="answer-input"
                  type="text"
                  value={answer}
                  onChange={(e) => { setAnswer(e.target.value); setSolve(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitAnswer(); }}
                  placeholder="mis. Irfan Maulana atau P-1003"
                  className="w-full rounded-md border border-white/15 bg-surface-0 px-3 py-2 font-mono text-sm text-accent outline-none placeholder:text-slate-600 focus:border-accent"
                />
                <button
                  onClick={submitAnswer}
                  disabled={status === 'loading' || !answer.trim()}
                  className="whitespace-nowrap rounded-md border border-accent px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40">
                  Tebak Pelaku
                </button>
              </div>
            </div>

            {error && episode && (
              <div className="mb-4 rounded-md border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">{error}</div>
            )}

            {solve && (
              <div
                className={`animate-rise-in mb-4 rounded-md border p-4 text-sm ${
                  solve.correct
                    ? 'border-accent bg-accent/10 text-ink'
                    : 'border-white/15 bg-surface-1 text-ink'
                }`}>
                <p className="font-semibold">{solve.correct ? 'Kasus terpecahkan' : 'Belum benar'}</p>
                <p className="mt-1 text-slate-300">{solve.message}</p>
                {solve.correct && solve.score !== undefined && (
                  <p className="mt-2 font-mono text-xs text-slate-400">
                    query {String(solve.breakdown?.queryCount ?? 0).padStart(2, '0')}
                    {'  '}salah {String(solve.breakdown?.wrongAttempts ?? 0).padStart(2, '0')}
                    {'  '}skor {solve.score}
                  </p>
                )}
                {solve.verdict && <p className="mt-2 border-t border-white/10 pt-2 text-slate-300">{solve.verdict}</p>}
              </div>
            )}

            <ResultTable columns={query?.columns ?? []} rows={query?.rows ?? []} />
            {query?.truncated && (
              <p className="mt-2 text-xs text-slate-500">Hasil dibatasi 500 baris - persempit query kamu.</p>
            )}
          </section>
        </main>
      ) : (
        <p className="text-slate-400">Memuat kasus…</p>
      )}
    </div>
  );
}