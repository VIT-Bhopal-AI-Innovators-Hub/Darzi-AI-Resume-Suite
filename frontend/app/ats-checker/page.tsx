"use client";

import React, { useState, useRef } from "react";
import Sidebar from "../../components/main/sidebar";
import Header from "@/components/main/header";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { FileSearch } from "lucide-react";
import FooterSection from "@/components/footer";


export default function ATSCheckerPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // File upload states
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(
    null
  );
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Refs for file inputs - FIX: proper useRef initialization
  const jobDescriptionInputRef = useRef<HTMLInputElement>(null);

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

  // Analyze resume
  const handleAnalyzeResume = () => {
    setTimeout(() => {}, 2000);
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
            <Header pageName="ATS Checker" />
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
                      Upload Resume (PDF)
                    </label>
                    <div
                      onClick={() => triggerFileInput(jobDescriptionInputRef)}
                      className="border border-dashed border-white/30 rounded-lg p-4 text-center cursor-pointer hover:bg-white/5 transition-colors py-15"
                    >
                      <input
                        type="file"
                        ref={jobDescriptionInputRef}
                        onChange={(e) =>
                          handleFileUpload(e, setJobDescriptionFile)
                        }
                        accept=".pdf"
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
                            Upload Resume (PDF)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Click and upload
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* GitHub Profile */}
                  <div className="mb-2">
                    <label className="text-xs text-gray-400 block mb-2">
                      Job Description
                    </label>
                    <div className="flex bg-black/40 border border-white/10 rounded-md px-3 py-2 focus-within:border-white/30">
                      <textarea
                        className="bg-transparent border-none outline-none text-sm flex-1 resize-none"
                        placeholder="Paste your job description here"
                        rows={10}
                      />
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleAnalyzeResume}
                    disabled={isAnalysing}
                    className={`w-full mt-4 py-3 px-4 rounded-md font-medium text-sm ${
                      isAnalysing
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                  >
                    {isAnalysing ? (
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
                      "Analyze Resume"
                    )}
                  </button>
                </section>

                {analysisComplete && <div></div>}
              </div>

              {/* PREVIEW */}
              <div className="space-y-6">
                <section className="bg-white/5 border border-white/10 rounded-xl p-6 pt-4 h-[81.5vh]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg tracking-wide">
                      Analysis Result
                    </h2>
                    <button className="text-xs bg-white/90 text-black font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-300">
                      Download Report
                    </button>
                  </div>

                  <h1 className="font-light text-foreground/50">
                    Analyse resume to get insights
                  </h1>
                </section>
              </div>
            </div>
            <FooterSection />
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
