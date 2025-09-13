import { TemplateParams } from '../types';

export function preamble(p: TemplateParams): string {
  return `\\documentclass[${p.fontSize || '11pt'}]{article}
% Classic Single-Column Resume
% by Darzi AI (https://github.com/Darzi-AI/Resume-Suite)

% PACKAGES
\\usepackage[${p.pageSize}paper, margin=${p.margin || 0.6}in]{geometry} % Page layout (default reduced)
\\usepackage[T1]{fontenc} % Font encoding
\\IfFileExists{lmodern.sty}{\\usepackage{lmodern}}{} % Font family (optional)
\\usepackage{microtype} % Better typography
\\usepackage{enumitem} % Customized lists
\\usepackage[hidelinks]{hyperref} % URLs and links
\\usepackage{parskip} % No paragraph indentation
\\usepackage{xcolor} % Color definitions
\\usepackage{titlesec} % Section styling
\\usepackage{ragged2e} % for \\RaggedRight
\\usepackage{fontawesome5} % Icons
\\usepackage{setspace} % Line spacing
\\usepackage{multicol} % Multi-column support for compact lists (skills)

% COLORS (Primary and Secondary)
\\definecolor{primarycolor}{RGB}{${p.primaryColorRGB.r},${p.primaryColorRGB.g},${p.primaryColorRGB.b}}
\\definecolor{secondarycolor}{RGB}{${p.secondaryColorRGB.r},${p.secondaryColorRGB.g},${p.secondaryColorRGB.b}}

% FONT
${p.fontFamily === 'sans-serif' ? "\\renewcommand{\\familydefault}{\\sfdefault}" : ''}
${p.fontFamily === 'mono' ? "\\renewcommand{\\familydefault}{\\ttdefault}" : ''}

% SECTION STYLING
\\titleformat{\\section}{\\large\\bfseries\\color{primarycolor}}{}{0em}{}
% Tighten section spacing (less white space before/after sections)
\\titlespacing*{\\section}{0pt}{4pt}{2pt}

% LIST STYLING
\\setlist[itemize]{noitemsep, topsep=0pt, leftmargin=1.2em}

% HORIZONTAL RULES
\\newcommand{\\sectionrule}{\\par\\noindent\\rule{\\textwidth}{0.6pt}\\par\\vspace{3pt}}

% MACROS
% Header
\\newcommand{\\header}[2]{%
  \\begin{center}
    {\\Huge\\bfseries\\color{primarycolor} #1}\\\\[2pt]
    {\\large\\color{secondarycolor} #2}
  \\end{center}
}

% Contact Information
\\newcommand{\\contact}[5]{%
  \\begin{center}\\small
  ${p.showIcons ? "\\faMapMarkerAlt\\, #1 \\quad" : "#1 \\quad"}
  ${p.showIcons ? "\\faPhone\\, #2 \\quad" : "#2 \\quad"}
  ${p.showIcons ? "\\faEnvelope\\, \\href{mailto:#3}{#3} \\quad" : "\\href{mailto:#3}{#3} \\quad"}
  ${p.showIcons ? "\\faGlobe\\, \\href{#4}{#4}" : "\\href{#4}{#4}"}
  \\end{center}
}

% Experience Entry
\\newcommand{\\resumeEntry}[5]{%
  \\vspace{1pt}
  \\noindent{\\textbf{#2} \\hfill {\\small\\color{secondarycolor}#1}}\\\\
  \\noindent{\\small\\emph{#3} \\ifx\\relax#4\\relax\\else\\hfill{\\small #4}\\fi}\\\\
  \\vspace{1pt}
  #5
  \\vspace{3pt}
}

% Project Entry
\\newcommand{\\projectEntry}[3]{%
  \\vspace{1pt}
  \\noindent{\\textbf{#1}}\\\\
  \\noindent{\\small\\emph{#2}}\\\\
  #3
  \\vspace{3pt}
}

% Education Entry
\\newcommand{\\educationEntry}[4]{%
  \\vspace{1pt}
  \\noindent{\\textbf{#1} \\hfill {\\small\\color{secondarycolor}#2}}\\\\
  \\noindent{\\small\\emph{#3} \\hfill {\\small #4}}\\\\
  \\vspace{3pt}
}

% Global settings
\\setlength{\\parindent}{0pt}
\\RaggedRight
% Reduce inter-line spacing for a denser layout
\\linespread{1.0}
% Ensure no extra paragraph spacing (override parskip package) and avoid vertical stretching
\\setlength{\\parskip}{0pt}
\\raggedbottom
`;
}

export function body(p: TemplateParams): string {
  const customObj = typeof p.customSectionsTex === 'object' && p.customSectionsTex !== null
    ? p.customSectionsTex as { projects?: string; others?: string }
    : null;
  const customString = typeof p.customSectionsTex === 'string' ? p.customSectionsTex : '';

  // Build a 4-column x 2-row skills table from a comma-separated skillsList when provided.
  const skillsTex = (() => {
    if (p.skillsCommaSeparated && p.skillsCommaSeparated.trim()) {
      const skills = p.skillsCommaSeparated.split(/,\s*/).map(s => s.trim()).filter(Boolean);
      const cells = skills.slice(0, 8);
      while (cells.length < 8) cells.push('');
      const row1 = cells.slice(0, 4).join(' & ');
      const row2 = cells.slice(4, 8).join(' & ');
      // Use p-column widths that fit the page; keep small font for compactness.
      return `\\begin{tabular}{p{0.24\\textwidth} p{0.24\\textwidth} p{0.24\\textwidth} p{0.24\\textwidth}}\\small ${row1}\\\\ ${row2}\\\\\\end{tabular}`;
    }
    // Fallback to any prebuilt LaTeX table string
    if (p.skillsTable && p.skillsTable.trim()) return p.skillsTable;
    return '';
  })();

  return `\\begin{document}

% HEADER
\\header{${p.name}}{${p.title}}
\\contact{${p.location}}{${p.phone}}{${p.email}}{${p.website}}

\\sectionrule

% SUMMARY
${p.summary ? `\\section*{Summary}\\small{${p.summary}}\\sectionrule` : ''}

% EDUCATION (moved right after Summary)
${p.education ? `\\section*{Education}
${p.education}
\\sectionrule` : ''}

% SKILLS (4 columns x 2 rows)
${skillsTex ? `\\section*{Skills}
${skillsTex}
\\sectionrule` : ''}

% EXPERIENCE
${p.experiences ? `\\section*{Experience}
${p.experiences}
\\sectionrule` : ''}

% PROJECTS
${customObj && customObj.projects ? `\\section*{Projects}
${customObj.projects}
\\sectionrule` : ''}

% CUSTOM SECTIONS
${customObj && customObj.others ? `${customObj.others}\\sectionrule` : (customString ? `${customString}\\sectionrule` : '')}

\\end{document}
`;
  }