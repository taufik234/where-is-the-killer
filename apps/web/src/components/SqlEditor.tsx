interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function SqlEditor({ value, onChange, onSubmit }: SqlEditorProps) {
  return (
    <div className="mb-4">
      <label htmlFor="sql-input" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
        Editor SQL
      </label>
      <textarea
        id="sql-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') onSubmit();
        }}
        spellCheck={false}
        placeholder="-- tulis query bukti di sini&#10;SELECT * FROM ..."
        className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 font-mono text-sm text-emerald-300 outline-none focus:border-sky-500"
        rows={7}
      />
      <p className="mt-1 text-xs text-slate-500">berjalan: <kbd className="rounded bg-slate-800 px-1">Ctrl</kbd>+<kbd className="rounded bg-slate-800 px-1">Enter</kbd></p>
    </div>
  );
}