import { useCallback, useEffect, useState } from 'react';
import { 
  BookOpen, Check, FileSearch, Lock, RotateCcw, 
  Search, Zap, Database, ChevronRight, Terminal,
  Trophy, Activity
} from 'lucide-react';
import { api, type EpisodeDetail, type EpisodeSummary, type QueryResponse, type SolveResponse } from '@/lib/api';
import SqlEditor from './SqlEditor';
import ResultTable from './ResultTable';
import StoryPanel from './StoryPanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

type Status = 'idle' | 'loading' | 'success' | 'error';

const STATUS_LABEL = {
  solved: 'TERPECAHKAN',
  available: 'SIAP DIIKUTI',
  locked: 'TERKUNCI',
} as const;

const STATUS_COLORS = {
  solved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  available: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  locked: 'text-white/30 bg-white/5 border-white/10',
} as const;

const EPISODE_ICONS = [BookOpen, Search, Lock, Lock, Lock];

export default function GameApp() {
  const [episodes, setEpisodes] = useState<EpisodeSummary[] | null>(null);
  const [episode, setEpisode] = useState<EpisodeDetail | null>(null);
  const [sql, setSql] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [query, setQuery] = useState<QueryResponse | null>(null);
  const [solve, setSolve] = useState<SolveResponse | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [verdictDialogOpen, setVerdictDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const loadEpisode = useCallback(async (id: number) => {
    const detail = await api.episode(id);
    setEpisode(detail);
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
        setVerdictDialogOpen(true);
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

  const totalScore = episodes?.reduce((acc, e) => acc + (e.best_score ?? 0), 0) ?? 0;
  const solvedCount = episodes?.filter((e) => e.status === 'solved').length ?? 0;
  const totalCount = episodes?.length ?? 5;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e8e4dc] relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]" 
        style={{background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)'}} />
      
      <div className="pointer-events-none fixed top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-700/5 rounded-full blur-[120px]" />

      <div className="flex h-screen">
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="flex-shrink-0 bg-[#0f0f14] border-r border-white/5 flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <Search className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight">
                      <span className="text-amber-500">Query</span> Noir
                    </h1>
                    <p className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Detective SQL</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                <p className="px-3 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-2">Kasus Aktif</p>
                
                {!episodes ? (
                  <div className="space-y-2 px-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/5 bg-white/[0.02]">
                        <Skeleton className="w-7 h-7 rounded-md bg-white/10" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-3/4 bg-white/10" />
                          <Skeleton className="h-2 w-1/2 bg-white/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  episodes.map((ep, i) => {
                    const Icon = EPISODE_ICONS[i % EPISODE_ICONS.length];
                    const isActive = episode?.id === ep.id;
                    const isLocked = ep.status === 'locked';
                    
                    return (
                      <motion.button
                        key={ep.id}
                        whileHover={!isLocked ? { scale: 1.02 } : {}}
                        whileTap={!isLocked ? { scale: 0.98 } : {}}
                        onClick={() => !isLocked && selectEpisode(ep.id)}
                        disabled={isLocked}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden group ${
                          isActive 
                            ? 'bg-amber-500/10 border border-amber-500/20' 
                            : isLocked 
                              ? 'opacity-40 cursor-not-allowed' 
                              : 'hover:bg-white/[0.03] border border-transparent hover:border-white/5'
                        }`}
                      >
                        {isActive && (
                          <motion.div 
                            layoutId="active-indicator"
                            className="absolute left-0 top-2 bottom-2 w-0.5 bg-amber-500 rounded-full" 
                          />
                        )}
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                            isActive 
                              ? 'bg-amber-500/20 text-amber-400' 
                              : isLocked 
                                ? 'bg-white/5 text-white/30' 
                                : 'bg-white/5 text-white/50'
                          }`}>
                            {isLocked ? <Lock className="w-3 h-3" /> : <Icon className="w-3.5 h-3.5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isActive ? 'text-amber-100' : 'text-white/70'}`}>
                              {ep.title}
                            </p>
                            <p className={`text-[10px] font-mono mt-0.5 ${isActive ? 'text-amber-400/60' : 'text-white/30'}`}>
                              {STATUS_LABEL[ep.status]}
                            </p>
                          </div>
                          {ep.status === 'solved' && (
                            <Check className="w-4 h-4 text-emerald-500" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>

              <div className="p-4 border-t border-white/5">
                <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Progress</span>
                    {!episodes ? (
                      <Skeleton className="h-3 w-8 bg-white/10" />
                    ) : (
                      <span className="text-xs font-mono text-amber-400">{solvedCount}/{totalCount}</span>
                    )}
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    {!episodes ? (
                      <Skeleton className="h-full w-full bg-white/5" />
                    ) : (
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(solvedCount / totalCount) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.3)]" 
                      />
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Total Skor</span>
                    {!episodes ? (
                      <Skeleton className="h-5 w-12 bg-white/10" />
                    ) : (
                      <span className="text-lg font-mono font-bold text-amber-400">{totalScore}</span>
                    )}
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3 border-white/10 bg-transparent hover:bg-white/5 text-white/50 hover:text-white/80 transition-all"
                  onClick={() => location.reload()}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-2" /> Mulai Ulang
                </Button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto relative">
          <header className="sticky top-0 z-40 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/50"
              >
                <Search className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-white/10" />
              {episode && (
                <motion.span 
                  key={episode.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-white/40 font-mono uppercase tracking-wider"
                >
                  Bab {String(episode.id).padStart(2, '0')} - {episode.focus}
                </motion.span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-emerald-400/70 font-mono uppercase tracking-wider">Database Connected</span>
            </div>
          </header>

          <div className="max-w-5xl mx-auto p-6 space-y-6">
            <AnimatePresence mode="wait">
              {error && !episode && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="rounded-xl border border-red-500/20 bg-red-500/5 p-4"
                >
                  <div className="flex items-center gap-2 text-red-400 mb-1">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm font-semibold">Gagal memuat</span>
                  </div>
                  <p className="text-sm text-red-400/70">{error}</p>
                </motion.div>
              )}

              {episode ? (
                <motion.div
                  key={episode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col gap-6"
                >
                  <StoryPanel
                    title={episode.title}
                    focus={episode.focus}
                    statusLabel={STATUS_LABEL[episode.status]}
                    statusColor={STATUS_COLORS[episode.status]}
                    brief={episode.brief}
                    goal={episode.goal}
                  >
                    {episode.hints.length > 0 && (
                      <div className="mt-2 md:mt-0 md:border-l md:border-white/5 md:pl-6">
                        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5" /> Petunjuk
                        </p>
                        <ol className="space-y-2.5">
                          {episode.hints.map((h, i) => (
                            <motion.li 
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="flex gap-3 text-sm text-white/60"
                            >
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-white/40">
                                {i + 1}
                              </span>
                              <span className="leading-relaxed">{h}</span>
                            </motion.li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </StoryPanel>

                  <div className="flex flex-col gap-6">
                    <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#0c0c12] shadow-2xl">
                      <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">sql_editor.sql</span>
                        <div className="flex-1" />
                        <Terminal className="w-3.5 h-3.5 text-white/20" />
                      </div>
                      
                      <SqlEditor value={sql} onChange={handleChange} onSubmit={runQuery} />
                      
                      <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-white/30">
                          <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/50">Ctrl</kbd>
                          {' + '}
                          <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-white/50">Enter</kbd>
                          {' untuk eksekusi'}
                        </span>
                        <Button
                          onClick={runQuery}
                          disabled={status === 'loading' || !sql.trim()}
                          className="px-4 py-1.5 h-auto rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition-all duration-200 flex items-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {status === 'loading' ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Zap className="w-3.5 h-3.5" />
                            </motion.div>
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                          {status === 'loading' ? 'Menjalankan...' : 'Run Query'}
                        </Button>
                      </div>
                    </div>

                    <motion.div 
                      className="rounded-xl border border-white/5 bg-white/[0.02] p-5"
                      whileHover={{ borderColor: 'rgba(255,255,255,0.08)' }}
                    >
                      <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider flex items-center gap-2">
                            <Trophy className="w-3.5 h-3.5" /> Tebak Pelaku
                          </label>
                          <Input
                            value={answer}
                            onChange={(e) => { setAnswer(e.target.value); setSolve(null); }}
                            onKeyDown={(e) => { if (e.key === 'Enter') submitAnswer(); }}
                            placeholder="mis. Irfan Maulana atau P-1003"
                            className="w-full bg-[#0c0c12] border-white/10 rounded-lg px-4 py-2.5 text-sm font-mono text-white/90 placeholder:text-white/20 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                          />
                        </div>
                        <Button
                          onClick={submitAnswer}
                          disabled={status === 'loading' || !answer.trim()}
                          variant="outline"
                          className="px-6 py-2.5 h-auto rounded-lg border-white/10 bg-transparent hover:border-amber-500/30 hover:bg-amber-500/5 text-white/70 hover:text-amber-400 text-sm font-medium transition-all duration-200 disabled:opacity-50"
                        >
                          Tebak Pelaku
                        </Button>
                      </div>
                    </motion.div>

                    <AnimatePresence>
                      {error && episode && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 overflow-hidden"
                        >
                          <div className="flex items-center gap-2 text-red-400 mb-1">
                            <Database className="w-4 h-4" />
                            <span className="text-sm font-semibold">Query Error</span>
                          </div>
                          <p className="text-sm text-red-400/70 font-mono">{error}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {solve && !solve.correct && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
                        >
                          <div className="flex items-center gap-2 text-amber-400 mb-1">
                            <Search className="w-4 h-4" />
                            <span className="text-sm font-semibold">Belum Benar</span>
                          </div>
                          <p className="text-sm text-amber-400/70">{solve.message}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <ResultTable 
                      columns={query?.columns ?? []} 
                      rows={query?.rows ?? []} 
                      isLoading={status === 'loading'} 
                    />
                    
                    {query?.truncated && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-amber-500/60 font-mono flex items-center gap-1.5"
                      >
                        <Zap className="w-3 h-3" />
                        Hasil dibatasi 500 baris. Persempit query kamu.
                      </motion.p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-24 bg-white/10" />
                      <Skeleton className="h-5 w-20 bg-white/5" />
                    </div>
                    <Skeleton className="h-6 w-3/4 bg-white/10" />
                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-3">
                        <Skeleton className="h-3 w-full bg-white/5" />
                        <Skeleton className="h-3 w-full bg-white/5" />
                        <Skeleton className="h-3 w-5/6 bg-white/5" />
                        <Skeleton className="h-20 w-full bg-white/[0.02] border border-white/5" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-1/3 bg-white/10" />
                        <Skeleton className="h-3 w-full bg-white/5" />
                        <Skeleton className="h-3 w-full bg-white/5" />
                        <Skeleton className="h-3 w-4/5 bg-white/5" />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden border border-white/5 bg-[#0c0c12]">
                    <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/5 flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      </div>
                      <Skeleton className="h-3 w-20 bg-white/10 ml-2" />
                    </div>
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-3 w-full bg-white/5" />
                      <Skeleton className="h-3 w-5/6 bg-white/5" />
                      <Skeleton className="h-3 w-4/6 bg-white/5" />
                    </div>
                    <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                      <Skeleton className="h-3 w-24 bg-white/5" />
                      <Skeleton className="h-7 w-24 bg-amber-500/20 rounded-lg" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 flex flex-col items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full bg-white/5" />
                    <Skeleton className="h-3 w-40 bg-white/5" />
                    <Skeleton className="h-2 w-56 bg-white/5" />
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <Dialog open={verdictDialogOpen} onOpenChange={setVerdictDialogOpen}>
        <DialogContent className="bg-[#0f0f14] border-white/10 text-[#e8e4dc] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-amber-400 text-xl">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <FileSearch className="w-5 h-5" />
              </div>
              Kasus Terpecahkan
            </DialogTitle>
            <DialogDescription className="text-white/60 leading-relaxed">
              {solve?.message}
            </DialogDescription>
          </DialogHeader>
          
          {solve?.score !== undefined && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-1">Query</p>
                  <p className="text-lg font-mono font-bold text-amber-400">
                    {String(solve.breakdown?.queryCount ?? 0).padStart(2, '0')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-1">Salah</p>
                  <p className="text-lg font-mono font-bold text-red-400">
                    {String(solve.breakdown?.wrongAttempts ?? 0).padStart(2, '0')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-white/30 uppercase tracking-wider mb-1">Skor</p>
                  <p className="text-lg font-mono font-bold text-emerald-400">{solve.score}</p>
                </div>
              </div>
            </div>
          )}
          
          {solve?.verdict && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="border-t border-white/5 pt-4 text-sm leading-relaxed text-white/60 italic"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              "{solve.verdict}"
            </motion.p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
