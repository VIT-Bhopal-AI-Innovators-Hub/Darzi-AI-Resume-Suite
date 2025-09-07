"use client";

import { GripVertical, X } from "lucide-react";
import { ResumeSection, CustomSection } from "../types";

interface CustomSectionComponentProps {
  section: ResumeSection;
  customSection: CustomSection | undefined;
  draggedSection: string | null;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onUpdateCustomSection: (sectionId: string, updates: Partial<CustomSection>) => void;
  onRemoveCustomSection: (sectionId: string) => void;
}

export default function CustomSectionComponent({
  section,
  customSection,
  draggedSection,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onUpdateCustomSection,
  onRemoveCustomSection,
}: CustomSectionComponentProps) {
  const sectionClasses = `bg-white/5 border border-white/10 rounded-xl p-5 ${
    draggedSection === section.id ? 'opacity-50' : ''
  }`;

  return (
    <section 
      className={sectionClasses}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <GripVertical className="w-4 h-4 text-gray-400 cursor-move mr-2" />
          <input
            value={customSection?.title || ''}
            onChange={(e) => onUpdateCustomSection(section.id, { title: e.target.value })}
            className="font-bold text-sm tracking-wide bg-transparent border-b border-white/20 outline-none focus:border-white/50"
            placeholder="SECTION TITLE"
          />
        </div>
        <button
          onClick={() => onRemoveCustomSection(section.id)}
          className="text-[11px] px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      <textarea
        value={customSection?.content || ''}
        onChange={(e) => onUpdateCustomSection(section.id, { content: e.target.value })}
        placeholder="Enter section content..."
        rows={6}
        className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm resize-y outline-none focus:border-white/30"
      />
    </section>
  );
}
