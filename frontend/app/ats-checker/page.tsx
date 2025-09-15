"use client";

import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../../components/main/sidebar";
import Header from "@/components/main/header";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { FileSearch } from "lucide-react";
import FooterSection from "@/components/footer";

export default function ATSCheckerPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // File upload states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Refs for file inputs
  const jobDescriptionInputRef = useRef<HTMLInputElement>(null);

  // Restore from localStorage on mount
  useEffect(() => {
    const storedJD = localStorage.getItem("atsJD");
    if (storedJD) setJobDescriptionText(storedJD);

    const storedResult = localStorage.getItem("atsResult");
    if (storedResult) {
      setAnalysisResult(JSON.parse(storedResult));
      setAnalysisComplete(true);
    }

    const storedPDF = localStorage.getItem("atsPDF");
    const storedPDFName = localStorage.getItem("atsPDFName");
    if (storedPDF && storedPDFName) {
      const byteString = atob(storedPDF.split(",")[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const file = new File([ab], storedPDFName, { type: "application/pdf" });
      setResumeFile(file);
    }
  }, []);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);

      const reader = new FileReader();
      reader.onload = function (ev) {
        if (ev.target?.result) {
          localStorage.setItem("atsPDF", ev.target.result as string);
          localStorage.setItem("atsPDFName", file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Store JD in localStorage on change
  useEffect(() => {
    localStorage.setItem("atsJD", jobDescriptionText);
  }, [jobDescriptionText]);

  const triggerFileInput = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  // Analyze resume
  const handleAnalyzeResume = async () => {
    if (!resumeFile || !jobDescriptionText.trim()) return;
    setIsAnalysing(true);
    setAnalysisComplete(false);

    const formData = new FormData();
    formData.append("resume_file", resumeFile);
    formData.append("job_description", jobDescriptionText);

    try {
      const response = await fetch("http://localhost:7860/ats-checker", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setAnalysisResult(data);
      setAnalysisComplete(true);

      localStorage.setItem("atsScore", data.overall_score);
      localStorage.setItem("atsResult", JSON.stringify(data));
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalysing(false);
    }
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
                        onChange={(e) => handleFileUpload(e, setResumeFile)}
                        accept=".pdf"
                        className="hidden"
                      />
                      {resumeFile ? (
                        <div className="flex items-center justify-center gap-2 text-green-400 py-7">
                          <FileSearch className="h-5 w-5" />
                          <span className="text-sm">{resumeFile.name}</span>
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

                  {/* Job Description Textarea */}
                  <div className="mb-2">
                    <label className="text-xs text-gray-400 block mb-2">
                      Job Description
                    </label>
                    <div className="flex bg-black/40 border border-white/10 rounded-md px-3 py-2 focus-within:border-white/30">
                      <textarea
                        className="bg-transparent border-none outline-none text-sm flex-1 resize-none"
                        placeholder="Paste your job description here"
                        rows={10}
                        value={jobDescriptionText}
                        onChange={(e) => setJobDescriptionText(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleAnalyzeResume}
                    disabled={
                      isAnalysing || !resumeFile || !jobDescriptionText.trim()
                    }
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
                <section className="bg-white/5 border border-white/10 rounded-xl p-6 pt-4 h-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-lg tracking-wide">
                      ANALYSIS RESULT
                    </h2>
                    {/* <button className="text-xs bg-white/90 text-black font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200 disabled:cursor-not-allowed cursor-pointer hover:bg-gray-300">
                      Download Report
                    </button> */}
                  </div>

                  {/* Analysis Result Rendering */}
                  {analysisResult ? (
                    <div className="space-y-4">
                      <div>
                        <span className="font-semibold">Overall Score:</span>{" "}
                        <span className="text-green-400">
                          {analysisResult.overall_score}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold">Assessment:</span>{" "}
                        <span>{analysisResult.overall_assessment}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold mt-2 mb-1">Categories:</h3>
                        <ul className="space-y-2">
                          {Object.entries(analysisResult.categories).map(
                            ([cat, val]: any) => (
                              <li
                                key={cat}
                                className="border-b border-white/10 pb-2"
                              >
                                <div className="font-bold text-sm">
                                  {cat.replace(/_/g, " ")}
                                </div>
                                <div>
                                  <span className="font-semibold">Score:</span>{" "}
                                  <span className="text-blue-300">
                                    {val.score}
                                  </span>
                                </div>
                                {val.details && (
                                  <div className="text-xs text-gray-300">
                                    {val.details}
                                  </div>
                                )}
                                {val.suggestions && (
                                  <div className="text-xs text-yellow-300">
                                    <span className="font-semibold">
                                      Suggestions:
                                    </span>{" "}
                                    {val.suggestions}
                                  </div>
                                )}
                                {val.found_items &&
                                  val.found_items.length > 0 && (
                                    <div className="text-xs text-gray-400">
                                      <span className="font-semibold">
                                        Found:
                                      </span>{" "}
                                      {val.found_items.join(", ")}
                                    </div>
                                  )}
                                {val.issues && val.issues.length > 0 && (
                                  <div className="text-xs text-red-400">
                                    <span className="font-semibold">
                                      Issues:
                                    </span>{" "}
                                    {val.issues.join(", ")}
                                  </div>
                                )}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                      {analysisResult.recommendations && (
                        <div>
                          <h3 className="font-semibold mt-2 mb-1">
                            Recommendations:
                          </h3>
                          <ul className="list-disc ml-5 text-xs">
                            {analysisResult.recommendations.map(
                              (rec: any, idx: number) => (
                                <li key={idx}>
                                  <span className="font-semibold">
                                    {rec.category}:
                                  </span>{" "}
                                  {rec.suggestion}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-2">
                        <span className="font-semibold">Filename:</span>{" "}
                        {analysisResult.metadata?.filename}
                      </div>
                      <div className="text-xs text-gray-400">
                        <span className="font-semibold">Text Length:</span>{" "}
                        {analysisResult.metadata?.text_length}
                      </div>
                      <div className="text-xs text-gray-400">
                        <span className="font-semibold">
                          Analysis Timestamp:
                        </span>{" "}
                        {analysisResult.metadata?.analysis_timestamp}
                      </div>
                    </div>
                  ) : (
                    <h1 className="font-light text-foreground/50">
                      Analyse resume to get insights
                    </h1>
                  )}
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