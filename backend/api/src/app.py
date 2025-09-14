import os
import json
import asyncio
import tempfile
from pathlib import Path
from datetime import datetime
from typing import Any, Dict, List, Optional
import sys

from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, HTTPException, UploadFile, Form
from fastapi.responses import RedirectResponse, JSONResponse

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

try:
    from ats.ats import (
        clean_text,
        extract_text_from_resume_pdf,
        calculate_comprehensive_resume_score,
        buzzwords
    )
    from ats.matchjd import (
        get_resume_jd_match_score,
        tfidf_vectorizer
    )
    print("successfully imported from existing ats files")
except ImportError as e:
    print(f"could not import ats files: {e}")



class GenerateResumePayload(BaseModel):
    data: Dict[str, Any]
    preferred_provider: Optional[str] = None

class AutoFixPayload(BaseModel):
    field: str
    context: Dict[str, Any]
    constraints: Optional[Dict[str, Any]] = None
    preferred_provider: Optional[str] = None


class ATSCheckerPayload(BaseModel):
    job_description: Optional[str] = None

class ATSAnalyzer:
    def __init__(self):
        self.esco_zip_path = 'backend/ats/data/ESCO dataset - v1.2.0 - classification - en - csv.zip'
        self.vectorizer_path = 'backend/ats/data/ats_tfidf_vectorizer/tfidf_vectorizer.pkl'
        self.tfidf_vectorizer = None
        self.buzzwords = buzzwords if 'buzzwords' in globals() else self._get_default_buzzwords()
        self._load_vectorizer()

    
    def _load_vectorizer(self):     #for loading tf-idf vectorizer from existing file (have to add later)
        try:
            import joblib
            self.tfidf_vectorizer = joblib.load(self.vectorizer_path)
            print(f"Successfully loaded TF-IDF vectorizer from {self.vectorizer_path}")
        except Exception as e:
            print(f"Could not load TF-IDF vectorizer: {e}")

    def _get_default_buzzwords(self):       #fallback buzzwords (not needed ig but still)
        return [
            "machine learning", "deep learning", "artificial intelligence", "data science",
            "big data", "cloud computing", "aws", "azure", "gcp", "devops", "agile", "scrum",
            "python", "r", "sql", "nosql", "docker", "kubernetes", "ci/cd", "nlp",
            "computer vision", "predictive modeling", "statistical analysis", "data mining"
        ]
    
    def analyze_buzzwords_from_text(self, resume_text):     #existing approach
        resume_text_lower = str(resume_text).lower()
        buzzword_count = 0
        found_buzzwords = []
        
        for buzzword in self.buzzwords:
            if buzzword in resume_text_lower:
                buzzword_count += 1
                found_buzzwords.append(buzzword)
        
        return {
            "count": buzzword_count,
            "percentage": min(100, (buzzword_count / 30) * 100),
            "found_terms": found_buzzwords
        }
    
    def analyze_quantifiable_from_text(self, resume_text):
        import re
        
        refined_quantifiable_patterns = [
            r'(?:increased|reduced|improved|decreased|boosted|cut|grew)\s+.*?by\s+([\d,\.]+\s*%?)',
            r'(?:managed|led|oversaw)\s+(?:a\s+team\s+of|[\d,\.]+\s+projects?)',
            r'(?:saved)\s+([\$\€\£]?[\d,\.]+)',
            r'(?:achieved|delivered)\s+(?:a\s+)?([\d,\.]+%?)\s+.*?',
            r'(?:handled|processed)\s+([\d,\.]+)\s+(?:data\s+records?|transactions?)',
            r'(?:developed|implemented)\s+.*?for\s+([\d,\.]+)\s+users?',
            r'(?:optimized|streamlined)\s+.*?resulting\s+in\s+([\d,\.]+%?)\s+reduction',
            r'([\d,\.]+%?)\s+(?:increase|reduction|improvement|gain|growth)',
        ]
        
        quantifiable_achievements = []
        resume_text_lower = str(resume_text).lower()
        
        for pattern in refined_quantifiable_patterns:
            matches = re.findall(pattern, resume_text_lower)
            if matches:
                for match in matches:
                    if isinstance(match, tuple):
                        quantifiable_achievements.extend([item for item in match if item])
                    else:
                        quantifiable_achievements.append(match)
        
        count = len(quantifiable_achievements)
        return {
            "count": count,
            "percentage": min(100, (count / 8) * 100),
            "achievements": quantifiable_achievements
        }
    
    def analyze_esco_technical_terms(self, resume_text):        #from ats.py (existing esco analysis)
        import zipfile
        import pandas as pd
        import spacy
        from spacy.matcher import PhraseMatcher
        
        unique_technical_terms_count = 0
        found_terms = []
        
        try:
            if os.path.exists(self.esco_zip_path):
                with zipfile.ZipFile(self.esco_zip_path, 'r') as zip_ref:
                    if 'skills_en.csv' in zip_ref.namelist():
                        zip_ref.extract('skills_en.csv', path='/tmp/')
                        
                        esco_skills_df = pd.read_csv('/tmp/skills_en.csv')
                        
                        os.remove('/tmp/skills_en.csv')
                        
                        required_cols = ['preferredLabel', 'altLabels', 'description']
                        if all(col in esco_skills_df.columns for col in required_cols):
                            esco_terms = []
                            for index, row in esco_skills_df.iterrows():
                                if pd.notna(row['preferredLabel']) and isinstance(row['preferredLabel'], str):
                                    esco_terms.append(row['preferredLabel'])
                                if pd.notna(row['altLabels']) and isinstance(row['altLabels'], str):
                                    alt_labels = [label.strip() for label in row['altLabels'].split(',') if label.strip()]
                                    esco_terms.extend(alt_labels)
                        
                            nlp_esco_matcher = spacy.blank("en")
                            esco_matcher = PhraseMatcher(nlp_esco_matcher.vocab)
                            
                            cleaned_esco_terms = [clean_text(term) for term in esco_terms if term]
                            cleaned_esco_terms = [term for term in cleaned_esco_terms if term]
                            
                            if cleaned_esco_terms:
                                esco_patterns = [nlp_esco_matcher.make_doc(term) for term in cleaned_esco_terms[:1000]]  #umm limiting for performance
                                esco_matcher.add("TECHNICAL_TERMS", esco_patterns)
                                
                                cleaned_resume_text = clean_text(resume_text)
                                if cleaned_resume_text:
                                    resume_doc = nlp_esco_matcher(cleaned_resume_text)
                                    esco_matches = esco_matcher(resume_doc)
                                    found_terms = [resume_doc[start:end].text for match_id, start, end in esco_matches]
                                    unique_technical_terms_count = len(set(found_terms))
                        
        except Exception as e:      #vibecoded exception logic :>
            print(f"ESCO analysis failed: {e}")
            # Fallback to basic technical terms
            basic_terms = ["python", "java", "javascript", "sql", "aws", "docker", "react"]
            text_lower = resume_text.lower()
            found_terms = [term for term in basic_terms if term in text_lower]
            unique_technical_terms_count = len(found_terms)
        
        return {
            "count": unique_technical_terms_count,
            "percentage": min(100, (unique_technical_terms_count / 15) * 100),
            "terms": found_terms[:20]  # Limit for response size
        }
    
    def analyze_structure_from_text(self, resume_text):
        import re
        
        section_titles = [
            "summary", "objective", "education", "experience", "work experience",
            "professional experience", "skills", "technical skills", "projects",
            "portfolio", "awards", "honors", "publications", "presentations",
            "licenses", "certifications", "volunteering", "interests", "contact",
            "contact information"
        ]
        
        resume_text_lower = str(resume_text).lower()
        identified_sections = []
        
        for title in section_titles:
            if re.search(r'\b' + re.escape(title) + r'\b', resume_text_lower):
                identified_sections.append(title)
        
        count = len(identified_sections)
        return {
            "count": count,
            "percentage": min(100, (count / 8) * 100),
            "sections": identified_sections
        }
    
    def analyze_repetition_from_text(self, resume_text):
        import re
        from collections import Counter

        try:
            from nltk.corpus import stopwords
            stop_words = set(stopwords.words('english'))
        except:     #basic fallback
            stop_words = set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were'])
        
        words = re.findall(r'\b\w+\b', str(resume_text).lower())
        word_counts = Counter(words)
        
        ignore_words = stop_words | {'com', 'https', 'www', 'project', 'skill', 
                                   'experience', 'develop', 'system'}
        
        high_frequency_words = [word for word, count in word_counts.most_common(50) 
                              if count > 10 and word not in ignore_words]
        
        repetition_penalty = len(high_frequency_words) * 5
        score = max(0, 100 - repetition_penalty)
        
        return {
            "score": score,
            "percentage": score,
            "repetitive_words": high_frequency_words
        }
    
    def calculate_jd_match_score(self, resume_text, jd_text):       
        if not self.tfidf_vectorizer or not jd_text:
            return {"score": 0, "percentage": 0, "available": False}
        
        try:
            if 'get_resume_jd_match_score' in globals():
                similarity = get_resume_jd_match_score(resume_text, jd_text, self.tfidf_vectorizer)
                if similarity is not None:
                    return {
                        "score": similarity,
                        "percentage": similarity * 100,
                        "available": True
                    }
            return {"score": 0, "percentage": 0, "available": False}
            
        except Exception as e:
            print(f"JD matching error: {e}")
            return {"score": 0, "percentage": 0, "available": False}

ats_analyzer = ATSAnalyzer()        



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

    # PDFs - Using proper PDF text extraction instead of vision (bcoz it's not working)
    if suffix.endswith(".pdf"):
        extracted_text = ""
        
        # Trying PyPDF2
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
                return extracted_text
            else:
                print(f"PyPDF2: Extracted text too short ({len(extracted_text)} chars)")
                
        except Exception as e:
            print(f"PyPDF2 extraction failed: {e}")

        # Trying pdfplumber as fallback (M2)
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
                    except Exception as e:
                        print(f"pdfplumber: Failed to extract page {page_num + 1}: {e}")
                
                extracted_text = "\n\n".join(text_parts)
                
                if extracted_text.strip() and len(extracted_text) > 100:
                    print(f"pdfplumber: Successfully extracted {len(extracted_text)} characters total")
                    return extracted_text
                else:
                    print(f"pdfplumber: Extracted text too short ({len(extracted_text)} chars)")
                    
        except Exception as e:
            print(f"pdfplumber extraction failed: {e}")

        # Trying pymupdf (fitz) as last resort for PDFs (M3)
        try:
            import fitz  # PyMuPDF
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
                return extracted_text
            else:
                print(f"PyMuPDF: Extracted text too short ({len(extracted_text)} chars)")
                
        except Exception as e:
            print(f"PyMuPDF extraction failed: {e}")

    # Images/others: try Google Vision (only for images, not PDFs) 
    if not suffix.endswith(".pdf"):  # will not use vision for PDFs anymore
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

    # Fallback: basic text decoding (shouldn't be reached for PDFs) 
    return _decode_text_bytes(content)


async def _parse_text(text: str, llm: Optional[LLMManager]) -> Dict[str, Any]:
    """Use LLM to structure the raw text into proper JSON format"""
    if not text or not text.strip():
        return {"error": "Empty text provided"}
    
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


@app.post("/ats-checker")
async def ats_checker(
    file: UploadFile = File(...),
    job_description: str = Form("")
) -> Dict[str, Any]:    

    if not file:
        raise HTTPException(status_code=400, detail="No resume file uploaded")
    
    if not file.filename or not file.filename.lower().endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(status_code=400, detail="Only pdf, docx, txt files are supported")

    try:
        resume_text = await _extract_text_for_file(file)

        if not resume_text or len(resume_text.strip()) < 100:
            raise HTTPException(status_code=400, detail="Could not extract meaningful text from resume") 

        if not job_description:
            job_description = """
            We are seeking a skilled professional with strong technical expertise and proven experience. 
            Candidates should demonstrate quantifiable achievements, relevant industry experience, 
            and excellent communication skills. Experience with modern technologies and methodologies preferred.
            Strong analytical and problem-solving abilities required.
            """
        
        print(f"Analyzing resume with {len(resume_text)} characters")
        
        analyses = {}
        
        #Buzzwords Analysis (from ats.py)   
        analyses["buzzwords"] = ats_analyzer.analyze_buzzwords_from_text(resume_text)
        print(f"Buzzwords: {analyses['buzzwords']['count']} found")
        
        #Quantifiable Achievements (from ats.py)
        analyses["quantifiable"] = ats_analyzer.analyze_quantifiable_from_text(resume_text)
        print(f"Quantifiable achievements: {analyses['quantifiable']['count']} found")
        
        #Resume Structure (from ats.py)
        analyses["structure"] = ats_analyzer.analyze_structure_from_text(resume_text)
        print(f"Structure sections: {analyses['structure']['count']} found")
        
        #Repetition Analysis (from ats.py)
        analyses["repetition"] = ats_analyzer.analyze_repetition_from_text(resume_text)
        print(f"Repetition score: {analyses['repetition']['score']}")
        
        #Technical Terms (from ats.py ESCO analysis)
        analyses["technical"] = ats_analyzer.analyze_esco_technical_terms(resume_text)
        print(f"Technical terms: {analyses['technical']['count']} found")
        
        #JD Matching (from matchjd.py)
        jd_match = ats_analyzer.calculate_jd_match_score(resume_text, job_description)
        if jd_match["available"]:
            analyses["jd_match"] = jd_match
            print(f"JD Match: {jd_match['percentage']:.1f}%")


        #using weights and calculation from your ats.py
        buzzword_points = analyses["buzzwords"]["count"] * 0.5
        quantifiable_points = analyses["quantifiable"]["count"] * 10
        technical_points = analyses["technical"]["count"] * 2
        structure_points = analyses["structure"]["count"] * 5
        repetition_penalty = max(0, 100 - analyses["repetition"]["score"])
        
        overall_score = max(0, min(100, 
            buzzword_points + quantifiable_points + technical_points + 
            structure_points - repetition_penalty
        ))
        
        graph_data = {
            "overall_score": round(overall_score, 1),
            "categories": {
                "Industry Keywords": {
                    "score": round(analyses["buzzwords"]["percentage"], 1),
                    "count": analyses["buzzwords"]["count"],
                    "details": f"Found {analyses['buzzwords']['count']} relevant industry keywords",
                    "suggestions": "Include more industry-specific terms and technologies" if analyses["buzzwords"]["percentage"] < 60 else "Strong keyword coverage",
                    "found_items": analyses["buzzwords"]["found_terms"][:10]  # Top 10 for display
                },
                "Quantifiable Impact": {
                    "score": round(analyses["quantifiable"]["percentage"], 1),
                    "count": analyses["quantifiable"]["count"],
                    "details": f"Found {analyses['quantifiable']['count']} quantifiable achievements with metrics",
                    "suggestions": "Add more specific numbers, percentages, and measurable outcomes" if analyses["quantifiable"]["percentage"] < 50 else "Excellent use of quantifiable metrics",
                    "found_items": analyses["quantifiable"]["achievements"][:5]
                },
                "Resume Structure": {
                    "score": round(analyses["structure"]["percentage"], 1),
                    "count": analyses["structure"]["count"],
                    "details": f"Identified {analyses['structure']['count']} standard resume sections",
                    "suggestions": "Consider adding missing standard sections" if analyses["structure"]["percentage"] < 70 else "Well-organized resume structure",
                    "found_items": analyses["structure"]["sections"]
                },
                "Content Quality": {
                    "score": round(analyses["repetition"]["percentage"], 1),
                    "details": "Analysis of word repetition and content diversity",
                    "suggestions": "Vary your language and avoid repetitive phrases" if analyses["repetition"]["percentage"] < 80 else "Good content diversity and language variation",
                    "issues": analyses["repetition"]["repetitive_words"][:5]
                },
                "Technical Expertise": {
                    "score": round(analyses["technical"]["percentage"], 1),
                    "count": analyses["technical"]["count"],
                    "details": f"Found {analyses['technical']['count']} technical skills and expertise terms",
                    "suggestions": "Include more specific technical skills relevant to your field" if analyses["technical"]["percentage"] < 60 else "Strong technical skills representation",
                    "found_items": analyses["technical"]["terms"][:15]
                }
            },
            "recommendations": [],
            "metadata": {
                "filename": file.filename,
                "text_length": len(resume_text),
                "analysis_timestamp": datetime.utcnow().isoformat(),
                "jd_matching_available": jd_match["available"],
                "datasets_used": {
                    "esco_available": os.path.exists(ats_analyzer.esco_zip_path),
                    "tfidf_available": ats_analyzer.tfidf_vectorizer is not None
                }
            }
        }
        
        #will add jd match if available
        if jd_match["available"]:
            graph_data["categories"]["Job Relevance"] = {
                "score": round(jd_match["percentage"], 1),
                "details": f"Resume-job description similarity: {jd_match['percentage']:.1f}%",
                "suggestions": "Tailor resume content more closely to job requirements" if jd_match["percentage"] < 60 else "Strong alignment with job requirements"
            }
        
        #for generating prioritized recommendations
        for category, data in graph_data["categories"].items():
            if data["score"] < 60:
                priority = "high" if data["score"] < 40 else "medium"
                graph_data["recommendations"].append({
                    "category": category,
                    "priority": priority,
                    "suggestion": data["suggestions"],
                    "current_score": data["score"]
                })
        
        #sortin recommendations by priority and score
        graph_data["recommendations"].sort(key=lambda x: (x["priority"] == "high", -x["current_score"]), reverse=True)
        
        #Overall assessment (might change later)
        if overall_score >= 80:
            graph_data["overall_assessment"] = "Excellent ATS compatibility - ready for application"
        elif overall_score >= 60:
            graph_data["overall_assessment"] = "Good ATS compatibility with some areas for improvement"
        elif overall_score >= 40:
            graph_data["overall_assessment"] = "Moderate ATS compatibility - several improvements needed"
        else:
            graph_data["overall_assessment"] = "Low ATS compatibility - significant improvements required"
        
        print(f"Analysis complete. Overall score: {overall_score}")
        return graph_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"ATS analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error analyzing resume: {str(e)}")