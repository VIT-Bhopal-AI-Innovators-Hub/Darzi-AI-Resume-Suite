#!/usr/bin/env python3
"""
Production-ready FastAPI backend for Darzi AI Resume Suite
Combines local parser with AI-enhanced parsing, ATS analysis, and resume generation
"""

import uvicorn
import tempfile
import os
import json
import logging
from typing import Optional, Dict, Any, List, Union
from fastapi import FastAPI, Request, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from fastmcp import Client
from pydantic import BaseModel, AnyHttpUrl
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

import sys
import os
# Add current directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.parser.enhanced import EnhancedResumeParser
from utils.parser.core import ResumeParser  # Keep for compatibility
from utils.data_extractor import extract_text
from utils.data_extractor.utils import validate_file_type, format_file_size
from utils.ats import ATSScoreAnalyzer
from utils.resume_generator import generate_resume

# Configuration
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent.parent
MCP_SERVER_PATH = BASE_DIR / "local_mcp" / "server.py"
MCP_SERVER_URL = f"stdio://python {MCP_SERVER_PATH}"

# File size limits - Production optimized
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE_MB", "10")) * 1024 * 1024  # Default 10MB
MAX_FILES_COUNT = 10


class UrlPayload(BaseModel):
    url: AnyHttpUrl


class ResumeGenerationRequest(BaseModel):
    user_resume: Dict[str, Any]  # Parsed resume data
    resume_template: str  # LaTeX template code
    extra_info: Optional[Dict[str, str]] = None  # Additional info like LinkedIn, GitHub
    ats_score: Optional[int] = None  # Current ATS score (0-100)
    improvement_suggestions: Optional[List[str]] = None  # ATS improvement suggestions
    preferred_provider: Optional[str] = None  # Preferred LLM provider


# Global variables
client: Optional[Client] = None
enhanced_parser: Optional[EnhancedResumeParser] = None
resume_parser: Optional[ResumeParser] = None  # Keep for compatibility
ats_analyzer: Optional[ATSScoreAnalyzer] = None

#standard JSON schema for all parsers
RESUME_SCHEMA = {
    "name": "",
    "email": [],
    "mobile_number": [],
    "skills": [],
    "education": [],
    "experience": [],
    "summary": "",
    "certifications": [],
    "raw_text": "",
    "parsing_source": "",
    "confidence_score": 0.0
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    global client, enhanced_parser, resume_parser, ats_analyzer
    
    logger.info("🚀 Starting Darzi AI Resume Suite API...")
    
    # Initialize enhanced parser with LLM support
    try:
        enhanced_parser = EnhancedResumeParser()
        logger.info("✅ Enhanced parser initialized")
        
        # Also initialize local parser for compatibility
        resume_parser = ResumeParser()
        logger.info("✅ Local parser initialized")
        
        # Initialize ATS analyzer
        ats_analyzer = ATSScoreAnalyzer()
        logger.info("✅ ATS analyzer initialized")
    except Exception as e:
        logger.error(f"❌ Parser initialization failed: {e}")
        enhanced_parser = None
        resume_parser = None
        ats_analyzer = None
    
    # Initialize MCP client (optional, graceful degradation)
    try:
        if os.getenv("MCP_ENABLED", "false").lower() == "true":
            client = Client(MCP_SERVER_URL)
            await client.__aenter__()
            logger.info("✅ MCP client connected")
            
            # Test MCP connection
            tools = await client.list_tools()
            logger.info(f"📋 Available MCP tools: {[tool['name'] for tool in tools]}")
        else:
            logger.info("🔧 MCP client disabled via configuration")
            client = None
        
    except Exception as e:
        logger.warning(f"⚠️  MCP client connection failed (continuing without MCP): {e}")
        client = None
    
    logger.info("🎉 API startup complete!")
    yield
    
    # Shutdown
    logger.info("🔄 Shutting down API...")
    if client:
        try:
            await client.__aexit__(None, None, None)
            logger.info("✅ MCP client disconnected")
        except Exception as e:
            logger.warning(f"⚠️  Error during MCP shutdown: {e}")
    
    logger.info("✅ Shutdown complete!")


app = FastAPI(
    title="Darzi AI Resume Suite API",
    description="🤖 AI-powered resume processing with parsing, ATS analysis, and generation capabilities",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configuration (set API_CORS_ORIGINS to a comma-separated list, or "*" to allow all)
_cors_env = os.getenv("API_CORS_ORIGINS", "*").strip()
_allow_origins = ["*"] if _cors_env == "*" else [o.strip() for o in _cors_env.split(",") if o.strip()]

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def normalize_to_schema(data: Dict[str, Any], source: str = "unknown") -> Dict[str, Any]:
    normalized = RESUME_SCHEMA.copy()
    
    for key, default_value in RESUME_SCHEMA.items():
        if key in data:
            value = data[key]
            
            if key in ['email', 'mobile_number', 'skills', 'education', 'experience', 'certifications']:
                if isinstance(value, list):
                    normalized[key] = value
                elif isinstance(value, str) and value.strip():
                    normalized[key] = [value.strip()]
                else:
                    normalized[key] = []
            
            elif key in ['name', 'summary', 'raw_text', 'parsing_source']:
                normalized[key] = str(value) if value else ""
            
            elif key == 'confidence_score':
                try:
                    normalized[key] = float(value) if value else 0.0
                except (ValueError, TypeError):
                    normalized[key] = 0.0
            
            else:
                normalized[key] = value
    
    normalized['parsing_source'] = source
    return normalized

async def parse_with_local(text: str) -> Dict[str, Any]:            #parser esume using loccal parser
    if not resume_parser:
        raise HTTPException(status_code=500, detail="Local parser not available")
    
    try:
        result = {
            "name": resume_parser.extract_name(text),
            "email": resume_parser.extract_email(text),
            "mobile_number": resume_parser.extract_phone(text),
            "skills": resume_parser.extract_skills(text),
            "education": resume_parser.extract_education(text),
            "experience": resume_parser.extract_experience(text),
            "summary": "",  #local parser doesn't extract summary rn
            "certifications": [],  #local parser doesn't extract certifications too
            "raw_text": text[:500] + "..." if len(text) > 500 else text,
            "confidence_score": 0.7  #default confidence for local parser (added for later llm integration)
        }
        
        return normalize_to_schema(result, "local")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Local parsing failed: {str(e)}")

async def parse_with_mcp(text: str) -> Dict[str, Any]:      #Parse resume using MCP AI service
    if not client:
        raise HTTPException(status_code=503, detail="MCP service not available")
    
    try:
        result = await client.call_tool("parse_resume", {"text": text})
        return normalize_to_schema(result, "mcp")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MCP parsing failed: {str(e)}")

def merge_parsing_results(local_result: Dict[str, Any], mcp_result: Dict[str, Any]) -> Dict[str, Any]:
    merged = RESUME_SCHEMA.copy()
    
    #use MCP name if available, otherwise local
    merged['name'] = mcp_result.get('name') or local_result.get('name', '')
    
    #merge email (prefer non-empty results)
    merged['email'] = list(set(
        (mcp_result.get('email', []) or []) + 
        (local_result.get('email', []) or [])
    ))
    
    merged['mobile_number'] = list(set(
        (mcp_result.get('mobile_number', []) or []) + 
        (local_result.get('mobile_number', []) or [])
    ))
    
    merged['skills'] = list(set(
        (mcp_result.get('skills', []) or []) + 
        (local_result.get('skills', []) or [])
    ))
    
    merged['education'] = mcp_result.get('education', []) or local_result.get('education', [])
    
    merged['experience'] = mcp_result.get('experience', []) or local_result.get('experience', [])
    
    merged['summary'] = mcp_result.get('summary', '')
    merged['certifications'] = mcp_result.get('certifications', [])
    
    #using local raw text
    merged['raw_text'] = local_result.get('raw_text', '')
    
    local_conf = local_result.get('confidence_score', 0.7)
    mcp_conf = mcp_result.get('confidence_score', 0.8)
    merged['confidence_score'] = (local_conf + mcp_conf) / 2
    
    merged['parsing_source'] = 'hybrid'
    
    return merged


@app.get("/")
async def root():
    return {
        "message": "Darzi Resume Parser & ATS Optimizer API",
        "version": "2.0.0",
        "status": "running",
        "organization": "VIT Bhopal AI Innovators Hub",
        "description": "AI-powered resume parsing, text extraction, and ATS optimization",
        "services": {
            "local_parser": "available" if resume_parser else "unavailable",
            "mcp_ai_parser": "available" if client else "unavailable",
            "enhanced_parser": "available" if enhanced_parser else "unavailable",
            "ats_analyzer": "available" if ats_analyzer else "unavailable",
            "text_extraction": "available",
            "google_vision_api": "available" if os.getenv("GOOGLE_API_KEY") else "configure_required"
        },
        "endpoints": {
            "health": "/health",
            "parse_text": "/parse",
            "parse_pdf": "/parse-pdf",
            "parse_enhanced": "/parse-enhanced",
            "parse_llm_only": "/parse-llm-only", 
            "parse_local_only": "/parse-local-only",
            "extract_text": "/api/extract",
            "extract_url": "/api/extract-url",
            "optimize_ats": "/optimize-ats",
            "analyze_ats": "/analyze-ats",
            "parser_status": "/parser-status",
            "ats_status": "/ats-status",
            "mcp_status": "/mcp-status",
            "docs": "/docs"
        },
        "text_extraction": {
            "supported_formats": {
                "text_files": [".txt", ".md", ".csv", ".log", ".rtf"],
                "vision_files": [".pdf", ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".ico"]
            },
            "features": [
                "📄 PDF Text Extraction using Google Vision API",
                "📝 Text File Support (TXT, MD, CSV, LOG) - Free",
                "🔗 Google Drive Integration",
                "💰 Cost Optimized - Text files read directly, Vision API only for PDFs/images"
            ]
        },
        "features": [
            "🔍 Hybrid Resume Parsing (Local + AI)",
            "📊 ATS Compatibility Analysis",
            "📄 Advanced Text Extraction",
            "🔗 Google Drive Integration",
            "💡 Resume Optimization Suggestions",
            "🎯 Keyword Matching Analysis"
        ],
        "cost_information": {
            "resume_parsing": "Free (local parser)",
            "text_files": "Free (direct reading)",
            "pdf_images": "Google Vision API rates apply",
            "ai_parsing": "MCP service rates may apply"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": "2024-01-01T00:00:00Z",
        "components": {
            "api": "healthy",
            "local_parser": "healthy" if resume_parser else "unhealthy",
            "enhanced_parser": "healthy" if enhanced_parser else "unhealthy",
            "ats_analyzer": "healthy" if ats_analyzer else "unhealthy",
            "mcp_client": "healthy" if client else "unhealthy"
        },
        "capabilities": {
            "text_parsing": bool(resume_parser or client),
            "pdf_parsing": bool(resume_parser),
            "ai_enhancement": bool(client),
            "hybrid_parsing": bool(resume_parser and client),
            "llm_parsing": bool(enhanced_parser and enhanced_parser.llm_manager.is_llm_available()) if enhanced_parser else False,
            "ats_analysis": bool(ats_analyzer)
        }
    }

@app.get("/mcp-status")     #for checking MCP service status and available tools
async def mcp_status():
    if not client:
        return {
            "status": "disconnected",
            "message": "MCP client not available",
            "tools": []
        }
    
    try:
        tools = await client.list_tools()
        return {
            "status": "connected",
            "message": "MCP client connected successfully",
            "tools": [
                {
                    "name": tool.get("name", ""),
                    "description": tool.get("description", "")
                }
                for tool in tools
            ]
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"MCP client error: {str(e)}",
            "tools": []
        }

@app.post("/parse")
async def parse_resume_text(request: Request):
    try:
        # Read request body
        body_bytes = await request.body()
        text = body_bytes.decode("utf-8").strip()
        
        if not text:
            raise HTTPException(status_code=400, detail="Empty request body")
        
        if len(text) < 50:
            raise HTTPException(status_code=400, detail="Text too short to be a valid resume")
        
        local_available = bool(resume_parser)
        mcp_available = bool(client)
        
        if not local_available and not mcp_available:
            raise HTTPException(status_code=503, detail="No parsing services available")
        
        local_result = None
        mcp_result = None
        errors = {}
        
        if local_available:
            try:
                local_result = await parse_with_local(text)
            except Exception as e:
                errors['local_parser'] = str(e)
                print(f"Local parsing failed: {e}")
        
        if mcp_available:
            try:
                mcp_result = await parse_with_mcp(text)
            except Exception as e:
                errors['mcp_parser'] = str(e)
                print(f"MCP parsing failed: {e}")
        
        if local_result and mcp_result:
            final_result = merge_parsing_results(local_result, mcp_result)            #hybrid approach -> merge results
        elif local_result:
            final_result = local_result
        elif mcp_result:
            final_result = mcp_result
        else:
            raise HTTPException(status_code=500, detail="All parsing methods failed")
        
        response = {
            "success": True,
            "data": final_result,
            "metadata": {
                "text_length": len(text),
                "parsing_method": final_result['parsing_source'],
                "confidence": final_result['confidence_score']
            }
        }
        
        if errors:
            response['warnings'] = errors
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")

@app.post("/parse-pdf")
async def parse_resume_pdf(file: UploadFile = File(...)):       #Parse resume from PDF file Currently uses local parser only (MCP doesn't handle files directly)

    if not resume_parser:
        raise HTTPException(status_code=503, detail="PDF parsing service not available")

    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
        
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    MAX_SIZE = 10 * 1024 * 1024     #kept file size to 10mb
    
    tmp_path = None
    try:
        content = await file.read()
        
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")

        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name
        
        result = resume_parser.parse_resume(tmp_path)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        normalized_result = normalize_to_schema(result, "local_pdf")
        
        return {
            "success": True,
            "data": normalized_result,
            "metadata": {
                "filename": file.filename,
                "file_size": len(content),
                "parsing_method": "local_pdf",
                "confidence": normalized_result['confidence_score']
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF parsing failed: {str(e)}")
    
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except Exception as cleanup_error:
                print(f"Warning: Could not cleanup {tmp_path}: {cleanup_error}")

@app.post("/optimize-ats")
async def optimize_for_ats(request: Request):
    """Enhanced ATS optimization using LLM-powered analysis"""
    if not ats_analyzer:
        raise HTTPException(status_code=503, detail="ATS analyzer not available")
    
    try:
        body = await request.json()
        resume_text = body.get('resume_text', '')
        job_description = body.get('job_description', '')
        preferred_provider = body.get('preferred_provider')
        
        if not resume_text:
            raise HTTPException(status_code=400, detail="resume_text is required")
        
        if not job_description:
            raise HTTPException(status_code=400, detail="job_description is required")
        
        # Get comprehensive ATS analysis using LLM
        ats_analysis = ats_analyzer.analyze_ats_score(
            resume_text, 
            job_description,
            preferred_provider
        )
        
        return {
            "success": True,
            "data": {
                "ats_analysis": ats_analysis,
                "overall_score": ats_analysis.get('overall_score', 0),
                "predicted_pass_rate": ats_analysis.get('predicted_ats_pass_rate', 0),
                "summary": ats_analysis.get('summary', ''),
                "improvement_priority": ats_analysis.get('improvement_priority', {}),
                "optimization_tips": ats_analysis.get('ats_optimization_tips', [])
            },
            "metadata": {
                "analysis_method": ats_analysis.get('analysis_method', 'unknown'),
                "provider_used": ats_analysis.get('provider_used', 'unknown'),
                "confidence_score": ats_analysis.get('confidence_score', 0.0),
                "analysis_timestamp": ats_analysis.get('analysis_timestamp'),
                "resume_length": len(resume_text),
                "job_description_length": len(job_description)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ATS optimization failed: {str(e)}")


# Enhanced Parser Endpoints with LLM Integration
@app.get("/ats-status")
def get_ats_status():
    """Get status of the ATS analyzer"""
    if ats_analyzer is None:
        raise HTTPException(status_code=503, detail="ATS analyzer not initialized")
    
    try:
        status = ats_analyzer.get_analyzer_status()
        return {
            "status": "ok",
            **status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get ATS status: {str(e)}")

@app.post("/analyze-ats")
async def analyze_ats_score(request: Request):
    """Dedicated ATS analysis endpoint with detailed scoring"""
    if not ats_analyzer:
        raise HTTPException(status_code=503, detail="ATS analyzer not available")
    
    try:
        body = await request.json()
        resume_text = body.get('resume_text', '')
        job_description = body.get('job_description', '')
        preferred_provider = body.get('preferred_provider')
        
        if not resume_text:
            raise HTTPException(status_code=400, detail="resume_text is required")
        
        if not job_description:
            raise HTTPException(status_code=400, detail="job_description is required")
        
        # Perform detailed ATS analysis
        analysis = ats_analyzer.analyze_ats_score(
            resume_text, 
            job_description,
            preferred_provider
        )
        
        return {
            "success": True,
            "analysis": analysis,
            "metadata": {
                "resume_length": len(resume_text),
                "job_description_length": len(job_description),
                "analysis_timestamp": analysis.get('analysis_timestamp')
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ATS analysis failed: {str(e)}")

@app.get("/parser-status")
def get_parser_status():
    """Get status of all available parsers (local and LLM)"""
    if enhanced_parser is None:
        raise HTTPException(status_code=503, detail="Enhanced parser not initialized")
    
    try:
        status = enhanced_parser.get_parser_status()
        return {
            "status": "ok",
            **status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get parser status: {str(e)}")

@app.post("/parse-enhanced")
async def parse_enhanced(
    file: UploadFile = File(...),
    use_llm: bool = True,
    preferred_provider: Optional[str] = None,
    return_raw: bool = False
):
    """
    Enhanced resume parsing with LLM primary and local fallback
    
    Args:
        file: Resume file to parse
        use_llm: Whether to try LLM parsing first (default: True)
        preferred_provider: Preferred LLM provider (optional)
        return_raw: Return raw parsed data instead of normalized structure
    """
    if enhanced_parser is None:
        raise HTTPException(status_code=503, detail="Enhanced parser not initialized")
    
    try:
        # Validate file
        validate_file_type(file.filename)
        
        # Extract text using temporary file
        file_content = await file.read()
        
        # Create temporary file with appropriate extension
        file_extension = os.path.splitext(file.filename)[1] if file.filename else '.txt'
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
            tmp_file.write(file_content)
            tmp_path = tmp_file.name
        
        try:
            text = extract_text(tmp_path)
        finally:
            # Clean up temporary file
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
        
        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the file")
        
        # Parse with enhanced parser
        result = enhanced_parser.parse_resume(
            text, 
            use_llm=use_llm, 
            preferred_provider=preferred_provider,
            return_raw=return_raw
        )
        
        return {
            "status": "success",
            "filename": file.filename,
            "file_size": format_file_size(len(file_content)),
            "text_length": len(text),
            **result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")

@app.post("/parse-llm-only")
async def parse_llm_only(
    file: UploadFile = File(...),
    preferred_provider: Optional[str] = None,
    return_raw: bool = False
):
    """Parse resume using only LLM (no local fallback)"""
    if enhanced_parser is None:
        raise HTTPException(status_code=503, detail="Enhanced parser not initialized")
    
    try:
        # Validate file
        validate_file_type(file.filename)
        
        # Extract text using temporary file
        file_content = await file.read()
        
        # Create temporary file with appropriate extension
        file_extension = os.path.splitext(file.filename)[1] if file.filename else '.txt'
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
            tmp_file.write(file_content)
            tmp_path = tmp_file.name
        
        try:
            text = extract_text(tmp_path)
        finally:
            # Clean up temporary file
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
        
        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the file")
        
        # Parse with LLM only
        result = enhanced_parser.parse_resume_llm_only(text, preferred_provider, return_raw)
        
        return {
            "status": "success",
            "filename": file.filename,
            "file_size": format_file_size(len(file_content)),
            "text_length": len(text),
            **result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse with LLM: {str(e)}")

@app.post("/parse-local-only")
async def parse_local_only(
    file: UploadFile = File(...),
    return_raw: bool = False
):
    """Parse resume using only local parser"""
    if enhanced_parser is None:
        raise HTTPException(status_code=503, detail="Enhanced parser not initialized")
    
    try:
        # Validate file
        validate_file_type(file.filename)
        
        # Extract text using temporary file
        file_content = await file.read()
        
        # Create temporary file with appropriate extension
        file_extension = os.path.splitext(file.filename)[1] if file.filename else '.txt'
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
            tmp_file.write(file_content)
            tmp_path = tmp_file.name
        
        try:
            text = extract_text(tmp_path)
        finally:
            # Clean up temporary file
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
        
        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the file")
        
        # Parse with local parser only
        result = enhanced_parser.parse_resume_local_only(text, return_raw)
        
        return {
            "status": "success",
            "filename": file.filename,
            "file_size": format_file_size(len(file_content)),
            "text_length": len(text),
            **result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse with local parser: {str(e)}")


# Resume Generation Endpoint
@app.post("/generate-resume")
async def generate_resume_endpoint(request: ResumeGenerationRequest):
    """
    Generate LaTeX resume code using LLM based on user data and template.
    
    This endpoint takes user resume data, a LaTeX template, and optional ATS feedback
    to generate a complete resume in LaTeX format.
    
    Args:
        request: ResumeGenerationRequest containing:
            - user_resume: Parsed resume data (required)
            - resume_template: LaTeX template code (required) 
            - extra_info: Additional information like LinkedIn, GitHub (optional)
            - ats_score: Current ATS score 0-100 (optional)
            - improvement_suggestions: List of ATS improvement suggestions (optional)
            - preferred_provider: Preferred LLM provider (optional)
    
    Returns:
        JSON response with:
            - success: Whether generation was successful
            - latex_code: Generated LaTeX code
            - provider_used: LLM provider that was used
            - metadata: Additional generation metadata
            - error: Error message if generation failed
    """
    try:
        # Generate resume using the utility function
        result = generate_resume(
            user_resume=request.user_resume,
            resume_template=request.resume_template,
            extra_info=request.extra_info,
            ats_score=request.ats_score,
            improvement_suggestions=request.improvement_suggestions,
            preferred_provider=request.preferred_provider
        )
        
        if result["success"]:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "latex_code": result["latex_code"],
                    "provider_used": result["provider_used"],
                    "metadata": result["metadata"]
                }
            )
        else:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "error": result["error"],
                    "provider_used": result["provider_used"],
                    "metadata": result["metadata"]
                }
            )
            
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": f"Resume generation failed: {str(e)}",
                "provider_used": None,
                "metadata": {}
            }
        )


@app.get("/generate-resume/status")
def get_resume_generation_status():
    """
    Check the status of resume generation service.
    
    Returns:
        JSON response with:
            - available: Whether resume generation is available
            - providers: List of available LLM providers
            - service: Service name and status
    """
    try:
        from utils.resume_generator import resume_generator
        
        available_providers = resume_generator.get_available_providers()
        is_available = resume_generator.is_available()
        
        return {
            "available": is_available,
            "providers": available_providers,
            "service": "Resume Generator",
            "status": "operational" if is_available else "no_providers_available"
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "available": False,
                "providers": [],
                "service": "Resume Generator",
                "status": "error",
                "error": str(e)
            }
        )


# Health and Status Endpoints
@app.get("/health")
def health_check():
    """Comprehensive health check endpoint for monitoring and load balancers."""
    try:
        health_status = {
            "status": "healthy",
            "version": "1.0.0",
            "timestamp": str(os.environ.get("TIMESTAMP", "unknown")),
            "services": {
                "enhanced_parser": enhanced_parser is not None,
                "local_parser": resume_parser is not None,
                "ats_analyzer": ats_analyzer is not None,
                "mcp_client": client is not None,
                "google_vision_api": bool(os.getenv("GOOGLE_API_KEY")),
                "gemini_api": bool(os.getenv("GEMINI_API_KEY"))
            },
            "environment": {
                "app_mode": os.getenv("APP_MODE", "api"),
                "port": os.getenv("PORT", "7860"),
                "debug": os.getenv("DEBUG", "false"),
                "max_file_size_mb": int(os.getenv("MAX_FILE_SIZE_MB", "10"))
            }
        }
        
        # Check if critical services are available
        critical_services = ["enhanced_parser", "local_parser", "ats_analyzer"]
        if not all(health_status["services"][service] for service in critical_services):
            health_status["status"] = "degraded"
            logger.warning("⚠️  Some critical services are unavailable")
        
        return JSONResponse(content=health_status, status_code=200)
        
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        return JSONResponse(
            content={"status": "unhealthy", "error": str(e)},
            status_code=503
        )

@app.get("/healthz")
def healthz():
    """Simple health check endpoint for legacy compatibility."""
    return {"status": "ok", "service": "darzi-ai-resume-suite"}

@app.get("/status")
def api_status():
    """Detailed API status with feature availability."""
    return {
        "api_name": "Darzi AI Resume Suite",
        "version": "1.0.0",
        "features": {
            "resume_parsing": {
                "local": resume_parser is not None,
                "enhanced": enhanced_parser is not None,
                "mcp": client is not None
            },
            "ats_analysis": ats_analyzer is not None,
            "resume_generation": True,  # Always available
            "text_extraction": bool(os.getenv("GOOGLE_API_KEY"))
        },
        "llm_providers": {
            "gemini": bool(os.getenv("GEMINI_API_KEY"))
        }
    }


@app.post("/api/extract")
async def extract_from_file(file: UploadFile = File(...)):
    """Extract text from uploaded files (PDF, images, text files)."""
    # Check file size
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, 
            detail=f"File too large. Maximum size is {format_file_size(MAX_FILE_SIZE)}. Your file is {format_file_size(file.size)}."
        )
    
    # Validate file type
    is_valid, file_type = validate_file_type(file.filename)
    if not is_valid:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {file.filename}. Supported types: PDF, images (PNG, JPG, etc.), and text files (TXT, MD, CSV)."
        )

    # Ensure API key for vision types
    if file_type == "vision" and not os.getenv("GOOGLE_API_KEY"):
        raise HTTPException(
            status_code=400, 
            detail="Google Vision API key is required for PDF and image files. Please configure GOOGLE_API_KEY environment variable."
        )

    # Persist to temp and extract
    suffix = os.path.splitext(file.filename)[1]
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            content = await file.read()
            
            # Double-check file size after reading
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size is {format_file_size(MAX_FILE_SIZE)}."
                )
            
            tmp.write(content)
            tmp_path = tmp.name

        text = extract_text(tmp_path)
        size = format_file_size(len(content))
        return JSONResponse({
            "success": True,
            "text": text,
            "file_info": {
                "name": file.filename,
                "size": size,
                "type": file_type,
            },
        })
    except HTTPException:
        raise
    except Exception as e:
        error_msg = str(e)
        if "Vision API error" in error_msg:
            raise HTTPException(status_code=400, detail=f"Failed to process file with Google Vision API: {error_msg}")
        elif "Google Drive" in error_msg:
            raise HTTPException(status_code=400, detail=f"Failed to download from Google Drive: {error_msg}")
        else:
            raise HTTPException(status_code=500, detail=f"Failed to extract text: {error_msg}")
    finally:
        try:
            if tmp_path and os.path.exists(tmp_path):
                os.unlink(tmp_path)
        except Exception:
            pass


@app.post("/api/extract-url")
async def extract_from_url(payload: UrlPayload):
    """Extract text from Google Drive URLs."""
    try:
        text = extract_text(str(payload.url))
        return JSONResponse({
            "success": True,
            "text": text,
            "file_info": {
                "name": "from_url",
                "size": None,
                "type": "auto",
            },
        })
    except Exception as e:
        error_msg = str(e)
        if "Vision API error" in error_msg:
            raise HTTPException(status_code=400, detail=f"Failed to process file with Google Vision API: {error_msg}")
        elif "Google Drive" in error_msg or "drive.google.com" in error_msg:
            raise HTTPException(status_code=400, detail=f"Failed to download from Google Drive: {error_msg}")
        elif "Missing GOOGLE_API_KEY" in error_msg:
            raise HTTPException(status_code=400, detail="Google Vision API key is required for PDF and image files from URLs.")
        else:
            raise HTTPException(status_code=500, detail=f"Failed to extract text from URL: {error_msg}")


if __name__ == "__main__":
    uvicorn.run(
        "app:app", 
        host="0.0.0.0", 
        port=7860, 
        reload=True,
        log_level="info"
    )