import { TemplateParams } from '../types';

export function preamble(p: TemplateParams): string {
  return `\documentclass[${p.fontSize || '11pt'}]{article}
% Two-Column Resume
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
\titleformat{\section}{\large\bfseries\color{primarycolor}}{}{0em}{}
\titlespacing*{\section}{0pt}{*3}{*2}

% LIST STYLING
\setlist[itemize]{noitemsep, topsep=0pt, leftmargin=1.2em, label=\textcolor{primarycolor}{\textbullet}}

% MACROS
% Header
\newcommand{\header}[2]{%
  \begin{center}
    {\Huge\bfseries\color{primarycolor} #1}\[5pt]
    {\large\color{secondarycolor} #2}
  \end{center}
}

% Contact Information
\newcommand{\contact}[5]{%
  \begin{center}\small
  ${p.showIcons ? `\faMapMarkerAlt\, #1 \quad` : '#1 \quad'}
  ${p.showIcons ? `\faPhone\, #2 \quad` : '#2 \quad'}
  ${p.showIcons ? `\faEnvelope\, \href{mailto:#3}{#3} \quad` : '\href{mailto:#3}{#3} \quad'}
  ${p.showIcons ? `\faGlobe\, \href{#4}{#4}` : '\href{#4}{#4}'}
  \end{center}
}

% Experience Entry
\newcommand{\resumeEntry}[5]{%
  \vspace{4pt}
  \noindent{\textbf{#2} \hfill {\small\color{secondarycolor}#1}}\\
  \noindent{\small\emph{#3} \ifx\relax#4\relax\else\hfill{\small #4}\fi}\\
  \vspace{3pt}
  #5
  \vspace{8pt}
}

% Project Entry
\newcommand{\projectEntry}[3]{%
    \vspace{4pt}
    \noindent{\textbf{#1}} \\
    \noindent{\small\emph{#2}} \\
    #3
    \vspace{8pt}
}

% Education Entry
\newcommand{\educationEntry}[4]{%
    \vspace{4pt}
    \noindent{\textbf{#1} \hfill {\small\color{secondarycolor}#2}}\\
    \noindent{\small\emph{#3} \hfill {\small #4}}\\
    \vspace{8pt}
}

% Global settings
\setlength{\parindent}{0pt}
\setlength{\columnsep}{20pt}
\RaggedRight
\linespread{1.1}
`;
}

export function body(p: TemplateParams): string {
  return `\begin{document}

% HEADER
\header{${p.name}}{${p.title}}
\contact{${p.location}}{${p.phone}}{${p.email}}{${p.website}}

% SUMMARY
${p.summary ? `\section*{Summary}\small{${p.summary}}` : ''}

\begin{paracol}{2}
\setlength{\columnsep}{20pt}

\begin{leftcolumn}

% EXPERIENCE
${p.experiences ? `\section*{Experience}
${p.experiences}` : ''}

% PROJECTS
${(p.customSectionsTex as { projects?: string }).projects ? `\section*{Projects}
${(p.customSectionsTex as { projects?: string }).projects}` : ''}

\end{leftcolumn}
\begin{rightcolumn}

% SKILLS
${p.skillsList ? `\section*{Skills}
\small{${p.skillsList}}` : ''}

% EDUCATION
${p.education ? `\section*{Education}
${p.education}` : ''}

% CUSTOM SECTIONS
${(p.customSectionsTex as { others?: string }).others ? (p.customSectionsTex as { others?: string }).others : ''}

\end{rightcolumn}
\end{paracol}

\end{document}
`;
}