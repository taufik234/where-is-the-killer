import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ResultTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
  isLoading?: boolean;
}

export default function ResultTable({ columns, rows, isLoading }: ResultTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border p-4">
        <p className="text-sm text-muted-foreground">Menjalankan query...</p>
        <div className="mt-3 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-3 w-4/6 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }
  if (columns.length === 0) {
    return <p className="text-sm text-muted-foreground">Jalankan query untuk melihat hasil. Tulis SELECT di editor lalu tekan Run Query.</p>;
  }
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-amber-500/20 bg-amber-500/5 p-4">
        <p className="text-sm font-medium text-foreground">Query berhasil, tidak ada baris yang cocok.</p>
        <p className="mt-1 text-sm text-foreground/70">Coba longgarkan WHERE atau cek nama kolom dan nilai. Gunakan SELECT * untuk melihat semua data dulu.</p>
      </div>
    );
  }
  return (
    <ScrollArea className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((col) => (
              <TableHead key={col} className="font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i} className="odd:bg-muted/30">
              {columns.map((col) => (
                <TableCell key={col} className="font-mono text-xs text-foreground/80">
                  {String(row[col] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}