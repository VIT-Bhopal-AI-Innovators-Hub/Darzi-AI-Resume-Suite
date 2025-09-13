import React from 'react';
import { ResumeData } from '@/types/resume';

interface CreativeResumeProps {
  data: ResumeData;
  pageSize: 'a4' | 'letter';
  fontFamily: 'serif' | 'sans-serif' | 'mono';
  primaryColor: string;
  secondaryColor: string;
  sectionSpacingMm?: number;
}
export default function CreativeResume({ data, primaryColor, secondaryColor, sectionSpacingMm = 3 }: CreativeResumeProps) {
  const mmToPx = (mm: number) => `${Math.round(mm * 3.78)}px`;
  const sectionMb = mmToPx(sectionSpacingMm);
  const smallMb = mmToPx(Math.max(0, sectionSpacingMm));
  const mediumMb = mmToPx(Math.max(1, Math.round(sectionSpacingMm * 1.5)));
  void mediumMb;
  return (
    <div className="bg-white text-black min-h-full relative overflow-hidden" style={{ fontFamily: 'Georgia, serif' }}>
      {/* Background shapes */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10" style={{ backgroundColor: primaryColor }}></div>
      <div className="absolute bottom-0 left-0 w-60 h-20 opacity-5" style={{ backgroundColor: secondaryColor }}></div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="text-center" style={{ marginBottom: sectionMb }}>
          <div className="inline-block p-6 rounded-2xl mb-4" style={{ backgroundColor: `${primaryColor}10` }}>
            <h1 className="text-4xl font-bold mb-2" style={{ color: primaryColor }}>
              {data.name || 'Your Name'}
            </h1>
            <h2 className="text-xl italic" style={{ color: secondaryColor }}>
              {data.title || 'Your Title'}
            </h2>
          </div>
          <div className="flex justify-center space-x-6 text-sm">
            {data.email && <span className="flex items-center gap-1">📧 {data.email}</span>}
            {data.phone && <span className="flex items-center gap-1">📱 {data.phone}</span>}
            {data.location && <span className="flex items-center gap-1">📍 {data.location}</span>}
          </div>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="text-center" style={{ marginBottom: sectionMb }}>
            <div className="max-w-2xl mx-auto p-4 rounded-lg" style={{ backgroundColor: `${secondaryColor}10` }}>
              <p className="text-sm leading-relaxed italic">{data.summary}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div>
            {/* Experience */}
            {data.experiences.length > 0 && (
              <div style={{ marginBottom: sectionMb }}>
                <h3 className="text-2xl font-bold mb-4 relative" style={{ color: primaryColor }}>
                  Experience
                  <div className="absolute bottom-0 left-0 w-12 h-1 rounded" style={{ backgroundColor: primaryColor }}></div>
                </h3>
                {data.experiences.map((exp, index) => (
                  <div key={index} style={{ marginBottom: smallMb, padding: '1rem', borderLeft: `4px solid ${primaryColor}`, borderRadius: '6px', backgroundColor: `${primaryColor}05` }}>
                    <h4 className="font-bold text-lg">{exp.role}</h4>
                    <div className="font-semibold" style={{ color: secondaryColor, marginBottom: smallMb }}>{exp.company}</div>
                    <ul className="text-sm">
                      {exp.bullets.filter(bullet => bullet.trim()).map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2" style={{ marginBottom: smallMb }}>
                          <span className="text-xs mt-1" style={{ color: primaryColor }}>▶</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div>
            {/* Education */}
            {data.education.length > 0 && (
              <div style={{ marginBottom: sectionMb }}>
                <h3 className="text-2xl font-bold mb-4 relative" style={{ color: primaryColor }}>
                  Education
                  <div className="absolute bottom-0 left-0 w-12 h-1 rounded" style={{ backgroundColor: primaryColor }}></div>
                </h3>
                {data.education.map((edu, index) => (
                  <div key={index} style={{ marginBottom: smallMb, padding: '0.75rem', borderRadius: '6px', backgroundColor: `${secondaryColor}10` }}>
                    <div className="font-bold">{edu.degree}</div>
                    <div style={{ color: secondaryColor }}>{edu.school}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <div style={{ marginBottom: sectionMb }}>
                <h3 className="text-2xl font-bold mb-4 relative" style={{ color: primaryColor }}>
                  Skills
                  <div className="absolute bottom-0 left-0 w-12 h-1 rounded" style={{ backgroundColor: primaryColor }}></div>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.filter(skill => skill.trim()).map((skill, index) => (
                    <span key={index} className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: primaryColor, color: 'white', marginBottom: smallMb }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {data.links && data.links.length > 0 && (
              <div style={{ marginBottom: sectionMb }}>
                <h3 className="text-2xl font-bold mb-4 relative" style={{ color: primaryColor }}>
                  Links
                  <div className="absolute bottom-0 left-0 w-12 h-1 rounded" style={{ backgroundColor: primaryColor }}></div>
                </h3>
                <div className="space-y-2">
                  {data.links.filter(link => link.name.trim() || link.url.trim()).map((link, index) => (
                    <div key={index} style={{ marginBottom: smallMb, padding: '0.75rem', borderRadius: '6px', backgroundColor: `${secondaryColor}10` }}>
                      <div className="font-bold">{link.name}</div>
                      <div style={{ color: secondaryColor }} className="text-sm break-all">{link.url}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
