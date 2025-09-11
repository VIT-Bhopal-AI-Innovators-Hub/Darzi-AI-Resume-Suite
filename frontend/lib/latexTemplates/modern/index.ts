import { TemplateParams } from '../types';

export function preamble(p: TemplateParams): string {
  return `\\documentclass[${p.pageSize === 'a4' ? 'a4paper' : 'letterpaper'},11pt]{article}
% --- Packages ---
\\usepackage[margin=0.6in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{parskip}
\\usepackage{color}
\\usepackage{setspace}
\\usepackage{titlesec}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{3pt}
\\raggedbottom
\\sloppy

% --- Colors ---
\\definecolor{primarycolor}{RGB}{${p.primaryColorRGB.r},${p.primaryColorRGB.g},${p.primaryColorRGB.b}}
\\definecolor{secondarycolor}{RGB}{${p.secondaryColorRGB.r},${p.secondaryColorRGB.g},${p.secondaryColorRGB.b}}

% --- Font family ---
${p.fontFamily === 'sans-serif' ? '\\renewcommand{\\familydefault}{\\sfdefault}' : ''}
${p.fontFamily === 'mono' ? '\\renewcommand{\\familydefault}{\\ttdefault}' : ''}
`;
}

export function body(p: TemplateParams): string {
  return `\\begin{document}\n\n\\begin{center}\n  {\\LARGE \\textbf{\\color{primarycolor}${p.name}}} \\\\n  ${p.title ? `{\\color{secondarycolor}${p.title}} \\` : ''}\n  ${p.coloredFullContactLine ? `${p.coloredFullContactLine} \\` : ''}\n\\end{center}\n\n${p.summary ? `\\vspace{${p.sectionSpacingSmall}mm}\\noindent ${p.summary} \\vspace{${p.sectionSpacingMedium}mm}` : ''}\n\n\\noindent\n\\begin{minipage}[t]{0.65\\textwidth}  % MAIN column (source-first for ATS)\n  % Experience\n  ${p.experiences ? `\\section*{Experience}\n${p.experiences}` : ''}\n\n  % Education\n  ${p.education ? `\\section*{Education}\n${p.education}` : ''}\n\n  ${p.customSectionsTex ? `${p.customSectionsTex}` : ''}\n\\end{minipage}\n\\hfill\n\\begin{minipage}[t]{0.32\\textwidth}  % SIDEBAR column (visually right)\n  {\\small\n    ${p.skillsList ? `\\section*{Skills}\n${p.skillsList}` : ''}\n\n    ${p.linksSection ? `\\section*{Links}\n${p.linksSection}` : ''}\n  }\n\\end{minipage}\n`;
}

export function footer(): string {
  return `\\vspace{${'${sectionSpacingMedium}'}mm}\\hrulefill\\end{document}`;
}
