interface ResultTableProps {
  columns: string[];
  rows: Record<string, unknown>[];
}

export default function ResultTable({ columns, rows }: ResultTableProps) {
  if (columns.length === 0) {
    return <p className="text-sm text-slate-400">Jalankan query untuk melihat hasil.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-700">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-800">
          <tr>
            {columns.map((col) => (
              <th key={col} className="border-b border-slate-700 px-3 py-2 font-mono text-xs font-semibold text-sky-400">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-slate-900 even:bg-slate-900/60">
              {columns.map((col) => (
                <td key={col} className="border-b border-slate-800 px-3 py-1.5 font-mono text-xs text-slate-300">
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