"use client";

import { ResumeSection, ResumeFormData, Link } from "../types";

interface BasicInfoSectionProps {
  section: ResumeSection;
  formData: ResumeFormData;
  onFormDataChange: (updates: Partial<ResumeFormData>) => void;
}

export default function BasicInfoSection({
  section,
  formData,
  onFormDataChange,
}: BasicInfoSectionProps) {
  const { fullName, title, summary, email, phone, location, website, links } = formData;

  const addLink = () => {
    const newLinks = [...links, { id: Date.now().toString(), label: "", url: "" }];
    onFormDataChange({ links: newLinks });
  };

  const updateLink = (id: string, updates: Partial<Link>) => {
    const updatedLinks = links.map((link) => 
      link.id === id ? { ...link, ...updates } : link
    );
    onFormDataChange({ links: updatedLinks });
  };

  const removeLink = (id: string) => {
    const filteredLinks = links.filter((link) => link.id !== id);
    onFormDataChange({ links: filteredLinks });
  };

  return (
    <section className="bg-white/5 border border-white/10 rounded-xl p-5">
      <div className="flex items-center mb-4">
        <h2 className="font-bold text-sm tracking-wide">
          {section.title.toUpperCase()}
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400">Full Name</label>
          <input
            value={fullName}
            onChange={(e) => onFormDataChange({ fullName: e.target.value })}
            className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Title</label>
          <input
            value={title}
            onChange={(e) => onFormDataChange({ title: e.target.value })}
            className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
            placeholder="Frontend Engineer"
          />
        </div>
      </div>
      <div className="mt-4">
        <label className="text-xs text-gray-400">Professional Summary</label>
        <textarea
          value={summary}
          onChange={(e) => onFormDataChange({ summary: e.target.value })}
          rows={4}
          className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm resize-y outline-none focus:border-white/30"
          placeholder="2–3 line impactful summary..."
        />
      </div>
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400">Email</label>
          <input
            value={email}
            onChange={(e) => onFormDataChange({ email: e.target.value })}
            type="email"
            placeholder="john.doe@email.com"
            className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Phone</label>
          <input
            value={phone}
            onChange={(e) => onFormDataChange({ phone: e.target.value })}
            placeholder="+91 1234 5678 90"
            className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Location</label>
          <input
            value={location}
            onChange={(e) => onFormDataChange({ location: e.target.value })}
            placeholder="City, Country / Remote"
            className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Website / Primary Link</label>
          <input
            value={website}
            onChange={(e) => onFormDataChange({ website: e.target.value })}
            placeholder="https://linkedin.com/in/username"
            className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
          />
        </div>
      </div>

      {/* Additional links */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400">Additional Links</label>
          <button
            type="button"
            onClick={addLink}
            className="text-[11px] px-2 py-1 rounded bg-white text-black font-semibold hover:bg-gray-200"
          >
            + Add
          </button>
        </div>
        {links.length === 0 && (
          <p className="text-[11px] text-gray-500">
            (Optional) Add portfolio, GitHub, publications, etc.
          </p>
        )}
        <div className="space-y-2">
          {links.map((l) => (
            <div key={l.id} className="flex gap-2">
              <input
                value={l.label}
                onChange={(e) => updateLink(l.id, { label: e.target.value })}
                placeholder="Label (e.g. GitHub)"
                className="flex-1 bg-black/40 border border-white/10 rounded-md px-2 py-1 text-xs outline-none focus:border-white/30"
              />
              <input
                value={l.url}
                onChange={(e) => updateLink(l.id, { url: e.target.value })}
                placeholder="https://..."
                className="flex-[1.4] bg-black/40 border border-white/10 rounded-md px-2 py-1 text-xs outline-none focus:border-white/30"
              />
              <button
                onClick={() => removeLink(l.id)}
                className="text-gray-400 hover:text-red-400 text-xs px-2"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
