import React from "react";
import resumeData from "@/data/resume-schema.json";



const ClassicResume: React.FC = () => {
  const data = resumeData;

  return (
    <div className="bg-white p-12 max-w-5xl mx-auto my-12 shadow-2xl font-sans text-slate-800 rounded-lg flex">
      {/* Sidebar - Adjusted for a more professional look */}
      <aside className="w-1/3 bg-slate-50 p-8 rounded-l-lg border-r border-slate-200">
        <h2 className="text-2xl font-bold text-[#2B4162] mb-4 border-b pb-2 border-slate-300">
          Contact
        </h2>
        <ul className="space-y-1 text-sm text-slate-700">
          <li>
            <span className="font-semibold">Location:</span> {data.contact.location}
          </li>
          <li>
            <span className="font-semibold">Phone:</span> {data.contact.phone}
          </li>
          <li>
            <span className="font-semibold">Email:</span> {data.contact.email}
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-[#2B4162] mt-8 mb-4 border-b pb-2 border-slate-300">
          Links
        </h2>
        <ul className="space-y-1 text-sm text-slate-700">
          <li>
            <a href={data.links.github} className="text-[#426694] hover:underline">
              GitHub
            </a>
          </li>
          <li>
            <a href={data.links.linkedin} className="text-[#426694] hover:underline">
              LinkedIn
            </a>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-[#2B4162] mt-8 mb-4 border-b pb-2 border-slate-300">
          Problem Solving
        </h2>
        <ul className="space-y-1 text-sm text-slate-700">
          <li>
            <span className="font-semibold">Codeforces:</span> {data.problemSolving.codeforces}
          </li>
          <li>
            <span className="font-semibold">LeetCode:</span> {data.problemSolving.leetcode}
          </li>
          <li>
            <span className="font-semibold">GFG:</span> {data.problemSolving.gfg}
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-[#2B4162] mt-8 mb-4 border-b pb-2 border-slate-300">
          Skills
        </h2>
        <ul className="space-y-1 text-sm text-slate-700">
          {data.skills.map((skill, i) => (
            <li key={i}>{skill}</li>
          ))}
        </ul>
      </aside>

      {/* Main Content - Adjusted for better hierarchy and readability */}
      <main className="w-2/3 p-8">
        <h1 className="text-5xl font-extrabold text-[#2B4162] border-b-4 border-b-[#426694] pb-2">
          {data.name}
        </h1>

        <h2 className="text-3xl font-bold text-[#2B4162] mt-8 mb-4">Experience</h2>
        {data.experience.map((experience, i) => (
          <div key={i} className="mb-6 border-l-4 border-l-slate-200 pl-4">
            <h3 className="text-xl font-bold text-[#426694]">{experience.company}</h3>
            <p className="text-sm text-slate-500 mt-1">
              <strong>Role:</strong> {experience.role}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              <strong>Duration:</strong> {experience.duration}
            </p>
            <p className="mt-2 text-slate-700">{experience.description}</p>
          </div>
        ))}
        <h2 className="text-3xl font-bold text-[#2B4162] mt-8 mb-4">Education</h2>
        <p className="text-lg text-slate-700 leading-relaxed">
          <strong>{data.education.degree}</strong> &mdash; {data.education.university} ({data.education.duration})
        </p>

        <h2 className="text-3xl font-bold text-[#2B4162] mt-8 mb-4">Projects</h2>
        {data.projects.map((project, i) => (
          <div key={i} className="mb-6 border-l-4 border-l-slate-200 pl-4">
            <h3 className="text-xl font-bold text-[#426694]">{project.title}</h3>
            <p className="text-sm text-slate-500 mt-1">
              <strong>Technologies Used:</strong> {project.technologies}
            </p>
            <p className="mt-2 text-slate-700">{project.description}</p>
          </div>
        ))}
      </main>
    </div>
  );
};

export default ClassicResume;