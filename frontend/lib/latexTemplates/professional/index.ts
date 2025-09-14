import { TemplateParams } from '../types';

export function preamble(p: TemplateParams): string {
  return `\\documentclass[${p.fontSize || '11pt'}]{article}
% Professional Resume
% by Darzi AI (https://github.com/Darzi-AI/Resume-Suite)

% PACKAGES
  \\usepackage[${p.pageSize}paper, margin=${p.margin || 0.5}in]{geometry}
\\usepackage[T1]{fontenc}
\\IfFileExists{lmodern.sty}{\\usepackage{lmodern}}{} \\usepackage{microtype}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{parskip}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{ragged2e}
\\usepackage{fontawesome5}
\\usepackage{setspace}
\\usepackage{fancyhdr} % For header and footer

% COLORS
\\definecolor{primarycolor}{RGB}{${p.primaryColorRGB.r},${p.primaryColorRGB.g},${p.primaryColorRGB.b}}
\\definecolor{secondarycolor}{RGB}{${p.secondaryColorRGB.r},${p.secondaryColorRGB.g},${p.secondaryColorRGB.b}}
\\definecolor{gray}{RGB}{128,128,128}

% FONT
${p.fontFamily === 'sans-serif' ? "\\renewcommand{\\familydefault}{\\sfdefault}" : ''}
${p.fontFamily === 'mono' ? "\\renewcommand{\\familydefault}{\\ttdefault}" : ''}

% SECTION STYLING
\\titleformat{\\section}{\\large\\bfseries\\scshape\\color{primarycolor}}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{*3}{*2}

% LIST STYLING
\\setlist[itemize]{noitemsep, topsep=0pt, leftmargin=1.2em, label=\\textcolor{primarycolor}{\\textbullet}}

% HEADER & FOOTER
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0.4pt}
\\fancyfoot[C]{\\small\\color{gray}Page \\thepage}

% MACROS
% Header
\\newcommand{\\header}[2]{%
  \\begin{center}
    {\\Huge\\bfseries\\color{primarycolor} #1}\\\\[5pt]
    {\\large\\color{secondarycolor} #2}
  \\end{center}
}

% Contact Information
\\newcommand{\\contact}[5]{%
  \\begin{center}\\small
  ${p.showIcons ? `\\faMapMarkerAlt\\, #1 \\quad` : '#1 \\quad'}
  ${p.showIcons ? `\\faPhone\\, #2 \\quad` : '#2 \\quad'}
  ${p.showIcons ? `\\faEnvelope\\, \\href{mailto:#3}{#3} \\quad` : '\\href{mailto:#3}{#3} \\quad'}
  ${p.showIcons ? `\\faGlobe\\, \\href{#4}{#4}` : '\\href{#4}{#4}'}
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

% Global settings
\\setlength{\\parindent}{0pt}
\\RaggedRight
\\linespread{1.1}
`;
}

export function body(p: TemplateParams): string {
  const customSections = p.customSectionsTex as { projects?: string; others?: string };
  return `\\begin{document}

% HEADER
\\header{${p.name}}{${p.title}}
\\contact{${p.location}}{${p.phone}}{${p.email}}{${p.website}}

% SUMMARY
${p.summary ? `\\section*{Summary}\n\\small{${p.summary}}` : ''}

% EXPERIENCE
${p.experiences ? `\\section*{Experience}\n${p.experiences}` : ''}

% PROJECTS
${customSections.projects ? `\\section*{Projects}\n${customSections.projects}` : ''}

% EDUCATION
${p.education ? `\\section*{Education}\n${p.education}` : ''}

% CERTIFICATES
${p.certificatesTex ? `\\section*{Certificates}\n${p.certificatesTex}` : ''}

% SKILLS
${p.skillsList ? `\\section*{Skills}\n\\small{${p.skillsList}}` : ''}

% CUSTOM SECTIONS
${customSections.others ? customSections.others : ''}

\\end{document}
`;
}
