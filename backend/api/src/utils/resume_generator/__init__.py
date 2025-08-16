"""
Resume Generator Package

This package provides comprehensive functionality for generating LaTeX resumes using LLM
based on user data, templates, and ATS feedback.
"""

from .core import ResumeGenerator
from .templates import TemplateManager, PREDEFINED_TEMPLATES, TEMPLATE_INFO

# Create a singleton instance for easy access
resume_generator = ResumeGenerator()


def generate_resume(
    user_resume,
    resume_template,
    extra_info=None,
    ats_score=None,
    improvement_suggestions=None,
    preferred_provider=None
):
    """
    Convenience function to generate resume LaTeX code.
    
    This is a wrapper around ResumeGenerator.generate_resume() for easier access.
    
    Args:
        user_resume: Parsed resume data
        resume_template: LaTeX template code
        extra_info: Additional information like LinkedIn, GitHub
        ats_score: Current ATS score (0-100)
        improvement_suggestions: List of ATS improvement suggestions
        preferred_provider: Preferred LLM provider
        
    Returns:
        Dict with generation result containing latex_code, success status, etc.
    """
    return resume_generator.generate_resume(
        user_resume=user_resume,
        resume_template=resume_template,
        extra_info=extra_info,
        ats_score=ats_score,
        improvement_suggestions=improvement_suggestions,
        preferred_provider=preferred_provider
    )


def get_available_templates():
    """Get list of available predefined templates."""
    return TemplateManager.get_available_templates()


def get_template(template_name):
    """Get template content by name."""
    return TemplateManager.get_template(template_name)


def get_template_info(template_name):
    """Get template information and description."""
    return TemplateManager.get_template_info(template_name)


def validate_template(template_content):
    """Validate LaTeX template content."""
    return TemplateManager.validate_template(template_content)


def is_generator_available():
    """Check if resume generation is available."""
    return resume_generator.is_available()


def get_available_providers():
    """Get list of available LLM providers."""
    return resume_generator.get_available_providers()


__all__ = [
    "ResumeGenerator",
    "TemplateManager", 
    "PREDEFINED_TEMPLATES",
    "TEMPLATE_INFO",
    "generate_resume",
    "get_available_templates",
    "get_template",
    "get_template_info",
    "validate_template",
    "is_generator_available",
    "get_available_providers",
    "resume_generator"
]
