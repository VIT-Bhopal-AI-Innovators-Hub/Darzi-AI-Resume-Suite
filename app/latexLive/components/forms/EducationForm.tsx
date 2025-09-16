import React from 'react';
import { Plus, X } from 'lucide-react';
import { ResumeData } from '@/types/resume';

interface EducationFormProps {
  data: ResumeData;
  addEducation: () => void;
  updateEducation: (index: number, patch: Partial<ResumeData["education"][number]>) => void;
  removeEducation: (index: number) => void;
}

export default function EducationForm({ 
  data, 
  addEducation, 
  updateEducation, 
  removeEducation 
}: EducationFormProps) {
  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-sm tracking-wide">EDUCATION</h2>
        <button
          onClick={addEducation}
          className="text-xs flex items-center gap-1 bg-white text-black font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Education
        </button>
      </div>

      {data.education.map((edu, index) => (
        <div
          key={index}
          className="border border-white/10 rounded-lg p-4 space-y-4 bg-black/40"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0 space-y-3">
              <input
                value={edu.school}
                onChange={(e) =>
                  updateEducation(index, { school: e.target.value })
                }
                placeholder="School"
                className="w-full bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm outline-none focus:border-white/30 font-semibold"
              />
              <input
                value={edu.degree}
                onChange={(e) =>
                  updateEducation(index, { degree: e.target.value })
                }
                placeholder="Degree"
                className="w-full bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm outline-none focus:border-white/30 font-semibold"
              />
            </div>
            <button
              onClick={() => removeEducation(index)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors flex-shrink-0"
              title="Remove education"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}
