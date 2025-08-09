'use client'
import React, { useState } from "react";
import Sidebar from '../components/sidebar';
import Header from '../components/header';
import { User, Settings, Bell } from 'lucide-react';

interface Template {
  id: number;
  name: string;
  tags: string[];
  thumbnail: string;
}

const templatesData: Template[] = [
  {
    id: 1,
    name: "Modern Professional",
    tags: ["Minimal", "ATS-Friendly"], 
    thumbnail: "https://marketplace.canva.com/EADapHeQ60o/2/0/1236w/canva-modern-professional-resume-kRcgOs0cv1U.jpg",
  },
  {
    id: 2,
    name: "Creative Design",
    tags: ["Colorful", "Portfolio Style"],
    thumbnail: "https://www.creativeswall.com/wp-content/uploads/2014/04/alex_creative_cv_by_alexsatriani-d5wmrn2.jpg",
  },
  {
    id: 3,
    name: "Classic Elegant",
    tags: ["Traditional", "Formal"],
    thumbnail: "https://techguruplus.com/wp-content/uploads/2024/09/Virtual-Assistant-Editable-Resume-Templates-Download-in-Docx-Format-6-724x1024.jpg",
  },
];

const TemplatesTab: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="bg-black text-white min-h-screen font-sans">
      {/* Sidebar */}
      <Sidebar onToggle={setSidebarCollapsed} />

      {/* Main content */}
      <main
        className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        } min-h-screen`}
      >
        <Header />

        <div className="p-6">
          {/* Page Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Resume Templates</h1>
              <p className="text-gray-400">
                Choose a template to preview or download your resume.
              </p>
            </div>
            
          </div>

          {/* Search & Filter Bar (Dark style like "type here" bar) */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <input
              type="text"
              placeholder="Type here..."
              className="w-64 bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
            />
            <select className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30">
              <option className="bg-black">All Categories</option>
              <option className="bg-black">Minimal</option>
              <option className="bg-black">Creative</option>
              <option className="bg-black">Formal</option>
            </select>
            <select className="bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30">
              <option>Sort by Name</option>
              <option>Sort by Popularity</option>
            </select>
          </div>

          {/* Templates Grid */}
          {templatesData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {templatesData.map((template) => (
                <div
                  key={template.id}
                  className="bg-neutral-900 border border-white/10 rounded-lg shadow-sm hover:shadow-md transition p-4 flex flex-col items-center"
                >
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-80 h-100 object-contain p-2 border border-white/10 rounded-lg bg-black"
                  />
                  <h3 className="mt-4 text-lg font-semibold">{template.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {template.tags.join(" · ")}
                  </p>
                  <div className="flex gap-3 mt-auto">
                    <button
                      className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 text-sm font-semibold"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      Preview
                    </button>
                    <button
                      className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 text-sm font-semibold"
                      onClick={() =>
                        alert(`Download for "${template.name}" is not implemented`)
                      }
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No templates found.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default TemplatesTab;
