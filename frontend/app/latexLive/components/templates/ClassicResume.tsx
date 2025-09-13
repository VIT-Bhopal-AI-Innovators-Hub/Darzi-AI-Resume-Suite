import React from 'react';
import { ResumeData } from '@/types/resume';

interface ClassicResumeProps {
  data: ResumeData;
  pageSize: 'a4' | 'letter';
  fontFamily: 'serif' | 'sans-serif' | 'mono';
  primaryColor: string;
  secondaryColor: string;
  sectionSpacingMm?: number;
}

export default function ClassicResume({ data, primaryColor, secondaryColor, sectionSpacingMm = 3 }: ClassicResumeProps) {
  const mmToPx = (mm: number) => `${Math.round(mm * 3.78)}px`;
  const sectionMb = mmToPx(sectionSpacingMm);
  const smallMb = mmToPx(Math.max(0, sectionSpacingMm));
  const mediumMb = mmToPx(Math.max(1, Math.round(sectionSpacingMm * 1.5)));
  return (
    <div className="bg-white text-black p-8 min-h-full" style={{ fontFamily: 'Times, serif' }}>
      {/* Header */}
  <div className="text-center" style={{ marginBottom: sectionMb, borderBottom: '2px solid', paddingBottom: '1rem', borderColor: primaryColor }}>
        <h1 className="text-4xl font-bold mb-2" style={{ color: primaryColor }}>
          {data.name || 'Your Name'}
        </h1>
        <h2 className="text-xl mb-4" style={{ color: secondaryColor }}>
          {data.title || 'Your Title'}
        </h2>
        <div className="flex justify-center space-x-4 text-sm" style={{ color: secondaryColor }}>
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>•</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>•</span>}
          {data.location && <span>{data.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div style={{ marginBottom: sectionMb }}>
          <h3 className="text-lg font-bold mb-2" style={{ color: primaryColor }}>
            PROFESSIONAL SUMMARY
          </h3>
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experiences.length > 0 && (
        <div style={{ marginBottom: sectionMb }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: primaryColor }}>
            EXPERIENCE
          </h3>
          {data.experiences.map((exp, index) => (
            <div key={index} style={{ marginBottom: mediumMb }}>
              <div style={{ marginBottom: smallMb }} className="flex justify-between items-start">
                <h4 className="font-bold">{exp.company}</h4>
                <span className="text-sm" style={{ color: secondaryColor }}>{exp.role}</span>
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

      {/* Education */}
      {data.education.length > 0 && (
        <div style={{ marginBottom: sectionMb }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: primaryColor }}>
            EDUCATION
          </h3>
          {data.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: smallMb }}>
              <div className="flex justify-between">
                <span className="font-semibold">{edu.school}</span>
                <span className="text-sm" style={{ color: secondaryColor }}>{edu.degree}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div style={{ marginBottom: sectionMb }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: primaryColor }}>
            SKILLS
          </h3>
          <div className="flex flex-wrap gap-2" style={{ marginBottom: smallMb }}>
            {data.skills.filter(skill => skill.trim()).map((skill, index) => (
              <span key={index} className="text-sm px-2 py-1 rounded" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Links */}
      {data.links && data.links.length > 0 && (
        <div style={{ marginBottom: sectionMb }}>
          <h3 className="text-lg font-bold mb-3" style={{ color: primaryColor }}>
            LINKS
          </h3>
          <div className="space-y-1">
            {data.links.filter(link => link.name.trim() || link.url.trim()).map((link, index) => (
              <div key={index} className="text-sm" style={{ marginBottom: smallMb }}>
                <span className="font-medium">{link.name}: </span>
                <span style={{ color: secondaryColor }}>{link.url}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Custom Sections */}
      {data.customSections && data.customSections.length > 0 && (
        <div style={{ marginBottom: sectionMb }}>
          {data.customSections.map((sec) => (
            <div key={sec.id} style={{ marginBottom: smallMb }}>
              <h3 className="text-lg font-bold mb-2" style={{ color: primaryColor }}>{sec.title}</h3>
              <div className="text-sm" style={{ color: secondaryColor, whiteSpace: 'pre-wrap' }}>{sec.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
