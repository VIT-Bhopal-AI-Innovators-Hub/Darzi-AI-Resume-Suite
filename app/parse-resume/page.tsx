"use client";

import React, { useState, useRef, useEffect } from "react";
import Sidebar from "../../components/main/sidebar";
import Header from "@/components/main/header";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { FileSearch } from "lucide-react";
import FooterSection from "@/components/footer";

export default function ResumeEditorPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // File upload states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingComplete, setParsingComplete] = useState(false);
  const [parsedData, setParsedData] = useState({
    contact_information: {
      full_name: "John Doe",
      title: "Senior Software Engineer",
      location: "San Francisco, CA",
      phone: "+1 (415) 555-0198",
      email: "john.doe@example.com",
      website: "https://johndoe.dev",
    },
    professional_summary:
      "Product-focused senior software engineer with 8 years of experience building high-throughput web services and consumer-facing applications. Experienced in leading cross-functional teams, shipping end-to-end features, and improving system reliability at scale.",
    education: [
      {
        institution: "University of California, Berkeley",
        degree: "B.S. in Computer Science",
        duration: "2014 - 2018",
      },
      {
        institution: "Stanford University",
        degree: "M.S. in Software Engineering",
        duration: "2018 - 2020",
      },
    ],
    skills: [
      "TypeScript",
      "React",
      "Node.js",
      "PostgreSQL",
      "Redis",
      "AWS (ECS, Lambda, S3)",
      "Kafka",
      "Flink",
      "Terraform",
    ],
    work_experience: [
      {
        title: "Senior Software Engineer",
        company: "Nimbus Analytics",
        responsibilities: [
          "Designed and implemented a microservices-based analytics pipeline that processed 2TB of event data per day, improving query latency by 65% through partitioning and indexing strategies",
          "Led a team of 6 engineers to ship a real-time dashboard product used by 300+ enterprise customers, increasing monthly revenue by 22%",
          "Architected and migrated core services to AWS (ECS, RDS, S3) and introduced IaC with Terraform to reduce environment drift",
          "Introduced contract testing and a staged CI/CD flow which cut production incidents by 45%",
        ],
      },
    ],
    certifications: [
      { name: "AWS Certified Solutions Architect – Associate", year: "2022" },
      { name: "Google Cloud Professional Data Engineer", year: "2021" },
    ],
    projects: [
      {
        name: "Realtime Insights Dashboard",
        description:
          "Built a streaming analytics dashboard using Kafka, Flink, and React; reduced BI reporting time from hours to minutes.",
      },
      {
        name: "Open Source Contribution",
        description:
          "Contributed to an auth library (40+ PRs), improved test coverage and documentation.",
      },
    ],
    awards_and_activities: [
      {
        name: "Tech Innovation Award",
        year: "2023",
        description: "Team lead for customer analytics product",
      },
      { name: "Speaker at JSConf 2022", year: "2022" },
    ],
    _parsed_by: "Gemini (gemini-1.5-flash)",
  });

  // Refs for file inputs - FIX: proper useRef initialization
  const resumeFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("parsedData");
    if (stored) {
      try {
        setParsedData(JSON.parse(stored));
        setParsingComplete(true);
      } catch {
        console.log("Failed to parse stored data");
      }
    }
  }, []);

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
  const handleParseData = async () => {
    if (!resumeFile) return;
    setIsParsing(true);

    const formData = new FormData();
    formData.append("files", resumeFile);

    try {
      const response = await fetch("https://vit-bhopal-ai-innovators-hub-darzi-api-server.hf.space/parse-data", {
      // const response = await fetch("http://localhost:7860/parse-data", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data._parsed_by) {
        delete data['_parsed_by'];
      }

      setParsedData(data);
      localStorage.setItem("parsedData", JSON.stringify(data));

      console.log(data);

      setParsingComplete(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsParsing(false);
    }
  };

  const renderValue = (val: any): React.ReactNode => {
    if (Array.isArray(val)) {
      return (
        <ul className="list-disc list-inside">
          {val.map((item, i) => (
            <li key={i}>{renderValue(item)}</li>
          ))}
        </ul>
      );
    } else if (val && typeof val === "object") {
      return (
        <div className="ml-4">
          {Object.keys(val).map((k) => (
            <div key={k}>
              <strong>{k.replace(/_/g, " ").toUpperCase()}:</strong>{" "}
              {renderValue(val[k])}
            </div>
          ))}
        </div>
      );
    } else {
      return String(val);
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
            <Header pageName="Parse Resume" />
            <div className="p-4 grid grid-cols-1 gap-6">
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
                      onClick={() => triggerFileInput(resumeFileInputRef)}
                      className="border border-dashed border-white/30 rounded-lg p-4 text-center cursor-pointer hover:bg-white/5 transition-colors py-8"
                    >
                      <input
                        type="file"
                        ref={resumeFileInputRef}
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
                            Upload job description (PDF or Text)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Click and drop
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleParseData}
                    disabled={isParsing}
                    className={`cursor-pointer w-full mt-4 py-3 px-4 rounded-md font-medium text-sm ${
                      isParsing
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                  >
                    {isParsing ? (
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
                        Parsing...
                      </span>
                    ) : (
                      "Parse Resume"
                    )}
                  </button>
                </section>
              </div>

              {/* PREVIEW */}
              <div className="space-y-6">
                <section className="bg-white/5 border border-white/10 rounded-xl p-6 pb-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-sm tracking-wide">
                      PARSED DATA
                    </h2>
                  </div>
                  {parsedData && (
                    <section>
                      {Object.keys(parsedData).map((key) => (
                        <div key={key} className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
                          <h3 className="font-semibold text-md mb-2 text-foreground/50">
                            {key.replace(/_/g, " ").toUpperCase()}
                          </h3>
                          <div className="text-sm text-gray-300">
                            {renderValue(parsedData[key])}
                          </div>
                        </div>
                      ))}
                    </section>
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