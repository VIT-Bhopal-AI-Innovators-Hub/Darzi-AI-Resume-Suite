"use client";

import React, { useState, useEffect } from "react";
import { Logo } from "@/components/logo";
import FooterSection from "@/components/footer";
import Sidebar from "./components/sidebar";
import Header from "./components/header";
import { Card } from "./components/card";
import {
  FileText,
  BarChart3,
  Bot,
  ChevronRight,
  MoreVertical,
  ArrowUp,
  Target,
  CheckCircle,
  BrainCircuit,
  ListChecks,
} from "lucide-react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

type StatData = {
  resumesCreated: number;
  avgAtsScore: number;
  keywordsMatched: number;
  templatesUsed: number;
};

type KeywordData = {
  name: string;
  match: number;
};

type Resume = {
  name: string;
  lastUpdated: string;
  atsScore: number;
  status: "Draft" | "Completed";
};

type ActionItem = {
  icon: React.ReactElement;
  text: string;
  suggestion: string;
};

const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "increase" | "decrease";
  icon: React.ReactElement;
}) => (
  <Card className="flex justify-between items-center !p-4">
    <div>
      <p className="text-xs text-gray-400 font-bold">{title}</p>
      <p className="text-lg font-bold text-white">
        {value}
        {change && (
          <span
            className={`ml-2 text-sm font-bold ${
              changeType === "increase" ? "text-gray-200" : "text-gray-500"
            }`}
          >
            {change}
          </span>
        )}
      </p>
    </div>
    <div className="p-3 bg-gray-200 rounded-xl shadow-lg shadow-gray-500/10">
      {icon}
    </div>
  </Card>
);

const WelcomeCard = () => (
  <Card className="flex flex-col justify-between h-full !p-0 overflow-hidden relative">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-80"></div>
    <div className="p-6 pb-0 z-10">
      <p className="text-white text-sm">Welcome back,</p>
      <h3 className="text-white text-2xl font-bold">Alex Thompson</h3>
      <p className="text-white text-sm mt-1">
        Ready to land your dream job? Let's get started.
      </p>
    </div>
    <div className="p-6 pt-0 z-10">
      <a
        href="#"
        className="text-white text-sm font-bold flex items-center bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 p-2 rounded-lg w-fit transition-colors"
      >
        Upload a Job Description <ChevronRight className="h-4 w-4 ml-1" />
      </a>
    </div>
  </Card>
);

const OverallAtsScoreCard = ({ score }: { score: number }) => (
  <Card className="h-full flex flex-col justify-center items-center text-center">
    <p className="text-gray-400 text-sm">Overall ATS Score</p>
    <p className="text-gray-500 text-xs mb-4">Based on your latest resume</p>
    <div className="relative w-32 h-32">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path
          className="text-gray-800"
          d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="text-white"
          strokeDasharray={`${score}, 100`}
          d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          transform="rotate(90 18 18)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white text-3xl font-bold">{score}%</span>
      </div>
    </div>
    <p className="text-gray-400 text-xs mt-4">Highly Optimized</p>
  </Card>
);

const RecentActivityCard = () => (
  <Card className="h-full flex flex-col">
    <h4 className="font-bold text-white">Recent Activity</h4>
    <div className="mt-4 space-y-4 flex-grow">
      <div className="flex items-center">
        <CheckCircle className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
        <p className="text-sm text-gray-300">
          Updated "Software Engineer" resume.
        </p>
      </div>
      <div className="flex items-center">
        <Target className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
        <p className="text-sm text-gray-300">
          Checked ATS score for Google role.
        </p>
      </div>
      <div className="flex items-center">
        <FileText className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
        <p className="text-sm text-gray-300">
          Created new "Product Manager" resume.
        </p>
      </div>
      <div className="flex items-center">
        <BrainCircuit className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
        <p className="text-sm text-gray-300">
          Generated 5 AI-powered suggestions.
        </p>
      </div>
    </div>
  </Card>
);

const AtsScoreHistoryCard = () => (
  <Card className="col-span-2">
    <h4 className="font-bold text-white">ATS Score Over Time</h4>
    <p className="text-sm text-gray-400">
      Your score improvements on your primary resume.
    </p>
    <div className="mt-4 flex items-center justify-center h-64 bg-black/20 rounded-lg">
      <p className="text-gray-500">Chart will be displayed here.</p>
    </div>
  </Card>
);

const KeywordAnalysisCard = ({ data }: { data: KeywordData[] }) => (
  <Card>
    <h4 className="font-bold text-white">Keyword Analysis</h4>
    <p className="text-sm text-gray-400 mb-4">
      Top keywords for "Senior Frontend Developer"
    </p>
    <div className="space-y-3">
      {data.map((keyword) => (
        <div key={keyword.name} className="flex items-center justify-between">
          <span className="text-sm text-gray-300">{keyword.name}</span>
          <div className="flex items-center">
            <span className="text-sm font-bold text-white mr-2">
              {keyword.match}%
            </span>
            <div className="w-24 bg-gray-700 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full"
                style={{ width: `${keyword.match}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

const MyResumesCard = ({ data }: { data: Resume[] }) => (
  <Card className="col-span-2">
    <div className="flex justify-between items-center">
      <div>
        <h4 className="font-bold text-white">My Resumes</h4>
        <p className="text-sm text-gray-400 flex items-center">
          <CheckCircle className="h-4 w-4 text-gray-300 mr-1" /> {data.length}{" "}
          resumes created
        </p>
      </div>
      <button>
        <MoreVertical className="text-gray-400" />
      </button>
    </div>
    <div className="overflow-x-auto mt-4">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-400 uppercase border-b border-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 font-normal">
              Resume Title
            </th>
            <th scope="col" className="px-6 py-3 font-normal">
              Last Updated
            </th>
            <th scope="col" className="px-6 py-3 font-normal">
              Status
            </th>
            <th scope="col" className="px-6 py-3 font-normal">
              ATS Score
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((resume, index) => (
            <tr
              key={index}
              className="border-b border-gray-700 hover:bg-gray-800/50"
            >
              <td className="px-6 py-4 font-bold text-white">{resume.name}</td>
              <td className="px-6 py-4 text-gray-300">{resume.lastUpdated}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    resume.status === "Completed"
                      ? "bg-gray-600 text-gray-100"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {resume.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <span className="text-xs font-bold text-white mr-2">
                    {resume.atsScore}%
                  </span>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-white h-1.5 rounded-full"
                      style={{ width: `${resume.atsScore}%` }}
                    ></div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

const ActionItemsCard = ({ data }: { data: ActionItem[] }) => (
  <Card>
    <h4 className="font-bold text-white">AI Action Items</h4>
    <p className="text-sm text-gray-400 flex items-center">
      <ArrowUp className="h-4 w-4 text-gray-300 mr-1" /> Suggestions to improve
      your score
    </p>
    <div className="mt-6 space-y-6">
      {data.map((item, index) => (
        <div key={index} className="flex items-start">
          <div className="p-2 bg-gray-800 rounded-full mr-4">
            {React.cloneElement(item.icon, {
              className: "text-gray-300",
            } as React.HTMLAttributes<SVGElement>)}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{item.text}</p>
            <p className="text-xs text-gray-400">{item.suggestion}</p>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

export default function App() {
  const [stats, setStats] = useState<StatData | null>(null);
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        resumesCreated: 5,
        avgAtsScore: 88,
        keywordsMatched: 42,
        templatesUsed: 3,
      });
      setKeywords([
        { name: "React", match: 95 },
        { name: "TypeScript", match: 90 },
        { name: "Next.js", match: 85 },
        { name: "Tailwind", match: 80 },
        { name: "GraphQL", match: 70 },
      ]);
      setResumes([
        {
          name: "Senior Frontend Developer",
          lastUpdated: "2 days ago",
          atsScore: 88,
          status: "Completed",
        },
        {
          name: "Product Manager Role",
          lastUpdated: "5 days ago",
          atsScore: 75,
          status: "Completed",
        },
        {
          name: "UX Designer (Draft)",
          lastUpdated: "1 week ago",
          atsScore: 60,
          status: "Draft",
        },
      ]);
      setActionItems([
        {
          icon: <Bot />,
          text: "Add quantifiable results",
          suggestion: 'Example: "Increased user engagement by 15%."',
        },
        {
          icon: <ListChecks />,
          text: "Include more power verbs",
          suggestion:
            'Instead of "responsible for", use "orchestrated", "led".',
        },
        {
          icon: <Target />,
          text: "Tailor skills to job description",
          suggestion: 'Add "GraphQL" and "CI/CD" to match the role.',
        },
      ]);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center font-sans">
        <div className="flex items-center space-x-2">
          <Logo className="h-8 w-8 animate-spin text-white" />
          <span className="text-xl">Loading AI Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <div className="bg-black text-white min-h-screen font-sans">
          <Sidebar onToggle={setSidebarCollapsed} />
          <main
            className={`overflow-y-auto transition-all duration-300 ease-in-out ${
              sidebarCollapsed ? "ml-20" : "ml-64"
            }`}
          >
            <Header />
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                  title="Resumes Created"
                  value={stats?.resumesCreated || 0}
                  change="+2"
                  changeType="increase"
                  icon={<FileText className="text-black" />}
                />
                <StatCard
                  title="Avg. ATS Score"
                  value={`${stats?.avgAtsScore || 0}%`}
                  change="+5%"
                  changeType="increase"
                  icon={<Target className="text-black" />}
                />
                <StatCard
                  title="Keywords Matched"
                  value={stats?.keywordsMatched || 0}
                  change="+12"
                  changeType="increase"
                  icon={<ListChecks className="text-black" />}
                />
                <StatCard
                  title="Templates Used"
                  value={stats?.templatesUsed || 0}
                  icon={<BarChart3 className="text-black" />}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-1">
                  <WelcomeCard />
                </div>
                <div className="lg:col-span-1">
                  <OverallAtsScoreCard score={stats?.avgAtsScore || 0} />
                </div>
                <div className="lg:col-span-1">
                  <RecentActivityCard />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                <AtsScoreHistoryCard />
                <KeywordAnalysisCard data={keywords} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <MyResumesCard data={resumes} />
                <ActionItemsCard data={actionItems} />
              </div>
            </div>
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
