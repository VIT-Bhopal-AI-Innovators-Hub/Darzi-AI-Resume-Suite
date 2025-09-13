"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Eye, X, Download, Code, RefreshCw, Save, User, Menu } from "lucide-react";
// Clerk removed from this component to avoid redundant errors
import type { ResumeData } from "@/types/resume";
import { generateResumeTex } from "@/lib/latexTemplate";
import ReconnectingWebSocket from '@/lib/reconnectingWebsocket';
import { UserDataService } from "@/lib/userDataService";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import Sidebar from "@/components/main/sidebar";
import Header from "@/components/main/header";
import FooterSection from "@/components/footer";

// Form Components
import TemplateSelector from "./forms/TemplateSelector";
import BasicInfoForm from "./forms/BasicInfoForm";
import ExperienceForm from "./forms/ExperienceForm";
import EducationForm from "./forms/EducationForm";
import SkillsForm from "./forms/SkillsForm";
import LinksForm from "./forms/LinksForm";
import CustomSectionsForm from "./forms/CustomSectionsForm";

// Template Components
import ClassicResume from "./templates/ClassicResume";
import ModernResume from "./templates/ModernResume";
import CreativeResume from "./templates/CreativeResume";
import MinimalistResume from "./templates/MinimalistResume";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-800 text-gray-300">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
        <p>Loading Monaco Editor...</p>
        <p className="text-sm text-gray-400 mt-1">
          This may take a moment on first load
        </p>
      </div>
    </div>
  ),
});

const WS_URL = "wss://ayush-003-latexwebsocket.hf.space";

export default function ResumeGenerator() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [data, setData] = useState<ResumeData>({
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    summary: "",
    experiences: [],
    education: [],
    skills: [],
    links: [],
    customSections: [],
  });
  const [selectedTemplate, setSelectedTemplate] = useState<
    "classic" | "modern" | "Academic" | "creative" | "professional" | "minimalist"
  >("classic");
  const [pageSize, setPageSize] = useState<"a4" | "letter">("letter");
  const [fontFamily, setFontFamily] = useState<"serif" | "sans-serif" | "mono">(
    "serif"
  );
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#666666");
  const [sectionSpacingMm, setSectionSpacingMm] = useState<number>(3);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [log, setLog] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"preview" | "editor" | "rendered">(
    "preview"
  );
  const [latexCode, setLatexCode] = useState<string>("");
  const [manualLatexPriority, setManualLatexPriority] = useState<boolean>(false);

  // New state for data management
  const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(false);
  const [isSavingUserData, setIsSavingUserData] = useState<boolean>(false);
  const [dataLoadError, setDataLoadError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);

  const wsRef = useRef<ReconnectingWebSocket | null>(null);
  const debounceRef = useRef<number | null>(null);
  const pdfUrlRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  // removed unused maxReconnectAttempts: ReconnectingWebSocket handles backoff internally

  const [logOpen, setLogOpen] = useState<boolean>(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Load user data from the service
  const loadUserData = useCallback(async () => {
    setIsLoadingUserData(true);
    setDataLoadError(null);
    try {
      const userData = await UserDataService.fetchUserData();
      setData(userData);
      setIsDataLoaded(true);
      setHasUnsavedChanges(false);
      setLog((s) => s + "\nUser data loaded successfully");
      
      // Generate initial LaTeX code for the loaded data (only if not in manual priority)
      try {
        const tex = generateResumeTex(userData, selectedTemplate, {
          pageSize,
          fontFamily,
          primaryColor,
          secondaryColor,
          sectionSpacingMm,
        });
        if (!manualLatexPriority) {
          setLatexCode(tex);
          setLog((s) => s + "\nGenerated LaTeX code for loaded data");
        } else {
          setLog((s) => s + "\nManual priority active — kept editor code on load");
        }
      } catch (error) {
        console.error("Error generating initial LaTeX:", error);
        setLog(
          (s) =>
            s +
            "\nError generating initial LaTeX: " +
            (error instanceof Error ? error.message : "Unknown error")
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load user data";
      setDataLoadError(errorMessage);
      setLog((s) => s + "\nError loading user data: " + errorMessage);
    } finally {
      setIsLoadingUserData(false);
    }
  }, [selectedTemplate, pageSize, fontFamily, primaryColor, secondaryColor, sectionSpacingMm, manualLatexPriority]);

  // Save user data to the service
  const saveUserData = useCallback(async () => {
    setIsSavingUserData(true);
    try {
      // Sanitize data to match the expected ResumeData shape used by the UserDataService.
      // This ensures required fields (like company, role, bullets) are present and of the correct type.
      const sanitized: ResumeData = {
        ...data,
        experiences: (data.experiences || []).map((exp) => {
          const bullets = Array.isArray(exp?.bullets)
            ? exp.bullets.map((b) => b ?? "")
            : [];
          return {
            company: exp?.company ?? "",
            role: exp?.role ?? "",
            bullets,
          };
        }),
        education: (data.education || []).map((edu) => ({
          school: edu?.school ?? "",
          degree: edu?.degree ?? "",
        })),
        skills: Array.isArray(data.skills) ? data.skills : [],
        links: Array.isArray(data.links) ? data.links : [],
        customSections: Array.isArray(data.customSections) ? data.customSections : [],
      };

      await UserDataService.saveUserData(sanitized);
      setHasUnsavedChanges(false);
      setLog((s) => s + "\nUser data saved successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save user data";
      setLog((s) => s + "\nError saving user data: " + errorMessage);
    } finally {
      setIsSavingUserData(false);
    }
  }, [data]);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Auto-save functionality
  useAutoSave({
    data,
    onSave: saveUserData,
    delay: 3000, // Auto-save every 3 seconds
    enabled: autoSaveEnabled && hasUnsavedChanges && isDataLoaded,
  });

  // Handle manual LaTeX code changes
  const handleLatexCodeChange = useCallback((value: string | undefined) => {
    const newCode = value || "";
    setLatexCode(newCode);
    // Once user edits the code, prioritize manual LaTeX for PDF builds
    if (!manualLatexPriority) setManualLatexPriority(true);
    
    // Debounce sending the code to WebSocket to avoid too many requests
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "edit", tex: newCode }));
        setLog((s) => s + "\\nSent manual edit to build (manual priority)");
      }
    }, 1000) as unknown as number;
  }, [manualLatexPriority]);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const rws = new ReconnectingWebSocket(WS_URL);
    wsRef.current = rws;

    rws.onopen = () => {
      setLog((s) => s + "\nWS connected");
      reconnectAttemptsRef.current = 0;
    };

    rws.onmessage = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === "progress") {
          setLoading(true);
          setLog((s) => s + "\n" + (msg.text || "progress"));
        } else if (msg.type === "error") {
          setLoading(false);
          setLog((s) => s + "\nERROR: " + msg.message);
        } else if (msg.type === "pdf") {
          setLoading(false);
          const arr = Uint8Array.from(atob(msg.base64), (c) => c.charCodeAt(0));
          const blob = new Blob([arr], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
          pdfUrlRef.current = url;
          setPdfUrl(url);
          setLog((s) => s + "\nPDF received");
        }
      } catch (e) {
        setLoading(false);
        setLog((s) => s + "\nMSG ERR: " + String(e));
      }
    };

    rws.onclose = () => {
      setLog((s) => s + "\nWS closed");
    };

    rws.onerror = () => setLog((s) => s + "\nWS error");
  }, []);

  useEffect(() => {
    connectWebSocket();
    const currentTimeout = reconnectTimeoutRef.current;

    return () => {
      if (currentTimeout) window.clearTimeout(currentTimeout);
      if (wsRef.current) wsRef.current.close();
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current);
    };
  }, [connectWebSocket]);

  const scheduleBuild = useCallback(
    (latest: ResumeData, tmpl: typeof selectedTemplate = selectedTemplate) => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        try {
          if (manualLatexPriority) {
            const code = latexCode;
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: "edit", tex: code }));
              setLog((s) => s + "\\nManual priority: sent editor code to build");
              setLoading(true);
            }
            return;
          }

          console.log("Building with template:", tmpl);
          const tex = generateResumeTex(latest, tmpl, {
            pageSize,
            fontFamily,
            primaryColor,
            secondaryColor,
            sectionSpacingMm,
          });
          setLatexCode(tex);
          wsRef.current?.send(JSON.stringify({ type: "edit", tex }));
          setLog((s) => s + "\\nSent build request");
        } catch (error) {
          setLog(
            (s) =>
              s +
              "\\nERROR: " +
              (error instanceof Error
                ? error.message
                : "Failed to generate LaTeX")
          );
          setLoading(false);
        }
      }, 700) as unknown as number;
    },
  [pageSize, fontFamily, primaryColor, secondaryColor, selectedTemplate, sectionSpacingMm, manualLatexPriority, latexCode]
  );

  function updateField<K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K]
  ) {
    setData((prev) => {
      const next = { ...prev, [key]: value };
      setHasUnsavedChanges(true);
      scheduleBuild(next, selectedTemplate);
      return next;
    });
  }

  useEffect(() => {
    if (pdfUrlRef.current) {
      try {
        URL.revokeObjectURL(pdfUrlRef.current);
      } catch {
        /* ignore */
      }
      pdfUrlRef.current = null;
    }
    setPdfUrl(null);
    setLoading(true);
    setLog((s) => s + "\\nTemplate/style changed — rebuilding");
    
    if (!manualLatexPriority) {
      // Immediately update LaTeX code for the new template when not in manual mode
      try {
        const tex = generateResumeTex(data, selectedTemplate, {
          pageSize,
          fontFamily,
          primaryColor,
          secondaryColor,
          sectionSpacingMm,
        });
        setLatexCode(tex);
      } catch (error) {
        console.error("Error generating LaTeX for template change:", error);
      }
    } else {
      setLog((s) => s + "\\nManual priority active — skipping auto LaTeX update");
    }

    scheduleBuild(data, selectedTemplate);
  }, [selectedTemplate, pageSize, fontFamily, primaryColor, secondaryColor, data, scheduleBuild, sectionSpacingMm, manualLatexPriority]);

  function addExperience() {
    setData((prev) => {
      const next = {
        ...prev,
        experiences: [
          ...prev.experiences,
          { company: "", role: "", bullets: [""] },
        ],
      };
      setHasUnsavedChanges(true);
      scheduleBuild(next, selectedTemplate);
      return next;
    });
  }

  function updateExperience(
    index: number,
    patch: Partial<ResumeData["experiences"][number]>
  ) {
    setData((prev) => {
      const arr = [...prev.experiences];
      arr[index] = { ...arr[index], ...patch };
      const next = { ...prev, experiences: arr };
      setHasUnsavedChanges(true);
      scheduleBuild(next, selectedTemplate);
      return next;
    });
  }

  function removeExperience(index: number) {
    setData((prev) => {
      const newExperiences = [...prev.experiences];
      newExperiences.splice(index, 1);
      const next = { ...prev, experiences: newExperiences };
      setHasUnsavedChanges(true);
      scheduleBuild(next, selectedTemplate);
      return next;
    });
  }

  function addEducation() {
    setData((prev) => {
      const next = {
        ...prev,
        education: [...prev.education, { school: "", degree: "" }],
      };
      setHasUnsavedChanges(true);
      scheduleBuild(next, selectedTemplate);
      return next;
    });
  }

  function updateEducation(
    index: number,
    patch: Partial<ResumeData["education"][number]>
  ) {
    setData((prev) => {
      const arr = [...prev.education];
      arr[index] = { ...arr[index], ...patch };
      const next = { ...prev, education: arr };
      setHasUnsavedChanges(true);
      scheduleBuild(next, selectedTemplate);
      return next;
    });
  }

  function removeEducation(index: number) {
    setData((prev) => {
      const newEducation = [...prev.education];
      newEducation.splice(index, 1);
      const next = { ...prev, education: newEducation };
      setHasUnsavedChanges(true);
      scheduleBuild(next, selectedTemplate);
      return next;
    });
  }

  const renderTemplate = () => {
    const templateProps = {
      data,
      pageSize,
      fontFamily,
      primaryColor,
      secondaryColor,
      sectionSpacingMm,
    };

    switch (selectedTemplate) {
      case "classic":
        return <ClassicResume {...templateProps} />;
      case "modern":
        return <ModernResume {...templateProps} />;
      case "Academic":
        return <ModernResume {...templateProps} />;
      case "creative":
        return <CreativeResume {...templateProps} />;
      case "minimalist":
        return <MinimalistResume {...templateProps} />;
      default:
        return <ClassicResume {...templateProps} />;
    }
  };

  return (
    <>
      <div className="bg-black text-white min-h-screen font-sans">
          <div className="hidden lg:block">
            <Sidebar onToggle={setSidebarCollapsed} />
          </div>

          {/* Mobile: menu button to open sidebar as an overlay */}
          <button
            className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white/10 text-white rounded-md shadow-md hover:bg-white/20"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open sidebar"
            title="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {mobileSidebarOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/60 flex lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <div
                className="bg-black text-white w-72 max-w-full h-full overflow-auto border-r border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 border-b border-white/5 flex items-center justify-between">
                  <div className="text-sm font-semibold">Menu</div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-2 rounded-md bg-white/5 text-white hover:bg-white/10"
                    aria-label="Close sidebar"
                    title="Close sidebar"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <Sidebar onToggle={setSidebarCollapsed} />
              </div>
            </div>
          )}
          <main
            className={`transition-all duration-300 ease-in-out ${
              // On small screens we want no left margin so content is full-width.
              // Apply margins only at large (lg) breakpoints to account for the sidebar.
              sidebarCollapsed ? "ml-0 lg:ml-20" : "ml-0 lg:ml-64"
            } min-h-screen`}
          >
            <Header pageName="LaTeX Live Editor" />
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Data Management Controls */}
              <div className="lg:col-span-12 mb-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h3 className="font-semibold text-sm tracking-wide">
                        USER DATA MANAGEMENT
                      </h3>
                      {hasUnsavedChanges && (
                        <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded">
                          Unsaved changes
                        </span>
                      )}
                      {isDataLoaded && !hasUnsavedChanges && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          Data loaded
                        </span>
                      )}
                      <label className="flex items-center space-x-2 text-xs">
                        <input
                          type="checkbox"
                          checked={autoSaveEnabled}
                          onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                          className="rounded"
                        />
                        <span>Auto-save</span>
                      </label>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      <button
                        onClick={loadUserData}
                        disabled={isLoadingUserData}
                        title={
                          isLoadingUserData
                            ? "Loading sample data"
                            : "Load sample data"
                        }
                        aria-label={
                          isLoadingUserData
                            ? "Loading sample data"
                            : "Load sample data"
                        }
                        className="p-2 sm:px-3 sm:py-2 bg-blue-600 text-white rounded text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                      >
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {isLoadingUserData
                            ? "Loading..."
                            : "Load Sample Data"}
                        </span>
                      </button>

                      <button
                        onClick={saveUserData}
                        disabled={
                          isSavingUserData ||
                          (!hasUnsavedChanges && autoSaveEnabled)
                        }
                        title={
                          isSavingUserData ? "Saving changes" : "Save changes"
                        }
                        aria-label={
                          isSavingUserData ? "Saving changes" : "Save changes"
                        }
                        className="p-2 sm:px-3 sm:py-2 bg-green-600 text-white rounded text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
                      >
                        <Save className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          {isSavingUserData ? "Saving..." : "Save Changes"}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setData(UserDataService.getEmptyResumeData());
                          setIsDataLoaded(false);
                          setHasUnsavedChanges(false);
                        }}
                        title="Clear all data"
                        aria-label="Clear all data"
                        className="p-2 sm:px-3 sm:py-2 bg-red-600 text-white rounded text-xs flex items-center gap-2 hover:bg-red-700"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span className="hidden sm:inline">Clear All</span>
                      </button>
                    </div>
                  </div>
                  {dataLoadError && (
                    <div className="mt-2 text-xs text-red-400 bg-red-900/20 border border-red-500/20 rounded px-2 py-1">
                      {dataLoadError}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-400">
                    Click "Load Sample Data" to populate all fields with test
                    data. You can then edit any field as needed.
                    {autoSaveEnabled
                      ? " Changes will be auto-saved every 3 seconds."
                      : " Manual save required."}
                  </div>
                </div>
              </div>

              {/* LEFT: MAIN editor panel */}
              <div className="space-y-6 lg:col-span-5">
                <TemplateSelector
                  selectedTemplate={selectedTemplate}
                  setSelectedTemplate={setSelectedTemplate}
                  pageSize={pageSize}
                  setPageSize={setPageSize}
                  fontFamily={fontFamily}
                  setFontFamily={setFontFamily}
                  primaryColor={primaryColor}
                  setPrimaryColor={setPrimaryColor}
                  secondaryColor={secondaryColor}
                  setSecondaryColor={setSecondaryColor}
                  sectionSpacingMm={sectionSpacingMm}
                  setSectionSpacingMm={setSectionSpacingMm}
                />

                <BasicInfoForm data={data} updateField={updateField} />

                <ExperienceForm
                  data={data}
                  addExperience={addExperience}
                  updateExperience={updateExperience}
                  removeExperience={removeExperience}
                />

                <EducationForm
                  data={data}
                  addEducation={addEducation}
                  updateEducation={updateEducation}
                  removeEducation={removeEducation}
                />

                <SkillsForm data={data} updateField={updateField} />

                <LinksForm data={data} updateField={updateField} />
                <CustomSectionsForm data={data} updateField={updateField} />
              </div>

              {/* RIGHT: Live preview / Editor split */}
              <div className="space-y-6 lg:col-span-7 hidden lg:block">
                <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-sm tracking-wide">
                      LIVE PREVIEW
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setActiveTab("preview")}
                        className={`px-3 py-1 text-xs rounded ${
                          activeTab === "preview"
                            ? "bg-white text-black"
                            : "bg-white/10 text-gray-300"
                        }`}
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => setActiveTab("editor")}
                        className={`px-3 py-1 text-xs rounded ${
                          activeTab === "editor"
                            ? "bg-white text-black"
                            : "bg-white/10 text-gray-300"
                        }`}
                      >
                        LaTeX Code
                      </button>
                      <button
                        onClick={() => setActiveTab("rendered")}
                        className={`px-3 py-1 text-xs rounded ${
                          activeTab === "rendered"
                            ? "bg-white text-black"
                            : "bg-white/10 text-gray-300"
                        }`}
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-xs bg-white/5 px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          checked={manualLatexPriority}
                          onChange={async (e) => {
                            const enabled = e.target.checked;
                            setManualLatexPriority(enabled);
                            if (enabled) {
                              setLog((s) => s + "\\nManual priority enabled — editor code will be used");
                              if (wsRef.current?.readyState === WebSocket.OPEN) {
                                wsRef.current.send(JSON.stringify({ type: "edit", tex: latexCode }));
                                setLoading(true);
                              }
                            } else {
                              setLog((s) => s + "\\nManual priority disabled — using auto-generated LaTeX");
                              try {
                                const tex = generateResumeTex(data, selectedTemplate, {
                                  pageSize,
                                  fontFamily,
                                  primaryColor,
                                  secondaryColor,
                                  sectionSpacingMm,
                                });
                                setLatexCode(tex);
                                if (wsRef.current?.readyState === WebSocket.OPEN) {
                                  wsRef.current.send(JSON.stringify({ type: "edit", tex }));
                                  setLoading(true);
                                }
                              } catch (error) {
                                setLog((s) => s + "\\nError generating LaTeX after disabling manual: " + (error instanceof Error ? error.message : "Unknown error"));
                              }
                            }
                          }}
                        />
                        <span>Use editor for PDF</span>
                      </label>
                      <button
                        onClick={() => setLogOpen(!logOpen)}
                        className="text-xs px-2 py-1 bg-gray-700 rounded"
                      >
                        {logOpen ? "Hide" : "Show"} Build Log
                      </button>
                      <button
                        onClick={() => setLog("")}
                        className="text-xs px-2 py-1 bg-gray-700 rounded"
                        title="Clear build log"
                      >
                        Clear Log
                      </button>
                      <button
                        onClick={() => {
                          try {
                            // Exit manual mode and sync with generated LaTeX
                            setManualLatexPriority(false);
                            const tex = generateResumeTex(data, selectedTemplate, {
                              pageSize,
                              fontFamily,
                              primaryColor,
                              secondaryColor,
                              sectionSpacingMm,
                            });
                            setLatexCode(tex);
                            if (wsRef.current?.readyState === WebSocket.OPEN) {
                              wsRef.current.send(JSON.stringify({ type: "edit", tex }));
                              setLog((s) => s + "\\nSynced LaTeX and disabled manual priority");
                            }
                          } catch (error) {
                            setLog(
                              (s) =>
                                s +
                                "\\nError syncing LaTeX: " +
                                (error instanceof Error
                                  ? error.message
                                  : "Unknown error")
                            );
                          }
                        }}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                      >
                        Sync LaTeX
                      </button>
                      {loading && (
                        <div className="text-xs text-yellow-400">
                          Building...
                        </div>
                      )}
                      {pdfUrl && (
                        <a
                          href={pdfUrl}
                          download="resume.pdf"
                          className="text-xs px-2 py-1 bg-green-600 text-white rounded flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download PDF
                        </a>
                      )}
                    </div>

                    {logOpen && (
                      <div className="bg-black/60 border border-gray-600 rounded p-3 text-xs font-mono max-h-24 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-gray-300">
                          {log || "No logs yet..."}
                        </pre>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col min-h-[600px] pt-3">
                    {activeTab === "preview" ? (
                      <div className="flex-1 p-4 overflow-auto bg-gray-100 min-h-0">
                        <div className="max-w-4xl mx-auto bg-white shadow-lg">
                          {renderTemplate()}
                        </div>
                      </div>
                    ) : activeTab === "editor" ? (
                      <div className="flex-1 min-h-0">
                        <Editor
                          height="600px"
                          defaultLanguage="latex"
                          value={latexCode}
                          onChange={handleLatexCodeChange}
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: false },
                            fontSize: 12,
                            wordWrap: "on",
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 p-4 min-h-0 flex flex-col">
                        {pdfUrl ? (
                          <iframe
                            src={pdfUrl}
                            className="w-full flex-1 h-full rounded border-0"
                            title="Generated PDF"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center">
                              <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>No PDF generated yet</p>
                              <p className="text-sm">
                                Fill in your information to generate a PDF
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
            {/* Mobile floating preview button */}
            <div className="fixed bottom-4 right-4 lg:hidden">
              <button
                className="p-3 rounded-full bg-indigo-600 text-white shadow-lg"
                onClick={() => setMobilePreviewOpen(true)}
                title="Open preview"
              >
                <Eye className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile preview modal */}
            {mobilePreviewOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/60 flex items-start lg:hidden"
                onClick={() => setMobilePreviewOpen(false)}
              >
                <div
                  className="bg-white w-full h-full overflow-auto relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setMobilePreviewOpen(false)}
                    className="absolute top-4 right-4 p-3 bg-black/10 rounded-full"
                    aria-label="Close preview"
                  >
                    <X className="h-6 w-6 text-black" />
                  </button>
                  <div className="p-4 pt-16">
                    <div className="w-full max-w-4xl px-4 mx-auto">
                      {renderTemplate()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <FooterSection />
          </main>
        </div>
    </>
  );
}
