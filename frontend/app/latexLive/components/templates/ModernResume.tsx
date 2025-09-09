import React from 'react';
import { ResumeData } from '@/types/resume';

interface ModernResumeProps {
  data: ResumeData;
  pageSize: 'a4' | 'letter';
  fontFamily: 'serif' | 'sans-serif' | 'mono';
  primaryColor: string;
  secondaryColor: string;
  sectionSpacingMm?: number;
}
export default function ModernResume({ data, primaryColor, secondaryColor, sectionSpacingMm = 3 }: ModernResumeProps) {
  const mmToPx = (mm: number) => `${Math.round(mm * 3.78)}px`;
  const sectionMb = mmToPx(sectionSpacingMm);
  const smallMb = mmToPx(Math.max(0, sectionSpacingMm));
  const mediumMb = mmToPx(Math.max(1, Math.round(sectionSpacingMm * 1.5)));
  return (
    <div className="bg-white text-black min-h-full" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-1/3 p-6" style={{ backgroundColor: `${primaryColor}15` }}>
          <div style={{ marginBottom: smallMb }}>
            <h1 className="text-2xl font-bold mb-1" style={{ color: primaryColor }}>
              {data.name || 'Your Name'}
            </h1>
            <h2 className="text-lg mb-4" style={{ color: secondaryColor }}>
              {data.title || 'Your Title'}
            </h2>
          </div>

          {/* Contact */}
          <div style={{ marginBottom: smallMb }}>
            <h3 className="text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: primaryColor }}>
              Contact
            </h3>
            <div className="space-y-1 text-sm">
              {data.email && <div>{data.email}</div>}
              {data.phone && <div>{data.phone}</div>}
              {data.location && <div>{data.location}</div>}
            </div>
          </div>

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: smallMb }}>
              <h3 className="text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: primaryColor }}>
                Skills
              </h3>
              <div className="space-y-2">
                {data.skills.filter(skill => skill.trim()).map((skill, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>{skill}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ backgroundColor: primaryColor, width: '85%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Sections */}
            {data.customSections && data.customSections.length > 0 && (
            <div style={{ marginBottom: smallMb }}>
              {data.customSections.map((sec) => (
                <div key={sec.id} className="mb-3 text-sm">
                  <div className="font-semibold" style={{ color: primaryColor }}>{sec.title}</div>
                  <div style={{ color: secondaryColor }} className="break-all whitespace-pre-wrap">{sec.content}</div>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
            {data.education.length > 0 && (
            <div style={{ marginBottom: smallMb }}>
              <h3 className="text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: primaryColor }}>
                Education
              </h3>
              {data.education.map((edu, index) => (
                <div key={index} className="mb-3 text-sm">
                  <div className="font-semibold">{edu.degree}</div>
                  <div style={{ color: secondaryColor }}>{edu.school}</div>
                </div>
              ))}
            </div>
          )}

          {/* Links */}
            {data.links && data.links.length > 0 && (
            <div style={{ marginBottom: smallMb }}>
              <h3 className="text-sm font-bold mb-2 uppercase tracking-wide" style={{ color: primaryColor }}>
                Links
              </h3>
              <div className="space-y-1 text-sm">
                {data.links.filter(link => link.label.trim() || link.url.trim()).map((link, index) => (
                  <div key={index}>
                    <div className="font-medium">{link.label}</div>
                    <div style={{ color: secondaryColor }} className="break-all">{link.url}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Content */}
    <div className="w-2/3 p-6">
          {/* Summary */}
          {data.summary && (
      <div style={{ marginBottom: smallMb }}>
              <h3 className="text-lg font-bold mb-3" style={{ color: primaryColor }}>
                PROFILE
              </h3>
              <p className="text-sm leading-relaxed">{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experiences.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3" style={{ color: primaryColor }}>
                EXPERIENCE
              </h3>
              {data.experiences.map((exp, index) => (
                    <div key={index} style={{ marginBottom: mediumMb }}>
                      <div style={{ marginBottom: smallMb }}>
                        <h4 className="font-bold text-base">{exp.role}</h4>
                        <div className="font-semibold" style={{ color: secondaryColor }}>{exp.company}</div>
                      </div>
                      <ul className="text-sm ml-4">
                        {exp.bullets.filter(bullet => bullet.trim()).map((bullet, i) => (
                          <li key={i} className="list-disc" style={{ marginBottom: smallMb }}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
