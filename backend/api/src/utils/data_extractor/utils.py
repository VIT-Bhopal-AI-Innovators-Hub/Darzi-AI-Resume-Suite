"""Utility functions for data extraction."""

import re
from typing import Optional, Tuple, Set
from urllib.parse import urlparse


# Centralized file type definitions
TEXT_FILE_EXTENSIONS: Set[str] = {'.txt', '.md', '.rtf', '.csv', '.log'}
VISION_FILE_EXTENSIONS: Set[str] = {'.pdf', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.ico'}


def get_supported_extensions() -> Tuple[Set[str], Set[str]]:
    """Get supported file extensions."""
    return TEXT_FILE_EXTENSIONS, VISION_FILE_EXTENSIONS


def is_google_drive_url(url: str) -> bool:
    """Check if URL is a Google Drive file link."""
    return 'drive.google.com' in url.lower() or 'docs.google.com' in url.lower()


def extract_google_drive_file_id(url: str) -> Optional[str]:
    """Extract file ID from Google Drive URL."""
    # Handle different Google Drive URL formats
    patterns = [
        r'/d/([a-zA-Z0-9-_]+)',  # /file/d/FILE_ID/view
        r'id=([a-zA-Z0-9-_]+)',  # ?id=FILE_ID
        r'/([a-zA-Z0-9-_]+)/edit',  # Google Docs edit URL
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None


def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format."""
    if size_bytes == 0:
        return "0B"
    
    size_names = ["B", "KB", "MB", "GB"]
    import math
    
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    
    return f"{s} {size_names[i]}"


def validate_file_type(filename: str) -> Tuple[bool, str]:
    """Validate if file type is supported."""
    import os
    
    file_ext = os.path.splitext(filename)[1].lower()
    
    if file_ext in TEXT_FILE_EXTENSIONS:
        return True, "text"
    elif file_ext in VISION_FILE_EXTENSIONS:
        return True, "vision"
    else:
        return False, "unsupported"


def read_text_file_with_encoding(file_path: str) -> str:
    """Read text file with multiple encoding attempts."""
    try:
        # Try different encodings
        encodings = ['utf-8', 'utf-8-sig', 'latin1', 'cp1252']
        
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    return f.read().strip()
            except UnicodeDecodeError:
                continue
        
        # If all encodings fail, read as binary and decode with errors='replace'
        with open(file_path, 'rb') as f:
            content = f.read()
            return content.decode('utf-8', errors='replace').strip()
            
    except Exception as e:
        raise RuntimeError(f"Error reading text file: {e}")
