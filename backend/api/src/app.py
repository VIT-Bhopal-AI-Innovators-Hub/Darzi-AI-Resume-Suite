import os
import json
import asyncio
import tempfile
from pathlib import Path
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import RedirectResponse

try:
    import docx
except Exception:
    docx = None

from utils.llm.manager import LLMManager
from utils.data_extractor.core import extract_text as vision_extract_text


app = FastAPI(title="DARZI AI Resume Suite API", openapi_url="/openapi.json")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateResumePayload(BaseModel):
    data: Dict[str, Any]
    preferred_provider: Optional[str] = None

class AutoFixPayload(BaseModel):
    field: str
    context: Dict[str, Any]
    constraints: Optional[Dict[str, Any]] = None
    preferred_provider: Optional[str] = None


@app.get("/")
async def root():
    return RedirectResponse("https://github.com/VIT-Bhopal-AI-Innovators-Hub/Darzi-AI-Resume-Suite")

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring and load balancers"""
    try:
        # Test LLM availability
        llm = _get_llm()
        llm_available = llm.is_llm_available() if llm else False
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "llm": "available" if llm_available else "unavailable",
                "vision_api": "available",  # Google Vision API integration
                "api": "available"
            },
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

def _decode_text_bytes(b: bytes) -> str:
    try:
        return b.decode("utf-8")
    except UnicodeDecodeError:
        return b.decode("latin-1", errors="replace")


# async def _extract_text_for_file(upload: UploadFile) -> str:
#     filename = upload.filename or "uploaded"
#     suffix = filename.lower()
#     content = await upload.read()

#     # .txt locally only
#     if suffix.endswith(".txt"):
#         return _decode_text_bytes(content)

#     # .docx via python-docx if available
#     if suffix.endswith(".docx") and docx is not None:
#         try:
#             with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
#                 tmp.write(content)
#                 tmp.flush()
#                 tmp_path = tmp.name
#             try:
#                 d = docx.Document(tmp_path)  # type: ignore
#                 text = "\n".join(p.text for p in d.paragraphs)
#                 if text.strip():
#                     return text
#             finally:
#                 try:
#                     os.remove(tmp_path)
#                 except OSError:
#                     pass
#         except Exception:
#             pass

#     # PDFs/images/others: try Google Vision util first
#     try:
#         ext = Path(filename).suffix or ""
#         with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
#             tmp.write(content)
#             tmp.flush()
#             tmp_path = tmp.name
#         try:
#             text = vision_extract_text(tmp_path)
#             if isinstance(text, dict):
#                 text = text.get("text", "")
#             if isinstance(text, str) and text.strip():
#                 return text
#         finally:
#             try:
#                 os.remove(tmp_path)
#             except OSError:
#                 pass
#     except Exception:
#         pass

#     # Fallback: best-effort local decoding
#     return _decode_text_bytes(content)


async def _extract_text_for_file(upload: UploadFile) -> str:
    filename = upload.filename or "uploaded"
    suffix = filename.lower()
    content = await upload.read()

    if suffix.endswith(".txt"):
        return _decode_text_bytes(content)

    if suffix.endswith(".docx") and docx is not None:
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
                tmp.write(content)
                tmp.flush()
                tmp_path = tmp.name
            try:
                d = docx.Document(tmp_path)
                text = "\n".join(p.text for p in d.paragraphs)
                if text.strip():
                    return text
            finally:
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass
        except Exception:
            pass

    #PDFs - Using proper PDF text extraction instead of vision (bcoz it's not working)
    if suffix.endswith(".pdf"):
        extracted_text = ""
        
        #Trying PyPDF2
        try:
            import PyPDF2
            from io import BytesIO
            
            pdf_reader = PyPDF2.PdfReader(BytesIO(content))
            text_parts = []
            
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text and page_text.strip():
                        text_parts.append(page_text)
                        print(f"PyPDF2: Extracted {len(page_text)} chars from page {page_num + 1}")
                except Exception as e:
                    print(f"PyPDF2: Failed to extract page {page_num + 1}: {e}")
            
            extracted_text = "\n\n".join(text_parts)
            
            if extracted_text.strip() and len(extracted_text) > 100:
                print(f"PyPDF2: Successfully extracted {len(extracted_text)} characters total")
                # # Debug: Show sample of extracted text
                # print("PyPDF2 SAMPLE:")
                # print(repr(extracted_text[:500]))
                return extracted_text
            else:
                print(f"PyPDF2: Extracted text too short ({len(extracted_text)} chars)")
                
        except Exception as e:
            print(f"PyPDF2 extraction failed: {e}")

        #Trying pdfplumber as fallback (M2)
        try:
            import pdfplumber
            from io import BytesIO
            
            with pdfplumber.open(BytesIO(content)) as pdf:
                text_parts = []
                for page_num, page in enumerate(pdf.pages):
                    try:
                        page_text = page.extract_text()
                        if page_text and page_text.strip():
                            text_parts.append(page_text)
                            # print(f"pdfplumber: Extracted {len(page_text)} chars from page {page_num + 1}")
                    except Exception as e:
                        print(f"pdfplumber: Failed to extract page {page_num + 1}: {e}")
                
                extracted_text = "\n\n".join(text_parts)
                
                if extracted_text.strip() and len(extracted_text) > 100:
                    print(f"pdfplumber: Successfully extracted {len(extracted_text)} characters total")
                    # print("pdfplumber SAMPLE:")
                    # print(repr(extracted_text[:500]))             for debugging
                    return extracted_text
                else:
                    print(f"pdfplumber: Extracted text too short ({len(extracted_text)} chars)")
                    
        except Exception as e:
            print(f"pdfplumber extraction failed: {e}")

        #Trying pymupdf (fitz) as last resort for PDFs (M3)
        try:
            import fitz  #PyMuPDF
            from io import BytesIO
            
            doc = fitz.open(stream=content, filetype="pdf")
            text_parts = []
            
            for page_num in range(doc.page_count):
                try:
                    page = doc[page_num]
                    page_text = page.get_text()
                    if page_text and page_text.strip():
                        text_parts.append(page_text)
                        print(f"PyMuPDF: Extracted {len(page_text)} chars from page {page_num + 1}")
                except Exception as e:
                    print(f"PyMuPDF: Failed to extract page {page_num + 1}: {e}")
            
            doc.close()
            extracted_text = "\n\n".join(text_parts)
            
            if extracted_text.strip() and len(extracted_text) > 100:
                print(f"PyMuPDF: Successfully extracted {len(extracted_text)} characters total")
                # print("PyMuPDF SAMPLE:")
                # print(repr(extracted_text[:500]))     for debugging hehe
                return extracted_text
            else:
                print(f"PyMuPDF: Extracted text too short ({len(extracted_text)} chars)")
                
        except Exception as e:
            print(f"PyMuPDF extraction failed: {e}")

    #Images/others: try Google Vision (only for images, not PDFs) 
    if not suffix.endswith(".pdf"):  #will not use vision for PDFs anymore
        try:
            ext = Path(filename).suffix or ""
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                tmp.write(content)
                tmp.flush()
                tmp_path = tmp.name
            try:
                text = vision_extract_text(tmp_path)
                if isinstance(text, dict):
                    text = text.get("text", "")
                if isinstance(text, str) and text.strip():
                    return text
            finally:
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass
        except Exception:
            pass

    #Fallback: basic text decoding (shouldn't be reached for PDFs) 
    return _decode_text_bytes(content)





async def _parse_text(text: str, llm: Optional[LLMManager]) -> Dict[str, Any]:
    """Use LLM to structure the raw text into proper JSON format"""
    if not text or not text.strip():
        return {"error": "Empty text provided"}
    # print("="*50)
    # print("EXTRACTED TEXT SAMPLE:")
    # print("First 1000 characters:")           debugging purppose
    # print(repr(text[:1000]))
    # print("\nLast 1000 characters:")  
    # print(repr(text[-1000:]))
    # print("="*50)
    
    try:
        if llm:
            structured_data = await _llm_structure_resume(text, llm)
            print(f"LLM returned: {structured_data}")
            if structured_data:
                return structured_data
        
        return _create_basic_structure(text)
        
    except Exception as e:
        return {"error": f"Failed to parse text: {str(e)}", "raw_text": text}


async def _llm_structure_resume(text: str, llm: LLMManager) -> Optional[Dict[str, Any]]:
    """Use LLM to structure resume text into JSON"""
    
    try:

        # print(f"=== SENDING TO GEMINI ===")
        # print(f"Text length: {len(text)}")
        # print(f"First 200 chars: {repr(text[:200])}")

        #Use the LLM manager's built-in parsing method
        structured_data = llm.parse_resume_with_llm(text)
        
        # print(f"=== GEMINI RESPONSE ===")
        # print(f"Response type: {type(structured_data)}")
        # print(f"Response keys: {list(structured_data.keys()) if isinstance(structured_data, dict) else 'Not a dict'}")
        # print(f"Full response: {structured_data}")

        # Validate the structure has required fields
        if isinstance(structured_data, dict) and len(structured_data) > 0:
            return structured_data
                
    except Exception as e:
        print(f"LLM parsing error: {str(e)}")
        return None
    
    return None


def _create_basic_structure(text: str) -> Dict[str, Any]:
    """Create a minimal basic structure - only used if LLM completely fails"""
    contact = _extract_basic_contact(text)
    
    # Return minimal structure with only what we can extract
    result = {
        "extraction_metadata": {
            "method": "basic_fallback",
            "text_length": len(text),
            "extraction_timestamp": datetime.utcnow().isoformat(),
            "note": "LLM parsing failed, minimal extraction returned"
        }
    }
    
    # Only add contact information if we found any
    if contact:
        result["contact_information"] = contact
    
    return result


def _extract_basic_contact(text: str) -> Dict[str, Any]:
    """Extract basic contact info from text"""
    import re
    contact = {}
    
    # Extract name (first non-empty line)
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        contact["full_name"] = lines[0]
    
    # Extract email
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    if email_match:
        contact["email"] = email_match.group()
    
    # Extract phone
    phone_match = re.search(r'(\+\d{1,3}\s?)?[\(\d][\d\s\-\(\)]{8,15}', text)
    if phone_match:
        contact["phone"] = phone_match.group().strip()
    
    return contact


def _remove_duplicates(data: Dict[str, Any]) -> Dict[str, Any]:
    """Remove duplicate fields and nested raw data - kept for compatibility"""
    if not isinstance(data, dict):
        return data
    
    # Remove work_experience if experience exists
    if 'work_experience' in data and 'experience' in data:
        del data['work_experience']
    elif 'work_experience' in data:
        # Rename work_experience to experience
        data['experience'] = data['work_experience']
        del data['work_experience']
    
    # Remove any raw_parsed_data or additional_sections that contain duplicates
    if 'raw_parsed_data' in data:
        del data['raw_parsed_data']
    
    if 'additional_sections' in data:
        del data['additional_sections']
        
    return data


def _ensure_resume_schema(data: Dict[str, Any]) -> Dict[str, Any]:
    """Return data as-is, allowing LLM to dynamically decide structure"""
    if not isinstance(data, dict):
        return {}
    
    # Simply return the data without forcing any predefined schema
    # The LLM should decide what fields exist based on the actual content
    return data


def _merge(items: List[Dict[str, Any]]) -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    for item in items:
        for k, v in (item or {}).items():
            if k not in out:
                out[k] = v
            else:
                if isinstance(out[k], list) and isinstance(v, list):
                    out[k] = out[k] + [x for x in v if x not in out[k]]
                elif isinstance(out[k], dict) and isinstance(v, dict):
                    out[k].update({kk: vv for kk, vv in v.items() if vv})
                elif not out[k] and v:
                    out[k] = v
    return out


def _get_llm(preferred: Optional[str] = None) -> Optional[LLMManager]:
    try:
        # LLMManager in this codebase doesn't accept preferred on init; handled per-call
        return LLMManager()
    except Exception:
        return None


@app.post("/parse-data")
async def parse_data(files: List[UploadFile] = File(...)) -> Dict[str, Any]:
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    llm = _get_llm()

    async def handle(upload: UploadFile) -> Dict[str, Any]:
        text = await _extract_text_for_file(upload)
        parsed = await _parse_text(text, llm)
        normalized = _ensure_resume_schema(parsed)
        return {
            "filename": upload.filename,
            "text_length": len(text or ""),
            "parsed": normalized,
        }

    results = await asyncio.gather(*(handle(f) for f in files))

    if len(files) == 1:
        return results[0]["parsed"]
    

    return {
        Path(files[i].filename or f"file_{i}").stem: results[i]["parsed"]
        for i in range(len(results))
    }


@app.post("/generate-resume")
async def generate_resume(payload: GenerateResumePayload) -> Dict[str, Any]:
    if not payload or not payload.data:
        raise HTTPException(status_code=400, detail="Missing data")

    items: List[Dict[str, Any]] = []
    for _name, parsed in (payload.data or {}).items():
        if isinstance(parsed, dict) and "parsed" in parsed:
            items.append(_ensure_resume_schema(parsed.get("parsed") or {}))
        elif isinstance(parsed, dict):
            items.append(_ensure_resume_schema(parsed))

    merged = _merge(items)

    llm = _get_llm(preferred=payload.preferred_provider)
    if llm is not None:
        try:
            summary_src = merged.get("professional_summary") or merged.get("summary") or merged.get("objective") or ""
            if isinstance(summary_src, (list, dict)):
                summary_src = json.dumps(summary_src)
            prompt = (
                "Rewrite this resume summary in a concise, ATS-friendly style (2-3 sentences).\n\n" + str(summary_src)
            )
            result = llm.generate_text(prompt, preferred_provider=payload.preferred_provider)
            if isinstance(result, dict) and result.get("success") and result.get("content"):
                merged["professional_summary"] = str(result["content"]).strip()
        except Exception:
            pass

    return {"resume": merged}


@app.post("/auto-fix")
async def auto_fix(payload: AutoFixPayload) -> Dict[str, Any]:
    if not payload or not payload.field or not payload.context:
        raise HTTPException(status_code=400, detail="Invalid payload")

    field = payload.field
    context = payload.context
    constraints = payload.constraints or {}

    llm = _get_llm(preferred=payload.preferred_provider)
    if llm is not None:
        try:
            prompt = (
                "You are improving a resume field.\n"
                f"Field: {field}\n"
                f"Constraints: {json.dumps(constraints)}\n"
                "Return only the improved text.\n\n"
                f"Context JSON: {json.dumps(context)}\n"
            )
            result = llm.generate_text(prompt, preferred_provider=payload.preferred_provider)
            if isinstance(result, dict) and result.get("success") and result.get("content"):
                return {"field": field, "suggestion": str(result["content"]).strip()}
        except Exception:
            pass

    original = context.get(field)
    if isinstance(original, str) and original.strip():
        cleaned = " ".join(original.split())
        return {"field": field, "suggestion": cleaned}

    return {"field": field, "suggestion": ""}