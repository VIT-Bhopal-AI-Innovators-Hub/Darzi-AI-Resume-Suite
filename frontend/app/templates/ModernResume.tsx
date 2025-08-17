import React from "react";
import resumeData from "@/data/resume-schema.json";

const ModernResume: React.FC = () => {
  const data = resumeData;

  return (
    <div className="max-w-4xl mx-auto my-12 p-10 bg-white shadow-2xl rounded-xl font-sans text-slate-800">
      <header className="text-center mb-8 pb-6 border-b border-slate-200">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900">
          {data.name}
        </h1>
        <div className="mt-3 text-sm text-slate-600 flex justify-center space-x-4">
          <span>{data.contact.email}</span>
          <span>•</span>
          <span>{data.contact.phone}</span>
          <span>•</span>
          <span>{data.contact.location}</span>
        </div>
      </header>

      <section>
        <h2 className="text-2xl font-bold border-b-2 border-slate-300 pb-2 mb-4">
          Experience
        </h2>
        <div className="space-y-6">
          {data.experience.map((experience, i) => (
            <div key={i} className="border-l-4 border-slate-300 pl-6 py-2">
              <h3 className="text-xl font-bold">{experience.company}</h3>
              <p className="text-sm text-slate-500 mt-1">
                <strong>Role:</strong> {experience.role}
                <strong>Duration:</strong> {experience.duration}
              </p>
              <p className="mt-2 text-slate-700">{experience.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold border-b-2 border-slate-300 pb-2 mb-4">
          Skills
        </h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {data.skills.map((skill, i) => (
            <span
              key={i}
              className="bg-slate-100 px-3 py-1 rounded-full text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold border-b-2 border-slate-300 pb-2 mb-4">
          Education
        </h2>
        <div className="border-l-4 border-slate-300 pl-6 py-2">
          <h3 className="text-lg font-bold">{data.education.degree}</h3>
          <p className="text-md text-slate-700">{data.education.university}</p>
          <p className="text-sm text-slate-500 mt-1">{data.education.duration}</p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold border-b-2 border-slate-300 pb-2 mb-4">
          Projects
        </h2>
        <div className="space-y-6">
          {data.projects.map((project, i) => (
            <div key={i} className="border-l-4 border-slate-300 pl-6 py-2">
              <h3 className="text-xl font-bold">{project.title}</h3>
              <p className="text-sm text-slate-500 mt-1">
                <strong>Technologies:</strong> {project.technologies}
              </p>
              <p className="mt-2 text-slate-700">{project.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ModernResume;