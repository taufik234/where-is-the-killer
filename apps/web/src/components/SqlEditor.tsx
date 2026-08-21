import { Textarea } from '@/components/ui/textarea';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export default function SqlEditor({ value, onChange, onSubmit }: SqlEditorProps) {
  return (
    <Textarea
      id="sql-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') onSubmit();
      }}
      spellCheck={false}
      placeholder={`-- tulis query bukti di sini
SELECT * FROM ...`}
      className="min-h-32 w-full resize-none bg-[#0c0c12] border-0 rounded-none font-mono text-sm text-white/90 caret-amber-500 placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 px-4 py-3"
      rows={7}
    />
  );
}