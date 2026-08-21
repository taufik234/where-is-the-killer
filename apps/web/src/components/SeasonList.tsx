import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Trophy, Lock, Check } from 'lucide-react';
import { api, type SeasonSummary } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';

interface SeasonListProps {
  onSelectEpisode?: (id: number) => void;
  activeEpisodeId?: number | null;
  seasons?: SeasonSummary[] | null;
}

export default function SeasonList({ onSelectEpisode, activeEpisodeId, seasons: propSeasons }: SeasonListProps) {
  const [seasonsInternal, setSeasonsInternal] = useState<SeasonSummary[] | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({ 1: true });

  useEffect(() => {
    if (propSeasons !== undefined) return;
    api.seasons().then(setSeasonsInternal).catch(() => {});
  }, [propSeasons]);

  const seasons = propSeasons !== undefined ? propSeasons : seasonsInternal;

  const toggle = (id: number) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  if (!seasons) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
        <Skeleton className="h-4 w-40 bg-white/10" />
        <Skeleton className="h-2 w-full bg-white/5" />
        <Skeleton className="h-12 w-full bg-white/[0.02] border border-white/5" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {seasons.map((season) => {
        const isExpanded = expanded[season.id] ?? true;
        const progress = season.episodeCount ? (season.solvedCount / season.episodeCount) * 100 : 0;
        return (
          <div key={season.id} className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
            <button
              onClick={() => toggle(season.id)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Kasus #{season.id}: {season.title}
                    <span className="text-[10px] font-mono text-white/30 border border-white/10 rounded px-1.5 py-0.5">{season.solvedCount}/{season.episodeCount}</span>
                  </h3>
                  <p className="text-[11px] text-white/40 font-mono">5 episode investigasi</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:block w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-amber-500 rounded-full"
                  />
                </div>
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 text-white/40" />
                </motion.div>
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="border-t border-white/5"
                >
                  <div className="p-2 space-y-1">
                    {season.episodes.map((ep) => {
                      const isActive = activeEpisodeId === ep.id;
                      const isLocked = ep.status === 'locked';
                      return (
                        <button
                          key={ep.id}
                          onClick={() => !isLocked && onSelectEpisode?.(ep.id)}
                          disabled={isLocked}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                            isActive
                              ? 'bg-amber-500/10 border border-amber-500/20'
                              : isLocked
                                ? 'opacity-40 cursor-not-allowed border border-transparent'
                                : 'hover:bg-white/[0.03] border border-transparent hover:border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono text-white/20">#{String(ep.id).padStart(2, '0')}</span>
                            <span className={`text-sm ${isActive ? 'text-amber-100 font-medium' : 'text-white/70'}`}>{ep.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                              ep.status === 'solved' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' : ep.status === 'available' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' : 'text-white/30 border-white/10 bg-white/5'
                            }`}>
                              {ep.status === 'solved' ? 'TERPECAHKAN' : ep.status === 'available' ? 'SIAP DIIKUTI' : 'TERKUNCI'}
                            </span>
                            {ep.status === 'solved' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : isLocked ? <Lock className="w-3.5 h-3.5 text-white/20" /> : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="px-4 pb-3 flex items-center gap-2 text-[10px] font-mono text-white/20">
                    <span>Solved {season.solvedCount}/{season.episodeCount}</span>
                    <span className="w-px h-3 bg-white/10" />
                    <span>Available {season.availableCount}/{season.episodeCount}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
