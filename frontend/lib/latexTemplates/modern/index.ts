import { TemplateParams } from '../types';

// Use a type that omits the conflicting `education` field from TemplateParams
// so we can redefine it as a structured array while keeping all other params.
type NITJSRResumeParams = Omit<TemplateParams, 'education'> & {
   course: string;
  roll: string;
  emaila: string;
  emailb: string;
  github: string;
  website: string;
  linkedin: string;
  education?: Array<{
    degree: string;
    institute: string;
    score: string;
    year: string;
  }>;
  experience?: Array<{
    company: string;
    location: string;
    role: string;
    dates: string;
    work: string[];
  }>;
  projects?: Array<{
    name: string;
    role: string;
    date: string;
    work: string[];
    description: string;
  }>;
  skills?: Array<{
    category: string;
    tools: string;
  }>;
  courses?: Array<{
    year: string;
    list: string;
  }>;
  certifications?: string[];
  positions?: Array<{
    position: string;
    organization: string;
    date: string;
  }>;
  activities?: Array<{
    name: string;
    description: string;
  }>;
}


export function preamble(p: TemplateParams): string {
  return `\\documentclass[a4paper,11pt]{article}
\\usepackage{latexsym}
\\usepackage{xcolor}
\\usepackage{float}
\\usepackage{ragged2e}
\\usepackage[empty]{fullpage}
\\usepackage{wrapfig}
\\usepackage{lipsum}
\\usepackage{tabularx}
\\usepackage{titlesec}
\\usepackage{geometry}
\\usepackage{marvosym}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage{multicol}
\\usepackage{graphicx}
% Fallback: comment out lmodern to avoid build failure when package not installed.
% If you have control over the LaTeX environment, install the 'lmodern' package
% (TeX Live: tlmgr install lmodern or Debian: sudo apt install texlive-fonts-recommended).
% Uncomment the next line if 'lmodern' is available in your LaTeX installation.
% \\usepackage{lmodern}
\\usepackage[T1]{fontenc}
\\setlength{\\multicolsep}{0pt}
\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\geometry{left=1.4cm, top=0.8cm, right=1.2cm, bottom=1cm}

\\urlstyle{same}

\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-7pt}]

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[2]{
  \\item{
    \\textbf{#1}{:\\hspace{0.5mm}#2 \\vspace{-0.5mm}}
  }
}

\\newcommand{\\resumePOR}[3]{
\\vspace{0.5mm}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
        \\textbf{#1},~#2 & \\textit{\\small{#3}}
    \\end{tabular*}
    \\vspace{-2mm}
}

\\newcommand{\\resumeSubheading}[4]{
\\vspace{0.5mm}\\item
    \\begin{tabular*}{0.98\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
        \\textbf{#1} & \\textit{\\footnotesize{#4}} \\\\
        \\textit{\\footnotesize{#3}} &  \\footnotesize{#2}\\\\
    \\end{tabular*}
    \\vspace{-2.4mm}
}

\\newcommand{\\resumeProject}[4]{
\\vspace{0.5mm}\\item
    \\begin{tabular*}{0.98\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
        \\textbf{#1} & \\textit{\\footnotesize{#3}} \\\\
        \\footnotesize{\\textit{#2}} & \\footnotesize{#4}
    \\end{tabular*}
    \\vspace{-2.4mm}
}

\\newcommand{\\resumeSubItem}[2]{\\resumeItem{#1}{#2}\\vspace{-4pt}}

\\renewcommand{\\labelitemi}{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=*,labelsep=0mm]}
\\newcommand{\\resumeHeadingSkillStart}{\\begin{itemize}[leftmargin=*,itemsep=1.7mm, rightmargin=2ex]}
\\newcommand{\\resumeItemListStart}{\\begin{justify}\\begin{itemize}[leftmargin=3ex, rightmargin=2ex, noitemsep,labelsep=1.2mm,itemsep=0mm]\\small}

\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}\\vspace{2mm}}
\\newcommand{\\resumeHeadingSkillEnd}{\\end{itemize}\\vspace{-2mm}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\end{justify}\\vspace{-2mm}}

\\newcolumntype{L}{>{\\raggedright\\arraybackslash}X}%
\\newcolumntype{R}{>{\\raggedleft\\arraybackslash}X}%
\\newcolumntype{C}{>{\\centering\\arraybackslash}X}%
`;
}

export function body(p: NITJSRResumeParams): string {
  const educationRows = Array.isArray(p.education) ? p.education.map(edu =>
    `${edu.degree} & ${edu.institute} & ${edu.score} & ${edu.year} \\\\ \\hline`
  ).join('\n') : '';

  const experienceItems = Array.isArray(p.experience) ? p.experience.map(exp =>
    `\\resumeSubheading
      {${exp.company}}{${exp.location}}
      {${exp.role}}{${exp.dates}}
      \\resumeItemListStart
        ${exp.work.map(w => `\\item{${w}}`).join('\n')}
      \\resumeItemListEnd`
  ).join('\n') : '';

  const projectItems = Array.isArray(p.projects) ? p.projects.map(proj =>
    `\\resumeProject
        {${proj.name}}
        {${proj.description}}{${proj.role}}
        {${proj.date}}
        \\resumeItemListStart
      ${proj.work.map(w => `\\item{${w}}`).join('\n')}
        \\resumeItemListEnd`
  ).join('\n') : '';

  const skillItems = Array.isArray(p.skills) ? p.skills.map(skill =>
    `\\item{\\textbf{${skill.category}}: ${skill.tools}}`
  ).join('\n') : '';

  const courseItems = Array.isArray(p.courses) ? p.courses.map(course =>
    `\\item{\\textbf{${course.year}:} ${course.list}}`
  ).join('\n') : '';

  const certificationItems = Array.isArray(p.certifications) ? p.certifications.map(cert =>
    `\\resumeSubItem{${cert}}{}`
  ).join('\n') : '';

  const positionItems = Array.isArray(p.positions) ? p.positions.map(pos =>
    `\\resumePOR
        {${pos.position}}{${pos.organization}}{${pos.date}}`
  ).join('\n') : '';

  const activityItems = Array.isArray(p.activities) ? p.activities.map(act =>
    `\\item{\\textbf{${act.name}}: ${act.description}}`
  ).join('\n') : '';

  return `\\begin{document}
%----------HEADING-----------------
\\begin{tabularx}{\\linewidth}{L r}
  \\textbf{\\LARGE ${p.name}} & +91-${p.phone}\\\\
  {Roll No.:${p.roll}} & \\href{mailto:${p.emaila}}{${p.emaila}} \\\\
  ${p.course} &  \\href{mailto:${p.emailb}}{${p.emailb}}\\\\
  {B.Tech in Computer Science and Engineering} &  \\href{https://github.com/${p.github}}{Github} $|$ \\href{${p.website}}{Website}\\\\
  {National Institute of Technology Jamshedpur} & \\href{https://www.linkedin.com/in/${p.linkedin}/}{${p.linkedin}}
\\end{tabularx}

%-----------EDUCATION-----------------
\\section{Education}
\\setlength{\\tabcolsep}{5pt}
\\small{\\begin{tabularx}
{\\dimexpr\\textwidth-3mm\\relax}{|c|C|c|c|}
  \\hline
  \\textbf{Degree/Certificate } & \\textbf{Institute/Board} & \\textbf{CGPA/Percentage} & \\textbf{Year}\\\\
  \\hline
  ${educationRows}
\\end{tabularx}}
\\vspace{8mm}

%-----------SECTIONS IN TWO COLUMNS-----------------
\\begin{multicols}{2}
%-----------EXPERIENCE-----------------
${experienceItems ? `\\section{Experience}
  \\resumeSubHeadingListStart
    ${experienceItems}
  \\resumeSubHeadingListEnd
\\vspace{-2mm}` : ''}


%-----------PROJECTS-----------------
${projectItems ? `\\section{Projects}
    \\resumeSubHeadingListStart
    ${projectItems}
    \\resumeSubHeadingListEnd
\\vspace{-2mm}` : ''}


%-----------SKILLS-----------------
${skillItems ? `\\section{Skills}
\\resumeHeadingSkillStart
${skillItems}
\\resumeHeadingSkillEnd
\\vspace{-2mm}`: ''}


%-----------COURSES-----------------
${courseItems ? `\\section{Relevant Courses}
    \\resumeSubHeadingListStart
    ${courseItems}
    \\resumeSubHeadingListEnd
\\vspace{-2mm}` : ''}


%-----------CERTIFICATIONS-----------------
${certificationItems ? `\\section{Certifications}
  \\resumeSubHeadingListStart
    ${certificationItems}
  \\resumeSubHeadingListEnd
\\vspace{-2mm}` : ''}


%-----------POSITIONS OF RESPONSIBILITY-----------------
${positionItems ? `\\section{Positions of Responsibility}
    \\resumeSubHeadingListStart
    ${positionItems}
    \\resumeSubHeadingListEnd
\\vspace{-2mm}` : ''}


%-----------EXTRA CURRICULAR ACTIVITIES-----------------
${activityItems ? `\\section{Extra Curricular Activities}
    \\resumeSubHeadingListStart
    ${activityItems}
    \\resumeSubHeadingListEnd` : ''}
\\end{multicols}

\\end{document}
`;
}