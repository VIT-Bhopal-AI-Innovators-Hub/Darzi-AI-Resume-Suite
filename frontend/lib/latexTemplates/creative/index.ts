import { TemplateParams } from '../types';

export function preamble(p: TemplateParams): string {
  return `\\documentclass[${p.pageSize === 'a4' ? 'a4paper' : 'letterpaper'},11pt]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{parskip}
\\usepackage{color}
\\definecolor{primarycolor}{RGB}{${p.primaryColorRGB.r},${p.primaryColorRGB.g},${p.primaryColorRGB.b}}
\\definecolor{secondarycolor}{RGB}{${p.secondaryColorRGB.r},${p.secondaryColorRGB.g},${p.secondaryColorRGB.b}}
${p.fontFamily === 'sans-serif' ? '\\renewcommand{\\familydefault}{\\sfdefault}' : ''}
${p.fontFamily === 'mono' ? '\\renewcommand{\\familydefault}{\\ttdefault}' : ''}
\\setlength{\\parindent}{0pt}
`;
}

export function body(p: TemplateParams): string {
  return `\\begin{document}\n\n\\begin{center}\n  {\\LARGE \\textbf{\\color{primarycolor}${p.name}}}\\\\\n  ${p.title ? `{\\color{secondarycolor}${p.title}} \\` : ''}\n  ${p.coloredFullContactLine ? `${p.coloredFullContactLine} \\` : ''}\n\\end{center}\n\n${p.summary ? `\\vspace{${p.sectionSpacingSmall}mm}\\noindent ${p.summary} \\vspace{${p.sectionSpacingMedium}mm}` : ''}\n\n${p.experiences ? `\\section*{Experience}\n${p.experiences}` : ''}\n\n${p.education ? `\\section*{Education}\n${p.education}` : ''}\n\n${p.skillsList ? `\\section*{Skills}\n${p.skillsList}` : ''}\n\n${p.linksSection ? `\\section*{Links}\n${p.linksSection}` : ''}\n\n${p.customSectionsTex}\n\\end{document}`;
}

export function footer(p: TemplateParams): string {
  return ``;
}
