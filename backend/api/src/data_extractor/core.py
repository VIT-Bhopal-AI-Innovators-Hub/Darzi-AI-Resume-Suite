"""Core text extraction functionality."""

import base64
import os
import re
import tempfile
import time
from typing import Optional, Tuple

import requests
from dotenv import load_dotenv

from .utils import is_google_drive_url, extract_google_drive_file_id, get_supported_extensions, read_text_file_with_encoding

load_dotenv()

# Request configuration
REQUEST_TIMEOUT = (10, 120)  # (connect, read) timeouts in seconds
MAX_RETRIES = 3
RETRY_DELAY = 1  # seconds


def make_request_with_retry(url: str, **kwargs) -> requests.Response:
    """Make HTTP request with retry logic."""
    kwargs.setdefault('timeout', REQUEST_TIMEOUT)
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, **kwargs)
            response.raise_for_status()
            return response
        except (requests.RequestException, requests.Timeout) as e:
            if attempt == MAX_RETRIES - 1:  # Last attempt
                raise RuntimeError(f"Request failed after {MAX_RETRIES} attempts: {e}")
            
            # Retry on network errors, timeouts, and 5xx/429 status codes
            if isinstance(e, requests.HTTPError):
                if e.response.status_code < 500 and e.response.status_code != 429:
                    raise RuntimeError(f"HTTP error {e.response.status_code}: {e}")
            
            time.sleep(RETRY_DELAY * (attempt + 1))  # Exponential backoff


def make_post_request_with_retry(url: str, **kwargs) -> requests.Response:
    """Make HTTP POST request with retry logic."""
    kwargs.setdefault('timeout', REQUEST_TIMEOUT)
    
    for attempt in range(MAX_RETRIES):
        try:
            response = requests.post(url, **kwargs)
            response.raise_for_status()
            return response
        except (requests.RequestException, requests.Timeout) as e:
            if attempt == MAX_RETRIES - 1:  # Last attempt
                raise RuntimeError(f"Request failed after {MAX_RETRIES} attempts: {e}")
            
            # Retry on network errors, timeouts, and 5xx/429 status codes
            if isinstance(e, requests.HTTPError):
                if e.response.status_code < 500 and e.response.status_code != 429:
                    raise RuntimeError(f"HTTP error {e.response.status_code}: {e}")
            
            time.sleep(RETRY_DELAY * (attempt + 1))  # Exponential backoff


def download_google_drive_file(url: str) -> Tuple[str, str]:
    """Download file from Google Drive. Returns (temp_path, file_extension)."""
    file_id = extract_google_drive_file_id(url)
    if not file_id:
        raise ValueError("Could not extract file ID from Google Drive URL")
    
    # Use the direct download URL
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    try:
        response = make_request_with_retry(download_url, headers=headers, stream=True)
        
        # Handle Google Drive's virus scan warning for large files
        if 'virus scan warning' in response.text.lower():
            # Extract the confirmation URL
            confirm_pattern = r'href="(/uc\?export=download[^"]*)"'
            match = re.search(confirm_pattern, response.text)
            if match:
                confirm_url = "https://drive.google.com" + match.group(1).replace('&amp;', '&')
                response = make_request_with_retry(confirm_url, headers=headers, stream=True)
        
        # Determine file extension from content type or URL
        content_type = response.headers.get('content-type', '').lower()
        
        if 'pdf' in content_type:
            file_ext = '.pdf'
        elif 'text' in content_type:
            file_ext = '.txt'
        elif '/vnd.google-apps.document' in content_type:
            file_ext = '.txt'  # Google Docs exported as text
        else:
            # Try to guess from URL or default to .txt
            if 'pdf' in url.lower():
                file_ext = '.pdf'
            else:
                file_ext = '.txt'
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    temp_file.write(chunk)
            temp_path = temp_file.name
        
        # After downloading, check the actual file content to confirm type
        with open(temp_path, 'rb') as f:
            file_header = f.read(10)
        
        # If it looks like a PDF but we detected it as text, correct it
        if file_header.startswith(b'%PDF') and file_ext == '.txt':
            # Rename the file to have .pdf extension
            new_temp_path = temp_path.replace('.txt', '.pdf')
            os.rename(temp_path, new_temp_path)
            temp_path = new_temp_path
            file_ext = '.pdf'
        
        return temp_path, file_ext
        
    except RuntimeError:
        raise  # Re-raise our custom errors
    except Exception as e:
        raise RuntimeError(f"Error downloading from Google Drive: {e}")


def extract_text_vision_api(file_path: str) -> str:
    """Extract text using Google Cloud Vision API for PDFs and images."""
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        raise RuntimeError('Missing GOOGLE_API_KEY in environment variables')
    # Validate Google API key format (should start with "AIza" and be 39 chars)
    if not (isinstance(api_key, str) and api_key.startswith("AIza") and len(api_key) == 39):
        raise RuntimeError('GOOGLE_API_KEY appears to be malformed. It should start with "AIza" and be 39 characters long.')
    # Read and encode file
    with open(file_path, 'rb') as f:
        file_content = f.read()
    
    encoded_content = base64.b64encode(file_content).decode('utf-8')
    
    # Determine if it's a PDF or image
    file_ext = os.path.splitext(file_path)[1].lower()
    
    if file_ext == '.pdf':
        # For PDFs, use document text detection
        request_body = {
            "requests": [{
                "inputConfig": {
                    "content": encoded_content,
                    "mimeType": "application/pdf"
                },
                "features": [{"type": "DOCUMENT_TEXT_DETECTION"}],
                "imageContext": {"languageHints": ["en"]}
            }]
        }
        
        url = f"https://vision.googleapis.com/v1/files:annotate?key={api_key}"
    else:
        # For images, use regular text detection
        request_body = {
            "requests": [{
                "image": {"content": encoded_content},
                "features": [{"type": "TEXT_DETECTION"}]
            }]
        }
        
        url = f"https://vision.googleapis.com/v1/images:annotate?key={api_key}"
    
    # Make API request with retry
    response = make_post_request_with_retry(url, json=request_body)
    
    result = response.json()
    
    # Handle errors
    if 'error' in result:
        raise RuntimeError(f"Vision API error: {result['error']}")
    
    # Extract text from response
    if file_ext == '.pdf':
        # PDF response structure - handle nested responses
        responses = result.get('responses', [])
        if not responses:
            return ""
        
        full_text = ""
        for resp in responses:
            if 'error' in resp:
                raise RuntimeError(f"PDF processing error: {resp['error']}")
            elif 'responses' in resp:
                # Nested responses for PDF pages
                page_responses = resp['responses']
                for page_resp in page_responses:
                    if 'fullTextAnnotation' in page_resp:
                        page_text = page_resp['fullTextAnnotation'].get('text', '')
                        full_text += page_text + "\n"
                    elif 'textAnnotations' in page_resp and page_resp['textAnnotations']:
                        # Fallback to first text annotation
                        page_text = page_resp['textAnnotations'][0].get('description', '')
                        full_text += page_text + "\n"
            elif 'fullTextAnnotation' in resp:
                # Direct fullTextAnnotation (shouldn't happen for PDFs but handle it)
                full_text += resp['fullTextAnnotation'].get('text', '')
        
        return full_text.strip()
    else:
        # Image response structure
        responses = result.get('responses', [])
        if not responses:
            return ""
        
        resp = responses[0]
        if 'error' in resp:
            raise RuntimeError(f"Image processing error: {resp['error']}")
        
        if 'fullTextAnnotation' in resp:
            return resp['fullTextAnnotation'].get('text', '')
        elif 'textAnnotations' in resp and resp['textAnnotations']:
            # Fallback to first text annotation
            return resp['textAnnotations'][0].get('description', '')
        
        return ""


def read_text_file(file_path: str) -> str:
    """Read text file directly (no API needed) - wrapper for unified function."""
    return read_text_file_with_encoding(file_path)


def extract_text(input_path: str) -> str:
    """Main extract function - handles local files and Google Drive links."""
    temp_file = None
    
    try:
        # Check if input is a Google Drive URL
        if input_path.startswith('http') and is_google_drive_url(input_path):
            temp_file, file_ext = download_google_drive_file(input_path)
            
            if file_ext == '.pdf':
                return extract_text_vision_api(temp_file)
            else:
                return read_text_file(temp_file)
        
        # Local file processing
        if not os.path.exists(input_path):
            raise FileNotFoundError(f"File not found: {input_path}")
        
        # Check file type using unified utility
        file_ext = os.path.splitext(input_path)[1].lower()
        text_extensions, vision_extensions = get_supported_extensions()
        
        # Text files - read directly (no API cost)
        if file_ext in text_extensions:
            return read_text_file(input_path)
        
        # PDF and image files - use Vision API
        if file_ext in vision_extensions:
            return extract_text_vision_api(input_path)
        
        # Unknown file type - try to read as text first, then as binary
        try:
            return read_text_file(input_path)
        except:
            raise ValueError(f"Unsupported file format: {file_ext}")
    
    finally:
        # Clean up temporary file if created
        if temp_file and os.path.exists(temp_file):
            try:
                os.unlink(temp_file)
            except:
                pass
