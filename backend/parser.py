import warnings
import re
from pathlib import Path
from typing import Dict, List, Any

import PyPDF2
import spacy
from spacy.matcher import Matcher

warnings.filterwarnings("ignore", category=UserWarning)

class ResumeParser:
    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("Please install the English model: python -m spacy download en_core_web_sm")
            raise
        
        self.matcher = Matcher(self.nlp.vocab)
        self._setup_patterns()
    
    def _setup_patterns(self):
        #emil pattern
        email_pattern = [{"TEXT": {"REGEX": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"}}]
        self.matcher.add("EMAIL", [email_pattern])
        
        #phone pattern
        phone_pattern = [{"TEXT": {"REGEX": r"\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b"}}]
        self.matcher.add("PHONE", [phone_pattern])
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        text = ""
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
        except Exception as e:
            print(f"Error reading PDF {pdf_path}: {e}")
            return ""
        return text
    
    def extract_email(self, text: str) -> List[str]:
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        return re.findall(email_pattern, text, re.IGNORECASE)
    
    def extract_phone(self, text: str) -> List[str]:
        phone_patterns = [
            r'\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            r'\b\d{10}\b',
            r'\(\d{3}\)\s?\d{3}[-.\s]?\d{4}',
        ]
        phones = []
        for pattern in phone_patterns:
            phones.extend(re.findall(pattern, text))
        return [phone if isinstance(phone, str) else ''.join(phone) for phone in phones]
    
    def extract_name(self, text: str) -> str:
        lines = text.strip().split('\n')
        # Usually the name is in the first few lines
        for line in lines[:5]:
            line = line.strip()
            if line and not any(char.isdigit() for char in line) and len(line.split()) <= 4:
                # Check if it looks like a name (not too long, no numbers)
                if not re.search(r'[^\w\s\'-.]', line) and len(line) > 2:
                    return line
        return ""
    
    def extract_skills(self, text: str) -> List[str]:
        skill_keywords = [
            # Programming Languages
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin',
            'scala', 'r', 'matlab', 'perl', 'shell scripting', 'bash', 'powershell',
            
            # Web Technologies
            'html', 'css', 'sass', 'scss', 'bootstrap', 'tailwind', 'react', 'angular', 'vue', 'svelte',
            'nodejs', 'express', 'django', 'flask', 'fastapi', 'spring', 'laravel', 'rails', 'asp.net',
            
            # Databases
            'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'cassandra', 'elasticsearch',
            
            # Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github actions', 'terraform',
            'ansible', 'chef', 'puppet', 'vagrant', 'ci/cd',
            
            # Data Science & ML
            'machine learning', 'deep learning', 'artificial intelligence', 'data science', 'data analysis',
            'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn',
            'jupyter', 'r studio', 'tableau', 'power bi', 'excel', 'spark', 'hadoop',
            
            # Tools & Others
            'git', 'svn', 'linux', 'ubuntu', 'windows', 'macos', 'vim', 'vscode', 'intellij', 'eclipse',
            'photoshop', 'illustrator', 'figma', 'sketch', 'adobe', 'canva', 'jira', 'confluence', 'slack',
            'agile', 'scrum', 'kanban', 'devops', 'microservices', 'api', 'rest', 'graphql', 'soap',
            'unit testing', 'integration testing', 'tdd', 'bdd'
        ]
        
        found_skills = []
        text_lower = text.lower()
        
        # Look for skills in dedicated skills section first
        skills_section_patterns = [
            r'skills?[:\s]+(.*?)(?=\n[A-Z][A-Z\s]+:|$)',
            r'technical\s+skills?[:\s]+(.*?)(?=\n[A-Z][A-Z\s]+:|$)',
            r'technologies?[:\s]+(.*?)(?=\n[A-Z][A-Z\s]+:|$)',
            r'tools?\s+(?:and\s+)?technologies?[:\s]+(.*?)(?=\n[A-Z][A-Z\s]+:|$)',
        ]
        
        skills_text = text_lower
        for pattern in skills_section_patterns:
            match = re.search(pattern, text_lower, re.IGNORECASE | re.DOTALL)
            if match:
                skills_text = match.group(1)
                break
        
        for skill in skill_keywords:
            # Use word boundaries to avoid partial matches
            if re.search(r'\b' + re.escape(skill.lower()) + r'\b', skills_text):
                found_skills.append(skill.title())
        
        return sorted(list(set(found_skills)))  # Remove duplicates and sort
    
    def extract_experience(self, text: str) -> List[Dict[str, str]]:
        experience = []
        
        exp_section_patterns = [
            r'(?:work\s+)?experience[:\s]+(.*?)(?=\n[A-Z][A-Z\s]+:|$)',
            r'employment[:\s]+(.*?)(?=\n[A-Z][A-Z\s]+:|$)',
            r'career[:\s]+(.*?)(?=\n[A-Z][A-Z\s]+:|$)',
            r'professional\s+experience[:\s]+(.*?)(?=\n[A-Z][A-Z\s]+:|$)',
        ]
        
        exp_text = text
        for pattern in exp_section_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                exp_text = match.group(1)
                break
        
        job_patterns = [
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*[-–—]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+at\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        ]
        
        for pattern in job_patterns:
            matches = re.findall(pattern, exp_text)
            for match in matches:
                experience.append({
                    'title': match[0].strip(),
                    'company': match[1].strip()
                })
        
        return experience[:5]  # Limit to 5 experiences
    
    def extract_education(self, text: str) -> List[str]:
        education = []
        
        education_patterns = [
            # Full degree names
            r'bachelor\s+of\s+\w+(?:\s+\w+)*',
            r'master\s+of\s+\w+(?:\s+\w+)*',
            r'phd\s+in\s+\w+(?:\s+\w+)*',
            r'ph\.d\.?\s+in\s+\w+(?:\s+\w+)*',
            r'doctorate\s+in\s+\w+(?:\s+\w+)*',
            
            # Degree abbreviations with context
            r'\bb\.?s\.?\s+(?:in\s+)?\w+(?:\s+\w+)*',
            r'\bb\.?a\.?\s+(?:in\s+)?\w+(?:\s+\w+)*',
            r'\bm\.?s\.?\s+(?:in\s+)?\w+(?:\s+\w+)*',
            r'\bm\.?a\.?\s+(?:in\s+)?\w+(?:\s+\w+)*',
            r'\bm\.?b\.?a\.?\s+(?:in\s+)?\w+(?:\s+\w+)*',
            r'\bb\.?tech\.?\s+(?:in\s+)?\w+(?:\s+\w+)*',
            r'\bm\.?tech\.?\s+(?:in\s+)?\w+(?:\s+\w+)*',
            r'\bb\.?e\.?\s+(?:in\s+)?\w+(?:\s+\w+)*',
            
            # Common education keywords
            r'graduation',
            r'post\s+graduation',
            r'undergraduate',
            r'graduate',
            r'postgraduate',
            r'diploma\s+in\s+\w+(?:\s+\w+)*',
            r'certificate\s+in\s+\w+(?:\s+\w+)*',
            r'degree\s+in\s+\w+(?:\s+\w+)*',
            
            # University/College indicators
            r'university\s+of\s+\w+(?:\s+\w+)*',
            r'\w+\s+university',
            r'\w+\s+college',
            r'\w+\s+institute(?:\s+of\s+\w+)*',
        ]
        
        education_section_patterns = [
            r'education[:\s]+(.*?)(?=\n[A-Z][A-Z\s]+:|$)',
            r'academic[:\s]+(.*?)(?=\n[A-Z][A-Z\s]+:|$)',
            r'qualification[:\s]+(.*?)(?=\n[A-Z][A-Z\s]+:|$)',
        ]
        
        education_text = text
        for section_pattern in education_section_patterns:
            section_match = re.search(section_pattern, text, re.IGNORECASE | re.DOTALL)
            if section_match:
                education_text = section_match.group(1)
                break
        
        #extract education information
        for pattern in education_patterns:
            matches = re.findall(pattern, education_text, re.IGNORECASE)
            for match in matches:
                cleaned_match = match.strip()
                if len(cleaned_match) > 2:
                    education.append(cleaned_match.title())
        
        #remove duplicates and filter our common false positives
        education = list(set(education))
        
        false_positives = ['Ma', 'Ba', 'Ms', 'As', 'Is', 'In', 'On', 'Of', 'To', 'At']
        education = [edu for edu in education if edu not in false_positives and len(edu) > 2]
        
        return education[:10]  #Limit to first 10 to avoid too much noise
    
    def parse_resume(self, pdf_path: str) -> Dict[str, Any]:
        text = self.extract_text_from_pdf(pdf_path)
        
        if not text.strip():
            return {"error": "Could not extract text from PDF"}
        
        return {
            "name": self.extract_name(text),
            "email": self.extract_email(text),
            "mobile_number": self.extract_phone(text),
            "skills": self.extract_skills(text),
            "education": self.extract_education(text),
            "raw_text": text[:500] + "..." if len(text) > 500 else text  # First 500 chars
        }

#usage
if __name__ == "__main__":
    BASE_DIR = Path(r"C:\Users\ASUS\OneDrive\Desktop\Darzi-AI-Resume-Suite")
    PDF_DIR = BASE_DIR / "backend" / "resume-data"

    if not PDF_DIR.is_dir():
        raise FileNotFoundError(f"Directory not found: {PDF_DIR}")

    parser = ResumeParser()
    parsed_resumes = []

    for pdf_path in PDF_DIR.glob("*.pdf"):
        print(f"Processing: {pdf_path.name}")
        data = parser.parse_resume(str(pdf_path))
        parsed_resumes.append(data)

    print(f"Parsed {len(parsed_resumes)} resume(s).")
    
    for i, resume in enumerate(parsed_resumes[:2]):  # Show first 2
        print(f"\n-- Resume {i+1} --")
        for key, value in resume.items():
            if key != 'raw_text':
                print(f"{key}: {value}")