"""
Enhanced Resume Parser with LLM integration and local fallback
"""
import logging
from typing import Dict, Any, Optional
from .core import ResumeParser as LocalResumeParser
from .field_extractor import FlexibleFieldExtractor
from ..llm.manager import LLMManager

logger = logging.getLogger(__name__)

class EnhancedResumeParser:
    """Enhanced resume parser with LLM integration and local fallback"""
    
    def __init__(self):
        self.local_parser = LocalResumeParser()
        self.llm_manager = LLMManager()
        
        logger.info(f"Enhanced parser initialized - LLM available: {self.llm_manager.is_llm_available()}")
        if self.llm_manager.is_llm_available():
            logger.info(f"Available LLM providers: {self.llm_manager.get_available_providers()}")
    
    def parse_resume(
        self, 
        text: str, 
        use_llm: bool = True, 
        preferred_provider: Optional[str] = None,
        return_raw: bool = False
    ) -> Dict[str, Any]:
        """
        Parse resume text with LLM primary and local fallback
        
        Args:
            text: Resume text to parse
            use_llm: Whether to try LLM parsing first (default: True)
            preferred_provider: Preferred LLM provider name (optional)
            return_raw: If True, return raw LLM output; if False, return normalized structure
            
        Returns:
            Dict containing parsed resume data with metadata
        """
        result = {
            'parsing_method': 'unknown',
            'llm_available': self.llm_manager.is_llm_available(),
            'available_providers': self.llm_manager.get_available_providers(),
            'raw_data': {},
            'normalized_data': {},
            'confidence_score': 0.0,
            'error': None
        }
        
        # Try LLM parsing first if available and requested
        if use_llm and self.llm_manager.is_llm_available():
            try:
                logger.info("Attempting LLM parsing...")
                llm_result = self.llm_manager.parse_resume_with_llm(text, preferred_provider)
                
                result['raw_data'] = llm_result
                result['parsing_method'] = 'llm'
                result['parsed_by'] = llm_result.get('_parsed_by', 'unknown_llm')
                result['confidence_score'] = 0.95  # High confidence for LLM parsing
                
                # Remove internal metadata from raw data
                clean_raw_data = {k: v for k, v in llm_result.items() if k != '_parsed_by'}
                result['raw_data'] = clean_raw_data
                
                # Create normalized structure using field extractor
                if not return_raw:
                    extractor = FlexibleFieldExtractor(clean_raw_data)
                    result['normalized_data'] = extractor.get_normalized_resume()
                
                logger.info(f"LLM parsing successful using: {result['parsed_by']}")
                return result
                
            except Exception as e:
                logger.warning(f"LLM parsing failed, falling back to local parser: {e}")
                result['error'] = f"LLM parsing failed: {str(e)}"
        
        # Fallback to local parsing
        try:
            logger.info("Using local parser...")
            local_result = self.local_parser.parse_resume(text)
            
            result['raw_data'] = local_result
            result['parsing_method'] = 'local'
            result['parsed_by'] = 'local_nlp_parser'
            result['confidence_score'] = local_result.get('confidence_score', 0.7)
            
            # For local parser, the result is already in a somewhat normalized format
            # But we can still run it through the field extractor for consistency
            if not return_raw:
                extractor = FlexibleFieldExtractor(local_result)
                result['normalized_data'] = extractor.get_normalized_resume()
            
            logger.info("Local parsing successful")
            return result
            
        except Exception as e:
            logger.error(f"Local parsing also failed: {e}")
            result['error'] = f"Both LLM and local parsing failed. Local error: {str(e)}"
            raise RuntimeError(result['error'])
    
    def parse_resume_local_only(self, text: str, return_raw: bool = False) -> Dict[str, Any]:
        """Parse resume using only local parser"""
        return self.parse_resume(text, use_llm=False, return_raw=return_raw)
    
    def parse_resume_llm_only(self, text: str, preferred_provider: Optional[str] = None, return_raw: bool = False) -> Dict[str, Any]:
        """
        Parse resume using only LLM (no fallback)
        
        Raises:
            RuntimeError: If LLM is not available or fails
        """
        if not self.llm_manager.is_llm_available():
            raise RuntimeError("No LLM providers available")
        
        llm_result = self.llm_manager.parse_resume_with_llm(text, preferred_provider)
        
        clean_raw_data = {k: v for k, v in llm_result.items() if k != '_parsed_by'}
        
        result = {
            'parsing_method': 'llm',
            'parsed_by': llm_result.get('_parsed_by', 'unknown_llm'),
            'llm_available': True,
            'available_providers': self.llm_manager.get_available_providers(),
            'raw_data': clean_raw_data,
            'confidence_score': 0.95,
            'error': None
        }
        
        # Create normalized structure if requested
        if not return_raw:
            extractor = FlexibleFieldExtractor(clean_raw_data)
            result['normalized_data'] = extractor.get_normalized_resume()
        
        return result
    
    def get_parser_status(self) -> Dict[str, Any]:
        """Get status of all available parsers"""
        return {
            'local_parser_available': True,
            'llm_available': self.llm_manager.is_llm_available(),
            'available_llm_providers': self.llm_manager.get_available_providers(),
            'primary_llm_provider': self.llm_manager.get_primary_provider_name(),
            'recommended_method': 'llm' if self.llm_manager.is_llm_available() else 'local'
        }
