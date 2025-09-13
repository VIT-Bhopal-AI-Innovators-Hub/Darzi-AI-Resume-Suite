export type ResumeData = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  experiences?: Array<{
    company?: string;
    role?: string;
    startDate?: string | null;
    endDate?: string | null;
    bullets?: string[];
  }>;
  education?: Array<{
    school?: string;
    degree?: string;
    startDate?: string | null;
    endDate?: string | null;
  }>;
  skills?: string[];
  links?: Array<{
    name?: string;
    url?: string;
  }>;
  certificates?: Array<{
    name?: string;
    issuer?: string | null;
    date?: string | null;
  }>;
  customSections?: Array<{
    id?: string;
    title?: string;
    content?: string;
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
  template: 'classic' | 'modern' | 'Academic' | 'creative' | 'professional' | 'minimalist' | 'twoColumn' = 'classic',
  options?: {
    pageSize?: 'a4' | 'letter';
    fontFamily?: 'serif' | 'sans-serif' | 'mono';
    primaryColor?: string;
    secondaryColor?: string;
  sectionSpacingMm?: number;
  margin?: number;
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
    fontSize: "10pt",
  // Margin is in inches and defaults to 0.5in for a tighter layout
  margin: typeof options?.margin === 'number' ? options!.margin : 0.5,
    showIcons: false,
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
  return generateLatexFromTemplate(template, templateParams, data);
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

  // Create a compact two-column skills table (LaTeX) for denser layouts
  const skillsArray = (data.skills || [])
    .filter(skill => skill && skill.trim())
    .map(s => escapeLatex(s.trim()));

  const half = Math.ceil(skillsArray.length / 2) || 0;
    const leftItems = skillsArray.slice(0, half).map(s => `\\textbullet{} ${s} \\\\`).join('\n');
    const rightItems = skillsArray.slice(half).map(s => `\\textbullet{} ${s} \\\\`).join('\n');

    // Build a simple two-column table with bullet lines (avoid itemize inside tabular)
    const skillsTable = skillsArray.length ?
      `\\begin{tabular}{p{0.48\\linewidth} p{0.48\\linewidth}}\\small ${leftItems} & ${rightItems}\\\\\\end{tabular}`
      : '';

  const skillsCommaSeparated = skillsArray.join(', ');

  const linksList = (data.links || [])
    .filter(link => link && (link.name?.trim() || link.url?.trim()))
    .map((link) => {
      const label = escapeLatex(link.name?.trim() || '');
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
    .filter(link => link && (link.name?.trim() || link.url?.trim()))
    .map((link) => {
      const label = escapeLatex(link.name?.trim() || '');
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
      const role = escapeLatex((exp.role || '').trim());
      const company = escapeLatex((exp.company || '').trim());
      const start = escapeLatex((exp.startDate || '').trim());
      const end = escapeLatex((exp.endDate || '').trim());
      const bullets = (exp.bullets || [])
        .filter(b => b && b.trim())
        .map((b) => `\\item ${escapeLatex(b.trim())}`)
        .join('\n');

      const dateStr = (start || end) ? `\\hfill {\\small ${start || ''}${start && end ? ' -- ' : ''}${end || ''}}` : '';

      if (!bullets) {
        return `\\textbf{${role}} \\\\ \\small ${company} ${dateStr}`;
      }
      return `\\textbf{${role}} \\\\ \\small ${company} ${dateStr} \\\\ \\begin{itemize}[leftmargin=*,topsep=0pt,partopsep=0pt,itemsep=${sectionSpacingSmall}mm,parsep=0pt]\n${bullets}\n\\end{itemize}`;
    })
  .join(`
\\vspace{${sectionSpacingSmall}mm}
`);

  const education = (data.education || [])
    .filter(edu => edu && (edu.school?.trim() || edu.degree?.trim()))
    .map((edu) => {
      const school = escapeLatex((edu.school || '').trim());
      const degree = escapeLatex((edu.degree || '').trim());
      const start = escapeLatex((edu.startDate || '').trim());
      const end = escapeLatex((edu.endDate || '').trim());
      const dateStr = (start || end) ? `\\hfill {\\small ${start || ''}${start && end ? ' -- ' : ''}${end || ''}}` : '';
      return `\\textbf{${school}} ${dateStr} \\\\ ${degree}`;
    })
  .join(`
\\vspace{${sectionSpacingSmall}mm}
`);

  // Certificates
  const certificatesTex = (data.certificates || [])
    .filter(c => c && c.name)
    .map((c) => {
      const name = escapeLatex((c.name || '').trim());
      const issuer = escapeLatex((c.issuer || '').trim());
      const date = escapeLatex((c.date || '').trim());
      const datePart = date ? `\\hfill {\\small ${date}}` : '';
      return `\\textbf{${name}} \\\\ ${issuer} ${datePart}`;
    })
  .join(`
\\vspace{${sectionSpacingSmall}mm}
`);

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
  skillsTable,
    skillsCommaSeparated,
  certificatesTex,
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
  template: 'classic' | 'modern' | 'Academic' | 'creative' | 'professional' | 'minimalist' | 'twoColumn',
  params: TemplateParams,
  originalData: ResumeData | Record<string, unknown>
): string {
  switch (template) {
    case 'modern': {
      const modernParams = buildModernTemplateParams(params, originalData);
      type ModernBodyParam = Parameters<typeof modernTemplate.body>[0];
      return modernTemplate.preamble(params) + modernTemplate.body(modernParams as ModernBodyParam);
    }
    case 'Academic': {
      const modernParams = buildModernTemplateParams(params, originalData);
      type ModernBodyParam = Parameters<typeof modernTemplate.body>[0];
      return modernTemplate.preamble(params) + modernTemplate.body(modernParams as ModernBodyParam);
    }
    case 'creative':
      return creativeTemplate.preamble(params) + creativeTemplate.body(params);
    case 'professional':
      return professionalTemplate.preamble(params) + professionalTemplate.body(params);
    case 'minimalist':
      return minimalistTemplate.preamble(params) + minimalistTemplate.body(params);
    case 'twoColumn':
      return twoColumnTemplate.preamble(params) + twoColumnTemplate.body(params);
    default: // classic
      return classicTemplate.preamble(params) + classicTemplate.body(params);
  }
}

// Build extra parameters expected by the modern template from available data
type ModernExtras = {
  course?: string;
  roll?: string;
  emaila?: string;
  emailb?: string;
  github?: string;
  website?: string;
  linkedin?: string;
  education?: Array<{ degree: string; institute: string; score: string; year: string }>;
  experience?: Array<{ company: string; location: string; role: string; dates: string; work: string[] }>;
  projects?: Array<{ name: string; role: string; date: string; work: string[]; description: string }>;
  skills?: Array<{ category: string; tools: string }>;
  courses?: Array<{ year: string; list: string }>;
  certifications?: string[];
  positions?: Array<{ position: string; organization: string; date: string }>;
  activities?: Array<{ name: string; description: string }>;
};

function isString(v: unknown): v is string { return typeof v === 'string'; }
function toStr(v: unknown): string { return isString(v) ? v : v == null ? '' : String(v); }

function getProp<T = unknown>(obj: Record<string, unknown>, key: string): T | undefined {
  return obj[key] as T | undefined;
}

function buildModernTemplateParams(
  params: TemplateParams,
  data: ResumeData | Record<string, unknown>
): Omit<TemplateParams, 'education'> & ModernExtras {
  const extras: ModernExtras = {};

  // Basic contact extras
  const original = data as Record<string, unknown>;
  extras.course = escapeLatex(toStr(getProp(original, 'course') ?? (data as ResumeData).title));
  extras.roll = escapeLatex(toStr(getProp(original, 'roll')));
  extras.emaila = escapeLatex(toStr(getProp(original, 'emaila') ?? (data as ResumeData).email));
  extras.emailb = escapeLatex(toStr(getProp(original, 'emailb') ?? (data as ResumeData).email));

  // Derive GitHub and LinkedIn from links if not explicitly provided
  const links = Array.isArray((data as ResumeData).links) ? (data as ResumeData).links! : [];
  const findUrl = (pred: (u: string) => boolean) =>
    (links.find(l => typeof l?.url === 'string' && pred(l.url!))?.url || '') as string;
  const ghVal = getProp(original, 'github');
  const liVal = getProp(original, 'linkedin');
  const githubUrl = (isString(ghVal) && ghVal.startsWith('http'))
    ? ghVal
    : findUrl(u => /github\.com\//i.test(u));
  const linkedinUrl = (isString(liVal) && liVal.startsWith('http'))
    ? liVal
    : findUrl(u => /linkedin\.com\//i.test(u));

  const extractUsername = (url: string) => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      return parts[0] || '';
    } catch { return ''; }
  };

  extras.github = escapeLatex((isString(ghVal) && !ghVal.startsWith('http'))
    ? ghVal
    : extractUsername(githubUrl));
  extras.linkedin = escapeLatex((isString(liVal) && !liVal.startsWith('http'))
    ? liVal
    : extractUsername(linkedinUrl));

  // Education (array with degree, institute, score, year)
  const eduDetailed = getProp<unknown[]>(original, 'educationDetailed');
  if (Array.isArray(eduDetailed)) {
    extras.education = eduDetailed.map((e) => {
      const obj = (typeof e === 'object' && e !== null) ? (e as Record<string, unknown>) : {};
      return {
        degree: escapeLatex(toStr(obj['degree'])),
        institute: escapeLatex(toStr(obj['institute'])),
        score: escapeLatex(toStr(obj['score'])),
        year: escapeLatex(toStr(obj['year']))
      };
    }).filter(e => e.degree || e.institute);
  } else if (Array.isArray((data as ResumeData).education)) {
    extras.education = ((data as ResumeData).education || []).map((e) => ({
      degree: escapeLatex(toStr(e?.degree)),
      institute: escapeLatex(toStr(e?.school)),
      score: '',
      year: escapeLatex(toStr((e?.endDate || e?.startDate)))
    })).filter(e => e.degree || e.institute);
  } else {
    extras.education = [];
  }

  // Experience (company, location, role, dates, work[])
  const location = toStr((data as ResumeData).location || params.location);
  const expDetailed = getProp<unknown[]>(original, 'experience');
  if (Array.isArray(expDetailed)) {
    extras.experience = expDetailed.map((x) => {
      const o = (typeof x === 'object' && x !== null) ? (x as Record<string, unknown>) : {};
      const work = Array.isArray(o['work']) ? (o['work'] as unknown[]).map(item => escapeLatex(toStr(item))) : [];
      return {
        company: escapeLatex(toStr(o['company'])),
        location,
        role: escapeLatex(toStr(o['role'])),
        dates: escapeLatex(toStr(o['dates'])),
        work
      };
    }).filter(x => x.company || x.role);
  } else if (Array.isArray((data as ResumeData).experiences)) {
    extras.experience = (data as ResumeData).experiences!.map((x) => ({
      company: escapeLatex(toStr(x?.company)),
      location,
      role: escapeLatex(toStr(x?.role)),
      dates: escapeLatex([x?.startDate, x?.endDate].filter(Boolean).map(toStr).join(' - ')),
      work: Array.isArray(x?.bullets) ? x!.bullets!.filter(Boolean).map(b => escapeLatex(toStr(b))) : []
    })).filter(x => x.company || x.role);
  } else {
    extras.experience = [];
  }

  // Projects (fallback empty)
  const projects = getProp<unknown[]>(original, 'projects');
  extras.projects = Array.isArray(projects)
    ? projects.map((p) => {
        const o = (typeof p === 'object' && p !== null) ? (p as Record<string, unknown>) : {};
        const work = Array.isArray(o['work']) ? (o['work'] as unknown[]).map(item => escapeLatex(toStr(item))) : [];
        return {
          name: escapeLatex(toStr(o['name'])),
          role: escapeLatex(toStr(o['role'])),
          date: escapeLatex(toStr(o['date'])),
          work,
          description: escapeLatex(toStr(o['description']))
        };
      })
    : [];

  // Skills categorized; else collapse to one category using skillsCommaSeparated
  const skillsCat = getProp<unknown[]>(original, 'skillsCategorized');
  if (Array.isArray(skillsCat)) {
    extras.skills = skillsCat.map((s) => {
      const o = (typeof s === 'object' && s !== null) ? (s as Record<string, unknown>) : {};
      return { category: escapeLatex(toStr(o['category'])), tools: escapeLatex(toStr(o['tools'])) };
    }).filter(s => s.category || s.tools);
  } else if (Array.isArray((data as ResumeData).skills)) {
  const tools = ((data as ResumeData).skills || []).filter(Boolean).map(toStr).map(escapeLatex).join(', ');
  extras.skills = tools ? [{ category: 'Skills', tools }] : [];
  } else {
    extras.skills = [];
  }

  const courses = getProp<unknown[]>(original, 'courses');
  extras.courses = Array.isArray(courses)
    ? courses.map((c) => {
        const o = (typeof c === 'object' && c !== null) ? (c as Record<string, unknown>) : {};
        return { year: escapeLatex(toStr(o['year'])), list: escapeLatex(toStr(o['list'])) };
      })
    : [];

  const certs = getProp<unknown[]>(original, 'certifications');
  extras.certifications = Array.isArray(certs) ? certs.map(x => escapeLatex(toStr(x))) : [];

  const positions = getProp<unknown[]>(original, 'positions');
  extras.positions = Array.isArray(positions)
    ? positions.map((p) => {
        const o = (typeof p === 'object' && p !== null) ? (p as Record<string, unknown>) : {};
        return { position: escapeLatex(toStr(o['position'])), organization: escapeLatex(toStr(o['organization'])), date: escapeLatex(toStr(o['date'])) };
      })
    : [];

  const activities = getProp<unknown[]>(original, 'activities');
  extras.activities = Array.isArray(activities)
    ? activities.map((a) => {
        const o = (typeof a === 'object' && a !== null) ? (a as Record<string, unknown>) : {};
        return { name: escapeLatex(toStr(o['name'])), description: escapeLatex(toStr(o['description'])) };
      })
    : [];

  // Remove 'education' string from params to match modern template's type
  const restParams = { ...(params as unknown as Record<string, unknown>) };
  delete (restParams as Record<string, unknown>)['education'];
  return { ...(restParams as Omit<TemplateParams, 'education'>), ...extras };
}
