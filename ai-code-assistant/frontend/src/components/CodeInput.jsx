import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import Loader from './Loader.jsx';

function defineTheme(monaco) {
  monaco.editor.defineTheme('codesage', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#0b0f1d',
      'editor.lineHighlightBackground': '#141a2e',
      'editorLineNumber.foreground': '#4a5578',
      'editorLineNumber.activeForeground': '#a5b0ff',
      'editorGutter.background': '#0b0f1d',
      'editorCursor.foreground': '#a5b0ff',
      'editor.selectionBackground': '#3b4180',
    },
  });
}

/**
 * Monaco editor wrapper. `highlightLines` marks lines flagged by the debugger.
 */
export default function CodeInput({ value, onChange, language, highlightLines = [] }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef(null);
  const linesKey = highlightLines.join(',');

  const applyDecorations = () => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const decorations = linesKey
      ? linesKey.split(',').map((line) => ({
          range: new monaco.Range(Number(line), 1, Number(line), 1),
          options: { isWholeLine: true, className: 'editor-issue-line' },
        }))
      : [];

    if (decorationsRef.current) decorationsRef.current.set(decorations);
    else decorationsRef.current = editor.createDecorationsCollection(decorations);
  };

  useEffect(applyDecorations, [linesKey]);

  return (
    <div className="editor-frame">
      <Editor
        height="100%"
        theme="codesage"
        language={language}
        value={value}
        onChange={(next) => onChange(next ?? '')}
        beforeMount={defineTheme}
        onMount={(editor, monaco) => {
          editorRef.current = editor;
          monacoRef.current = monaco;
          applyDecorations();
        }}
        loading={<Loader block label="Loading editor…" />}
        options={{
          ariaLabel: 'Code editor',
          fontSize: 14,
          fontFamily: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 14, bottom: 14 },
          tabSize: 4,
          wordWrap: 'on',
          renderLineHighlight: 'line',
        }}
      />
    </div>
  );
}
