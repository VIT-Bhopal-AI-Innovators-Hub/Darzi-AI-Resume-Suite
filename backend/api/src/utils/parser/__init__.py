# Parser module for resume parsing functionality
from .core import ResumeParser
from .enhanced import EnhancedResumeParser

# Export the enhanced parser as the default
__all__ = ['ResumeParser', 'EnhancedResumeParser']
