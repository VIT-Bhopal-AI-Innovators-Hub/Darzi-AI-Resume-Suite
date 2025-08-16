"""
Gemini LLM Provider - Clean interface for Google's Gemini API
"""
import os
import logging
from typing import Optional
import google.generativeai as genai
from ..base import BaseLLMProvider

logger = logging.getLogger(__name__)

class GeminiProvider(BaseLLMProvider):
    """Clean Gemini provider that only handles model communication"""
    
    def __init__(self):
        super().__init__()
        self.model = None
        self._is_available = False
        self._initialize()
    
    def _initialize(self):
        """Initialize the Gemini model"""
        try:
            # Try GOOGLE_API_KEY first (standard for Gemini), then GEMINI_API_KEY as fallback
            api_key = os.getenv('GOOGLE_API_KEY') or os.getenv('GEMINI_API_KEY')
            
            if not api_key:
                logger.warning("Gemini API key not found. Please set either GOOGLE_API_KEY or GEMINI_API_KEY environment variable")
                logger.info("Note: For HuggingFace Spaces, add your API key in the Settings > Repository secrets")
                return
            
            # Log which key was used (without exposing the actual key)
            key_source = "GOOGLE_API_KEY" if os.getenv('GOOGLE_API_KEY') else "GEMINI_API_KEY"
            logger.debug(f"Using API key from: {key_source}")
            
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self._is_available = True
            logger.info("Gemini provider initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Gemini provider: {e}")
            self._is_available = False
    
    def is_available(self) -> bool:
        """Check if the Gemini provider is available"""
        return self._is_available
    
    def get_provider_name(self) -> str:
        """Get the provider name"""
        return "Gemini (gemini-1.5-flash)"
    
    def generate_text(self, prompt: str) -> Optional[str]:
        """
        Generate text using Gemini model
        
        Args:
            prompt: The input prompt for the model
            
        Returns:
            Generated text response or None if failed
        """
        if not self.is_available() or not self.model:
            logger.error("Gemini provider not available")
            return None
        
        try:
            logger.debug(f"Sending prompt to Gemini (length: {len(prompt)} chars)")
            response = self.model.generate_content(prompt)
            
            if response and response.text:
                logger.debug(f"Received response from Gemini (length: {len(response.text)} chars)")
                return response.text.strip()
            else:
                logger.warning("Empty response from Gemini")
                return None
                
        except Exception as e:
            logger.error(f"Error generating text with Gemini: {e}")
            return None
