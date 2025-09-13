import React from 'react';

interface TemplateSelectorProps {
  selectedTemplate: 'classic' | 'modern' | 'Academic' | 'creative' | 'professional' | 'minimalist';
  setSelectedTemplate: (template: 'classic' | 'modern' | 'Academic' | 'creative' | 'professional' | 'minimalist') => void;
  pageSize: 'a4' | 'letter';
  setPageSize: (size: 'a4' | 'letter') => void;
  fontFamily: 'serif' | 'sans-serif' | 'mono';
  setFontFamily: (font: 'serif' | 'sans-serif' | 'mono') => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
  sectionSpacingMm: number;
  setSectionSpacingMm: (v: number) => void;
}

export default function TemplateSelector({
  selectedTemplate,
  setSelectedTemplate,
  pageSize,
  setPageSize,
  fontFamily,
  setFontFamily,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  sectionSpacingMm,
  setSectionSpacingMm,
}: TemplateSelectorProps) {
  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-5">
      <h2 className="font-bold mb-4 text-sm tracking-wide">TEMPLATE & STYLE</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="min-w-0">
          <label className="text-xs text-gray-400 block mb-1">Template</label>
          <select
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value as 'classic' | 'modern' | 'Academic' | 'creative' | 'professional' | 'minimalist')}
          >
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="creative">Creative</option>
          </select>
        </div>
        <div className="min-w-0">
          <label className="text-xs text-gray-400 block mb-1">Page Size</label>
          <select
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter')}
          >
            <option value="letter">Letter (8.5×11 in)</option>
            <option value="a4">A4 (8.27×11.69 in)</option>
          </select>
        </div>
        <div className="min-w-0">
          <label className="text-xs text-gray-400 block mb-1">Font Family</label>
          <select
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
            value={fontFamily}
            onChange={(e) =>
              setFontFamily(e.target.value as 'serif' | 'sans-serif' | 'mono')
            }
          >
            <option value="serif">Serif</option>
            <option value="sans-serif">Sans Serif</option>
            <option value="mono">Monospace</option>
          </select>
        </div>
        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0">
              <label className="text-xs text-gray-400 block mb-1">Primary Color</label>
              <input
                type="color"
                className="w-full h-10 border border-white/10 bg-black/40 cursor-pointer rounded"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
            </div>
            <div className="min-w-0">
              <label className="text-xs text-gray-400 block mb-1">Secondary Color</label>
              <input
                type="color"
                className="w-full h-10 border border-white/10 bg-black/40 cursor-pointer rounded"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="min-w-0">
          <label className="text-xs text-gray-400 block mb-1">Section spacing (mm)</label>
          <input
            type="number"
            min={0}
            max={20}
            step={0.5}
            value={sectionSpacingMm}
            onChange={(e) => setSectionSpacingMm(Number(e.target.value || 0))}
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
          />
        </div>
      </div>
    </section>
  );
}
