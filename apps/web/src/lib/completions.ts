import type { Completion } from '@codemirror/autocomplete';

export function episodeCompletions(tables: { name: string; columns: string[] }[]): Completion[] {
  const completions: Completion[] = [];
  for (const t of tables) {
    completions.push({ label: t.name, type: 'table', detail: 'table' });
    for (const col of t.columns) {
      completions.push({ label: col, type: 'column', detail: `${t.name}.${col}` });
    }
  }
  // Tambah keyword umum agar autocomplete tetap berguna tanpa backend
  const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'GROUP BY', 'HAVING', 'ORDER BY', 'COUNT', 'AVG', 'SUM', 'BETWEEN', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'LIMIT', 'DISTINCT'];
  for (const k of keywords) completions.push({ label: k, type: 'keyword' });
  return completions;
}
