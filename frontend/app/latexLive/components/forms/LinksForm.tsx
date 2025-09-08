import React from 'react';
import { Plus, X } from 'lucide-react';
import { ResumeData } from '@/types/resume';

interface LinksFormProps {
  data: ResumeData;
  updateField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

export default function LinksForm({ data, updateField }: LinksFormProps) {
  const addLink = () => {
    const updatedLinks = [...(data.links || []), { name: '', url: '' }];
    updateField('links', updatedLinks);
  };

  const updateLink = (index: number, field: 'name' | 'url', value: string) => {
    const updatedLinks = [...(data.links || [])];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    updateField('links', updatedLinks);
  };

  const removeLink = (index: number) => {
    const updatedLinks = (data.links || []).filter((_, i) => i !== index);
    updateField('links', updatedLinks);
  };

  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="font-bold text-sm tracking-wide">ADDITIONAL LINKS</h2>
        <button
          onClick={addLink}
          className="text-xs flex items-center justify-center gap-1 bg-white text-black font-semibold px-3 py-2 rounded-md hover:bg-gray-200 whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Link
        </button>
      </div>
      
      {data.links?.map((link, index) => (
        <div
          key={index}
          className="border border-white/10 rounded-lg p-4 bg-black/40"
        >
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 min-w-0 space-y-3">
              <input
                value={link.name}
                onChange={(e) => updateLink(index, 'name', e.target.value)}
                placeholder="Link Name (e.g., LinkedIn, GitHub)"
                className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm outline-none focus:border-white/30 font-semibold"
              />
              <input
                value={link.url}
                onChange={(e) => updateLink(index, 'url', e.target.value)}
                placeholder="URL"
                className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm outline-none focus:border-white/30"
              />
            </div>
            <button
              onClick={() => removeLink(index)}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors flex-shrink-0 self-start lg:self-center"
              title="Remove link"
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
