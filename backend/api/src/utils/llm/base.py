"""
Base LLM interface - clean interface for model communication only
"""
from abc import ABC, abstractmethod
from typing import Optional

class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers - handles only model communication"""
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        self.api_key = api_key
        self.config = kwargs
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if the LLM provider is available and configured"""
        pass
    
    @abstractmethod
    def generate_text(self, prompt: str) -> str:
        """Generate text response from the LLM model"""
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """Get the name of the LLM provider"""
        pass
