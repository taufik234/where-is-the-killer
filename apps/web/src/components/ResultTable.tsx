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
}

export default function ResultTable({ columns, rows }: ResultTableProps) {
  if (columns.length === 0) {
    return <p className="text-sm text-muted-foreground">Jalankan query untuk melihat hasil.</p>;
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