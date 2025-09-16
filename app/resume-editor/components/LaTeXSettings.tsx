"use client";

import { LaTeXSettings } from "./types";

interface LaTeXSettingsProps {
  settings: LaTeXSettings;
  onSettingsChange: (settings: Partial<LaTeXSettings>) => void;
}

export default function LaTeXSettingsPanel({ settings, onSettingsChange }: LaTeXSettingsProps) {
  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-5">
      <h2 className="font-bold mb-4 text-sm tracking-wide">LATEX SETTINGS</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400">Template</label>
          <select
            value={settings.selectedTemplate}
            onChange={(e) =>
              onSettingsChange({
                selectedTemplate: e.target.value as
                  | "classic"
                  | "modern"
                  | "creative"
                  | "professional",
              })
            }
            className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
          >
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="creative">Creative</option>
            <option value="professional">Professional</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400">Page Size</label>
          <select
            value={settings.pageSize}
            onChange={(e) =>
              onSettingsChange({ pageSize: e.target.value as "letter" | "a4" })
            }
            className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
          >
            <option value="letter">Letter</option>
            <option value="a4">A4</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400">Font Family</label>
          <select
            value={settings.fontFamily}
            onChange={(e) =>
              onSettingsChange({
                fontFamily: e.target.value as "serif" | "sans-serif" | "mono",
              })
            }
            className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
          >
            <option value="serif">Serif</option>
            <option value="sans-serif">Sans Serif</option>
            <option value="mono">Monospace</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400">Colors</label>
          <div className="flex gap-2 mt-1">
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => onSettingsChange({ primaryColor: e.target.value })}
              className="w-full h-8 bg-black/40 border border-white/10 rounded cursor-pointer"
              title="Primary Color"
            />
            <input
              type="color"
              value={settings.secondaryColor}
              onChange={(e) => onSettingsChange({ secondaryColor: e.target.value })}
              className="w-full h-8 bg-black/40 border border-white/10 rounded cursor-pointer"
              title="Secondary Color"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
