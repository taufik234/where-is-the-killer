import type { ReactNode } from 'react';

interface StoryPanelProps {
  title: string;
  focus: string;
  statusLabel: string;
  statusColor?: string;
  brief: string;
  goal: string;
  children?: ReactNode;
}

export default function StoryPanel({ title, focus, statusLabel, statusColor, brief, goal, children }: StoryPanelProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] text-amber-400">
              {focus}
            </span>
            {statusColor && (
              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider ${statusColor}`}>
                {statusLabel}
              </span>
            )}
            {!statusColor && (
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">{statusLabel}</span>
            )}
          </div>
          <h2 className="text-xl font-bold leading-tight text-white">{title}</h2>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-white/60">{brief}</p>
          <div className="rounded-xl border border-white/5 bg-[#0c0c12] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-1.5">Tujuan</p>
            <p className="text-sm leading-relaxed text-white/80">{goal}</p>
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
