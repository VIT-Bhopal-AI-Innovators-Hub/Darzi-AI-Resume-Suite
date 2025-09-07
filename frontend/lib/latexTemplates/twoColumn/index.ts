import { TemplateParams } from '../types';

export function preamble(p: TemplateParams): string {
  return `\\documentclass[11pt,a4paper]{article}
% PACKAGES
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{titlesec}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{paracol}

% GEOMETRY
\\geometry{\n  left=2.0cm,\n  right=2.0cm,\n  top=2.0cm,\n  bottom=2.0cm\n}\n
% COLORS
\\definecolor{primary}{RGB}{${p.primaryColorRGB.r},${p.primaryColorRGB.g},${p.primaryColorRGB.b}}
\\definecolor{secondary}{RGB}{${p.secondaryColorRGB.r},${p.secondaryColorRGB.g},${p.secondaryColorRGB.b}}
\\definecolor{links}{RGB}{0,122,204}

% HYPERLINKS
\\hypersetup{\n    colorlinks=true,\n    linkcolor=links,\n    urlcolor=links,\n}\n
% FONT
${p.fontFamily === 'sans-serif' ? "\\renewcommand{\\familydefault}{\\sfdefault}" : ''}
${p.fontFamily === 'mono' ? "\\renewcommand{\\familydefault}{\\ttdefault}" : ''}
\\color{primary}
`;
}

export function body(p: TemplateParams): string {
  return `\\begin{document}\n\\pagestyle{empty}\n\n% --- HEADER ---\n\\begin{center}\n  \\Huge \\textbf{\\color{primary}${p.name}}\\\\\n  ${p.title ? `{\\color{secondary}${p.title}} \\` : ''}\n  ${p.coloredFullContactLine ? `${p.coloredFullContactLine} \\` : ''}\n\\end{center}\n\n% --- MAIN / SIDEBAR (paracol) ---\n\\begin{paracol}{2}\n\\setlength{\\columnsep}{12pt}\n\\begin{leftcolumn}\n  ${p.experiences ? `\\section*{Experience}\n${p.experiences}` : ''}\n  ${p.education ? `\\section*{Education}\n${p.education}` : ''}\n  ${p.customSectionsTex ? `${p.customSectionsTex}` : ''}\n\\end{leftcolumn}\n\\begin{rightcolumn}\n  ${p.skillsList ? `\\section*{Skills}\n${p.skillsList}` : ''}\n  ${p.linksSection ? `\\section*{Links}\n${p.linksSection}` : ''}\n  ${p.educationShort ? `\\section*{Education}\n${p.educationShort}` : ''}\n\\end{rightcolumn}\n\\end{paracol}\n`;
}

export function footer(p: TemplateParams): string {
  return `\\vspace{${p.sectionSpacingMedium}mm}\\hrulefill\\end{document}`;
}
