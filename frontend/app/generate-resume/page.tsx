"use client";

import React, { useState, useRef } from "react";
import Sidebar from "../../components/main/sidebar";
import Header from "@/components/main/header";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import {
  Plus,
  Github,
  Trash2,
  FileSearch,
} from "lucide-react";
import FooterSection from "@/components/footer";
import Image from "next/image";

type SectionEntry = {
  id: string;
  position: string;
  organization: string;
  start: string;
  end: string;
  bullets: string[];
  linkLabel?: string;
  linkUrl?: string;
};
type Section = {
  id: string;
  name: string;
  entries: SectionEntry[];
};

export default function ResumeEditorPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // File upload states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [linkedinFile, setLinkedinFile] = useState<File | null>(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(
    null
  );
  const [githubProfile, setGithubProfile] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);

  // Refs for file inputs - FIX: proper useRef initialization
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const linkedinInputRef = useRef<HTMLInputElement>(null);
  const jobDescriptionInputRef = useRef<HTMLInputElement>(null);

  // Existing resume data states
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string>("React, TypeScript, Next.js");
  const [sections, setSections] = useState<Section[]>([
    {
      id: crypto.randomUUID(),
      name: "Experience",
      entries: [
        {
          id: crypto.randomUUID(),
          position: "Frontend Engineer",
          organization: "Your Company Here",
          start: "20XX-01",
          end: "Present",
          bullets: ["Built reusable UI", "Improved performance by 25%"],
          linkLabel: "Portfolio",
          linkUrl: "", // cleared to avoid accidental leftover link
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: "Education",
      entries: [
        {
          id: crypto.randomUUID(),
          position: "B.S. Computer Science",
          organization: "University Name",
          start: "20XX-09",
          end: "20XX-06",
          bullets: [
            "Graduated with Honors (GPA 9.0/10.0)",
            "Relevant Coursework: Algorithms, Systems, Databases",
          ],
          linkLabel: "Transcript",
          linkUrl: "",
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: "Misc",
      entries: [
        {
          id: crypto.randomUUID(),
          position: "Open Source Contributor",
          organization: "GitHub",
          start: "20XX-04",
          end: "Present",
          bullets: [
            "Contributed to 5+ popular React libraries",
            "Maintainer of a small utility with 1k+ monthly downloads",
          ],
          linkLabel: "GitHub Profile",
          linkUrl: "", // left empty to not be left in accidentsally
        },
      ],
    },
  ]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [links, setLinks] = useState<
    { id: string; label: string; url: string }[]
  >([]);

  // Handle file uploads
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Trigger file input click
  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  // Generate resume
  const handleGenerateResume = () => {
    setIsGenerating(true);

    // Simulate API call with timeout
    setTimeout(() => {
      setIsGenerating(false);
      setGenerationComplete(true);

      // Update resume data with sample values
      setFullName("AI Generated Name");
      setTitle("Senior Software Engineer");
      setSummary(
        "Experienced software engineer with expertise in React, Node.js, and cloud technologies. Proven track record of delivering high-quality software solutions."
      );
      setSkills("React, TypeScript, Node.js, AWS, Docker, CI/CD, GraphQL");
      // You would typically update sections here too based on API response
    }, 2000);
  };

  const addSection = () =>
    setSections((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "New Section",
        entries: [
          {
            id: crypto.randomUUID(),
            position: "",
            organization: "",
            start: "",
            end: "",
            bullets: [""],
            linkLabel: "",
            linkUrl: "",
          },
        ],
      },
    ]);

  const updateSection = (id: string, patch: Partial<Section>) =>
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );

  const removeSection = (id: string) =>
    setSections((prev) => prev.filter((s) => s.id !== id));

  const addEntry = (sectionId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              entries: [
                ...s.entries,
                {
                  id: crypto.randomUUID(),
                  position: "",
                  organization: "",
                  start: "",
                  end: "",
                  bullets: [""],
                  linkLabel: "",
                  linkUrl: "",
                },
              ],
            }
          : s
      )
    );

  const updateEntry = (
    sectionId: string,
    entryId: string,
    patch: Partial<SectionEntry>
  ) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              entries: s.entries.map((e) =>
                e.id === entryId ? { ...e, ...patch } : e
              ),
            }
          : s
      )
    );

  const removeEntry = (sectionId: string, entryId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, entries: s.entries.filter((e) => e.id !== entryId) }
          : s
      )
    );

  const updateBullet = (
    sectionId: string,
    entryId: string,
    idx: number,
    value: string
  ) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              entries: s.entries.map((e) =>
                e.id === entryId
                  ? {
                      ...e,
                      bullets: e.bullets.map((b, i) => (i === idx ? value : b)),
                    }
                  : e
              ),
            }
          : s
      )
    );

  const addBullet = (sectionId: string, entryId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              entries: s.entries.map((e) =>
                e.id === entryId ? { ...e, bullets: [...e.bullets, ""] } : e
              ),
            }
          : s
      )
    );

  const removeBullet = (sectionId: string, entryId: string, idx: number) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              entries: s.entries.map((e) =>
                e.id === entryId
                  ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) }
                  : e
              ),
            }
          : s
      )
    );

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
            <Header pageName="Resume Generator" />
            <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* MAIN generator panel */}
              <div className="space-y-6">
                <section className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h2 className="font-bold mb-4 text-sm tracking-wide">
                    UPLOAD YOUR INFORMATION
                  </h2>

                  {/* Job Description Upload */}
                  <div className="mb-6">
                    <label className="text-xs text-gray-400 block mb-2">
                      Job Description (PDF or Text)
                    </label>
                    <div
                      onClick={() => triggerFileInput(jobDescriptionInputRef)}
                      className="border border-dashed border-white/30 rounded-lg p-4 text-center cursor-pointer hover:bg-white/5 transition-colors py-38"
                    >
                      <input
                        type="file"
                        ref={jobDescriptionInputRef}
                        onChange={(e) =>
                          handleFileUpload(e, setJobDescriptionFile)
                        }
                        accept=".pdf,.txt"
                        className="hidden"
                      />
                      {jobDescriptionFile ? (
                        <div className="flex items-center justify-center gap-2 text-green-400 py-7">
                          <FileSearch className="h-5 w-5" />
                          <span className="text-sm">
                            {jobDescriptionFile.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <FileSearch className="h-8 w-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-400">
                            Upload job description (PDF or Text)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Click and drop
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GitHub Profile */}
                  <div className="mb-2">
                    <label className="text-xs text-gray-400 block mb-2">
                      GitHub Profile URL
                    </label>
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-md px-3 py-2 focus-within:border-white/30">
                      <Github className="h-4 w-4 text-gray-400 mr-2" />
                      <input
                        value={githubProfile}
                        onChange={(e) => setGithubProfile(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm flex-1"
                        placeholder="https://github.com/username"
                      />
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerateResume}
                    disabled={isGenerating}
                    className={`w-full mt-4 py-3 px-4 rounded-md font-medium text-sm ${
                      isGenerating
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-black"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      "Generate Optimized Resume"
                    )}
                  </button>
                </section>

                {generationComplete && (
                  <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-8">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-sm tracking-wide">
                        EDIT GENERATED RESUME
                      </h2>
                      <button
                        onClick={addSection}
                        className="text-xs flex items-center gap-1 bg-white text-black font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Section
                      </button>
                    </div>

                    {sections.map((section, sIdx) => (
                      <div
                        key={section.id}
                        className="border border-white/10 rounded-lg p-4 space-y-4 bg-black/40"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            value={section.name}
                            onChange={(e) =>
                              updateSection(section.id, {
                                name: e.target.value,
                              })
                            }
                            placeholder="Section Name (e.g. Experience, Education, Projects)"
                            className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm outline-none focus:border-white/30 font-semibold"
                          />
                          {sections.length > 1 && (
                            <button
                              onClick={() => removeSection(section.id)}
                              className="text-gray-400 hover:text-red-400"
                              title="Remove section"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-6">
                          {section.entries.map((entry) => (
                            <div
                              key={entry.id}
                              className="bg-black/30 border border-white/10 rounded-md p-4 space-y-3"
                            >
                              <div className="flex gap-3">
                                <input
                                  value={entry.position}
                                  onChange={(e) =>
                                    updateEntry(section.id, entry.id, {
                                      position: e.target.value,
                                    })
                                  }
                                  placeholder="Title / Role"
                                  className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-white/30"
                                />
                                <input
                                  value={entry.organization}
                                  onChange={(e) =>
                                    updateEntry(section.id, entry.id, {
                                      organization: e.target.value,
                                    })
                                  }
                                  placeholder="Organization"
                                  className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-white/30"
                                />
                              </div>
                              <div className="flex gap-3 items-center">
                                <input
                                  type="month"
                                  value={entry.start}
                                  onChange={(e) =>
                                    updateEntry(section.id, entry.id, {
                                      start: e.target.value,
                                    })
                                  }
                                  className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-white/30"
                                />
                                <input
                                  type="month"
                                  value={entry.end}
                                  onChange={(e) =>
                                    updateEntry(section.id, entry.id, {
                                      end: e.target.value,
                                    })
                                  }
                                  className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-white/30"
                                />
                                <button
                                  onClick={() =>
                                    removeEntry(section.id, entry.id)
                                  }
                                  className="ml-auto text-gray-400 hover:text-red-400"
                                  title="Remove entry"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="space-y-2">
                                {entry.bullets.map((b, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2"
                                  >
                                    <textarea
                                      value={b}
                                      onChange={(e) =>
                                        updateBullet(
                                          section.id,
                                          entry.id,
                                          idx,
                                          e.target.value
                                        )
                                      }
                                      rows={1}
                                      className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-sm resize-y outline-none focus:border-white/30"
                                      placeholder="Achievement / Detail..."
                                    />
                                    {entry.bullets.length > 1 && (
                                      <button
                                        onClick={() =>
                                          removeBullet(
                                            section.id,
                                            entry.id,
                                            idx
                                          )
                                        }
                                        className="text-gray-500 hover:text-red-400"
                                        title="Remove bullet"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  onClick={() =>
                                    addBullet(section.id, entry.id)
                                  }
                                  className="text-xs text-gray-300 hover:text-white"
                                >
                                  + Add bullet
                                </button>
                              </div>

                              {/* LINK LABEL & URL INPUTS */}
                              <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-wide text-gray-400">
                                  Link
                                </label>
                                <div className="flex gap-3">
                                  <input
                                    value={entry.linkLabel || ""}
                                    onChange={(e) =>
                                      updateEntry(section.id, entry.id, {
                                        linkLabel: e.target.value,
                                      })
                                    }
                                    placeholder="Link Label (e.g. Repo)"
                                    className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-white/30"
                                  />
                                  <input
                                    value={entry.linkUrl || ""}
                                    onChange={(e) =>
                                      updateEntry(section.id, entry.id, {
                                        linkUrl: e.target.value,
                                      })
                                    }
                                    placeholder="https://link"
                                    className="flex-[1.4] bg-black/40 border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-white/30"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}

                          <button
                            onClick={() => addEntry(section.id)}
                            className="text-xs flex items-center gap-1 bg-white text-black font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Entry
                          </button>
                        </div>
                      </div>
                    ))}
                  </section>
                )}
              </div>

              {/* PREVIEW */}
              <div className="space-y-6">
                <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-sm tracking-wide">
                      LIVE PREVIEW
                    </h2>
                    <button className="text-xs bg-white/90 text-black font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200 disabled:cursor-not-allowed">
                      Export PDF (Coming Soon)
                    </button>
                  </div>
                  <Image src="/jake.jpeg" height={200} width={1200} alt="jake's-resume" className="rounded-lg"></Image>
                </section>
              </div>
            </div>
            {/* <FooterSection /> */}
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
}