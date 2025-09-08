import React from 'react';
import { Plus, X } from 'lucide-react';
import { ResumeData } from '@/types/resume';

interface ExperienceFormProps {
  data: ResumeData;
  addExperience: () => void;
  updateExperience: (index: number, patch: Partial<ResumeData["experiences"][number]>) => void;
  removeExperience: (index: number) => void;
}

export default function ExperienceForm({ 
  data, 
  addExperience, 
  updateExperience, 
  removeExperience 
}: ExperienceFormProps) {
  const addBulletPoint = (expIndex: number) => {
    const exp = data.experiences[expIndex];
    updateExperience(expIndex, { bullets: [...exp.bullets, ''] });
  };

  const updateBulletPoint = (expIndex: number, bulletIndex: number, value: string) => {
    const exp = data.experiences[expIndex];
    const newBullets = [...exp.bullets];
    newBullets[bulletIndex] = value;
    updateExperience(expIndex, { bullets: newBullets });
  };

  const removeBulletPoint = (expIndex: number, bulletIndex: number) => {
    const exp = data.experiences[expIndex];
    const newBullets = exp.bullets.filter((_, i) => i !== bulletIndex);
    updateExperience(expIndex, { bullets: newBullets });
  };

  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-sm tracking-wide">EXPERIENCE</h2>
        <button
          onClick={addExperience}
          className="text-xs flex items-center gap-1 bg-white text-black font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Experience
        </button>
      </div>

      {data.experiences.map((exp, index) => (
        <div
          key={index}
          className="border border-white/10 rounded-lg p-4 space-y-4 bg-black/40"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0 space-y-3">
              <input
                value={exp.company}
                onChange={(e) =>
                  updateExperience(index, { company: e.target.value })
                }
                placeholder="Company"
                className="w-full bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm outline-none focus:border-white/30 font-semibold"
              />
              <input
                value={exp.role}
                onChange={(e) =>
                  updateExperience(index, { role: e.target.value })
                }
                placeholder="Role"
                className="w-full bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm outline-none focus:border-white/30 font-semibold"
              />
            </div>
            <button
              onClick={() => removeExperience(index)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors flex-shrink-0"
              title="Remove experience"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Key Achievements</label>
              <button
                onClick={() => addBulletPoint(index)}
                className="text-xs flex items-center gap-1 text-gray-300 hover:text-white"
              >
                <Plus className="h-3 w-3" />
                Add Bullet
              </button>
            </div>
            
            {exp.bullets.map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="flex items-center gap-2">
                <span className="text-gray-400 flex-shrink-0">•</span>
                <input
                  value={bullet}
                  onChange={(e) => updateBulletPoint(index, bulletIndex, e.target.value)}
                  placeholder="Describe your achievement or responsibility"
                  className="flex-1 min-w-0 bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm outline-none focus:border-white/30"
                />
                {exp.bullets.length > 1 && (
                  <button
                    onClick={() => removeBulletPoint(index, bulletIndex)}
                    className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors flex-shrink-0"
                    title="Remove bullet point"
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
