"""
LLM Manager for handling multiple LLM providers with fallback support
Handles all parsing logic while keeping LLM providers clean
"""
import logging
import json
from typing import Dict, Any, List, Optional
from .base import BaseLLMProvider
from .providers.gemini import GeminiProvider

logger = logging.getLogger(__name__)

class LLMManager:
    """Manages multiple LLM providers with fallback support and handles parsing logic"""
    
    def __init__(self):
        self.providers: List[BaseLLMProvider] = []
        self.primary_provider: Optional[BaseLLMProvider] = None
        self._initialize_providers()
    
    def _initialize_providers(self):
        """Initialize available LLM providers in order of preference"""
        
        # Try to initialize Gemini first (primary)
        try:
            gemini = GeminiProvider()
            if gemini.is_available():
                self.providers.append(gemini)
                self.primary_provider = gemini
                logger.info(f"Primary LLM provider initialized: {gemini.get_provider_name()}")
            else:
                logger.warning("Gemini provider not available")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini provider: {e}")
        
        # Add other providers here in the future
        
        if not self.providers:
            logger.warning("No LLM providers available")
    
    def add_provider(self, provider: BaseLLMProvider):
        """Add a custom provider"""
        if provider.is_available():
            self.providers.append(provider)
            if self.primary_provider is None:
                self.primary_provider = provider
            logger.info(f"Added LLM provider: {provider.get_provider_name()}")
    
    def is_llm_available(self) -> bool:
        """Check if any LLM provider is available"""
        return len(self.providers) > 0
    
    def get_available_providers(self) -> List[str]:
        """Get list of available provider names"""
        return [provider.get_provider_name() for provider in self.providers]
    
    def format_resume_prompt(self, text: str) -> str:
        """Format the resume text into a flexible prompt for dynamic LLM parsing"""
        return f"""
You are an expert resume analyzer with deep understanding of various resume formats and structures.

**YOUR TASK:**
Analyze the resume text and extract ALL information into a flexible JSON structure. Discover what sections actually exist rather than forcing predefined categories.

**CRITICAL INSTRUCTIONS:**
1. Return ONLY valid JSON - no markdown, no explanations
2. Create section names based on what you actually find in the resume
3. Be comprehensive - don't miss any information
4. Use descriptive, clear section names
5. Preserve all context and details
6. Use consistent date formats (YYYY-MM-DD, YYYY-MM, or YYYY)
7. Group related information logically
8. **IMPORTANT: Do NOT include empty fields, arrays, or objects. Only include sections that have actual data.**
9. **IMPORTANT: Do NOT add predefined empty fields like empty skills arrays, certifications arrays, etc.**

**DYNAMIC APPROACH:**
- If you see contact info → create "contact_information" or "personal_details"
- If you see work history → create "work_experience" or "professional_experience"  
- If you see education → create "education" or "academic_background"
- If you see skills → create appropriate skill categories
- If you see projects → create "projects" or "portfolio"
- If you see certifications → create "certifications" or "licenses"
- If you see awards → create "awards" or "achievements"
- If you see publications → create "publications" or "research"
- If you see volunteer work → create "volunteer_experience"
- Create any other sections you discover
- **Only create sections that actually have data in the resume**

**JSON STRUCTURE PRINCIPLES:**
- Use arrays for lists (experiences, skills, education, etc.) only when data exists
- Use objects for grouped information (contact details, individual jobs, etc.) only when data exists
- Include all available details
- Maintain hierarchical relationships
- Do not add empty placeholders

**EXAMPLE DYNAMIC OUTPUT (only showing fields that exist):**
{{
  "contact_information": {{
    "full_name": "John Doe",
    "email": "john@email.com",
    "phone": "+1-555-0123",
    "location": "San Francisco, CA"
  }},
  "professional_summary": "Experienced software engineer...",
  "work_experience": [
    {{
      "company": "Tech Corp",
      "position": "Senior Developer",
      "duration": "2020-2023",
      "responsibilities": ["Built scalable systems", "Led team of 5"]
    }}
  ],
  "education": [
    {{
      "institution": "University of Technology",
      "degree": "Bachelor of Science in Computer Science",
      "graduation_year": "2019"
    }}
  ],
  "technical_skills": {{
    "programming_languages": ["Python", "JavaScript"],
    "tools": ["Docker", "Git"]
  }}
}}

**RESUME TEXT TO ANALYZE:**
{text}

**OUTPUT (JSON ONLY - include only sections with actual data):**
"""
    
    def _clean_llm_response(self, response_text: str) -> str:
        """Clean the raw LLM response to extract JSON"""
        response_text = response_text.strip()
        
        # Remove markdown formatting if present
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        elif response_text.startswith('```'):
            response_text = response_text[3:]
            
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        return response_text.strip()
    
    def _validate_parsed_data(self, data: Dict[str, Any], provider_name: str) -> Dict[str, Any]:
        """Validate and clean the parsed data"""
        if not isinstance(data, dict):
            return {}
        
        # Add parsing metadata
        validated = data.copy()
        validated['_parsed_by'] = provider_name
        
        # Clean empty fields
        validated = self._clean_empty_fields(validated)
        
        return validated
    
    def _clean_empty_fields(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Remove empty fields from the data"""
        if not isinstance(data, dict):
            return data
        
        cleaned = {}
        for key, value in data.items():
            if value is not None and value != "" and value != []:
                if isinstance(value, dict):
                    cleaned_value = self._clean_empty_fields(value)
                    if cleaned_value:  # Only add if not empty
                        cleaned[key] = cleaned_value
                elif isinstance(value, list):
                    cleaned_list = [
                        self._clean_empty_fields(item) if isinstance(item, dict) else item
                        for item in value
                        if item is not None and item != "" and item != {}
                    ]
                    if cleaned_list:  # Only add if not empty
                        cleaned[key] = cleaned_list
                else:
                    cleaned[key] = value
        
        return cleaned
    
    def parse_resume_with_llm(self, text: str, preferred_provider: Optional[str] = None) -> Dict[str, Any]:
        """
        Parse resume using LLM with fallback support
        
        Args:
            text: Resume text to parse
            preferred_provider: Name of preferred provider (optional)
            
        Returns:
            Parsed resume data
            
        Raises:
            RuntimeError: If no providers are available or all fail
        """
        if not self.providers:
            raise RuntimeError("No LLM providers available")
        
        # Create the prompt using manager's logic
        prompt = self.format_resume_prompt(text)
        
        # Try preferred provider first if specified
        if preferred_provider:
            for provider in self.providers:
                if provider.get_provider_name() == preferred_provider:
                    try:
                        response_text = provider.generate_text(prompt)
                        
                        # Clean and parse the response using manager's logic
                        clean_response = self._clean_llm_response(response_text)
                        parsed_data = json.loads(clean_response)
                        
                        # Validate and return
                        result = self._validate_parsed_data(parsed_data, provider.get_provider_name())
                        logger.info(f"Resume parsed successfully by preferred provider: {provider.get_provider_name()}")
                        return result
                        
                    except json.JSONDecodeError as e:
                        logger.error(f"JSON decode error from {provider.get_provider_name()}: {e}")
                        logger.error(f"Raw response: {response_text}")
                    except Exception as e:
                        logger.error(f"Preferred provider {provider.get_provider_name()} failed: {e}")
                    break
        
        # Try providers in order
        for provider in self.providers:
            try:
                response_text = provider.generate_text(prompt)
                
                # Clean and parse the response using manager's logic
                clean_response = self._clean_llm_response(response_text)
                parsed_data = json.loads(clean_response)
                
                # Validate and return
                result = self._validate_parsed_data(parsed_data, provider.get_provider_name())
                logger.info(f"Resume parsed successfully by: {provider.get_provider_name()}")
                return result
                
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error from {provider.get_provider_name()}: {e}")
                logger.error(f"Raw response: {response_text}")
                continue
            except Exception as e:
                logger.error(f"Provider {provider.get_provider_name()} failed: {e}")
                continue
        
        raise RuntimeError("All LLM providers failed to parse the resume")
    
    def generate_text(self, prompt: str, preferred_provider: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate text using LLM with fallback support
        
        Args:
            prompt: Text prompt for the LLM
            preferred_provider: Name of preferred provider (optional)
            
        Returns:
            Dict containing:
                - success: Whether generation was successful
                - content: Generated text content
                - provider_used: Name of provider that was used
                - error: Error message if generation failed
        """
        if not self.providers:
            return {
                "success": False,
                "content": None,
                "provider_used": None,
                "error": "No LLM providers available"
            }
        
        # Determine provider order
        providers_to_try = []
        
        if preferred_provider:
            # Try preferred provider first
            for provider in self.providers:
                if provider.get_provider_name().lower() == preferred_provider.lower():
                    providers_to_try.append(provider)
                    break
            # Add other providers as fallback
            providers_to_try.extend([p for p in self.providers if p not in providers_to_try])
        else:
            # Use default order (primary first)
            providers_to_try = self.providers.copy()
        
        # Try each provider
        for provider in providers_to_try:
            try:
                logger.info(f"Attempting text generation with provider: {provider.get_provider_name()}")
                
                response = provider.generate_text(prompt)
                
                if response:
                    logger.info(f"Text generation successful with provider: {provider.get_provider_name()}")
                    return {
                        "success": True,
                        "content": response,
                        "provider_used": provider.get_provider_name(),
                        "error": None
                    }
                else:
                    logger.warning(f"Provider {provider.get_provider_name()} returned empty response")
                    continue
                    
            except Exception as e:
                logger.error(f"Provider {provider.get_provider_name()} failed: {e}")
                continue
        
        return {
            "success": False,
            "content": None,
            "provider_used": None,
            "error": "All LLM providers failed to generate text"
        }
    
    def get_primary_provider_name(self) -> Optional[str]:
        """Get the name of the primary provider"""
        return self.primary_provider.get_provider_name() if self.primary_provider else None
