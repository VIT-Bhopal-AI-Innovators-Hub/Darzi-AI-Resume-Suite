import React from "react";
import resumeData from "@/data/resume-schema.json";

const CreativeResume: React.FC = () => {
  const data = resumeData;

  return (
    <div className="max-w-6xl mx-auto my-12 shadow-xl rounded-2xl overflow-hidden bg-white flex font-sans">
      {/* Sidebar - Creative and Colorful */}
      <aside className="w-1/3 p-8 text-white bg-gradient-to-b from-indigo-600 to-indigo-800">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-wide">{data.name}</h1>
          <p className="text-sm opacity-90 mt-2">Creative Developer</p>
        </header>

        <section className="mb-8">
          <h2 className="text-2xl font-bold border-b border-white border-opacity-30 pb-2 mb-4">Contact</h2>
          <ul className="text-sm space-y-2">
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
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold border-b border-white border-opacity-30 pb-2 mb-4">Links</h2>
          <ul className="text-sm space-y-2">
            <li>
              <a href={data.links.github} className="hover:underline">
                GitHub: {data.links.github}
              </a>
            </li>
            <li>
              <a href={data.links.linkedin} className="hover:underline">
                LinkedIn: {data.links.linkedin}
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold border-b border-white border-opacity-30 pb-2 mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2 ">
            {data.skills.map((skill, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-3 py-1 rounded-full transition-colors duration-200 hover:bg-opacity-40"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      </aside>

      {/* Main Content */}
      

      <main className="w-2/3 p-10 bg-gradient-to-br from-slate-50 to-indigo-50">
        <section className="mb-10">
        <h2 className="text-3xl font-extrabold text-indigo-700 mb-4 border-b-2 border-pink-500 pb-2">
          Experience
        </h2>
        <div className="space-y-6">
          {data.experience.map((experience, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-md border-l-4 border-pink-500 transition-transform duration-200 hover:scale-[1.01]"
            >
              <h3 className="text-xl font-bold text-slate-800">{experience.company}</h3>
              <p className="text-sm text-slate-500 mt-1">
                <strong>Role:</strong> {experience.role}<br></br>
                <strong>Duration:</strong> {experience.duration}
              </p>
              <p className="mt-4 text-slate-700">{experience.description}</p>
            </div>
          ))}
        </div>
      </section>
        <section className="mb-10">
          <h2 className="text-3xl font-extrabold text-indigo-700 mb-4 border-b-2 border-pink-500 pb-2">
            Education
          </h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold text-slate-800">{data.education.degree}</h3>
            <p className="text-lg text-slate-600 mt-1">{data.education.university}</p>
            <p className="text-sm text-slate-500 mt-2">{data.education.duration}</p>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-extrabold text-indigo-700 mb-4 border-b-2 border-pink-500 pb-2">
            Projects
          </h2>
          <div className="space-y-6">
            {data.projects.map((project, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-pink-500 transition-transform duration-200 hover:scale-[1.01]"
              >
                <h3 className="text-xl font-bold text-slate-800">{project.title}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  <strong>Tech:</strong> {project.technologies}
                </p>
                <p className="mt-4 text-slate-700">{project.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CreativeResume;