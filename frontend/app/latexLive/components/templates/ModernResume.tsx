import React from 'react';
import { ResumeData } from '@/types/resume';

interface ModernResumeProps {
  data: ResumeData;
  primaryColor: string;
  secondaryColor: string;
  sectionSpacingMm?: number;
}

// Reusable component for section titles
const SectionTitle = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <h2 className="text-xl font-bold uppercase mb-4 pb-1 border-b-2" style={{ color: color, borderColor: color }}>
    {children}
  </h2>
);

export default function ModernResume({ data, primaryColor, secondaryColor }: ModernResumeProps) {
  const mmToPx = (mm = 3) => `${Math.round(mm * 3.78)}px`;
  void mmToPx;
  // spacing utilities (currently not used by layout)
  // const baseSpacing = mmToPx(3);
  // const sectionSpacing = mmToPx( Math.max(0, 3) );

  return (
    <div className="bg-white text-gray-800 min-h-full" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Left Sidebar (1/3 width) */}
          <aside className="col-span-1 p-8" style={{ backgroundColor: `${primaryColor}1A` }} aria-label="Sidebar">
        {/* Name, Title, and Contact Info */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight" style={{ color: primaryColor }}>{data.name || 'Your Name'}</h1>
              {data.title && <h2 className="text-sm sm:text-lg font-semibold mt-1" style={{ color: secondaryColor }}>{data.title}</h2>}
            </div>

            <div className="text-sm mb-8">
              <h3 className="font-bold text-center uppercase mb-3" style={{ color: primaryColor }}>Contact</h3>
              <address className="not-italic space-y-1 text-center text-sm">
                {data.email && <div><strong>Email:</strong> <a href={`mailto:${data.email}`} className="underline">{data.email}</a></div>}
                {data.phone && <div><strong>Phone:</strong> <a href={`tel:${data.phone}`}>{data.phone}</a></div>}
                {data.location && <div><strong>Location:</strong> {data.location}</div>}
                {data.website && <div className="break-all"><strong>Website:</strong> <a href={data.website} className="underline" target="_blank" rel="noreferrer">{data.website}</a></div>}
              </address>
            </div>

        {/* Education */}
            {data.education && data.education.length > 0 && (
              <section className="mb-8">
                <SectionTitle color={primaryColor}>Education</SectionTitle>
                <div className="space-y-4 text-sm">
                  {data.education.map((edu, i) => (
                    <div key={i} className="flex flex-col">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold">{edu.degree}</h3>
                        { edu.date && <div className="text-xs text-gray-600">{edu.date}</div> }
                      </div>
                      <div className="font-medium" style={{ color: secondaryColor }}>{edu.school}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

        {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <section className="mb-8">
                <SectionTitle color={primaryColor}>Skills</SectionTitle>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {data.skills.filter(s => s && s.trim()).map((skill, i) => (
                    <li key={i}>{skill}</li>
                  ))}
                </ul>
              </section>
            )}

        {/* Links / Custom Sections */}
            {data.links && data.links.length > 0 && (
              <section className="mb-8">
                <SectionTitle color={primaryColor}>Links</SectionTitle>
                <div className="text-sm space-y-2">
                  {data.links.map((link, i) => (
                    <div key={i}>
                      <div className="font-bold">{link.name}</div>
                      <div style={{ color: secondaryColor }} className="break-all text-xs"><a href={link.url} target="_blank" rel="noreferrer" className="underline">{link.url}</a></div>
                    </div>
                  ))}
                </div>
              </section>
            )}
      </aside>

          {/* Right Content (2/3 width) */}
          <main className="col-span-2 p-8" role="main">
        {/* Profile / Summary */}
        {data.summary && (
          <section className="mb-8">
            <SectionTitle color={primaryColor}>Profile</SectionTitle>
            <p className="text-sm leading-relaxed">{data.summary}</p>
          </section>
        )}

        {/* Experience */}
          {data.experiences && data.experiences.length > 0 && (
            <section className="mb-8">
              <SectionTitle color={primaryColor}>Experience</SectionTitle>
              {data.experiences.map((exp, idx) => (
                <article key={idx} className="mb-6">
                  <div className="flex justify-between items-baseline mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{exp.role}</h3>
                      <div className="font-semibold text-md" style={{ color: secondaryColor }}>{exp.company}</div>
                    </div>
                    { exp.date && <div className="text-xs text-gray-600 font-mono">{exp.date}</div> }
                  </div>
                  <ul className="text-sm ml-4 list-disc space-y-1">
                    {exp.bullets && exp.bullets.map((b, bi) => (
                      <li key={bi}>{b}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </section>
          )}

        {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <section>
              <SectionTitle color={primaryColor}>Projects</SectionTitle>
              {data.projects.map((p, i) => (
                <div key={i} className="mb-6">
                  <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-lg">{p.title}</h3>
                      { p.date && <div className="text-xs text-gray-600 font-mono">{p.date}</div> }
                  </div>
                  {p.technologies && <div className="text-sm font-semibold mb-1" style={{ color: secondaryColor }}>{p.technologies}</div>}
                  {p.description && <p className="text-sm">{p.description}</p>}
                </div>
              ))}
            </section>
          )}
          </main>
        </div>
      </div>
    </div>
  );
}