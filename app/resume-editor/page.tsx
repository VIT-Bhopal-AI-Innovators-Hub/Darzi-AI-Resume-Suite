"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Sidebar from "../../components/main/sidebar";
import Header from "../../components/main/header";
import FooterSection from "@/components/footer";
import { generateResumeTex, ResumeData } from "@/lib/latexTemplate";

// Import components
import ViewTabs from "./components/ViewTabs";
import LaTeXSettingsPanel from "./components/LaTeXSettings";
import LaTeXEditor from "./components/LaTeXEditor";
import PDFPreview from "./components/PDFPreview";
import ResumeForm from "./components/ResumeForm";

// Import types
import { 
  ResumeFormData, 
  LaTeXSettings, 
  ResumeSection, 
  CustomSection 
} from "./components/types";
import { Resume } from "@/types/resume";

export default function ResumeEditor() {
  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // View state
  const [activeTab, setActiveTab] = useState<"form" | "latex">("form");

  // LaTeX integration state
  const [latexCode, setLatexCode] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [autoRender, setAutoRender] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LaTeX settings
  const [latexSettings, setLatexSettings] = useState<LaTeXSettings>({
    selectedTemplate: "modern",
    pageSize: "letter",
    fontFamily: "sans-serif",
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
  });

  // Form data
  const [formData, setFormData] = useState<ResumeFormData>({
    fullName: "John Doe",
    title: "Full Stack Developer",
    summary: "Experienced developer with expertise in React, Node.js, and modern web technologies.",
    skills: "React, TypeScript, Node.js, Python, AWS",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "https://linkedin.com/in/johndoe",
    links: [],
    experiences: [],
    educations: [],
    projects: [],
    customSections: [],
  });

  // Section order and visibility
  const [sections, setSections] = useState<ResumeSection[]>([
    { id: 'basic', type: 'basic', title: 'Basic Info', order: 0 },
    { id: 'skills', type: 'skills', title: 'Skills', order: 1 },
    { id: 'experience', type: 'experience', title: 'Work Experience', order: 2 },
    { id: 'education', type: 'education', title: 'Education', order: 3 },
    { id: 'projects', type: 'projects', title: 'Projects', order: 4 },
  ]);

  const [customSections, setCustomSections] = useState<CustomSection[]>([]);

  // Drag and drop state
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  // WebSocket connection
  const wsRef = useRef<WebSocket | null>(null);
  const pdfUrlRef = useRef<string | null>(null);

  // WebSocket setup
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket("wss://ayush-003-latexwebsocket.hf.space");

      ws.onopen = () => {
        wsRef.current = ws;
        setWsConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "progress") {
            setLoading(true);
          } else if (data.type === "pdf") {
            // Handle base64 PDF data
            const arr = Uint8Array.from(atob(data.base64), (c) =>
              c.charCodeAt(0)
            );
            const blob = new Blob([arr], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);

            // Clean up previous URL
            if (pdfUrlRef.current) {
              URL.revokeObjectURL(pdfUrlRef.current);
            }

            pdfUrlRef.current = url;
            setPdfUrl(url);
            setLoading(false);
            setError(null);
          } else if (data.type === "pdf_ready") {
            setPdfUrl(data.pdf_url);
            setLoading(false);
            setError(null);
          } else if (data.type === "error") {
            setLoading(false);
            setError(`Compilation error: ${data.message}`);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          setLoading(false);
          setError("Error parsing response from server");
        }
      };

      ws.onclose = (event) => {
        wsRef.current = null;
        setWsConnected(false);
        setError(`Connection lost: ${event.reason || "Unknown reason"}`);
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setLoading(false);
        setWsConnected(false);
        setError("WebSocket connection failed");
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Generate LaTeX code from form data
  const generateLatexFromForm = useCallback(() => {
    if (!formData.fullName.trim()) {
      console.warn("Name is required to generate resume");
      return "";
    }

    const resumeData = {
      name: formData.fullName,
      title: formData.title,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      website: formData.website,
      summary: formData.summary,
      skills: formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      experiences: formData.experiences.map((exp) => ({
        company: exp.company,
        role: exp.title,
        start: exp.startDate,
        end: exp.endDate,
        bullets: exp.description.split("\n").filter(Boolean),
      })),
      education: formData.educations.map((edu) => ({
        school: edu.institution,
        degree: edu.degree,
        start: edu.year,
        end: edu.year,
      })),
      projects: formData.projects.map((proj) => ({
        name: proj.name,
        technologies: proj.technologies,
        link: proj.link,
        description: proj.description,
      })),
      customSections: customSections.map((section) => ({
        id: section.id,
        title: section.title,
        content: section.content,
      })),
      links: [
        ...formData.links.map((link) => ({
          label: link.label,
          url: link.url,
        })),
        // Include projects as links if they have URLs (for backward compatibility)
        ...formData.projects
          .filter((proj) => proj.link)
          .map((proj) => ({
            label: proj.name,
            url: proj.link,
          })),
      ],
      sectionOrder: sections
        .filter(s => s.type !== 'basic')
        .sort((a, b) => a.order - b.order)
        .map(s => {
          if (s.type === 'skills') return 'skills';
          if (s.type === 'custom') {
            const customSection = customSections.find(cs => cs.id === s.id);
            return customSection?.title ? `custom-${customSection.title.toLowerCase().replace(/\s+/g, '-')}` : 'custom';
          }
          return s.type;
        }),
    };

    return generateResumeTex(resumeData as ResumeData, latexSettings.selectedTemplate, {
      pageSize: latexSettings.pageSize,
      fontFamily: latexSettings.fontFamily,
      primaryColor: latexSettings.primaryColor,
      secondaryColor: latexSettings.secondaryColor,
    });
  }, [
    formData,
    customSections,
    latexSettings,
    sections,
  ]);

  // Build PDF
  const buildPdf = useCallback(
    (texCode?: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setError("WebSocket not connected. Please wait for connection...");
        setLoading(false);
        return;
      }

      const codeToCompile = texCode || latexCode || generateLatexFromForm();
      setLoading(true);
      setError(null);

      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setLoading(false);
        setError("LaTeX compilation timed out. Please try again.");
      }, 30000); // 30 second timeout

      // Store timeout ID to clear it when we get a response
      const timeoutId = timeout;

      wsRef.current.send(
        JSON.stringify({
          type: "edit",
          tex: codeToCompile,
        })
      );

      // Clear timeout on success (we'll need to modify the message handler)
      wsRef.current.addEventListener(
        "message",
        function handler() {
          clearTimeout(timeoutId);
          wsRef.current?.removeEventListener("message", handler);
        },
        { once: true }
      );
    },
    [latexCode, generateLatexFromForm]
  );

  // Trigger initial build when WebSocket connects (only for form tab)
  useEffect(() => {
    if (wsConnected && formData.fullName && activeTab === "form" && autoRender) {
      setTimeout(() => {
        const initialLatex = generateLatexFromForm();
        if (initialLatex) {
          setLatexCode(initialLatex);
          buildPdf(initialLatex);
        }
      }, 1000);
    }
  }, [wsConnected, formData.fullName, activeTab, autoRender, generateLatexFromForm, buildPdf]);

  // Auto-build when form data changes (ONLY when in form tab)
  useEffect(() => {
    // Completely skip if not in form tab - this prevents overwriting LaTeX edits
    if (activeTab !== "form") {
      return;
    }
    
    // Only auto-build if we're in form tab with auto-render on
    if (autoRender) {
      const timeoutId = setTimeout(() => {
        const newLatexCode = generateLatexFromForm();
        setLatexCode(newLatexCode);
        buildPdf(newLatexCode);
      }, 1000); // Debounce for 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [
    activeTab,
    autoRender,
    formData,
    customSections,
    latexSettings,
    sections,
    generateLatexFromForm,
    buildPdf
  ]);

  // Manual build
  const manualBuild = () => {
    const newLatexCode =
      activeTab === "form" ? generateLatexFromForm() : latexCode;
    if (activeTab === "form") {
      setLatexCode(newLatexCode);
    }
    buildPdf(newLatexCode);
  };

  // Auto-build when LaTeX code changes (in LaTeX tab)
  const debouncedLatexBuild = useCallback(() => {
    if (autoRender && activeTab === "latex" && latexCode) {
      buildPdf(latexCode);
    }
  }, [autoRender, activeTab, latexCode, buildPdf]);

  useEffect(() => {
    if (autoRender && activeTab === "latex" && latexCode) {
      const timeoutId = setTimeout(debouncedLatexBuild, 5000); // 5 second debounce for LaTeX editing
      return () => clearTimeout(timeoutId);
    }
  }, [latexCode, autoRender, activeTab, debouncedLatexBuild]);

  // Smart tab switching
  const handleTabSwitch = (newTab: "form" | "latex") => {
    if (newTab === "latex" && activeTab === "form") {
      // Switching to LaTeX tab - generate current LaTeX code from form
      const currentLatex = generateLatexFromForm();
      setLatexCode(currentLatex);
    }
    setActiveTab(newTab);
  };

  // Drag and Drop Functions
  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetSectionId) return;

    const newSections = [...sections];
    const draggedIndex = newSections.findIndex(s => s.id === draggedSection);
    const targetIndex = newSections.findIndex(s => s.id === targetSectionId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remove dragged section and insert at target position
      const [removed] = newSections.splice(draggedIndex, 1);
      newSections.splice(targetIndex, 0, removed);
      
      // Update order values
      newSections.forEach((section, index) => {
        section.order = index;
      });

      setSections(newSections);
    }
    setDraggedSection(null);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
  };

  // Form data change handler
  const handleFormDataChange = (updates: Partial<ResumeFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // LaTeX settings change handler
  const handleLatexSettingsChange = (updates: Partial<LaTeXSettings>) => {
    setLatexSettings(prev => ({ ...prev, ...updates }));
  };

  // PDF retry handler
  const handleRetry = () => {
    setError(null);
    window.location.reload();
  };

  return (
    <>
      <SignedIn>
        <div className="bg-black text-white min-h-screen font-sans">
          <Sidebar onToggle={setSidebarCollapsed} />
          <main
            className={`transition-all duration-300 ease-in-out ${
              sidebarCollapsed ? "ml-20" : "ml-64"
            } min-h-screen`}
          >
            <Header pageName="Resume Editor" />
            <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* LEFT SIDE - Form & Controls */}
              <div className="space-y-6">
                {/* VIEW TABS */}
                <ViewTabs
                  activeTab={activeTab}
                  autoRender={autoRender}
                  loading={loading}
                  onTabSwitch={handleTabSwitch}
                  onAutoRenderChange={setAutoRender}
                  onManualBuild={manualBuild}
                />

                {/* LATEX SETTINGS */}
                <LaTeXSettingsPanel
                  settings={latexSettings}
                  onSettingsChange={handleLatexSettingsChange}
                />

                {/* CONDITIONAL CONTENT */}
                {activeTab === "form" ? (
                  <ResumeForm
                    formData={formData}
                    sections={sections}
                    customSections={customSections}
                    draggedSection={draggedSection}
                    onFormDataChange={handleFormDataChange}
                    onSectionsChange={setSections}
                    onCustomSectionsChange={setCustomSections}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                  />
                ) : (
                  <LaTeXEditor
                    latexCode={latexCode}
                    onCodeChange={setLatexCode}
                  />
                )}
              </div>

              {/* RIGHT SIDE - PDF Preview */}
              <div className="space-y-6 xl:sticky xl:top-4 xl:h-screen xl:overflow-y-auto">
                <PDFPreview
                  pdfUrl={pdfUrl}
                  loading={loading}
                  error={error}
                  wsConnected={wsConnected}
                  zoomLevel={zoomLevel}
                  onZoomChange={setZoomLevel}
                  onRetry={handleRetry}
                />
              </div>
            </div>
            <FooterSection />
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}