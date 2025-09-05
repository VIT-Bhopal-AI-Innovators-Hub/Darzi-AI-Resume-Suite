"use client";

import { GripVertical } from "lucide-react";
import { ResumeSection, Project } from "../types";

interface ProjectsSectionProps {
  section: ResumeSection;
  projects: Project[];
  onProjectsChange: (projects: Project[]) => void;
  draggedSection: string | null;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export default function ProjectsSection({
  section,
  projects,
  onProjectsChange,
  draggedSection,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: ProjectsSectionProps) {
  const sectionClasses = `bg-white/5 border border-white/10 rounded-xl p-5 ${
    draggedSection === section.id ? 'opacity-50' : ''
  }`;

  const addProject = () => {
    const newProjects = [
      ...projects,
      {
        id: Date.now().toString(),
        name: "",
        technologies: "",
        link: "",
        description: "",
      },
    ];
    onProjectsChange(newProjects);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map((proj) => 
      proj.id === id ? { ...proj, ...updates } : proj
    );
    onProjectsChange(updatedProjects);
  };

  const removeProject = (id: string) => {
    const filteredProjects = projects.filter((proj) => proj.id !== id);
    onProjectsChange(filteredProjects);
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
          onClick={addProject}
          className="text-[11px] px-2 py-1 rounded bg-white text-black font-semibold hover:bg-gray-200"
        >
          + Add
        </button>
      </div>
      <div className="space-y-4">
        {projects.map((proj) => (
          <div key={proj.id} className="bg-black/20 rounded-lg p-4">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => removeProject(proj.id)}
                className="text-gray-400 hover:text-red-400 text-xs"
                title="Remove Project"
              >
                × Remove
              </button>
            </div>
            <div className="mb-3">
              <input
                value={proj.name}
                onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                placeholder="Project Name"
                className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3 mb-3">
              <input
                value={proj.technologies}
                onChange={(e) => updateProject(proj.id, { technologies: e.target.value })}
                placeholder="Technologies (e.g. React, Node.js)"
                className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
              />
              <input
                value={proj.link}
                onChange={(e) => updateProject(proj.id, { link: e.target.value })}
                placeholder="Link (optional)"
                className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
              />
            </div>
            <textarea
              value={proj.description}
              onChange={(e) => updateProject(proj.id, { description: e.target.value })}
              placeholder="Project description and achievements..."
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm resize-y outline-none focus:border-white/30"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
