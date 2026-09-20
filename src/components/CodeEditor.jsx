import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useBuilderStore } from '../store/useBuilderStore';
import { Code2, Sparkles } from 'lucide-react';

export default function CodeEditor() {
  const { currentCode, setCurrentCode } = useBuilderStore();
  const debounceTimerRef = useRef(null);

  const handleEditorChange = (value) => {
    if (value === undefined) return;
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setCurrentCode(value);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-[#1e1e1e] border-r border-slate-800 overflow-hidden">
      {/* Code Editor Header */}
      <div className="h-9 bg-slate-950 border-b border-slate-800 px-3 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Code2 className="w-3.5 h-3.5 text-violet-400" />
          <span>index.html</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Live Editor Sync</span>
        </div>
      </div>

      {/* Monaco Editor Instance */}
      <div className="flex-1 w-full h-full">
        <Editor
          height="100%"
          defaultLanguage="html"
          theme="vs-dark"
          value={currentCode}
          onChange={handleEditorChange}
          options={{
            fontSize: 13,
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
}
