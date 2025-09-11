export type ResumeData = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  experiences: Array<{
    company: string;
    role: string;
    bullets: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
  }>;
  skills: string[];
  links: Array<{
    label: string;
    url: string;
  }>;
  customSections?: Array<{
    id: string;
    title: string;
    content: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    link?: string;
  }>;
};

// Import modular template components
import { TemplateParams } from './latexTemplates/types';
import * as classicTemplate from './latexTemplates/classic';
import * as modernTemplate from './latexTemplates/modern';
import * as creativeTemplate from './latexTemplates/creative';
import * as professionalTemplate from './latexTemplates/professional';
import * as minimalistTemplate from './latexTemplates/minimalist';
import * as twoColumnTemplate from './latexTemplates/twoColumn';

export function escapeLatex(s: string | undefined): string {
  if (!s) return '';
  return s
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/{/g, '\\{')
    .replace(/}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\^{}')
    .replace(/</g, '\\textless{}')
    .replace(/>/g, '\\textgreater{}');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
 
  hex = hex.replace(/^#/, '');

  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  // Handle invalid hex codes by returning black
  if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return { r: 0, g: 0, b: 0 };
  }

  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }

  // Parse and clamp RGB values to 0-255 range
  const r = Math.max(0, Math.min(255, parseInt(result[1], 16)));
  const g = Math.max(0, Math.min(255, parseInt(result[2], 16)));
  const b = Math.max(0, Math.min(255, parseInt(result[3], 16)));

  return { r, g, b };
}

export function generateResumeTex(
  data: ResumeData,
  template: 'classic' | 'modern' | 'creative' | 'professional' | 'minimalist' | 'twoColumn' = 'classic',
  options?: {
    pageSize?: 'a4' | 'letter';
    fontFamily?: 'serif' | 'sans-serif' | 'mono';
    primaryColor?: string;
    secondaryColor?: string;
  sectionSpacingMm?: number;
  sectionOrder?: string[];
  }
): string {
  
  if (!data.name || data.name.trim() === '') {
   
    console.warn('generateResumeTex: name is empty — falling back to empty string');
  }


  const processedData = processResumeData(data, options);


  const templateParams: TemplateParams = {
    ...processedData,
    pageSize: options?.pageSize || 'letter',
    fontFamily: getFontFamilyString(options?.fontFamily || 'serif'),
    primaryColorRGB: hexToRgb(options?.primaryColor || '#000000'),
    secondaryColorRGB: hexToRgb(options?.secondaryColor || '#666666'),
  };

  console.log('Generating LaTeX with options:', {
    template,
    pageSize: templateParams.pageSize,
    fontFamily: templateParams.fontFamily,
    primaryColor: options?.primaryColor,
    secondaryColor: options?.secondaryColor,
    sectionSpacingMm: templateParams.sectionSpacingSmall,
    hasName: !!templateParams.name,
    hasExperiences: !!templateParams.experiences,
    hasEducation: !!templateParams.education,
    hasSkills: !!templateParams.skillsList
  });

  // Generate LaTeX using modular templates
  return generateLatexFromTemplate(template, templateParams);
}

// Helper function to get font family string for LaTeX
function getFontFamilyString(fontFamily: 'serif' | 'sans-serif' | 'mono'): string {
  switch (fontFamily) {
    case 'sans-serif': return '\\renewcommand{\\familydefault}{\\sfdefault}';
    case 'mono': return '\\renewcommand{\\familydefault}{\\ttdefault}';
    default: return '';
  }
}

// Helper function to process resume data and create all the formatted strings
function processResumeData(data: ResumeData, options?: {
  pageSize?: 'a4' | 'letter';
  fontFamily?: 'serif' | 'sans-serif' | 'mono';
  primaryColor?: string;
  secondaryColor?: string;
  sectionSpacingMm?: number;
}) {
  const name = escapeLatex(data.name?.trim() || '');
  const title = escapeLatex(data.title?.trim() || '');
  const email = escapeLatex(data.email?.trim() || '');
  const phone = escapeLatex(data.phone?.trim() || '');
  const location = escapeLatex(data.location?.trim() || '');
  const website = escapeLatex(data.website?.trim() || '');
  const summary = escapeLatex(data.summary?.trim() || '');
  const rawSpacing = typeof options?.sectionSpacingMm === 'number' ? options!.sectionSpacingMm : 3;
  const sectionSpacingMm = Math.max(0, Math.min(20, Math.round(rawSpacing * 10) / 10));
  // small and medium spacing derived from the base spacing for consistent scaling
  const sectionSpacingSmall = Math.max(0, sectionSpacingMm);
  const sectionSpacingMedium = Math.max(1, Math.round(sectionSpacingMm * 1.5));

  const skillsItems = (data.skills || [])
    .filter(skill => skill && skill.trim())
    .map((s) => `\\item ${escapeLatex(s.trim())}`)
    .join('\n');

  const skillsList = skillsItems ? `\\begin{itemize}[leftmargin=*,itemsep=${sectionSpacingSmall}mm,parsep=0pt]\n${skillsItems}\n\\end{itemize}` : '';

  const linksList = (data.links || [])
    .filter(link => link && (link.label?.trim() || link.url?.trim()))
    .map((link) => {
      const label = escapeLatex(link.label?.trim() || '');
      const url = escapeLatex(link.url?.trim() || '');
      if (label && url) {
        return `\\href{${url}}{${label}}`;
      } else if (url) {
        return `\\href{${url}}{${url}}`;
      } else if (label) {
        return label;
      }
      return '';
    })
    .filter(link => link)
    .join(' \\textbullet{} ');

  // Create a links section (LaTeX lines) to append after skills
  const linksSection = (data.links || [])
    .filter(link => link && (link.label?.trim() || link.url?.trim()))
    .map((link) => {
      const label = escapeLatex(link.label?.trim() || '');
      const url = escapeLatex(link.url?.trim() || '');
      if (label && url) return `\\href{${url}}{${label}}`;
      if (url) return `\\href{${url}}{${url}}`;
      return label;
    })
    .filter(Boolean)
    .join(' \\\\ ');

  // Custom sections (user added sections)
  const customSectionsTex = (data.customSections || [])
    .filter(s => s && (s.title?.trim() || s.content?.trim()))
    .map((s) => {
      const title = escapeLatex(s.title?.trim() || '');
      // Allow basic newlines -> paragraph breaks in LaTeX
      const contentRaw = (s.content || '').trim();
      const contentEscaped = escapeLatex(contentRaw).replace(/\n/g, '\\\\par ');
      return `\\section*{${title}}\n${contentEscaped}`;
    })
    .join(`\n\\vspace{${sectionSpacingSmall}mm}\n`);

  // Short version of education for sidebar (e.g., just schools)
  const educationShort = (data.education || [])
    .filter(edu => edu && (edu.school?.trim()))
    .map((edu) => escapeLatex(edu.school?.trim() || ''))
    .join(', ');

  const experiences = (data.experiences || [])
    .filter(exp => exp && (exp.role?.trim() || exp.company?.trim()))
    .map((exp) => {
      const role = escapeLatex(exp.role?.trim() || '');
      const company = escapeLatex(exp.company?.trim() || '');
      const bullets = (exp.bullets || [])
        .filter(b => b && b.trim())
        .map((b) => `\\item ${escapeLatex(b.trim())}`)
        .join('\n');

      if (!bullets) {
        return `\\textbf{${role}} \\\\ \\small ${company}`;
      }
      return `\\textbf{${role}} \\\\ \\small ${company} \\\\ \\begin{itemize}[leftmargin=*,topsep=0pt,partopsep=0pt,itemsep=${sectionSpacingSmall}mm,parsep=0pt]\n${bullets}\n\\end{itemize}`;
    })
    .join(`\n\\vspace{${sectionSpacingSmall}mm}\n`);

  const education = (data.education || [])
    .filter(edu => edu && (edu.school?.trim() || edu.degree?.trim()))
    .map((edu) => {
      const school = escapeLatex(edu.school?.trim() || '');
      const degree = escapeLatex(edu.degree?.trim() || '');
      return `\\textbf{${school}} \\\\ ${degree}`;
    })
    .join(`\n\\vspace{${sectionSpacingSmall}mm}\n`);

  // Create colored contact line that handles hyperlinks properly
  const coloredContactParts = [email, phone, location, website].filter(part => part).map(part => `\\color{secondarycolor}${part}`);
  const coloredContactLine = coloredContactParts.join(' \\textbullet{} ');
  const coloredFullContactLine = coloredContactLine + (coloredContactLine && linksList ? ' \\textbullet{} ' + linksList : linksList);

  return {
    name,
    title,
    email,
    phone,
    location,
    website,
    summary,
    experiences,
    education,
    skillsList,
    linksSection,
    customSectionsTex,
    educationShort,
    coloredFullContactLine,
    sectionSpacingSmall,
    sectionSpacingMedium,
  };
}

// Main function to generate LaTeX from template
function generateLatexFromTemplate(
  template: 'classic' | 'modern' | 'creative' | 'professional' | 'minimalist' | 'twoColumn',
  params: TemplateParams
): string {
  switch (template) {
    case 'modern':
      return modernTemplate.preamble(params) + modernTemplate.body(params) + modernTemplate.footer();
    case 'creative':
      return creativeTemplate.preamble(params) + creativeTemplate.body(params) + creativeTemplate.footer(params);
    case 'professional':
      return professionalTemplate.preamble(params) + professionalTemplate.body(params) + professionalTemplate.footer(params);
    case 'minimalist':
      return minimalistTemplate.preamble(params) + minimalistTemplate.body(params) + minimalistTemplate.footer(params);
    case 'twoColumn':
      return twoColumnTemplate.preamble(params) + twoColumnTemplate.body(params) + twoColumnTemplate.footer(params);
    default: // classic
      return classicTemplate.preamble(params) + classicTemplate.body(params) + classicTemplate.footer();
  }
}
