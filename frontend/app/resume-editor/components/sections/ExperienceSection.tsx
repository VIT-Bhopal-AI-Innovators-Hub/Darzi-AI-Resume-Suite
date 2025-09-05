"use client";

import { GripVertical } from "lucide-react";
import { ResumeSection, Experience } from "../types";

interface ExperienceSectionProps {
  section: ResumeSection;
  experiences: Experience[];
  onExperiencesChange: (experiences: Experience[]) => void;
  draggedSection: string | null;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export default function ExperienceSection({
  section,
  experiences,
  onExperiencesChange,
  draggedSection,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: ExperienceSectionProps) {
  const sectionClasses = `bg-white/5 border border-white/10 rounded-xl p-5 ${
    draggedSection === section.id ? 'opacity-50' : ''
  }`;

  const addExperience = () => {
    const newExperiences = [
      ...experiences,
      {
        id: Date.now().toString(),
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ];
    onExperiencesChange(newExperiences);
  };

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    const updatedExperiences = experiences.map((exp) => 
      exp.id === id ? { ...exp, ...updates } : exp
    );
    onExperiencesChange(updatedExperiences);
  };

  const removeExperience = (id: string) => {
    const filteredExperiences = experiences.filter((exp) => exp.id !== id);
    onExperiencesChange(filteredExperiences);
  };

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
          <h2 className="font-bold text-sm tracking-wide">
            {section.title.toUpperCase()}
          </h2>
        </div>
        <button
          type="button"
          onClick={addExperience}
          className="text-[11px] px-2 py-1 rounded bg-white text-black font-semibold hover:bg-gray-200"
        >
          + Add
        </button>
      </div>
      <div className="space-y-4">
        {experiences.map((exp) => (
          <div key={exp.id} className="bg-black/20 rounded-lg p-4">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => removeExperience(exp.id)}
                className="text-gray-400 hover:text-red-400 text-xs"
                title="Remove Experience"
              >
                × Remove
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <input
                value={exp.title}
                onChange={(e) => updateExperience(exp.id, { title: e.target.value })}
                placeholder="Job Title"
                className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
              />
              <input
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                placeholder="Company"
                className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <input
                value={exp.startDate}
                onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                placeholder="Start Date (e.g. Jan 2023)"
                className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
              />
              <input
                value={exp.endDate}
                onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                placeholder="End Date (or 'Present')"
                className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
              />
            </div>
            <textarea
              value={exp.description}
              onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
              placeholder="Key achievements and responsibilities..."
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm resize-y outline-none focus:border-white/30"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
