// LaTeX generator utility for converting resume data to LaTeX format

export interface ResumeData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  skills: string;
  sections: Array<{
    id: string;
    name: string;
    entries: Array<{
      id: string;
      position: string;
      organization: string;
      start: string;
      end: string;
      bullets: string[];
      linkLabel?: string;
      linkUrl?: string;
    }>;
  }>;
  additionalLinks: Array<{
    id: string;
    label: string;
    url: string;
  }>;
}

export function generateLatexFromResumeData(data: ResumeData): string {
  const {
    fullName,
    title,
    email,
    phone,
    location,
    website,
    summary,
    skills,
    sections,
    additionalLinks,
  } = data;

  // Helper function to escape LaTeX special characters
  const escapeLatex = (text: string): string => {
    if (!text) return '';
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\$/g, '\\$')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/#/g, '\\#')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/_/g, '\\_')
      .replace(/~/g, '\\textasciitilde{}');
  };

  // Helper function to format dates
  const formatDate = (date: string): string => {
    if (!date) return '';
    try {
      const [year, month] = date.split('-');
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const monthName = monthNames[parseInt(month) - 1];
      return `${monthName} ${year}`;
    } catch {
      return date;
    }
  };

  // Build contact info
  const contactParts = [];
  if (email) contactParts.push(`\\href{mailto:${email}}{${escapeLatex(email)}}`);
  if (phone) contactParts.push(escapeLatex(phone));
  if (location) contactParts.push(escapeLatex(location));
  if (website) {
    const url = website.startsWith('http') ? website : `https://${website}`;
    contactParts.push(`\\href{${url}}{${escapeLatex(website)}}`);
  }
  
  // Add additional links
  additionalLinks
    .filter(link => link.url || link.label)
    .forEach(link => {
      const url = link.url || (link.label?.startsWith('http') ? link.label : '');
      const label = link.label || link.url;
      if (url && label) {
        contactParts.push(`\\href{${url}}{${escapeLatex(label)}}`);
      } else if (label) {
        contactParts.push(escapeLatex(label));
      }
    });

  const contactInfo = contactParts.join(' \\textbar\\ ');

  // Build skills section
  const skillsList = skills
    .split(',')
    .map(skill => escapeLatex(skill.trim()))
    .filter(Boolean)
    .join(' \\textbullet\\ ');

  // Build sections
  const sectionsLatex = sections
    .map(section => {
      if (!section.entries.length) return '';
      
      const sectionEntries = section.entries
        .map(entry => {
          if (!entry.position && !entry.organization) return '';
          
          const title = entry.position ? escapeLatex(entry.position) : '';
          const org = entry.organization ? escapeLatex(entry.organization) : '';
          const titleLine = [title, org].filter(Boolean).join(' | ');
          
          const startDate = entry.start ? formatDate(entry.start) : '';
          const endDate = entry.end ? formatDate(entry.end) : 'Present';
          const dateRange = [startDate, endDate].filter(Boolean).join(' - ');
          
          let entryLatex = '';
          if (titleLine && dateRange) {
            entryLatex = `\\textbf{${titleLine}} \\hfill ${dateRange}`;
          } else if (titleLine) {
            entryLatex = `\\textbf{${titleLine}}`;
          }
          
          // Add link if present
          if (entry.linkUrl && entry.linkLabel) {
            entryLatex += ` \\href{${entry.linkUrl}}{${escapeLatex(entry.linkLabel)}}`;
          }
          
          entryLatex += '\\\\\n';
          
          // Add bullets
          const bullets = entry.bullets
            .filter(bullet => bullet.trim())
            .map(bullet => `\\item ${escapeLatex(bullet)}`)
            .join('\n');
            
          if (bullets) {
            entryLatex += `\\begin{itemize}[leftmargin=*]\n${bullets}\n\\end{itemize}`;
          }
          
          return entryLatex;
        })
        .filter(Boolean)
        .join('\n\n');
      
      if (!sectionEntries) return '';
      
      return `\\section{${escapeLatex(section.name || 'Section')}}\n${sectionEntries}`;
    })
    .filter(Boolean)
    .join('\n\n');

  // Generate the complete LaTeX document
  const latexDocument = `\\documentclass[11pt,a4paper,sans]{moderncv}

% Modern CV theme and style
\\moderncvstyle{classic}
\\moderncvcolor{blue}

% Character encoding
\\usepackage[utf8]{inputenc}

% Page margins
\\usepackage[scale=0.75]{geometry}

% Personal data
\\name{${escapeLatex(fullName || 'Your Name')}}{${title ? escapeLatex(title) : ''}}
${contactInfo ? `\\address{${contactInfo}}{}{}` : ''}

% Disable page numbering
\\nopagenumbers{}

\\begin{document}

% Make the title
\\makecvtitle

${summary ? `\\section{Professional Summary}\n${escapeLatex(summary)}\n\n` : ''}

${skillsList ? `\\section{Skills}\n${skillsList}\n\n` : ''}

${sectionsLatex}

\\end{document}`;

  return latexDocument;
}