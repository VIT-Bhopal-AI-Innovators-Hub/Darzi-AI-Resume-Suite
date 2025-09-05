"use client";

import dynamic from "next/dynamic";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

interface LaTeXEditorProps {
  latexCode: string;
  onCodeChange: (code: string) => void;
}

export default function LaTeXEditor({ latexCode, onCodeChange }: LaTeXEditorProps) {
  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-sm tracking-wide">LATEX CODE EDITOR</h2>
      </div>
      <div className="h-96 border border-white/10 rounded-md overflow-hidden">
        <MonacoEditor
          height="100%"
          language="latex"
          theme="vs-dark"
          value={latexCode}
          onChange={(value) => {
            if (value) {
              onCodeChange(value);
            }
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </section>
  );
}
