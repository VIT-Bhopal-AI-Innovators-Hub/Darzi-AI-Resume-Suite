"use client";

import { GripVertical } from "lucide-react";
import { ResumeSection, Education } from "../types";

interface EducationSectionProps {
  section: ResumeSection;
  educations: Education[];
  onEducationsChange: (educations: Education[]) => void;
  draggedSection: string | null;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export default function EducationSection({
  section,
  educations,
  onEducationsChange,
  draggedSection,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: EducationSectionProps) {
  const sectionClasses = `bg-white/5 border border-white/10 rounded-xl p-5 ${
    draggedSection === section.id ? 'opacity-50' : ''
  }`;

  const addEducation = () => {
    const newEducations = [
      ...educations,
      {
        id: Date.now().toString(),
        degree: "",
        institution: "",
        year: "",
        gpa: "",
      },
    ];
    onEducationsChange(newEducations);
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    const updatedEducations = educations.map((edu) => 
      edu.id === id ? { ...edu, ...updates } : edu
    );
    onEducationsChange(updatedEducations);
  };

  const removeEducation = (id: string) => {
    const filteredEducations = educations.filter((edu) => edu.id !== id);
    onEducationsChange(filteredEducations);
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
          onClick={addEducation}
          className="text-[11px] px-2 py-1 rounded bg-white text-black font-semibold hover:bg-gray-200"
        >
          + Add
        </button>
      </div>
      <div className="space-y-4">
        {educations.map((edu) => (
          <div key={edu.id} className="bg-black/20 rounded-lg p-4">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => removeEducation(edu.id)}
                className="text-gray-400 hover:text-red-400 text-xs"
                title="Remove Education"
              >
                × Remove
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <input
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                placeholder="Degree"
                className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
              />
              <input
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                placeholder="Institution"
                className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <input
                value={edu.year}
                onChange={(e) => updateEducation(edu.id, { year: e.target.value })}
                placeholder="Year (e.g. 2023)"
                className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
              />
              <input
                value={edu.gpa}
                onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                placeholder="GPA (optional)"
                className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
