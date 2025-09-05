"use client";

import { Eye, Code } from "lucide-react";

interface ViewTabsProps {
  activeTab: "form" | "latex";
  autoRender: boolean;
  loading: boolean;
  onTabSwitch: (tab: "form" | "latex") => void;
  onAutoRenderChange: (autoRender: boolean) => void;
  onManualBuild: () => void;
}

export default function ViewTabs({
  activeTab,
  autoRender,
  loading,
  onTabSwitch,
  onAutoRenderChange,
  onManualBuild,
}: ViewTabsProps) {
  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-sm tracking-wide">VIEW MODE</h2>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 flex items-center gap-1">
            <input
              type="checkbox"
              checked={autoRender}
              onChange={(e) => onAutoRenderChange(e.target.checked)}
              className="w-3 h-3"
            />
            Auto Render
          </label>
          <button
            onClick={onManualBuild}
            disabled={loading}
            className="text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Building..." : "Build"}
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onTabSwitch("form")}
          className={`px-4 py-2 text-xs font-medium rounded-md transition-colors ${
            activeTab === "form"
              ? "bg-white text-black"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          <Eye className="w-3 h-3 inline mr-1" />
          Form Editor
        </button>
        <button
          onClick={() => onTabSwitch("latex")}
          className={`px-4 py-2 text-xs font-medium rounded-md transition-colors ${
            activeTab === "latex"
              ? "bg-white text-black"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          <Code className="w-3 h-3 inline mr-1" />
          LaTeX Code
        </button>
      </div>
    </section>
  );
}
