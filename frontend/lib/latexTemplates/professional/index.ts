import { TemplateParams } from '../types'; // Assuming types are in a '../types' file
export function preamble(p: TemplateParams): string {
  return `\\documentclass[${p.pageSize === 'a4' ? 'a4paper' : 'letterpaper'},11pt]{article}

% --- PACKAGES ---
% Geometry: Page margins have been reduced for a tighter layout.
\\usepackage[top=0.25in, bottom=0.5in, left=0.4in, right=0.4in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{parskip}
\\usepackage{xcolor}
\\usepackage{titlesec}
\\usepackage{fancyhdr}
\\usepackage{fontawesome5}
\\usepackage{array}
\\usepackage{tabularx}
\\usepackage{multicol}

% --- COLORS ---
% Define custom colors for a professional look.
\\definecolor{primarycolor}{RGB}{${p.primaryColorRGB.r},${p.primaryColorRGB.g},${p.primaryColorRGB.b}}
\\definecolor{secondarycolor}{RGB}{${p.secondaryColorRGB.r},${p.secondaryColorRGB.g},${p.secondaryColorRGB.b}}
\\definecolor{accentcolor}{RGB}{70,130,180}
\\definecolor{lightgray}{RGB}{245,245,245}
\\definecolor{darkgray}{RGB}{64,64,64}

% --- FONT CONFIGURATION ---
${p.fontFamily === 'sans-serif' ? '\\renewcommand{\\familydefault}{\\sfdefault}' : ''}
${p.fontFamily === 'mono' ? '\\renewcommand{\\familydefault}{\\ttdefault}' : ''}

% --- LAYOUT & SPACING ---
% Reduce paragraph spacing for a more compact document.
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{2pt}

% Section title formatting with reduced spacing.
\\titleformat{\\section}
  {\\color{primarycolor}\\large\\bfseries\\scshape}
  {}
  {0em}
  {}[\\color{primarycolor}\\titlerule]
\\titlespacing{\\section}{0pt}{2.5ex}{1.5ex}

% --- HEADER & FOOTER ---
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0.5pt}
\\fancyfoot[C]{\\color{darkgray}\\small Page \\thepage}
\\fancyfoot[L]{\\color{secondarycolor}\\small ${p.name}}
\\fancyfoot[R]{\\color{secondarycolor}\\small \\today}

% --- CUSTOM ENVIRONMENTS ---
% Custom itemize environment with reduced vertical spacing.
\\newenvironment{itemizeCustom}
{\\begin{itemize}[leftmargin=15pt, itemsep=0pt, parsep=0pt, topsep=1pt]}
{\\end{itemize}}

% Custom environment for experience entries.
\\newenvironment{experienceItem}
{\\begin{tabularx}{\\textwidth}{@{}X r@{}}\\color{darkgray}}
{\\end{tabularx}}
`;
}
export function body(p: TemplateParams): string {
  return `\\begin{document}

% --- HEADER ---
% A professional header with a light gray background and reduced vertical space.
\\begin{center}
\\colorbox{lightgray}{%
  \\begin{minipage}{\\textwidth}
    \\centering
    \\vspace{2pt}
    {\\Huge\\textbf{\\color{primarycolor}${p.name}}}\\\\[1pt]
    ${p.title ? `{\\Large\\color{secondarycolor}\\textit{${p.title}}}\\\\[3pt]` : ''}
    ${p.coloredFullContactLine ? `{\\color{darkgray}${p.coloredFullContactLine}}` : ''}
    \\vspace{2pt}
  \\end{minipage}%
}
\\end{center}

${p.summary ? `
% --- PROFESSIONAL SUMMARY ---
% Using a minipage instead of quote to avoid large default spacing.
\\section*{Professional Summary}
\\noindent
\\begin{minipage}{\\textwidth}
  \\color{darkgray}\\large\\textit{${p.summary}}
\\end{minipage}
` : ''}

${p.experiences ? `
% --- EXPERIENCE ---
\\section*{Experience}
${p.experiences}
` : ''}

${p.education ? `
% --- EDUCATION ---
\\section*{Education}
${p.education}
` : ''}

${p.skillsList ? `
% --- SKILLS ---
% Skills are now displayed in a two-column format for better readability and space usage.
\\section*{Core Competencies \\& Skills}
\\begin{multicols}{5}
\\color{darkgray}
${p.skillsList}
\\end{multicols}
` : ''}

${p.linksSection ? `
% --- PROFESSIONAL LINKS ---
\\section*{Professional Links}
${p.linksSection}
` : ''}

${p.customSectionsTex}
`;
}

export function footer(p: TemplateParams): string {
  // Dynamically build the contact line from available parameters.
  const parts: string[] = [];
  if (p.email) parts.push(`\\href{mailto:${p.email}}{${p.email}}`);
  if (p.phone) parts.push(p.phone);
  if (p.website) parts.push(`\\href{${p.website}}{${p.website}}`);
  if (p.location) parts.push(p.location);
  const contactLine = parts.join(' \\textbullet{} ');

  return `
% --- FOOTER ---
% Pushes the footer to the bottom of the page and reduces spacing.
\\vspace*{\\fill}
\\noindent\\rule{\\textwidth}{0.4pt}\\\\[2pt]
\\begin{center}
  \\color{secondarycolor}\\small ${contactLine}
  \\\\[2pt]
  \\color{darkgray}\\small\\textit{This resume was generated using modern LaTeX typesetting}
\\end{center}
\\end{document}`;
}