"""
Resume Generator Core Module

This module provides the main ResumeGenerator class for generating LaTeX resumes using LLM.
"""

import logging
from typing import Dict, List, Optional, Any
from ..llm.manager import LLMManager

logger = logging.getLogger(__name__)


class ResumeGenerator:
    """
    Resume generator that uses LLM to create LaTeX code based on resume data and templates.
    """
    
    def __init__(self):
        """Initialize the resume generator with LLM manager."""
        self.llm_manager = LLMManager()
    
    def generate_resume(
        self,
        user_resume: Dict[str, Any],
        resume_template: str,
        extra_info: Optional[Dict[str, str]] = None,
        ats_score: Optional[int] = None,
        improvement_suggestions: Optional[List[str]] = None,
        preferred_provider: Optional[str] = None
    ) -> Dict[str, Any]:
        """
    Generate resume LaTeX code by passing data and template to the LLM.
        
        Args:
            user_resume (Dict[str, Any]): Parsed resume data containing personal info, 
                                        experience, education, skills, etc.
            resume_template (str): LaTeX template code for the resume
            extra_info (Optional[Dict[str, str]]): Additional information like LinkedIn, 
                                                 GitHub, portfolio links, etc.
            ats_score (Optional[int]): Current ATS compatibility score (0-100)
            improvement_suggestions (Optional[List[str]]): List of ATS improvement suggestions
            preferred_provider (Optional[str]): Preferred LLM provider to use
            
        Returns:
            Dict[str, Any]: Response containing:
                - success (bool): Whether generation was successful
                - latex_code (str): Generated LaTeX code
                - provider_used (str): LLM provider that was used
                - error (str): Error message if generation failed
                - metadata (Dict): Additional metadata about generation
        """
        try:
            # Validate inputs
            if not user_resume:
                return {
                    "success": False,
                    "error": "User resume data is required",
                    "latex_code": None,
                    "provider_used": None,
                    "metadata": {}
                }
            
            if not resume_template:
                return {
                    "success": False,
                    "error": "Resume template is required",
                    "latex_code": None,
                    "provider_used": None,
                    "metadata": {}
                }
            
            # Always use LLM generation path (no local substitution)
            available_providers = self.llm_manager.get_available_providers()

            if not available_providers:
                return {
                    "success": False,
                    "error": "No LLM providers available for resume generation",
                    "latex_code": None,
                    "provider_used": None,
                    "metadata": {"available_providers": []}
                }

            # Create the prompt for LLM
            prompt = self._create_resume_generation_prompt(
                user_resume=user_resume,
                resume_template=resume_template,
                extra_info=extra_info,
                ats_score=ats_score,
                improvement_suggestions=improvement_suggestions
            )

            # Generate LaTeX code using LLM
            result = self.llm_manager.generate_text(
                prompt=prompt,
                preferred_provider=preferred_provider
            )

            if result.get("success"):
                # Extract LaTeX code from LLM response
                latex_code = self._extract_latex_code(result.get("content", ""))

                return {
                    "success": True,
                    "latex_code": latex_code,
                    "provider_used": result.get("provider_used"),
                    "error": None,
                    "metadata": {
                        "generation_method": "llm_only",
                        "prompt_length": len(prompt),
                        "response_length": len(result.get("content", "")),
                        "available_providers": available_providers
                    }
                }
            else:
                return {
                    "success": False,
                    "error": result.get('error', 'Unknown LLM error'),
                    "latex_code": None,
                    "provider_used": result.get("provider_used"),
                    "metadata": {
                        "generation_method": "llm_only",
                        "available_providers": available_providers
                    }
                }
                
        except Exception as e:
            logger.error(f"Error generating resume: {str(e)}")
            return {
                "success": False,
                "error": f"Resume generation failed: {str(e)}",
                "latex_code": None,
                "provider_used": None,
                "metadata": {}
            }
    
    
    def _fill_template_directly(
        self,
        user_resume: Dict[str, Any],
        resume_template: str,
        extra_info: Optional[Dict[str, str]] = None
    ) -> Optional[str]:
        """
        Fill LaTeX template directly with user data using simple string substitution.
        
        Args:
            user_resume: Resume data dictionary
            resume_template: LaTeX template with placeholders like {{name}}, {{email}}, etc.
            extra_info: Additional information
            
        Returns:
            str: Filled template or None if substitution fails
        """
        try:
            # Start with the template
            filled_template = resume_template
            
            # Create a comprehensive resume_data dictionary
            resume_data = {}
            
            # Extract data from user_resume (handle both formats)
            if isinstance(user_resume, dict):
                # Handle nested contact_information format first
                contact_info = user_resume.get('contact_information', {})
                
                # Initialize with actual data or meaningful defaults
                resume_data = {
                    'name': contact_info.get('full_name') or user_resume.get('name') or 'John Doe',
                    'title': contact_info.get('title') or user_resume.get('title') or 'Software Engineer',
                    'email': contact_info.get('email') or user_resume.get('email') or 'john.doe@email.com',
                    'phone': contact_info.get('phone') or user_resume.get('phone') or '+1 (555) 123-4567',
                    'location': contact_info.get('location') or user_resume.get('location') or 'New York, NY',
                    'website': contact_info.get('linkedin') or user_resume.get('website') or 'linkedin.com/in/johndoe',
                    'github': contact_info.get('github') or user_resume.get('github') or 'github.com/johndoe',
                    'status': user_resume.get('status', 'Open to new opportunities'),
                    'fields': user_resume.get('fields', 'Software Development'),
                    'technologies': user_resume.get('technologies', 'Python, JavaScript, React'),
                    'activities': user_resume.get('activities', 'Coding, Learning'),
                    'summary': user_resume.get('professional_summary') or user_resume.get('summary') or 'Experienced professional with a strong background in software development.',
                }
                
                # Handle work experience with more dynamic content
                work_experience = user_resume.get('work_experience', [])
                if work_experience and isinstance(work_experience, list):
                    experience_entries = []
                    for exp in work_experience:
                        duration = exp.get('duration', exp.get('dates', exp.get('employment_dates', 'Present')))
                        position = exp.get('position', exp.get('title', exp.get('job_title', 'Software Engineer')))
                        company = exp.get('company', exp.get('employer', 'Tech Company'))
                        description = exp.get('description', exp.get('summary', 'Contributed to software development projects'))
                        
                        # Handle responsibilities/achievements
                        responsibilities = exp.get('responsibilities', exp.get('achievements', exp.get('duties', [])))
                        if isinstance(responsibilities, list) and responsibilities:
                            responsibilities_text = ' • '.join(responsibilities[:3])  # Take first 3 items
                        elif isinstance(responsibilities, str):
                            responsibilities_text = responsibilities
                        else:
                            responsibilities_text = 'Key contributor to team projects and deliverables'
                        
                        experience_entry = f"\\cvevent{{{duration}}}{{{position}}}{{{company}}}{{{description}}}{{{responsibilities_text}}}"
                        experience_entries.append(experience_entry)
                    
                    resume_data['experience_section'] = '\n\n'.join(experience_entries)
                else:
                    # Default experience if none provided
                    resume_data['experience_section'] = "\\cvevent{2023-Present}{Software Engineer}{Tech Company}{Developing innovative software solutions}{Built scalable applications • Collaborated with cross-functional teams • Improved system performance}"
                
                # Handle education with more dynamic content
                education = user_resume.get('education', [])
                if education and isinstance(education, list):
                    education_entries = []
                    for edu in education:
                        year = edu.get('graduation_year', edu.get('year', edu.get('graduation_date', '2023')))
                        degree = edu.get('degree', edu.get('degree_type', 'Bachelor of Science'))
                        institution = edu.get('institution', edu.get('school', edu.get('university', 'University')))
                        field = edu.get('field_of_study', edu.get('field', edu.get('major', 'Computer Science')))
                        details = edu.get('details', edu.get('honors', edu.get('gpa', 'Relevant coursework completed')))
                        
                        education_entry = f"\\cvevent{{{year}}}{{{degree}}}{{{institution}}}{{{field}}}{{{details}}}"
                        education_entries.append(education_entry)
                    
                    resume_data['education_section'] = '\n\n'.join(education_entries)
                else:
                    # Default education if none provided
                    resume_data['education_section'] = "\\cvevent{2023}{Bachelor of Science}{University}{Computer Science}{Relevant coursework in software engineering and algorithms}"
                
                # Handle skills more dynamically
                skills = user_resume.get('skills', {})
                if skills:
                    if isinstance(skills, dict):
                        # Convert skills dict to readable format
                        skills_text = []
                        for category, skill_list in skills.items():
                            if skill_list:
                                if isinstance(skill_list, list):
                                    skills_text.append(f"{category.replace('_', ' ').title()}: {', '.join(skill_list)}")
                                else:
                                    skills_text.append(f"{category.replace('_', ' ').title()}: {skill_list}")
                        resume_data['technologies'] = ' • '.join(skills_text) if skills_text else resume_data['technologies']
                    elif isinstance(skills, list):
                        resume_data['technologies'] = ', '.join(skills)
                    elif isinstance(skills, str):
                        resume_data['technologies'] = skills
                
                # Add extra info if provided (this can override defaults)
                if extra_info:
                    for key, value in extra_info.items():
                        if value:  # Only add non-empty values
                            resume_data[key] = value
                
                # Debug logging
                logger.info(f"Template substitution data prepared with {len(resume_data)} fields")
                logger.debug(f"Resume data keys: {list(resume_data.keys())}")
                
                # Replace placeholders in template with more flexible matching
                placeholders_found = 0
                for key, value in resume_data.items():
                    # Try different placeholder formats
                    placeholders = [
                        f"{{{{{key}}}}}",  # {{key}}
                        f"[{key.upper()}]",  # [KEY]
                        f"{{{{ {key} }}}}",  # {{ key }}
                        f"[{key}]"  # [key]
                    ]
                    
                    for placeholder in placeholders:
                        if placeholder in filled_template:
                            # Escape LaTeX special characters
                            escaped_value = self._escape_latex(str(value))
                            filled_template = filled_template.replace(placeholder, escaped_value)
                            placeholders_found += 1
                            logger.debug(f"Replaced placeholder {placeholder} with {value[:50]}...")
                
                logger.info(f"Replaced {placeholders_found} placeholders in template")
                
                # If no placeholders were found, the template might be using LLM-style generation
                if placeholders_found == 0:
                    logger.warning("No placeholders found in template - may need LLM generation")
                    return None
                
                return filled_template
            
            return None
            
        except Exception as e:
            logger.error(f"Error in direct template filling: {str(e)}")
            return None
    
    def _escape_latex(self, text: str) -> str:
        """
        Escape special LaTeX characters in text.
        
        Args:
            text: Text to escape
            
        Returns:
            str: LaTeX-escaped text
        """
        # Common LaTeX special characters
        replacements = {
            '&': '\\&',
            '%': '\\%',
            '$': '\\$',
            '#': '\\#',
            '^': '\\textasciicircum{}',
            '_': '\\_',
            '{': '\\{',
            '}': '\\}',
            '~': '\\textasciitilde{}',
            '\\': '\\textbackslash{}'
        }
        
        escaped_text = text
        for char, replacement in replacements.items():
            escaped_text = escaped_text.replace(char, replacement)
        
        return escaped_text

    def _create_resume_generation_prompt(
        self,
        user_resume: Dict[str, Any],
        resume_template: str,
        extra_info: Optional[Dict[str, str]] = None,
        ats_score: Optional[int] = None,
        improvement_suggestions: Optional[List[str]] = None
    ) -> str:
        """
        Create a comprehensive prompt for LLM to generate resume LaTeX code.
        
        Args:
            user_resume: Parsed resume data
            resume_template: LaTeX template
            extra_info: Additional information
            ats_score: Current ATS score
            improvement_suggestions: ATS improvement suggestions
            
        Returns:
            str: Complete prompt for LLM
        """
        import uuid
        import datetime
        
        # Generate unique identifier for this generation request
        generation_id = str(uuid.uuid4())[:8]
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        prompt_parts = [
            f"RESUME GENERATION REQUEST ID: {generation_id}",
            f"Generated at: {timestamp}",
            "",
            "You are an expert LaTeX resume generator. Your task is to create a professional, unique resume in LaTeX format using the provided template and user data.",
            "",
            "**CRITICAL INSTRUCTIONS:**",
            "1. Use the provided LaTeX template as the base structure",
            "2. Fill in the template with the user's ACTUAL resume data (not placeholder text)",
            "3. Maintain professional formatting and correct LaTeX syntax",
            "4. Ensure all LaTeX special characters are properly escaped",
            "5. If ATS suggestions are provided, incorporate them to improve compatibility",
            "6. Add any extra information provided in appropriate sections",
            "7. Make each resume unique by using the actual data provided",
            "8. DO NOT use generic placeholder text - use real data from the user",
            "9. Return ONLY the complete LaTeX code, no explanations or markdown blocks",
            "",
            "**USER RESUME DATA:**"
        ]
        
        # Add user resume data with detailed extraction
        if isinstance(user_resume, dict):
            # Contact Information with validation
            contact_info = user_resume.get('contact_information', {})
            if contact_info or any(key in user_resume for key in ['name', 'email', 'phone']):
                prompt_parts.append("=== CONTACT INFORMATION ===")
                name = contact_info.get('full_name') or user_resume.get('name', 'NO_NAME_PROVIDED')
                email = contact_info.get('email') or user_resume.get('email', 'NO_EMAIL_PROVIDED')
                phone = contact_info.get('phone') or user_resume.get('phone', 'NO_PHONE_PROVIDED')
                location = contact_info.get('location') or user_resume.get('location', 'NO_LOCATION_PROVIDED')
                
                prompt_parts.append(f"Full Name: {name}")
                prompt_parts.append(f"Email: {email}")
                prompt_parts.append(f"Phone: {phone}")
                prompt_parts.append(f"Location: {location}")
                
                if contact_info.get('linkedin') or user_resume.get('linkedin'):
                    prompt_parts.append(f"LinkedIn: {contact_info.get('linkedin') or user_resume.get('linkedin')}")
                if contact_info.get('github') or user_resume.get('github'):
                    prompt_parts.append(f"GitHub: {contact_info.get('github') or user_resume.get('github')}")
                prompt_parts.append("")
            
            # Professional Summary
            summary = user_resume.get('professional_summary', '') or user_resume.get('summary', '')
            if summary:
                prompt_parts.append("=== PROFESSIONAL SUMMARY ===")
                prompt_parts.append(f"{summary}")
                prompt_parts.append("")
            
            # Work Experience with detailed formatting
            experience = user_resume.get('work_experience', [])
            if experience and isinstance(experience, list):
                prompt_parts.append("=== WORK EXPERIENCE ===")
                for i, exp in enumerate(experience, 1):
                    position = exp.get('position') or exp.get('title', f'Position {i}')
                    company = exp.get('company', f'Company {i}')
                    duration = exp.get('duration') or exp.get('dates') or exp.get('employment_dates', 'Duration not specified')
                    location = exp.get('location', 'Location not specified')
                    
                    prompt_parts.append(f"JOB {i}:")
                    prompt_parts.append(f"  Position: {position}")
                    prompt_parts.append(f"  Company: {company}")
                    prompt_parts.append(f"  Duration: {duration}")
                    prompt_parts.append(f"  Location: {location}")
                    
                    if exp.get('description'):
                        prompt_parts.append(f"  Description: {exp['description']}")
                    
                    # Handle responsibilities/achievements
                    responsibilities = exp.get('responsibilities', []) or exp.get('achievements', []) or exp.get('duties', [])
                    if responsibilities:
                        prompt_parts.append("  Key Responsibilities/Achievements:")
                        if isinstance(responsibilities, list):
                            for resp in responsibilities:
                                prompt_parts.append(f"    • {resp}")
                        else:
                            prompt_parts.append(f"    • {responsibilities}")
                    prompt_parts.append("")
            
            # Education with detailed formatting
            education = user_resume.get('education', [])
            if education and isinstance(education, list):
                prompt_parts.append("=== EDUCATION ===")
                for i, edu in enumerate(education, 1):
                    degree = edu.get('degree', f'Degree {i}')
                    institution = edu.get('institution') or edu.get('school') or edu.get('university', f'Institution {i}')
                    field = edu.get('field_of_study') or edu.get('field') or edu.get('major', 'Field not specified')
                    year = edu.get('graduation_year') or edu.get('year') or edu.get('graduation_date', 'Year not specified')
                    
                    prompt_parts.append(f"EDUCATION {i}:")
                    prompt_parts.append(f"  Degree: {degree}")
                    prompt_parts.append(f"  Institution: {institution}")
                    prompt_parts.append(f"  Field of Study: {field}")
                    prompt_parts.append(f"  Graduation Year: {year}")
                    
                    if edu.get('gpa'):
                        prompt_parts.append(f"  GPA: {edu['gpa']}")
                    if edu.get('honors'):
                        prompt_parts.append(f"  Honors: {edu['honors']}")
                    if edu.get('details'):
                        prompt_parts.append(f"  Additional Details: {edu['details']}")
                    prompt_parts.append("")
            
            # Skills with categorization
            skills = user_resume.get('skills', {})
            if skills:
                prompt_parts.append("=== SKILLS ===")
                if isinstance(skills, dict):
                    for skill_category, skill_list in skills.items():
                        if skill_list:
                            category_name = skill_category.replace('_', ' ').title()
                            if isinstance(skill_list, list):
                                prompt_parts.append(f"{category_name}: {', '.join(skill_list)}")
                            else:
                                prompt_parts.append(f"{category_name}: {skill_list}")
                elif isinstance(skills, list):
                    prompt_parts.append(f"Skills: {', '.join(skills)}")
                elif isinstance(skills, str):
                    prompt_parts.append(f"Skills: {skills}")
                prompt_parts.append("")
            
            # Projects
            projects = user_resume.get('projects', [])
            if projects and isinstance(projects, list):
                prompt_parts.append("=== PROJECTS ===")
                for i, project in enumerate(projects, 1):
                    name = project.get('name', f'Project {i}')
                    prompt_parts.append(f"PROJECT {i}: {name}")
                    
                    if project.get('description'):
                        prompt_parts.append(f"  Description: {project['description']}")
                    if project.get('technologies'):
                        technologies = project['technologies']
                        if isinstance(technologies, list):
                            prompt_parts.append(f"  Technologies: {', '.join(technologies)}")
                        else:
                            prompt_parts.append(f"  Technologies: {technologies}")
                    if project.get('url'):
                        prompt_parts.append(f"  URL: {project['url']}")
                    prompt_parts.append("")
        
        # Add extra information
        if extra_info:
            prompt_parts.append("=== ADDITIONAL INFORMATION ===")
            for key, value in extra_info.items():
                if value:
                    prompt_parts.append(f"{key.replace('_', ' ').title()}: {value}")
            prompt_parts.append("")
        
        # Add ATS information
        if ats_score is not None:
            prompt_parts.append(f"=== CURRENT ATS COMPATIBILITY ===")
            prompt_parts.append(f"Current ATS Score: {ats_score}/100")
            prompt_parts.append("")
        
        if improvement_suggestions:
            prompt_parts.append("=== ATS IMPROVEMENT SUGGESTIONS ===")
            prompt_parts.append("Please incorporate these suggestions to improve ATS compatibility:")
            for i, suggestion in enumerate(improvement_suggestions, 1):
                prompt_parts.append(f"{i}. {suggestion}")
            prompt_parts.append("")
        
        # Add template with emphasis on uniqueness
        prompt_parts.extend([
            "=== LATEX TEMPLATE TO USE ===",
            "Use this template as the base structure and fill it with the ACTUAL user data above:",
            "",
            "```latex",
            resume_template.strip(),
            "```",
            "",
            "=== FINAL REQUIREMENTS ===",
            f"Generation ID: {generation_id} (include this in comments if needed)",
            "- Return ONLY the complete LaTeX code ready for compilation",
            "- Fill ALL template sections with the ACTUAL user data provided above",
            "- Do NOT use generic placeholder text like 'Your Name' or 'your.email@example.com'",
            "- Ensure proper LaTeX syntax and character escaping",
            "- Maintain professional formatting and structure",
            "- If ATS suggestions were provided, incorporate them naturally into the content",
            "- Make this resume unique by using the real data provided",
            "- Each generation should produce different output when different data is provided",
            "",
            "START LATEX CODE GENERATION NOW:"
        ])
        
        final_prompt = "\n".join(prompt_parts)
        logger.info(f"Generated LLM prompt with {len(final_prompt)} characters for generation ID {generation_id}")
        
        return final_prompt
    
    def _extract_latex_code(self, llm_response: str) -> str:
        """
        Extract LaTeX code from LLM response.
        
        Args:
            llm_response: Raw response from LLM
            
        Returns:
            str: Extracted LaTeX code
        """
        # Remove common markdown code block markers
        latex_code = llm_response.strip()
        
        # Remove ```latex and ``` markers if present
        if latex_code.startswith("```latex"):
            latex_code = latex_code[8:]
        elif latex_code.startswith("```"):
            latex_code = latex_code[3:]
        
        if latex_code.endswith("```"):
            latex_code = latex_code[:-3]
        
        # Clean up any remaining markdown or formatting
        latex_code = latex_code.strip()
        
        # Ensure the LaTeX document starts with \documentclass if it's a complete document
        if not latex_code.startswith("\\documentclass") and not latex_code.startswith("\\begin{document}"):
            # If it doesn't start with document class, assume it's content only
            logger.info("LaTeX code appears to be content-only, not a complete document")
        
        return latex_code
    
    def get_available_providers(self) -> List[str]:
        """
        Get list of available LLM providers.
        
        Returns:
            List[str]: Available provider names
        """
        return self.llm_manager.get_available_providers()
    
    def is_available(self) -> bool:
        """
        Check if resume generation is available (i.e., if any LLM providers are available).
        
        Returns:
            bool: True if generation is available, False otherwise
        """
        return len(self.llm_manager.get_available_providers()) > 0
