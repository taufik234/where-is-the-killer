import { useEffect, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { autocompletion } from '@codemirror/autocomplete';
import type { CompletionContext } from '@codemirror/autocomplete';
import { lintGutter } from '@codemirror/lint';
import { EditorView, keymap } from '@codemirror/view';
import { Prec, Compartment } from '@codemirror/state';
import { episodeCompletions } from '@/lib/completions';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  tables?: { name: string; columns: string[] }[];
}

const amberTheme = EditorView.theme({
  '&': { backgroundColor: '#0c0c12', color: '#e8e4dc' },
  '.cm-content': { caretColor: '#f59e0b', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', padding: '12px 0' },
  '.cm-gutters': { backgroundColor: '#0c0c12', color: '#ffffff1a', borderRight: '1px solid rgba(255,255,255,0.05)' },
  '.cm-activeLineGutter': { backgroundColor: 'rgba(245,158,11,0.08)' },
  '.cm-activeLine': { backgroundColor: 'rgba(245,158,11,0.04)' },
  '.cm-cursor': { borderLeftColor: '#f59e0b' },
  '.cm-selectionBackground, ::selection': { backgroundColor: 'rgba(245,158,11,0.2)' },
});

function tableCompletionSource(tables: { name: string; columns: string[] }[]) {
  const completions = episodeCompletions(tables);
  return (context: CompletionContext) => {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;
    return { from: word.from, options: completions };
  };
}

export default function SqlEditor({ value, onChange, onSubmit, tables }: SqlEditorProps) {
  const extensions = useMemo(() => {
    const submitKeymap = Prec.highest(
      keymap.of([
        { key: 'Ctrl-Enter', run: () => { onSubmit(); return true; } },
        { key: 'Cmd-Enter', run: () => { onSubmit(); return true; } },
      ])
    );
    const base = [sql(), lintGutter(), amberTheme, submitKeymap, EditorView.lineWrapping];
    if (tables && tables.length > 0) {
      base.push(autocompletion({ override: [tableCompletionSource(tables)] }));
    } else {
      base.push(autocompletion());
    }
    return base;
  }, [tables, onSubmit]);

  return (
    <CodeMirror
      value={value}
      height="180px"
      extensions={extensions}
      onChange={(val) => onChange(val)}
      placeholder="-- tulis query bukti di sini
SELECT * FROM ..."
      basicSetup={{ lineNumbers: true, highlightActiveLineGutter: true, highlightActiveLine: true, foldGutter: false }}
      className="text-sm"
    />
  );
}
