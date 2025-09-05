"use client";

import { Plus } from "lucide-react";
import { ResumeSection, ResumeFormData, CustomSection } from "./types";
import BasicInfoSection from "./sections/BasicInfoSection";
import SkillsSection from "./sections/SkillsSection";
import ExperienceSection from "./sections/ExperienceSection";
import EducationSection from "./sections/EducationSection";
import ProjectsSection from "./sections/ProjectsSection";
import CustomSectionComponent from "./sections/CustomSectionComponent";

interface ResumeFormProps {
  formData: ResumeFormData;
  sections: ResumeSection[];
  customSections: CustomSection[];
  draggedSection: string | null;
  onFormDataChange: (updates: Partial<ResumeFormData>) => void;
  onSectionsChange: (sections: ResumeSection[]) => void;
  onCustomSectionsChange: (customSections: CustomSection[]) => void;
  onDragStart: (e: React.DragEvent, sectionId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetSectionId: string) => void;
  onDragEnd: () => void;
}

export default function ResumeForm({
  formData,
  sections,
  customSections,
  draggedSection,
  onFormDataChange,
  onSectionsChange,
  onCustomSectionsChange,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: ResumeFormProps) {
  const addCustomSection = () => {
    const newSection: ResumeSection = {
      id: `custom-${Date.now()}`,
      type: 'custom',
      title: 'Custom Section',
      order: sections.length
    };
    onSectionsChange([...sections, newSection]);
    
    const newCustomSection: CustomSection = {
      id: newSection.id,
      title: 'Custom Section',
      content: ''
    };
    onCustomSectionsChange([...customSections, newCustomSection]);
  };

  const removeCustomSection = (sectionId: string) => {
    onSectionsChange(sections.filter(s => s.id !== sectionId));
    onCustomSectionsChange(customSections.filter(s => s.id !== sectionId));
  };

  const updateCustomSection = (sectionId: string, updates: Partial<CustomSection>) => {
    onCustomSectionsChange(customSections.map(s => 
      s.id === sectionId ? { ...s, ...updates } : s
    ));
  };

  const renderSection = (section: ResumeSection) => {
    const sectionClasses = `bg-white/5 border border-white/10 rounded-xl p-5 ${
      draggedSection === section.id ? 'opacity-50' : ''
    }`;

    const handleSectionDragStart = (e: React.DragEvent) => onDragStart(e, section.id);
    const handleSectionDrop = (e: React.DragEvent) => onDrop(e, section.id);

    switch (section.type) {
      case 'basic':
        return (
          <BasicInfoSection
            key={section.id}
            section={section}
            formData={formData}
            onFormDataChange={onFormDataChange}
          />
        );

      case 'skills':
        return (
          <SkillsSection
            key={section.id}
            section={section}
            skills={formData.skills}
            onSkillsChange={(skills) => onFormDataChange({ skills })}
            draggedSection={draggedSection}
            onDragStart={handleSectionDragStart}
            onDragOver={onDragOver}
            onDrop={handleSectionDrop}
            onDragEnd={onDragEnd}
          />
        );

      case 'experience':
        return (
          <ExperienceSection
            key={section.id}
            section={section}
            experiences={formData.experiences}
            onExperiencesChange={(experiences) => onFormDataChange({ experiences })}
            draggedSection={draggedSection}
            onDragStart={handleSectionDragStart}
            onDragOver={onDragOver}
            onDrop={handleSectionDrop}
            onDragEnd={onDragEnd}
          />
        );

      case 'education':
        return (
          <EducationSection
            key={section.id}
            section={section}
            educations={formData.educations}
            onEducationsChange={(educations) => onFormDataChange({ educations })}
            draggedSection={draggedSection}
            onDragStart={handleSectionDragStart}
            onDragOver={onDragOver}
            onDrop={handleSectionDrop}
            onDragEnd={onDragEnd}
          />
        );

      case 'projects':
        return (
          <ProjectsSection
            key={section.id}
            section={section}
            projects={formData.projects}
            onProjectsChange={(projects) => onFormDataChange({ projects })}
            draggedSection={draggedSection}
            onDragStart={handleSectionDragStart}
            onDragOver={onDragOver}
            onDrop={handleSectionDrop}
            onDragEnd={onDragEnd}
          />
        );

      case 'custom':
        const customSection = customSections.find(cs => cs.id === section.id);
        return (
          <CustomSectionComponent
            key={section.id}
            section={section}
            customSection={customSection}
            draggedSection={draggedSection}
            onDragStart={handleSectionDragStart}
            onDragOver={onDragOver}
            onDrop={handleSectionDrop}
            onDragEnd={onDragEnd}
            onUpdateCustomSection={updateCustomSection}
            onRemoveCustomSection={removeCustomSection}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Dynamic Draggable Sections */}
      {sections
        .sort((a, b) => a.order - b.order)
        .map(section => renderSection(section))}
      
      {/* Add Custom Section Button */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-5">
        <button
          onClick={addCustomSection}
          className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-white/20 rounded-lg hover:border-white/40 transition-colors"
        >
          <Plus className="w-5 h-5 text-white/60" />
          <span className="text-sm text-white/60 font-medium">Add Custom Section</span>
        </button>
      </section>
    </>
  );
}
