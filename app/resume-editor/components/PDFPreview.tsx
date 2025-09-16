"use client";

import { ZoomIn, ZoomOut, Download, FileText } from "lucide-react";

interface PDFPreviewProps {
  pdfUrl: string;
  loading: boolean;
  error: string | null;
  wsConnected: boolean;
  zoomLevel: number;
  onZoomChange: (zoom: number) => void;
  onRetry: () => void;
}

export default function PDFPreview({
  pdfUrl,
  loading,
  error,
  wsConnected,
  zoomLevel,
  onZoomChange,
  onRetry,
}: PDFPreviewProps) {
  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-sm tracking-wide">PDF PREVIEW</h2>
        <div className="flex items-center gap-2">
          <div
            className={`text-xs px-2 py-1 rounded ${
              wsConnected
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            }`}
          >
            {wsConnected ? "● Connected" : "● Disconnected"}
          </div>
          <button
            onClick={() => onZoomChange(Math.max(0.5, zoomLevel - 0.1))}
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded"
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="text-xs text-gray-400 min-w-[3rem] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(2, zoomLevel + 0.1))}
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded"
            disabled={zoomLevel >= 2}
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          {pdfUrl && (
            <a
              href={pdfUrl}
              download="resume.pdf"
              className="text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200 flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Download
            </a>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="bg-black/20 rounded-lg p-4 min-h-[600px] flex items-center justify-center">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="text-sm text-gray-400">Building your resume...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="text-red-400 text-4xl mb-3">⚠</div>
            <p className="text-sm text-red-400 mb-2">Connection Error</p>
            <p className="text-xs text-gray-400">{error}</p>
            <button
              onClick={onRetry}
              className="mt-3 text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        ) : pdfUrl ? (
          <div
            className="w-full h-full max-w-full overflow-auto"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top left",
              width: `${100 / zoomLevel}%`,
              height: `${100 / zoomLevel}%`,
            }}
          >
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=page-width`}
              className="w-full h-full min-h-[600px] border-0 rounded-md pdf-viewer"
              title="Resume Preview"
              style={{
                pointerEvents: "auto",
                overflow: "hidden",
              }}
            />

            <style jsx>{`
              .pdf-viewer {
                filter: none;
              }
              .pdf-viewer::-webkit-scrollbar {
                display: none;
              }
            `}</style>
          </div>
        ) : (
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {wsConnected
                ? "Click 'Manual Build' to generate your resume preview"
                : "Connecting to LaTeX service..."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
