"""
Template Management Module

This module provides predefined LaTeX templates and template utilities.
"""

from typing import Dict, List, Optional


class TemplateManager:
    """Manager for LaTeX resume templates."""
    
    @staticmethod
    def get_available_templates() -> List[str]:
        """Get list of available template names."""
        return list(PREDEFINED_TEMPLATES.keys())
    
    @staticmethod
    def get_template(template_name: str) -> Optional[str]:
        """Get template by name."""
        return PREDEFINED_TEMPLATES.get(template_name)
    
    @staticmethod
    def get_template_info(template_name: str) -> Optional[Dict[str, str]]:
        """Get template information."""
        return TEMPLATE_INFO.get(template_name)
    
    @staticmethod
    def validate_template(template_content: str) -> Dict[str, bool]:
        """
        Validate LaTeX template content.
        
        Returns:
            Dict with validation results
        """
        validation = {
            "has_documentclass": "\\documentclass" in template_content,
            "has_begin_document": "\\begin{document}" in template_content,
            "has_end_document": "\\end{document}" in template_content,
            "has_placeholders": any(placeholder in template_content for placeholder in [
                "[FULL_NAME]", "[EMAIL]", "[PHONE]", "[LOCATION]"
            ])
        }
        
        validation["is_valid"] = all([
            validation["has_documentclass"],
            validation["has_begin_document"], 
            validation["has_end_document"]
        ])
        
        return validation


# Predefined LaTeX templates
PREDEFINED_TEMPLATES = {
    "professional": """\\documentclass[letterpaper,11pt]{article}
\\usepackage[left=0.75in,top=0.6in,right=0.75in,bottom=0.6in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\titleformat{\\section}
  {\\large\\bfseries\\uppercase}
  {}
  {0pt}
  {}
  [\\titlerule]

\\titleformat{\\subsection}
  {\\bfseries}
  {}
  {0pt}
  {}

\\begin{document}

% Header
\\begin{center}
{\\Large \\textbf{[FULL_NAME]}}\\\\[0.2cm]
[PHONE] $\\bullet$ [EMAIL] $\\bullet$ [LOCATION]\\\\
[LINKEDIN] $\\bullet$ [GITHUB]
\\end{center}

% Professional Summary
\\section{Professional Summary}
[PROFESSIONAL_SUMMARY]

% Work Experience
\\section{Professional Experience}
[WORK_EXPERIENCE]

% Education
\\section{Education}
[EDUCATION]

% Skills
\\section{Technical Skills}
[SKILLS]

% Projects
\\section{Projects}
[PROJECTS]

\\end{document}""",

    "modern": """\\documentclass[11pt,a4paper,sans]{moderncv}
\\moderncvstyle{banking}
\\moderncvcolor{blue}

\\usepackage[scale=0.75]{geometry}

\\name{[FIRST_NAME]}{[LAST_NAME]}
\\title{[TITLE]}
\\address{[LOCATION]}
\\phone{[PHONE]}
\\email{[EMAIL]}
\\social[linkedin]{[LINKEDIN]}
\\social[github]{[GITHUB]}

\\begin{document}
\\makecvtitle

\\section{Professional Summary}
[PROFESSIONAL_SUMMARY]

\\section{Experience}
[WORK_EXPERIENCE]

\\section{Education}
[EDUCATION]

\\section{Skills}
[SKILLS]

\\section{Projects}
[PROJECTS]

\\end{document}""",

    "academic": """\\documentclass[11pt]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{titlesec}

\\pagestyle{empty}

\\titleformat{\\section*}
  {\\large\\bfseries}
  {}
  {0pt}
  {}

\\begin{document}

\\begin{center}
{\\LARGE \\textbf{[FULL_NAME]}}\\\\[0.3cm]
[EMAIL] $\\bullet$ [PHONE] $\\bullet$ [LOCATION]\\\\
[LINKEDIN] $\\bullet$ [GITHUB]
\\end{center}

\\section*{Research Interests}
[PROFESSIONAL_SUMMARY]

\\section*{Education}
[EDUCATION]

\\section*{Experience}
[WORK_EXPERIENCE]

\\section*{Publications}
[PUBLICATIONS]

\\section*{Skills}
[SKILLS]

\\section*{Projects}
[PROJECTS]

\\end{document}""",

    "minimal": """\\documentclass[11pt]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\begin{document}

% Header
\\textbf{\\Large [FULL_NAME]}\\\\
[PHONE] | [EMAIL] | [LOCATION]\\\\
[LINKEDIN] | [GITHUB]

\\vspace{0.2cm}

% Professional Summary
\\textbf{Professional Summary}\\\\
[PROFESSIONAL_SUMMARY]

\\vspace{0.2cm}

% Work Experience
\\textbf{Experience}\\\\
[WORK_EXPERIENCE]

\\vspace{0.2cm}

% Education
\\textbf{Education}\\\\
[EDUCATION]

\\vspace{0.2cm}

% Skills
\\textbf{Skills}\\\\
[SKILLS]

% Projects
\\textbf{Projects}\\\\
[PROJECTS]

\\end{document}""",

    "creative": """\\documentclass[letterpaper,11pt]{article}
\\usepackage[left=0.5in,top=0.5in,right=0.5in,bottom=0.5in]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{xcolor}
\\usepackage{fontawesome}

\\definecolor{primarycolor}{RGB}{41, 128, 185}
\\definecolor{secondarycolor}{RGB}{52, 73, 94}

\\pagestyle{empty}
\\setlength{\\parindent}{0pt}

\\titleformat{\\section}
  {\\large\\bfseries\\color{primarycolor}}
  {}
  {0pt}
  {}
  [\\color{primarycolor}\\titlerule]

\\begin{document}

% Header
\\begin{center}
{\\Huge \\textbf{\\color{primarycolor}[FULL_NAME]}}\\\\[0.3cm]
\\color{secondarycolor}
\\faPhone \\ [PHONE] $\\bullet$ \\faEnvelope \\ [EMAIL] $\\bullet$ \\faMapMarker \\ [LOCATION]\\\\
\\faLinkedin \\ [LINKEDIN] $\\bullet$ \\faGithub \\ [GITHUB]
\\end{center}

\\vspace{0.3cm}

% Professional Summary
\\section{Professional Summary}
[PROFESSIONAL_SUMMARY]

% Work Experience
\\section{Professional Experience}
[WORK_EXPERIENCE]

% Education
\\section{Education}
[EDUCATION]

% Skills
\\section{Technical Skills}
[SKILLS]

% Projects
\\section{Featured Projects}
[PROJECTS]

\\end{document}"""
}

# Template information and descriptions
TEMPLATE_INFO = {
    "professional": {
        "name": "Professional",
        "description": "Clean, traditional format ideal for corporate environments",
        "features": "Standard sections, conservative styling, ATS-friendly",
        "best_for": "Corporate jobs, traditional industries, senior positions"
    },
    "modern": {
        "name": "Modern CV",
        "description": "Contemporary design using moderncv package",
        "features": "Professional styling, sidebar layout, modern typography",
        "best_for": "Tech industry, consulting, modern companies"
    },
    "academic": {
        "name": "Academic",
        "description": "Format designed for academic and research positions",
        "features": "Publications section, research focus, formal structure",
        "best_for": "Academic positions, research roles, PhD applications"
    },
    "minimal": {
        "name": "Minimal",
        "description": "Simple, clean design with minimal styling",
        "features": "Basic formatting, fast compilation, universal compatibility",
        "best_for": "Simple applications, quick resumes, basic positions"
    },
    "creative": {
        "name": "Creative",
        "description": "Eye-catching design with colors and icons",
        "features": "Colors, FontAwesome icons, modern layout",
        "best_for": "Creative roles, design positions, startups"
    }
}
