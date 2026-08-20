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
        placeholder={`-- tulis query bukti di sini\nSELECT * FROM ...`}
        className="w-full rounded-md border border-white/15 bg-surface-0 p-3 font-mono text-sm text-accent caret-accent outline-none placeholder:text-slate-600 focus:border-accent"
        rows={7}
      />
      <p className="mt-1 text-xs text-slate-500">
        jalankan: <kbd className="rounded bg-surface-2 px-1">Ctrl</kbd>+<kbd className="rounded bg-surface-2 px-1">Enter</kbd>
      </p>
    </div>
  );
}