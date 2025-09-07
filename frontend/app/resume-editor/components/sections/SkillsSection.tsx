"use client";

import { GripVertical } from "lucide-react";
import { ResumeSection } from "../types";

interface SkillsSectionProps {
  section: ResumeSection;
  skills: string;
  onSkillsChange: (skills: string) => void;
  draggedSection: string | null;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export default function SkillsSection({
  section,
  skills,
  onSkillsChange,
  draggedSection,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: SkillsSectionProps) {
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
      <div className="flex items-center mb-4">
        <GripVertical className="w-4 h-4 text-gray-400 cursor-move mr-2" />
        <h2 className="font-bold text-sm tracking-wide">
          {section.title.toUpperCase()}
        </h2>
      </div>
      <textarea
        value={skills}
        onChange={(e) => onSkillsChange(e.target.value)}
        placeholder="List your technical skills, programming languages, frameworks, tools, etc."
        rows={4}
        className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm resize-y outline-none focus:border-white/30"
      />
    </section>
  );
}
