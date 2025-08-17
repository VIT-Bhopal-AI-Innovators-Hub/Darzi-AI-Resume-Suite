"use client";
import React, { useState } from "react";
import Sidebar from "@/components/main/sidebar";
import Header from "@/components/main/header";
import FooterSection from "@/components/footer";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import resumeData from "@/data/resume-schema.json";
import { Resume } from "@/types/resume";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";

import ModernResume from "./ModernResume";
import CreativeResume from "./CreativeResume";
import ClassicResume from "./ClassicResume";


interface Template {
  id: number;
  name: string;
  tags: string[];
  component: React.FC<{ data: Resume }>;

}

const templatesData: Template[] = [
  {
    id: 1,
    name: "Modern Professional",
    tags: ["Minimal", "ATS-Friendly"],
    component: ModernResume,

  },
  {
    id: 2,
    name: "Creative Design",
    tags: ["Colorful", "Portfolio Style"],
    component: CreativeResume,

  },
  {
    id: 3,
    name: "Classic Elegant",
    tags: ["Traditional", "Formal"],
    component: ClassicResume,
  },
];

const TemplatesTab: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  const handleDownload = async (template: Template) => {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    const TemplateComponent = template.component;
    const tempRoot = (
      <div style={{ width: "794px", padding: "20px", background: "white" }}>
        <TemplateComponent data={resumeData as Resume} />
      </div>
    );

    const { createRoot } = await import("react-dom/client");
    const root = createRoot(container);
    root.render(tempRoot);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${template.name.replace(/\s+/g, "_")}_Resume.pdf`);

    root.unmount();
    document.body.removeChild(container);
  };

  const handleExportToEditor = () => {
    // Save data in localStorage
    // localStorage.setItem("resumeData", JSON.stringify(resumeData));
    // Redirect to resume-editor
    router.push("/resume-editor");
  };

  return (
    <>
      <SignedIn>
        <div className="bg-black text-white min-h-screen font-sans">
          <Sidebar onToggle={setSidebarCollapsed} />
          <main
            className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? "ml-20" : "ml-64"
              } min-h-screen`}
          >
            <Header pageName="Templates" />
            <div className="p-6">
              {/* Page Header */}
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold">Resume Templates</h1>
                  <p className="text-gray-400">
                    Choose a template to preview, download or export to editor.
                  </p>
                </div>
              </div>

              {/* Templates Grid */}
              {templatesData.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {templatesData.map((template) => {
                    const TemplateComponent = template.component;
                    return (
                      <div
                        key={template.id}
                        className="bg-neutral-900 border border-white/10 rounded-lg shadow-sm hover:shadow-md transition p-4 flex flex-col items-center"
                      >
                        {/* Live preview */}
                        <div className="w-80 h-[420px] overflow-hidden border border-white/10 rounded-lg bg-white p-2 relative">
                          <div style={{width:"794px", height:"1123px", transform: "scale(0.36)", transformOrigin: "top left", margin: "0 auto", position: "absolute", top:0}}>
                            <TemplateComponent data={resumeData as Resume} />
                          </div>
                        </div>

                        <h3 className="mt-4 text-lg font-semibold">
                          {template.name}
                        </h3>
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
                            onClick={() => handleDownload(template)}
                          >
                            Download
                          </button>
                          <button
                            className="bg-white text-black px-4 py-2 rounded hover:bg-gray-200 text-sm font-semibold"
                            onClick={handleExportToEditor}
                          >
                            Export to Editor
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400">No templates found.</p>
              )}
            </div>
            <FooterSection />
            {/* Preview Modal */}
            {selectedTemplate && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                <div className="bg-white w-[850px] max-h-[90vh] overflow-y-auto rounded-lg p-6 relative">
                  <button
                    className="absolute top-2 right-2 bg-black text-white rounded px-3 py-1 text-sm"
                    onClick={() => setSelectedTemplate(null)}
                  >
                    Close
                  </button>

                  <div className="border p-4 bg-gray-50">
                    <selectedTemplate.component data={resumeData as Resume} />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </SignedIn>

      <SignedOut>
        <div className="bg-black text-white min-h-screen flex items-center justify-center">
          <RedirectToSignIn />
        </div>
      </SignedOut>
    </>
  );
};

export default TemplatesTab;
