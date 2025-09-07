import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { ResumeData } from '@/types/resume';

interface SkillsFormProps {
  data: ResumeData;
  updateField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

export default function SkillsForm({ data, updateField }: SkillsFormProps) {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim()) {
      const updatedSkills = [...(data.skills || []), newSkill.trim()];
      updateField('skills', updatedSkills);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    const updatedSkills = (data.skills || []).filter((_, i) => i !== index);
    updateField('skills', updatedSkills);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="font-bold text-sm tracking-wide">SKILLS</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
          <div className="flex items-center gap-2 min-w-0 w-full">
            <div className="flex-1 min-w-0">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a skill"
                className="text-xs bg-black/40 border border-white/10 rounded px-3 py-2 outline-none focus:border-white/30 w-full min-w-0 truncate"
              />
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={addSkill}
                className="text-xs flex items-center justify-center gap-1 bg-white text-black font-semibold px-3 py-2 rounded-md hover:bg-gray-200 whitespace-nowrap"
                type="button"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {data.skills?.map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 bg-white/10 text-white px-3 py-1 rounded-full text-sm"
          >
            {skill}
            <button
              onClick={() => removeSkill(index)}
              className="text-red-400 hover:text-red-300 hover:bg-red-400/20 rounded-full p-0.5 transition-colors ml-1"
              title="Remove skill"
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </section>
  );
}
