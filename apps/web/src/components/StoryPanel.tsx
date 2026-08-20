import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StoryPanelProps {
  title: string;
  focus: string;
  statusLabel: string;
  brief: string;
  goal: string;
  children?: ReactNode;
}

export default function StoryPanel({ title, focus, statusLabel, brief, goal, children }: StoryPanelProps) {
  return (
    <Card className="gap-4 border-white/10">
      <CardHeader className="gap-2">
        <Badge variant="secondary" className="w-fit font-mono text-[10px] uppercase tracking-[0.18em]">
          {focus}
        </Badge>
        <CardTitle className="text-xl leading-tight">{title}</CardTitle>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {statusLabel}
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm leading-relaxed text-foreground/80">{brief}</p>
        <div className="rounded-md border bg-muted/30 p-4">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tujuan</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">{goal}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}