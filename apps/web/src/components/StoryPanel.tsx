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
        <Badge variant="secondary" className="w-fit font-mono uppercase tracking-[0.18em]">
          {focus}
        </Badge>
        <CardTitle className="text-xl leading-tight">{title}</CardTitle>
        <span className="text-xs font-medium text-muted-foreground">{statusLabel}</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-0 md:px-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8">
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-foreground/80">{brief}</p>
            <div className="rounded-md bg-muted/30 p-4">
              <p className="text-sm font-semibold text-foreground">Tujuan</p>
              <p className="mt-0.5 text-sm leading-relaxed text-foreground/90">{goal}</p>
            </div>
          </div>
          <div>{children}</div>
        </div>
      </CardContent>
    </Card>
  );
}