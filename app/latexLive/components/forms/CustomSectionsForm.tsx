import React from 'react';
import { Plus, X } from 'lucide-react';
import { ResumeData } from '@/types/resume';
import { v4 as uuidv4 } from 'uuid';

interface CustomSectionsFormProps {
  data: ResumeData;
  updateField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

export default function CustomSectionsForm({ data, updateField }: CustomSectionsFormProps) {
  const addSection = () => {
    const next = [ ...(data.customSections || []), { id: uuidv4(), title: 'New Section', content: '' } ];
    updateField('customSections', next as ResumeData['customSections']);
  };

  type CustomSection = { id: string; title: string; content: string };

  const updateSection = (index: number, patch: Partial<CustomSection>) => {
    const arr = [...(data.customSections || [])];
    arr[index] = { ...arr[index], ...patch };
    updateField('customSections', arr as ResumeData['customSections']);
  };

  const removeSection = (index: number) => {
    const next = (data.customSections || []).filter((_, i) => i !== index);
    updateField('customSections', next as ResumeData['customSections']);
  };

  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-sm tracking-wide">CUSTOM SECTIONS</h2>
        <button
          type="button"
          onClick={addSection}
          className="text-xs flex items-center gap-1 bg-white text-black font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200"
        >
          <Plus className="h-3.5 w-3.5" /> Add Section
        </button>
      </div>

      {(data.customSections || []).map((sec, idx) => (
        <div key={sec.id} className="border border-white/10 rounded-lg p-3 bg-black/40 space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={sec.title}
              onChange={(e) => updateSection(idx, { title: e.target.value })}
              className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => removeSection(idx)}
              className="p-1 text-red-400 hover:text-red-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <textarea
            value={sec.content}
            onChange={(e) => updateSection(idx, { content: e.target.value })}
            rows={3}
            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm outline-none"
          />
        </div>
      ))}
    </section>
  );
}
