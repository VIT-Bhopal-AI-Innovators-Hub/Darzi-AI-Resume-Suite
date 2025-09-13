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

# -----------------------------
# Frontend schema mapper
# -----------------------------

def _as_list(value: Any) -> List[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def _first_non_empty(*values: Any, default: str = "") -> str:
    for v in values:
        if isinstance(v, str) and v.strip():
            return v.strip()
    # sometimes a field can be a list/obj with a string inside
    for v in values:
        if isinstance(v, list) and v:
            # pick first str-ish
            for x in v:
                if isinstance(x, str) and x.strip():
                    return x.strip()
        if isinstance(v, dict):
            # try common keys
            for k in ("text", "value", "name", "title"):
                s = v.get(k)
                if isinstance(s, str) and s.strip():
                    return s.strip()
    return default


def _normalize_url(url: Any) -> Optional[str]:
    if not isinstance(url, str):
        return None
    u = url.strip()
    if not u:
        return None
    # add scheme if missing
    if not (u.startswith("http://") or u.startswith("https://")):
        return f"https://{u}"
    return u


def _flatten_skills(data: Any) -> List[str]:
    # supports ["js", "ts"], or [{name:"js"}], or {category:[...]} structures
    out: List[str] = []
    if isinstance(data, list):
        for item in data:
            if isinstance(item, str) and item.strip():
                out.append(item.strip())
            elif isinstance(item, dict):
                # JSON Resume often uses { name, level, keywords }
                name = item.get("name")
                if isinstance(name, str) and name.strip():
                    out.append(name.strip())
                kws = item.get("keywords")
                if isinstance(kws, list):
                    out.extend([str(x).strip() for x in kws if str(x).strip()])
    elif isinstance(data, dict):
        for v in data.values():
            out.extend(_flatten_skills(v))
    return list(dict.fromkeys(out))  # de-dupe while keeping order


def _pick_website(root: Dict[str, Any]) -> str:
    website = _first_non_empty(
        root.get("website"),
        root.get("portfolio"),
        root.get("personal_website"),
        root.get("url"),
        default="",
    )

    if not website:
        # try links-like structures
        for coll_key in ("links", "profiles", "social", "contact_links"):
            coll = root.get(coll_key)
            if isinstance(coll, list):
                for link in coll:
                    if not isinstance(link, dict):
                        continue
                    name = str(link.get("name") or link.get("network") or "").lower()
                    if name in ("website", "portfolio", "site", "blog"):
                        url = _normalize_url(link.get("url") or link.get("link"))
                        if url:
                            return url
    return _normalize_url(website) or ""


def _collect_links(root: Dict[str, Any]) -> List[Dict[str, str]]:
    links: List[Dict[str, str]] = []
    for coll_key in ("links", "profiles", "social", "contact_links"):
        coll = root.get(coll_key)
        if isinstance(coll, list):
            for link in coll:
                if not isinstance(link, dict):
                    continue
                name = _first_non_empty(link.get("name"), link.get("network"))
                url = _normalize_url(link.get("url") or link.get("link"))
                if name and url:
                    links.append({"name": name, "url": url})
    # de-dupe by url
    seen = set()
    out: List[Dict[str, str]] = []
    for l in links:
        if l["url"] not in seen:
            out.append(l)
            seen.add(l["url"])
    return out


def _to_frontend_resume_data(parsed: Dict[str, Any]) -> Dict[str, Any]:
    # Defaults per frontend schema
    resume: Dict[str, Any] = {
        "name": "",
        "title": "",
        "email": "",
        "phone": "",
        "location": "",
        "website": "",
        "summary": "",
        "experiences": [],  # [{ company, role, bullets }]
        "education": [],    # [{ school, degree }]
        "skills": [],
        "links": [],        # [{ name, url }]
        "customSections": [],
    }

    if not isinstance(parsed, dict):
        return resume

    # Common roots
    basics = parsed.get("basics") if isinstance(parsed.get("basics"), dict) else {}
    contact = parsed.get("contact_information") if isinstance(parsed.get("contact_information"), dict) else {}

    # Name / Title
    resume["name"] = _first_non_empty(
        contact.get("full_name"),
        parsed.get("full_name"),
        basics.get("name"),
        parsed.get("name"),
        default="",
    )
    resume["title"] = _first_non_empty(
        parsed.get("title"),
        basics.get("label"),
        parsed.get("current_position"),
        parsed.get("headline"),
        default="",
    )

    # Contact
    resume["email"] = _first_non_empty(
        contact.get("email"), parsed.get("email"), basics.get("email"), default=""
    )
    resume["phone"] = _first_non_empty(
        contact.get("phone"), parsed.get("phone"), parsed.get("phone_number"), basics.get("phone"), default=""
    )
    # Location can be object or string
    loc = parsed.get("location") or basics.get("location") or contact.get("location")
    if isinstance(loc, dict):
        city = loc.get("city") or ""
        region = loc.get("region") or loc.get("state") or ""
        country = loc.get("country") or ""
        resume["location"] = ", ".join([str(x) for x in [city, region, country] if x]).strip(", ")
    else:
        resume["location"] = _first_non_empty(parsed.get("location"), basics.get("location"), contact.get("location"))

    resume["website"] = _pick_website(parsed or basics or contact)

    # Summary
    resume["summary"] = _first_non_empty(
        parsed.get("professional_summary"),
        parsed.get("summary"),
        basics.get("summary"),
        parsed.get("objective"),
        default="",
    )

    # Experiences
    exp_sources = [
        parsed.get("experience"),
        parsed.get("work_experience"),
        parsed.get("work"),
        parsed.get("positions"),
    ]
    experiences: List[Dict[str, Any]] = []
    for src in exp_sources:
        for item in _as_list(src):
            if not isinstance(item, dict):
                continue
            company = _first_non_empty(item.get("company"), item.get("organization"))
            role = _first_non_empty(item.get("role"), item.get("position"), item.get("title"))
            bullets: List[str] = []
            for key in ("bullets", "highlights", "responsibilities", "achievements"):
                val = item.get(key)
                if isinstance(val, list):
                    bullets.extend([str(x).strip() for x in val if str(x).strip()])
            desc = item.get("description") or item.get("summary")
            if isinstance(desc, str) and desc.strip():
                bullets.append(desc.strip())
            if company or role or bullets:
                experiences.append({
                    "company": company,
                    "role": role,
                    "bullets": list(dict.fromkeys([b for b in bullets if b]))[:12],
                })
    resume["experiences"] = experiences

    # Education
    edu_src = parsed.get("education")
    education: List[Dict[str, str]] = []
    for item in _as_list(edu_src):
        if not isinstance(item, dict):
            continue
        school = _first_non_empty(item.get("school"), item.get("institution"), item.get("university"), item.get("college"))
        degree = _first_non_empty(item.get("degree"), item.get("qualification"), item.get("program"))
        if school or degree:
            education.append({"school": school, "degree": degree})
    resume["education"] = education

    # Skills
    skills_raw = parsed.get("skills") or parsed.get("technical_skills") or parsed.get("core_skills")
    resume["skills"] = _flatten_skills(skills_raw)

    # Links
    resume["links"] = _collect_links(parsed) or _collect_links(basics) or []

    return resume


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


async def _extract_text_for_file(upload: UploadFile) -> str:
    filename = upload.filename or "uploaded"
    suffix = filename.lower()
    content = await upload.read()

    # .txt locally only
    if suffix.endswith(".txt"):
        return _decode_text_bytes(content)

    # .docx via python-docx if available
    if suffix.endswith(".docx") and docx is not None:
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp:
                tmp.write(content)
                tmp.flush()
                tmp_path = tmp.name
            try:
                d = docx.Document(tmp_path)  # type: ignore
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

    # PDFs/images/others: try Google Vision util first
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

    # Fallback: best-effort local decoding
    return _decode_text_bytes(content)

async def _parse_text(text: str, llm: Optional[LLMManager]) -> Dict[str, Any]:
    """Use LLM to structure the raw text into proper JSON format"""
    if not text or not text.strip():
        return {"error": "Empty text provided"}
    
    try:
        # Try to get LLM instance if not provided
        if not llm:
            llm = _get_llm()
        
        # Use LLM to structure the data
        if llm:
            structured_data = await _llm_structure_resume(text, llm)
            if structured_data:
                return structured_data
            
        # Last resort: return basic structure with raw text
        return _create_basic_structure(text)
        
    except Exception as e:
        return {"error": f"Failed to parse text: {str(e)}", "raw_text": text}


async def _llm_structure_resume(text: str, llm: LLMManager) -> Optional[Dict[str, Any]]:
    """Use LLM to structure resume text into JSON"""
    
    try:
        # Use the LLM manager's built-in parsing method
        structured_data = llm.parse_resume_with_llm(text)
        
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
        # Map to frontend schema for minimal/no frontend changes
        resume_data = _to_frontend_resume_data(normalized)
        return {
            "filename": upload.filename,
            "text_length": len(text or ""),
            "parsed": normalized,
            "resumeData": resume_data,
        }

    results = await asyncio.gather(*(handle(f) for f in files))
    return {Path(r.get("filename") or "").stem: r for r in results}


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

    # Also return frontend-shaped data for easy consumption
    resume_data = _to_frontend_resume_data(merged)

    return {"resume": merged, "resumeData": resume_data}


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