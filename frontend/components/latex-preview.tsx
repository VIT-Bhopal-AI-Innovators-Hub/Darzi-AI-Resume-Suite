'use client';

import React, { useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { generateLatexFromResumeData, type ResumeData } from '@/lib/latex-generator';
import { exportToPDF } from '@/lib/pdf-export';

interface LaTeXPreviewProps {
  resumeData: ResumeData;
  className?: string;
}

export default function LaTeXPreview({ resumeData, className = '' }: LaTeXPreviewProps) {
  const latexCode = useMemo(() => {
    return generateLatexFromResumeData(resumeData);
  }, [resumeData]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(latexCode);
      // You could add a toast notification here
      console.log('LaTeX code copied to clipboard');
    } catch (err) {
      console.error('Failed to copy LaTeX code:', err);
    }
  };

  const downloadLatexFile = () => {
    const blob = new Blob([latexCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.fullName || 'resume'}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(resumeData);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please ensure popups are allowed and try again.');
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button 
            onClick={copyToClipboard}
            className="text-xs bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-blue-700"
          >
            Copy LaTeX
          </button>
          <button 
            onClick={downloadLatexFile}
            className="text-xs bg-green-600 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-green-700"
          >
            Download .tex
          </button>
          <button 
            onClick={handleExportPDF}
            className="text-xs bg-red-600 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-red-700"
          >
            Export PDF
          </button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        <SyntaxHighlighter
          language="latex"
          style={oneDark}
          customStyle={{
            margin: 0,
            background: 'transparent',
            fontSize: '12px',
            lineHeight: '1.4',
          }}
          showLineNumbers={true}
          wrapLines={true}
        >
          {latexCode}
        </SyntaxHighlighter>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        <p>This LaTeX code uses the moderncv package. To compile:</p>
        <code className="bg-black/40 px-2 py-1 rounded text-gray-300">
          pdflatex resume.tex
        </code>
        <p className="mt-2">
          <strong>Export PDF:</strong> Creates a PDF using browser's print function. 
          For true LaTeX compilation, use the generated .tex file with a LaTeX editor.
        </p>
      </div>
    </div>
  );
}