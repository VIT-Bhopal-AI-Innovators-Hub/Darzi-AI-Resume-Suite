import { TemplateParams } from '../types';

export function preamble(p: TemplateParams): string {
  return `\\documentclass[${p.pageSize === 'a4' ? 'a4paper' : 'letterpaper'},11pt]{article}
% --- Packages ---
\\usepackage[margin=0.6in]{geometry}
\\usepackage{paracol}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{parskip}
\\usepackage{xcolor}
\\usepackage{setspace}
\\usepackage{titlesec}
\\usepackage[T1]{fontenc}
\\usepackage[expansion=false]{microtype}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{3pt}
\\raggedbottom
\\sloppy
\\definecolor{primarycolor}{RGB}{${p.primaryColorRGB.r},${p.primaryColorRGB.g},${p.primaryColorRGB.b}}
\\definecolor{secondarycolor}{RGB}{${p.secondaryColorRGB.r},${p.secondaryColorRGB.g},${p.secondaryColorRGB.b}}
${p.fontFamily === 'sans-serif' ? '\\renewcommand{\\familydefault}{\\sfdefault}' : ''}
${p.fontFamily === 'mono' ? '\\renewcommand{\\familydefault}{\\ttdefault}' : ''}
`;
}

export function body(p: TemplateParams): string {
  return `\\begin{document}\n\n\\begin{paracol}{2}\n\\setlength{\\columnsep}{14pt}\n\\begin{rightcolumn}\n\n${p.summary ? `\\section*{Profile}\n${p.summary}\n\\vspace{${p.sectionSpacingSmall}mm}` : ''}\n\n${p.experiences ? `\\section*{Experience}\n${p.experiences}\n\\vspace{${p.sectionSpacingSmall}mm}` : ''}\n\n${p.education ? `\\section*{Education}\n${p.education}\n\\vspace{${p.sectionSpacingSmall}mm}` : ''}\n\n${p.customSectionsTex ? `${p.customSectionsTex}\n\\vspace{${p.sectionSpacingSmall}mm}` : ''}\n\\end{rightcolumn}\n\\begin{leftcolumn}\n\\noindent\\rule{\\linewidth}{0.6pt}\\\\[4pt]\n{\\LARGE\\textbf{\\color{primarycolor}${p.name}}}\\\\[4pt]\n${p.title ? `\\muted{${p.title}}\\\\[6pt]` : ''}\n${p.coloredFullContactLine ? `\\section*{Contact}\n${p.coloredFullContactLine}\\vspace{${p.sectionSpacingSmall}mm}` : ''}\n${p.skillsList ? `\\section*{Skills}\\n${p.skillsList}\\vspace{${p.sectionSpacingSmall}mm}` : ''}\n${p.linksSection ? `\\section*{Links}\\n${p.linksSection}\\vspace{${p.sectionSpacingSmall}mm}` : ''}\n${p.educationShort ? `\\section*{Education}\\n${p.educationShort}\\vspace{${p.sectionSpacingSmall}mm}` : ''}\n\\noindent\\rule{\\linewidth}{0.6pt}\\\\[4pt]\n\\end{leftcolumn}\n\\end{paracol}\n`;
}

export function footer(p: TemplateParams): string {
  return `\\vspace{${p.sectionSpacingMedium}mm}\\hrulefill\\end{document}`;
}
