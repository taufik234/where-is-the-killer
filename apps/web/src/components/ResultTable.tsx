interface ResultTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
}

export default function ResultTable({ columns, rows }: ResultTableProps) {
  if (columns.length === 0) {
    return <p className="text-sm text-slate-500">Jalankan query untuk melihat hasil.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-md border border-white/10">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-surface-2">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="border-b border-white/10 px-3 py-2 font-mono text-xs font-semibold text-accent">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-surface-0/40 even:bg-surface-1">
              {columns.map((col) => (
                <td key={col} className="border-b border-white/5 px-3 py-1.5 font-mono text-xs text-slate-300">
                  {String(row[col] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}