import { TemplateParams } from '../types';

export function preamble(p: TemplateParams): string {
  return `\documentclass[${p.fontSize || '10pt'}]{article}
% Minimalist Two-Column Resume
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
\\usepackage{paracol} % For two-column layout

% COLORS
\\definecolor{primarycolor}{RGB}{${p.primaryColorRGB.r},${p.primaryColorRGB.g},${p.primaryColorRGB.b}}
\\definecolor{secondarycolor}{RGB}{${p.secondaryColorRGB.r},${p.secondaryColorRGB.g},${p.secondaryColorRGB.b}}

% FONT
${p.fontFamily === 'sans-serif' ? "\\renewcommand{\\familydefault}{\\sfdefault}" : ''}
${p.fontFamily === 'mono' ? "\\renewcommand{\\familydefault}{\\ttdefault}" : ''}

% SECTION STYLING
\titleformat{\section}{\small\bfseries\color{primarycolor}}{}{0em}{}
\titlespacing*{\section}{0pt}{*2}{*1}

% LIST STYLING
\setlist[itemize]{noitemsep, topsep=0pt, leftmargin=1em, label=\textbullet}

% MACROS
% Experience Entry
\newcommand{\resumeEntry}[5]{%
  \vspace{2pt}
  \noindent{\textbf{#2} \hfill {\small\color{secondarycolor}#1}}\\
  \noindent{\small\emph{#3} \ifx\relax#4\relax\else\hfill{\small #4}\fi}\\
  #5
  \vspace{4pt}
}

% Project Entry
\newcommand{\projectEntry}[3]{%
    \vspace{2pt}
    \noindent{\textbf{#1}} \\
    \noindent{\small\emph{#2}} \\
    #3
    \vspace{4pt}
}

% Education Entry
\newcommand{\educationEntry}[4]{%
    \vspace{2pt}
    \noindent{\textbf{#1} \hfill {\small\color{secondarycolor}#2}}\\
    \noindent{\small\emph{#3} \hfill {\small #4}}\\
    \vspace{4pt}
}

% Global settings
\setlength{\parindent}{0pt}
\setlength{\columnsep}{15pt}
\RaggedRight
\linespread{1.0}
`;
}

export function body(p: TemplateParams): string {
  const customObj = typeof p.customSectionsTex === 'object' && p.customSectionsTex !== null
    ? p.customSectionsTex as { projects?: string; others?: string }
    : null;
  const customString = typeof p.customSectionsTex === 'string' ? p.customSectionsTex : '';

  return `\begin{document}
\begin{paracol}{2}
\setlength{\columnsep}{15pt}

\begin{leftcolumn}

% HEADER
{\Huge\bfseries\color{primarycolor} ${p.name}}\[5pt]
{\large\color{secondarycolor} ${p.title}}

% CONTACT
\section*{Contact}
\small{
  ${p.showIcons ? `\faMapMarkerAlt\, ${p.location}<br>` : ''}
  ${p.showIcons ? `\faPhone\, ${p.phone}<br>` : ''}
  ${p.showIcons ? `\faEnvelope\, \href{mailto:${p.email}}{${p.email}}<br>` : ''}
  ${p.showIcons ? `\faGlobe\, \href{${p.website}}{${p.website}}` : ''}
}

% SKILLS
${p.skillsList ? `\section*{Skills}\small{${p.skillsList}}` : ''}

% EDUCATION
${p.education ? `\section*{Education}${p.education}` : ''}

\end{leftcolumn}
\begin{rightcolumn}

% SUMMARY
${p.summary ? `\section*{Summary}\small{${p.summary}}` : ''}

% EXPERIENCE
${p.experiences ? `\section*{Experience}${p.experiences}` : ''}

% PROJECTS
${customObj && customObj.projects ? `\section*{Projects}${customObj.projects}` : ''}

% CUSTOM SECTIONS
${customObj && customObj.others ? customObj.others : customString}

\end{rightcolumn}
\end{paracol}
\end{document}
`;
}