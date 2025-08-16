#!/usr/bin/env python3
"""
FastAPI backend with integrated MCP for resume parsing and text extraction
Combines local parser with AI-enhanced MCP parsing and Google Vision API text extraction
"""

import uvicorn
import tempfile
import os
import json
from typing import Optional, Dict, Any, List, Union
from fastapi import FastAPI, Request, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from fastmcp import Client
from pydantic import BaseModel, AnyHttpUrl

import sys
import os
# Add src directory to Python path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.parser import ResumeParser
from data_extractor import extract_text
from data_extractor.utils import validate_file_type, format_file_size

# Configuration
import os
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent.parent.parent
MCP_SERVER_PATH = BASE_DIR / "local_mcp" / "server.py"
MCP_SERVER_URL = f"stdio://python {MCP_SERVER_PATH}"

# File size limits (100MB max per file, 10 files max)
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
MAX_FILES_COUNT = 10


class UrlPayload(BaseModel):
    url: AnyHttpUrl


# Global variables
client: Optional[Client] = None
resume_parser: Optional[ResumeParser] = None

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
    global client, resume_parser
    
    print("Starting Darzi Resume Parser API...") #starter
    
    #initialize local parser
    try:
        resume_parser = ResumeParser()
        print("Local parser initialized")
    except Exception as e:
        print(f"Local parser failed: {e}")
        resume_parser = None
    
    #initialize MCP client
    try:
        client = Client(MCP_SERVER_URL)
        await client.__aenter__()
        print("MCP client connected")
        
        #test MCP connection
        tools = await client.list_tools()
        print(f"Available MCP tools: {[tool['name'] for tool in tools]}")
        
    except Exception as e:
        print(f"MCP client connection failed: {e}")
        client = None
    
    yield
    
    #shutdown
    print("Shutting down...")
    if client:
        try:
            await client.__aexit__(None, None, None)
            print("MCP client disconnected")
        except Exception as e:
            print(f"Error during MCP shutdown: {e}")
    
    print("Shutdown complete!")


app = FastAPI(
    title="Darzi Resume Parser & ATS Optimizer",
    description="AI-powered resume parsing with ATS optimization and text extraction",
    version="2.0.0",
    lifespan=lifespan
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
            "text_extraction": "available",
            "google_vision_api": "available" if os.getenv("GOOGLE_API_KEY") else "configure_required"
        },
        "endpoints": {
            "health": "/health",
            "parse_text": "/parse",
            "parse_pdf": "/parse-pdf",
            "extract_text": "/api/extract",
            "extract_url": "/api/extract-url",
            "optimize_ats": "/optimize-ats",
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
            "mcp_client": "healthy" if client else "unhealthy"
        },
        "capabilities": {
            "text_parsing": bool(resume_parser or client),
            "pdf_parsing": bool(resume_parser),
            "ai_enhancement": bool(client),
            "hybrid_parsing": bool(resume_parser and client)
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
    try:
        body = await request.json()
        resume_text = body.get('resume_text', '')
        job_description = body.get('job_description', '')
        
        if not resume_text:
            raise HTTPException(status_code=400, detail="resume_text is required")
        
        try:
            if resume_parser and client:
                local_result = await parse_with_local(resume_text)
                mcp_result = await parse_with_mcp(resume_text)
                parsed_resume = merge_parsing_results(local_result, mcp_result)
            elif client:
                parsed_resume = await parse_with_mcp(resume_text)
            elif resume_parser:
                parsed_resume = await parse_with_local(resume_text)
            else:
                raise HTTPException(status_code=503, detail="No parsing service available")
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to parse resume: {str(e)}")
        
        ats_suggestions = analyze_ats_compatibility(parsed_resume, job_description)
        
        return {
            "success": True,
            "data": {
                "parsed_resume": parsed_resume,
                "ats_score": ats_suggestions["score"],
                "suggestions": ats_suggestions["suggestions"],
                "optimized_sections": ats_suggestions["optimized_sections"]
            },
            "metadata": {
                "optimization_method": "rule_based",
                "job_description_provided": bool(job_description)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ATS optimization failed: {str(e)}")

def analyze_ats_compatibility(resume_data: Dict[str, Any], job_description: str = "") -> Dict[str, Any]:
    score = 0
    max_score = 100
    suggestions = []
    optimized_sections = {}
    
    #check basic information completeness (20 points)
    if resume_data.get('name'):
        score += 5
    else:
        suggestions.append("Add your full name at the top of the resume")
    
    if resume_data.get('email'):
        score += 5
    else:
        suggestions.append("Include a professional email address")
    
    if resume_data.get('mobile_number'):
        score += 5
    else:
        suggestions.append("Add your phone number")
    
    if resume_data.get('skills'):
        score += 5
    else:
        suggestions.append("Include a skills section with relevant technical and soft skills")
    
    #check skills section quality (25 points)
    skills = resume_data.get('skills', [])
    if len(skills) >= 5:
        score += 10
        if len(skills) >= 10:
            score += 5
    else:
        suggestions.append("Add more skills (aim for 10-15 relevant skills)")
    
    #check for technical skills
    technical_keywords = ['python', 'java', 'javascript', 'sql', 'html', 'css', 'react', 'node', 'aws', 'docker']
    tech_skills_found = [skill for skill in skills if any(tech.lower() in skill.lower() for tech in technical_keywords)]
    if tech_skills_found:
        score += 10
    else:
        suggestions.append("Include more technical skills relevant to your field")
    
    #check experience section (25 points)
    experience = resume_data.get('experience', [])
    if experience:
        score += 10
        if len(experience) >= 2:
            score += 5
        
        #check for quantified achievements
        exp_text = str(experience).lower()
        if any(indicator in exp_text for indicator in ['%', '$', 'increased', 'decreased', 'improved', 'reduced']):
            score += 10
        else:
            suggestions.append("Add quantified achievements to your experience (e.g., 'Increased efficiency by 20%')")
    else:
        suggestions.append("Include work experience with specific achievements")
    
    #check education section (15 points)
    education = resume_data.get('education', [])
    if education:
        score += 15
    else:
        suggestions.append("Add your educational background")
    
    #check summary/objective (15 points)
    summary = resume_data.get('summary', '')
    if summary and len(summary) > 50:
        score += 15
    else:
        suggestions.append("Add a professional summary (2-3 sentences highlighting your key strengths)")
    
    #job description keyword matching (if provided)
    if job_description:
        keyword_analysis = analyze_keywords_match(resume_data, job_description)
        optimized_sections['keywords'] = keyword_analysis
        
        if keyword_analysis['match_percentage'] >= 70:
            score += 0  #already good ig
        elif keyword_analysis['match_percentage'] >= 50:
            suggestions.append(f"Consider adding these missing keywords: {', '.join(keyword_analysis['missing_keywords'][:5])}")
        else:
            suggestions.append("Significantly improve keyword matching with the job description")
    
    #ATS-friendly formatting suggestions
    formatting_suggestions = []
    
    resume_text_lower = resume_data.get('raw_text', '').lower()
    standard_sections = ['experience', 'education', 'skills', 'summary']
    missing_sections = [section for section in standard_sections if section not in resume_text_lower]
    
    if missing_sections:
        formatting_suggestions.append(f"Use standard section headers: {', '.join(missing_sections)}")
    
    formatting_suggestions.extend([
        "Use simple, clean formatting without graphics or unusual fonts",
        "Avoid tables, text boxes, and columns",
        "Use bullet points for achievements and responsibilities",
        "Save as PDF to preserve formatting",
        "Use standard fonts like Arial, Calibri, or Times New Roman"
    ])
    
    optimized_sections['formatting'] = formatting_suggestions
    
    final_score = min(score, max_score)
    
    #score based sugesstion
    if final_score < 50:
        suggestions.insert(0, "Your resume needs significant improvement for ATS compatibility")
    elif final_score < 70:
        suggestions.insert(0, "Your resume is moderately ATS-friendly but has room for improvement")
    elif final_score < 85:
        suggestions.insert(0, "Your resume is well-optimized for ATS with minor improvements needed")
    else:
        suggestions.insert(0, "Excellent! Your resume is highly optimized for ATS systems")
    
    return {
        "score": final_score,
        "max_score": max_score,
        "suggestions": suggestions[:10],  # Limit to top 10 suggestions
        "optimized_sections": optimized_sections
    }

def analyze_keywords_match(resume_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
    job_keywords = extract_job_keywords(job_description)
    
    resume_text = ' '.join([
        resume_data.get('summary', ''),
        ' '.join(resume_data.get('skills', [])),
        str(resume_data.get('experience', [])),
        str(resume_data.get('education', []))
    ]).lower()
    
    matching_keywords = []
    missing_keywords = []
    
    for keyword in job_keywords:
        if keyword.lower() in resume_text:
            matching_keywords.append(keyword)
        else:
            missing_keywords.append(keyword)
    
    match_percentage = (len(matching_keywords) / len(job_keywords) * 100) if job_keywords else 0
    
    return {
        "job_keywords": job_keywords,
        "matching_keywords": matching_keywords,
        "missing_keywords": missing_keywords,
        "match_percentage": round(match_percentage, 1),
        "total_keywords": len(job_keywords)
    }

def extract_job_keywords(job_description: str) -> List[str]:          
    keyword_patterns = [
        #programming languages
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
        #web techn..
        'html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
        #databases
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite',
        #cloud & DevOps
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible',
        #data & AI
        'machine learning', 'data science', 'tensorflow', 'pytorch', 'pandas', 'numpy',
        #tools
        'git', 'jira', 'confluence', 'agile', 'scrum', 'ci/cd',
        #soft skills
        'leadership', 'communication', 'teamwork', 'problem solving', 'analytical'
    ]
    
    found_keywords = []
    job_text_lower = job_description.lower()
    
    for keyword in keyword_patterns:
        if keyword in job_text_lower:
            found_keywords.append(keyword)
    
    import re
    capitalized_words = re.findall(r'\b[A-Z][a-zA-Z]+\b', job_description)
    technical_caps = [word for word in capitalized_words if len(word) > 3 and word not in ['The', 'And', 'For', 'With']]
    
    found_keywords.extend(technical_caps[:10])  #limit to 10 additional terms
    
    return list(set(found_keywords))  #for removing duplicates


# Text Extraction Endpoints
@app.get("/healthz")
def healthz():
    """Health check endpoint for text extraction service."""
    return {"status": "ok"}


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
        "main:app", 
        host="0.0.0.0", 
        port=7860, 
        reload=True,
        log_level="info"
    )