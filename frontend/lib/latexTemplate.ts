export type ResumeData = {
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  summary?: string;
  experiences?: Array<{
    company?: string;
    role?: string;
    start?: string;
    end?: string;
    bullets?: string[];
  }>;
  education?: Array<{
    school?: string;
    degree?: string;
    start?: string;
    end?: string;
  }>;
  projects?: Array<{
    name?: string;
    technologies?: string;
    link?: string;
    description?: string;
  }>;
  skills?: string[];
  customSections?: Array<{
    title?: string;
    content?: string;
  }>;
  links?: Array<{
    label?: string;
    url?: string;
  }>;
};

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

/** Generate a simple resume LaTeX document from form data. */
export function generateResumeTex(
  data: ResumeData,
  template: 'classic' | 'modern' | 'creative' | 'professional' = 'classic',
  options?: {
    pageSize?: 'a4' | 'letter';
    fontFamily?: 'serif' | 'sans-serif' | 'mono';
    primaryColor?: string;
    secondaryColor?: string;
    sectionOrder?: string[];
  }
): string {
  
  if (!data.name || data.name.trim() === '') {
    throw new Error('Name is required to generate resume');
  }

  const name = escapeLatex(data.name?.trim() || '');
  const title = escapeLatex(data.title?.trim() || '');
  const email = escapeLatex(data.email?.trim() || '');
  const phone = escapeLatex(data.phone?.trim() || '');
  const location = escapeLatex(data.location?.trim() || '');
  const website = escapeLatex(data.website?.trim() || '');
  const summary = escapeLatex(data.summary?.trim() || '');

  const skillsList = (data.skills || [])
    .filter(skill => skill && skill.trim())
    .map((s) => escapeLatex(s.trim()))
    .join(', ');

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

  const experiences = (data.experiences || [])
    .filter(exp => exp && (exp.role?.trim() || exp.company?.trim()))
    .map((exp) => {
      const role = escapeLatex(exp.role?.trim() || '');
      const company = escapeLatex(exp.company?.trim() || '');
      const start = escapeLatex(exp.start?.trim() || '');
      const end = escapeLatex(exp.end?.trim() || '');
      const bullets = (exp.bullets || [])
        .filter(b => b && b.trim())
        .map((b) => `\\item ${escapeLatex(b.trim())}`)
        .join('\n');

      if (!bullets) {
        return `\\textbf{${role}} \\\\ \\small ${company} \\hfill ${start} -- ${end}`;
      }

      return `\\textbf{${role}} \\\\ \\small ${company} \\hfill ${start} -- ${end} \\\\ \\begin{itemize}[leftmargin=*]\n${bullets}\n\\end{itemize}`;
    })
    .join('\n\\vspace{2mm}\n');

  const education = (data.education || [])
    .filter(edu => edu && (edu.school?.trim() || edu.degree?.trim()))
    .map((edu) => {
      const school = escapeLatex(edu.school?.trim() || '');
      const degree = escapeLatex(edu.degree?.trim() || '');
      const start = escapeLatex(edu.start?.trim() || '');
      const end = escapeLatex(edu.end?.trim() || '');
      return `\\textbf{${school}} \\\\ ${degree} \\hfill ${start} -- ${end}`;
    })
    .join('\n\\vspace{2mm}\n');

  const projects = (data.projects || [])
    .filter(proj => proj && (proj.name?.trim() || proj.description?.trim()))
    .map((proj) => {
      const name = escapeLatex(proj.name?.trim() || '');
      const technologies = escapeLatex(proj.technologies?.trim() || '');
      const link = escapeLatex(proj.link?.trim() || '');
      const description = escapeLatex(proj.description?.trim() || '');
      
      let projectHeader = name;
      if (link) {
        projectHeader = `\\href{${link}}{${name}}`;
      }
      
      let projectLine = `\\textbf{${projectHeader}}`;
      if (technologies) {
        projectLine += ` \\\\ \\small\\textit{${technologies}}`;
      }
      if (description) {
        projectLine += ` \\\\ ${description}`;
      }
      
      return projectLine;
    })
    .join('\n\\vspace{2mm}\n');

  const customSections = (data.customSections || [])
    .filter(section => section && (section.title?.trim() || section.content?.trim()))
    .map((section) => {
      const title = escapeLatex(section.title?.trim() || 'Custom Section');
      const content = escapeLatex(section.content?.trim() || '');
      return { title, content };
    });

  
  // Create colored contact line that handles hyperlinks properly
  const coloredContactParts = [email, phone, location, website].filter(part => part).map(part => `\\color{secondarycolor}${part}`);
  const coloredContactLine = coloredContactParts.join(' \\textbullet{} ');
  const coloredFullContactLine = coloredContactLine + (coloredContactLine && linksList ? ' \\textbullet{} ' + linksList : linksList);

  // Customization options with defaults
  const pageSize = options?.pageSize || 'letter';
  const fontFamily = options?.fontFamily || 'serif';
  const primaryColor = options?.primaryColor || '#000000';
  const secondaryColor = options?.secondaryColor || '#666666';

  const primaryColorRGB = hexToRgb(primaryColor);
  const secondaryColorRGB = hexToRgb(secondaryColor);

  console.log('Generating LaTeX with options:', {
    template,
    pageSize,
    fontFamily,
    primaryColor,
    secondaryColor,
    hasName: !!name,
    hasExperiences: !!experiences,
    hasEducation: !!education,
    hasSkills: !!skillsList
  });

  // Generate sections in the specified order
  const sectionOrder = options?.sectionOrder || ['skills', 'experience', 'projects', 'education'];
  const generateOrderedSections = (isColored: boolean = false) => {
    const sectionMap: { [key: string]: string } = {
      'skills': skillsList ? `\\section*{${isColored ? '\\color{primarycolor}' : ''}Skills}\n${skillsList}` : '',
      'experience': experiences ? `\\section*{${isColored ? '\\color{primarycolor}' : ''}Experience}\n${experiences}` : '',
      'projects': projects ? `\\section*{${isColored ? '\\color{primarycolor}' : ''}Projects}\n${projects}` : '',
      'education': education ? `\\section*{${isColored ? '\\color{primarycolor}' : ''}Education}\n${education}` : '',
    };
    
    // Add custom sections to the map
    customSections.forEach((section) => {
      if (section.title && section.content) {
        const sectionKey = `custom-${section.title.toLowerCase().replace(/\s+/g, '-')}`;
        sectionMap[sectionKey] = `\\section*{${isColored ? '\\color{primarycolor}' : ''}${section.title}}\n${section.content}`;
      }
    });
    
    return sectionOrder
      .map(sectionType => sectionMap[sectionType])
      .filter(section => section)
      .join('\n\n');
  };

  let latexTemplate: string;

  switch (template) {
    case 'modern':
      latexTemplate = `\\documentclass[${pageSize === 'a4' ? 'a4paper' : 'letterpaper'},11pt]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{parskip}
\\usepackage{color}
\\definecolor{primarycolor}{RGB}{${primaryColorRGB.r},${primaryColorRGB.g},${primaryColorRGB.b}}
\\definecolor{secondarycolor}{RGB}{${secondaryColorRGB.r},${secondaryColorRGB.g},${secondaryColorRGB.b}}
${fontFamily === 'sans-serif' ? '\\renewcommand{\\familydefault}{\\sfdefault}' : ''}
${fontFamily === 'mono' ? '\\renewcommand{\\familydefault}{\\ttdefault}' : ''}
\\setlength{\\parindent}{0pt}

\\begin{document}

\\begin{center}
{\\LARGE \\textbf{\\color{primarycolor}${name}}}\\\\
${title ? `{\\color{secondarycolor}${title}} \\\\` : ''}
${coloredFullContactLine ? `${coloredFullContactLine} \\\\` : ''}
\\end{center}

${summary ? `\\vspace{3mm}\\noindent ${summary} \\vspace{4mm}` : ''}

${generateOrderedSections()}

\\end{document}`;
      break;
    case 'creative':
      latexTemplate = `\\documentclass[${pageSize === 'a4' ? 'a4paper' : 'letterpaper'},11pt]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{parskip}
\\usepackage{color}
\\definecolor{primarycolor}{RGB}{${primaryColorRGB.r},${primaryColorRGB.g},${primaryColorRGB.b}}
\\definecolor{secondarycolor}{RGB}{${secondaryColorRGB.r},${secondaryColorRGB.g},${secondaryColorRGB.b}}
${fontFamily === 'sans-serif' ? '\\renewcommand{\\familydefault}{\\sfdefault}' : ''}
${fontFamily === 'mono' ? '\\renewcommand{\\familydefault}{\\ttdefault}' : ''}
\\setlength{\\parindent}{0pt}

\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{\\color{primarycolor}${name}}}\\\\
  ${title ? `{\\color{secondarycolor}${title}} \\\\` : ''}
  ${coloredFullContactLine ? `${coloredFullContactLine} \\\\` : ''}
\\end{center}

${summary ? `\\vspace{3mm}\\noindent ${summary} \\vspace{4mm}` : ''}

${generateOrderedSections()}

\\end{document}`;
      break;
    case 'professional':
      latexTemplate = `\\documentclass[${pageSize === 'a4' ? 'a4paper' : 'letterpaper'},11pt]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{parskip}
\\usepackage{color}
\\definecolor{primarycolor}{RGB}{${primaryColorRGB.r},${primaryColorRGB.g},${primaryColorRGB.b}}
\\definecolor{secondarycolor}{RGB}{${secondaryColorRGB.r},${secondaryColorRGB.g},${secondaryColorRGB.b}}
${fontFamily === 'sans-serif' ? '\\renewcommand{\\familydefault}{\\sfdefault}' : ''}
${fontFamily === 'mono' ? '\\renewcommand{\\familydefault}{\\ttdefault}' : ''}
\\setlength{\\parindent}{0pt}

\\begin{document}

\\begin{center}
{\\LARGE \\textbf{\\color{primarycolor}${name}}}\\\\
${title ? `{\\color{secondarycolor}${title}} \\\\` : ''}
${coloredFullContactLine ? `${coloredFullContactLine} \\\\` : ''}
\\end{center}

${summary ? `\\vspace{3mm}\\noindent ${summary} \\vspace{4mm}` : ''}

${generateOrderedSections(true)}

\\end{document}`;
      break;
    default: // classic
      latexTemplate = `\\documentclass[${pageSize === 'a4' ? 'a4paper' : 'letterpaper'},11pt]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{parskip}
\\usepackage{color}
\\definecolor{primarycolor}{RGB}{${primaryColorRGB.r},${primaryColorRGB.g},${primaryColorRGB.b}}
\\definecolor{secondarycolor}{RGB}{${secondaryColorRGB.r},${secondaryColorRGB.g},${secondaryColorRGB.b}}
${fontFamily === 'sans-serif' ? '\\renewcommand{\\familydefault}{\\sfdefault}' : ''}
${fontFamily === 'mono' ? '\\renewcommand{\\familydefault}{\\ttdefault}' : ''}
\\setlength{\\parindent}{0pt}

\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{\\color{primarycolor}${name}}}\\\\
  ${title ? `\\color{secondarycolor}${title} \\\\` : ''}
  ${coloredFullContactLine ? `${coloredFullContactLine} \\\\` : ''}
\\end{center}

${summary ? `\\vspace{3mm}\\noindent \\color{primarycolor}${summary} \\vspace{4mm}` : ''}

${generateOrderedSections(true)}

\\end{document}`;
  }

  return latexTemplate;
}
