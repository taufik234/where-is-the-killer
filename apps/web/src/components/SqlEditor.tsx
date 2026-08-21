import { Textarea } from '@/components/ui/textarea';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function SqlEditor({ value, onChange, onSubmit }: SqlEditorProps) {
  return (
    <div className="space-y-1">
      <label htmlFor="sql-input" className="block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Editor SQL
      </label>
      <Textarea
        id="sql-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') onSubmit();
        }}
        spellCheck={false}
        placeholder={`-- tulis query bukti di sini\nSELECT * FROM ...`}
        className="min-h-32 bg-background font-mono text-sm text-primary caret-primary placeholder:text-muted-foreground/60"
        rows={7}
      />
      <p className="text-xs text-foreground/60">
        jalankan: <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">Ctrl</kbd>+<kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">Enter</kbd>
      </p>
    </div>
  );
}