import { TemplateParams } from '../types';

// Creative two-column resume template (cleaned)
export function preamble(p: TemplateParams): string {
  return `\\documentclass[${p.fontSize || '10pt'}]{article}
% Creative Two-Column Resume
% by Darzi AI (https://github.com/Darzi-AI/Resume-Suite)

% PACKAGES
\\usepackage[${p.pageSize}paper, margin=${p.margin || 0.5}in]{geometry}
\\usepackage[T1]{fontenc}
\\IfFileExists{lmodern.sty}{\\usepackage{lmodern}}{}
\\usepackage{microtype}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{parskip}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{ragged2e}
\\usepackage{fontawesome5}
\\usepackage{setspace}
\\usepackage{paracol} % For flexible two-column layout (sidebar + main)

% COLORS
\\definecolor{primarycolor}{RGB}{${p.primaryColorRGB.r},${p.primaryColorRGB.g},${p.primaryColorRGB.b}}
\\definecolor{secondarycolor}{RGB}{${p.secondaryColorRGB.r},${p.secondaryColorRGB.g},${p.secondaryColorRGB.b}}
\\definecolor{bgcolor}{RGB}{248,249,250} % A light background color for the header

% FONT
${p.fontFamily === 'sans-serif' ? "\\renewcommand{\\familydefault}{\\sfdefault}" : ''}
${p.fontFamily === 'mono' ? "\\renewcommand{\\familydefault}{\\ttdefault}" : ''}

% SECTION STYLING
\\titleformat{\\section}{\\large\\bfseries\\color{primarycolor}}{}{0em}{}
\\titlespacing*{\\section}{0pt}{*3}{*2}

% LIST STYLING
\\setlist[itemize]{noitemsep, topsep=0pt, leftmargin=1.2em, label=\\textcolor{primarycolor}{\\textbullet}}

% MACROS
% Header (with background color box)
\\newcommand{\\header}[2]{%
  \\begin{center}
    \\fcolorbox{primarycolor}{bgcolor}{\\parbox{\\dimexpr\\textwidth-2\\fboxsep-2\\fboxrule\\relax}{%
      \\centering
      {\\Huge\\bfseries\\color{primarycolor} #1}\\\\[5pt]
      {\\large\\color{secondarycolor} #2}
    }}
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
  \\vspace{4pt}
  \\noindent{\\textbf{#2} \\hfill {\\small\\color{secondarycolor}#1}}\\\\
  \\noindent{\\small\\emph{#3} \\ifx\\relax#4\\relax\\else\\hfill{\\small #4}\\fi}\\\\
  \\vspace{3pt}
  #5
  \\vspace{8pt}
}

% Project Entry
\\newcommand{\\projectEntry}[3]{%
    \\vspace{4pt}
    \\noindent{\\textbf{#1}} \\\\
    \\noindent{\\small\\emph{#2}} \\\\
    #3
    \\vspace{8pt}
}

% Education Entry
\\newcommand{\\educationEntry}[4]{%
    \\vspace{4pt}
    \\noindent{\\textbf{#1} \\hfill {\\small\\color{secondarycolor}#2}}\\\\
    \\noindent{\\small\\emph{#3} \\hfill {\\small #4}}\\\\
    \\vspace{8pt}
}

% Sidebar helper macro
\\newcommand{\\sidebarHeading}[1]{\\vspace{6pt}\\noindent{\\textbf{\\color{primarycolor} #1}}\\\\[4pt]}

% Global settings
\\setlength{\\parindent}{0pt}
\\setlength{\\columnsep}{18pt} % Space between columns
\\columnratio{0.35,0.65} % Sidebar is 35% of width, main is 65%
\\RaggedRight
\\linespread{1.05}
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

% Begin two-column layout: left sidebar (35%) and main content (65%)
\\begin{paracol}{2}
\\setcolumnwidth{0.35\\textwidth,0.65\\textwidth}

% SIDEBAR (column 1)
\\switchcolumn*\\raggedright
\\vspace{6pt}
\\sidebarHeading{Profile}
${p.summary ? `${p.summary}\\vspace{6pt}` : ''}

\\sidebarHeading{Skills}
${skillsTex ? `${skillsTex}\\vspace{6pt}` : ''}

\\sidebarHeading{Education}
${p.education ? `${p.education}\\vspace{6pt}` : ''}

\\sidebarHeading{Links}
\\begin{itemize}
  ${p.website ? `\\item Website: \\href{${p.website}}{${p.website}}` : ''}
  ${p.email ? `\\item Email: \\href{mailto:${p.email}}{${p.email}}` : ''}
  ${p.phone ? `\\item Tel: ${p.phone}` : ''}
\\end{itemize}

% End sidebar and switch to main column
\\switchcolumn

% MAIN CONTENT (column 2)
\\section*{Experience}
${p.experiences || ''}

${customObj && customObj.projects ? `\\section*{Projects}\n${customObj.projects}` : ''}

${customObj && customObj.others ? `${customObj.others}` : (customString ? `${customString}` : '')}

\\end{paracol}

\\end{document}`;
}
