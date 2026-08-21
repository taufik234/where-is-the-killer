import { useCallback, useEffect, useState } from 'react';

function keyFor(seasonId: number | null, episodeId: number | null) {
  return `query-noir:history:${seasonId ?? 'x'}:${episodeId ?? 'x'}`;
}

export function useHistory(seasonId: number | null, episodeId: number | null) {
  const [items, setItems] = useState<string[]>([]);

  const load = useCallback(() => {
    if (episodeId == null) return;
    try {
      const raw = localStorage.getItem(keyFor(seasonId, episodeId));
      if (raw) setItems(JSON.parse(raw));
      else setItems([]);
    } catch {
      setItems([]);
    }
  }, [seasonId, episodeId]);

  useEffect(() => {
    load();
  }, [load]);

  const push = useCallback((query: string) => {
    if (!query.trim() || episodeId == null) return;
    try {
      const raw = localStorage.getItem(keyFor(seasonId, episodeId));
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = [query, ...list.filter((q) => q !== query)].slice(0, 50);
      localStorage.setItem(keyFor(seasonId, episodeId), JSON.stringify(next));
      setItems(next);
    } catch {}
  }, [seasonId, episodeId]);

  const clear = useCallback(() => {
    if (episodeId == null) return;
    localStorage.removeItem(keyFor(seasonId, episodeId));
    setItems([]);
  }, [seasonId, episodeId]);

  return { items, push, clear, reload: load };
}
