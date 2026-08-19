import type { ReactNode } from 'react';

interface StoryPanelProps {
  title: string;
  focus: string;
  brief: string;
  goal: string;
  children?: ReactNode;
}

export default function StoryPanel({ title, focus, brief, goal, children }: StoryPanelProps) {
  return (
    <aside className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-sky-500">{focus}</p>
      <h2 className="mt-1 text-2xl font-bold leading-tight text-slate-100">{title}</h2>
      <p className="mt-4 text-sm leading-relaxed text-slate-300">{brief}</p>
      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tujuan</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-200">{goal}</p>
      </div>
      {children}
    </aside>
  );
}