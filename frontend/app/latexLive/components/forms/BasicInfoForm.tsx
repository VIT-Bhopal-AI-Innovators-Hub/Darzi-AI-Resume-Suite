import React from 'react';
import { ResumeData } from '@/types/resume';

interface BasicInfoFormProps {
  data: ResumeData;
  updateField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

export default function BasicInfoForm({ data, updateField }: BasicInfoFormProps) {
  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-5">
      <h2 className="font-bold mb-4 text-sm tracking-wide">BASIC INFO</h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="min-w-0">
          <label className="text-xs text-gray-400 block mb-1">Full Name</label>
          <input
            value={data.name}
            onChange={(e) => updateField("name", e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
            placeholder="John Doe"
          />
        </div>
        <div className="min-w-0">
          <label className="text-xs text-gray-400 block mb-1">Title</label>
          <input
            value={data.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
            placeholder="Frontend Engineer"
          />
        </div>
        <div className="min-w-0">
          <label className="text-xs text-gray-400 block mb-1">Email</label>
          <input
            value={data.email}
            onChange={(e) => updateField("email", e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
            placeholder="john@example.com"
          />
        </div>
        <div className="min-w-0">
          <label className="text-xs text-gray-400 block mb-1">Phone</label>
          <input
            value={data.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div className="min-w-0">
          <label className="text-xs text-gray-400 block mb-1">Location</label>
          <input
            value={data.location}
            onChange={(e) => updateField("location", e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
            placeholder="New York, NY"
          />
        </div>
        <div className="min-w-0">
          <label className="text-xs text-gray-400 block mb-1">Website</label>
          <input
            value={data.website}
            onChange={(e) => updateField("website", e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="text-xs text-gray-400 block mb-1">Professional Summary</label>
        <textarea
          value={data.summary}
          onChange={(e) => updateField("summary", e.target.value)}
          rows={4}
          className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm resize-y outline-none focus:border-white/30"
          placeholder="2–3 line impactful summary..."
        />
      </div>
    </section>
  );
}
