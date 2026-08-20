import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Check, Lock, RotateCcw, Sparkles } from 'lucide-react';
import { api, type EpisodeDetail, type EpisodeSummary, type QueryResponse, type SolveResponse } from '@/lib/api';
import SqlEditor from './SqlEditor';
import ResultTable from './ResultTable';
import StoryPanel from './StoryPanel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar';

type Status = 'idle' | 'loading' | 'success' | 'error';

const STATUS_LABEL = {
  solved: 'TERPECAHKAN',
  available: 'SIAP DIIKUTI',
  locked: 'TERKUNCI',
} as const;

const EPISODE_ICONS = [BookOpen, Sparkles, Lock, Lock, Lock];

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
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2">
            <span className="text-lg font-black tracking-tight">
              <span className="text-primary">Query</span> Noir
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Kasus</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {episodes?.map((ep, i) => {
                  const Icon = EPISODE_ICONS[i % EPISODE_ICONS.length];
                  return (
                    <SidebarMenuItem key={ep.id}>
                      <SidebarMenuButton
                        isActive={episode?.id === ep.id}
                        onClick={() => selectEpisode(ep.id)}
                        disabled={ep.status === 'locked'}
                        tooltip={ep.title}
                      >
                        <Icon />
                        <span>Bab {ep.id}</span>
                        <SidebarMenuBadge>
                          {ep.status === 'solved' ? (
                            <Check className="size-3.5 text-primary" />
                          ) : ep.status === 'locked' ? (
                            <Lock className="size-3.5 text-muted-foreground" />
                          ) : null}
                        </SidebarMenuBadge>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
          <SidebarGroup>
            <SidebarGroupLabel>Skor</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-1">
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-primary">{totalScore}</span>
                </div>
                <Progress value={(solvedCount / totalCount) * 100} className="mt-2" />
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {solvedCount}/{totalCount} kasus
                </p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-2">
            <Button variant="outline" size="sm" className="w-full" onClick={() => location.reload()}>
              <RotateCcw /> Mulai ulang
            </Button>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center gap-2 border-b px-4 py-2">
          <SidebarTrigger />
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Kasus {episode ? String(episode.id).padStart(2, '0') : '--'}
          </span>
        </header>
        <main className="flex-1 p-6">
          {error && !episode && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Gagal memuat</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {episode ? (
            <div className="flex flex-col gap-6">
              <StoryPanel
                title={episode.title}
                focus={episode.focus}
                statusLabel={STATUS_LABEL[episode.status]}
                brief={episode.brief}
                goal={episode.goal}
              >
                {episode.hints.length > 0 && (
                  <div className="mt-2 border-t pt-4">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Petunjuk
                    </p>
                    <ol className="mt-2 list-inside list-decimal space-y-1.5 text-sm text-foreground/80">
                      {episode.hints.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </StoryPanel>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-6 rounded-lg border bg-card px-6 py-5">
                  <SqlEditor value={sql} onChange={handleChange} onSubmit={runQuery} />

                  <div className="flex flex-wrap items-center gap-3">
                    <Button onClick={runQuery} disabled={status === 'loading' || !sql.trim()} className="min-h-11">
                      {status === 'loading' ? 'Menjalankan…' : 'Run Query'}
                    </Button>
                  </div>

                  <Card className="gap-3 border p-4 shadow-none">
                    <CardContent className="flex flex-col gap-2 p-0">
                      <label htmlFor="answer-input" className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Tebak pelaku — tulis nama atau kode
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          id="answer-input"
                          value={answer}
                          onChange={(e) => { setAnswer(e.target.value); setSolve(null); }}
                          onKeyDown={(e) => { if (e.key === 'Enter') submitAnswer(); }}
                          placeholder="mis. Irfan Maulana atau P-1003"
                          className="max-w-64 bg-background font-mono"
                        />
                        <Button
                          onClick={submitAnswer}
                          disabled={status === 'loading' || !answer.trim()}
                          variant="outline"
                          className="min-h-11"
                        >
                          Tebak Pelaku
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {error && episode && (
                  <Alert variant="destructive">
                    <AlertTitle>Query error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {solve && !solve.correct && (
                  <Card className="gap-3 border-amber-500/40 p-4 shadow-none animate-rise-in">
                    <CardContent className="flex flex-col gap-1 p-0">
                      <Badge variant="outline" className="w-fit text-amber-500">Belum benar</Badge>
                      <p className="text-sm text-foreground/80">{solve.message}</p>
                    </CardContent>
                  </Card>
                )}

                <ResultTable columns={query?.columns ?? []} rows={query?.rows ?? []} />
                {query?.truncated && (
                  <p className="text-xs text-muted-foreground">Hasil dibatasi 500 baris — persempit query kamu.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Memuat kasus…</p>
          )}
        </main>
      </SidebarInset>

      <Dialog open={verdictDialogOpen} onOpenChange={setVerdictDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Sparkles /> Kasus terpecahkan
            </DialogTitle>
            <DialogDescription>
              {solve?.message}
            </DialogDescription>
          </DialogHeader>
          {solve?.score !== undefined && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/30 p-3 font-mono text-sm">
              <span className="text-muted-foreground">query {String(solve.breakdown?.queryCount ?? 0).padStart(2, '0')}</span>
              <span className="text-muted-foreground">salah {String(solve.breakdown?.wrongAttempts ?? 0).padStart(2, '0')}</span>
              <span className="font-semibold text-primary">skor {solve.score}</span>
            </div>
          )}
          {solve?.verdict && (
            <p className="border-t pt-3 text-sm leading-relaxed text-foreground/80">{solve.verdict}</p>
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}