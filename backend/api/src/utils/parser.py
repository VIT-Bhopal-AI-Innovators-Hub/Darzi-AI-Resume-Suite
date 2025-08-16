import re
import warnings
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import string

import spacy
import PyPDF2
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
        
        # Common resume section headers
        self.section_headers = {
            'personal': ['contact', 'personal information', 'profile', 'summary', 'objective'],
            'experience': ['experience', 'work experience', 'employment', 'professional experience', 
                          'career history', 'work history', 'employment history'],
            'education': ['education', 'academic background', 'qualifications', 'academic', 
                         'educational background', 'schooling'],
            'skills': ['skills', 'technical skills', 'core competencies', 'expertise', 
                      'technologies', 'tools', 'programming languages', 'core skills'],
            'projects': ['projects', 'key projects', 'notable projects', 'personal projects'],
            'certifications': ['certifications', 'certificates', 'licenses', 'professional certifications'],
            'achievements': ['achievements', 'accomplishments', 'awards', 'honors', 'recognition'],
            'languages': ['languages', 'language skills', 'linguistic skills']
        }
        
        # Enhanced skill keywords with categories
        self.skill_categories = {
            'programming': [
                'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 
                'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'dart', 'elixir',
                'clojure', 'haskell', 'lua', 'assembly', 'cobol', 'fortran', 'pascal'
            ],
            'web_frontend': [
                'html', 'css', 'sass', 'scss', 'less', 'bootstrap', 'tailwind css', 'foundation',
                'react', 'angular', 'vue.js', 'vuejs', 'svelte', 'ember.js', 'backbone.js',
                'jquery', 'webpack', 'vite', 'parcel', 'rollup', 'gulp', 'grunt'
            ],
            'web_backend': [
                'nodejs', 'node.js', 'express', 'django', 'flask', 'fastapi', 'spring', 'spring boot',
                'laravel', 'rails', 'ruby on rails', 'asp.net', 'next.js', 'nuxt.js', 'nestjs',
                'koa', 'hapi', 'strapi', 'gin', 'echo', 'fiber'
            ],
            'databases': [
                'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'db2',
                'cassandra', 'couchdb', 'dynamodb', 'elasticsearch', 'neo4j', 'influxdb',
                'mariadb', 'cockroachdb', 'firestore', 'cosmos db'
            ],
            'cloud_devops': [
                'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp', 'google cloud',
                'docker', 'kubernetes', 'jenkins', 'gitlab ci', 'github actions', 'terraform',
                'ansible', 'chef', 'puppet', 'vagrant', 'ci/cd', 'heroku', 'vercel', 'netlify'
            ],
            'data_science': [
                'machine learning', 'deep learning', 'artificial intelligence', 'data science',
                'data analysis', 'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas',
                'numpy', 'matplotlib', 'seaborn', 'plotly', 'jupyter', 'r studio', 'tableau',
                'power bi', 'excel', 'spark', 'hadoop', 'airflow', 'mlflow'
            ],
            'mobile': [
                'ios', 'android', 'react native', 'flutter', 'xamarin', 'ionic', 'cordova',
                'swift', 'objective-c', 'kotlin', 'java android', 'dart flutter'
            ],
            'tools': [
                'git', 'github', 'gitlab', 'bitbucket', 'svn', 'linux', 'ubuntu', 'centos',
                'windows', 'macos', 'vim', 'vscode', 'intellij', 'eclipse', 'sublime text',
                'atom', 'postman', 'insomnia', 'slack', 'teams', 'zoom'
            ],
            'design': [
                'photoshop', 'illustrator', 'figma', 'sketch', 'adobe xd', 'canva', 'blender',
                'after effects', 'premiere pro', 'indesign', 'ui/ux', 'user experience',
                'user interface', 'wireframing', 'prototyping'
            ],
            'methodologies': [
                'agile', 'scrum', 'kanban', 'devops', 'microservices', 'api', 'rest', 'restful',
                'graphql', 'soap', 'grpc', 'unit testing', 'integration testing', 'tdd', 'bdd',
                'test driven development', 'behavior driven development'
            ]
        }
    
    def _setup_patterns(self):
        # Enhanced email pattern
        email_pattern = [{"TEXT": {"REGEX": r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b"}}]
        self.matcher.add("EMAIL", [email_pattern])
        
        # Enhanced phone patterns
        phone_patterns = [
            [{"TEXT": {"REGEX": r"\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})"}}],
            [{"TEXT": {"REGEX": r"\b\d{10}\b"}}],
            [{"TEXT": {"REGEX": r"\(\d{3}\)\s?\d{3}[-.\s]?\d{4}"}}],
            [{"TEXT": {"REGEX": r"\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}"}}]
        ]
        for i, pattern in enumerate(phone_patterns):
            self.matcher.add(f"PHONE_{i}", [pattern])
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace and normalize
        text = re.sub(r'\s+', ' ', text)
        text = re.sub(r'\n+', '\n', text)
        return text.strip()
    
    def _detect_sections(self, text: str) -> Dict[str, str]:
        """Advanced section detection using multiple strategies"""
        sections = {}
        lines = text.split('\n')
        current_section = 'general'
        current_content = []
        
        for i, line in enumerate(lines):
            line_clean = line.strip().lower()
            line_clean = re.sub(r'[^\w\s]', '', line_clean)
            
            # Check if line is a section header
            section_found = None
            for section_type, headers in self.section_headers.items():
                for header in headers:
                    if header in line_clean and len(line_clean) < 50:  # Headers are usually short
                        # Additional validation: check if it's really a header
                        if (len(line.strip()) < 50 and 
                            (line.strip().isupper() or 
                             line.strip().istitle() or 
                             any(char in line for char in [':', '-', '—', '•']))):
                            section_found = section_type
                            break
                if section_found:
                    break
            
            if section_found:
                # Save previous section
                if current_content:
                    sections[current_section] = '\n'.join(current_content)
                
                # Start new section
                current_section = section_found
                current_content = []
            else:
                current_content.append(line)
        
        # Save last section
        if current_content:
            sections[current_section] = '\n'.join(current_content)
        
        return sections
    
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
        """Enhanced email extraction with validation"""
        email_patterns = [
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        ]
        
        emails = set()
        for pattern in email_patterns:
            found = re.findall(pattern, text, re.IGNORECASE)
            emails.update(found)
        
        # Filter out common false positives
        valid_emails = []
        for email in emails:
            if (len(email) > 5 and 
                '@' in email and 
                '.' in email.split('@')[-1] and
                not email.startswith('.') and
                not email.endswith('.')):
                valid_emails.append(email.lower())
        
        return list(set(valid_emails))
    
    def extract_phone(self, text: str) -> List[str]:
        """Enhanced phone extraction with international support"""
        phone_patterns = [
            r'\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',  # US format
            r'\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}',  # International
            r'\b\d{10}\b',  # 10 digit number
            r'\(\d{3}\)\s?\d{3}[-.\s]?\d{4}',  # (123) 456-7890
            r'\d{3}[-.\s]\d{3}[-.\s]\d{4}',  # 123-456-7890
        ]
        
        phones = set()
        for pattern in phone_patterns:
            matches = re.findall(pattern, text)
            for match in matches:
                if isinstance(match, tuple):
                    phone = ''.join(match)
                else:
                    phone = match
                
                # Clean phone number
                phone = re.sub(r'[^\d+]', '', phone)
                
                # Validate phone number length
                if 7 <= len(phone) <= 15:
                    phones.add(phone)
        
        return list(phones)
    
    def extract_name(self, text: str) -> str:
        """Enhanced name extraction using NLP and heuristics"""
        lines = text.strip().split('\n')
        
        # Strategy 1: Look for name in first few lines
        for line in lines[:5]:
            line = line.strip()
            if not line:
                continue
                
            # Skip lines with email, phone, or URLs
            if any(pattern in line.lower() for pattern in ['@', 'http', 'www', 'phone', 'email', 'tel:']):
                continue
            
            # Skip lines with too many numbers or special characters
            if (sum(c.isdigit() for c in line) > len(line) * 0.3 or
                sum(c in string.punctuation for c in line) > len(line) * 0.3):
                continue
            
            # Check if it looks like a name (2-4 words, proper case)
            words = line.split()
            if (2 <= len(words) <= 4 and 
                all(word.replace('.', '').replace(',', '').isalpha() for word in words) and
                all(len(word) > 1 for word in words)):
                
                # Use spaCy NER to validate
                doc = self.nlp(line)
                for ent in doc.ents:
                    if ent.label_ == "PERSON":
                        return ent.text.strip()
                
                # If no NER match, use heuristic
                if any(word[0].isupper() for word in words):
                    return line.strip()
        
        # Strategy 2: Look for "Name:" pattern
        name_patterns = [
            r'name[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            r'candidate[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return ""
    
    def extract_skills(self, text: str) -> List[str]:
        """Enhanced skills extraction with categorization and context awareness"""
        sections = self._detect_sections(text)
        
        # Focus on skills section if available, otherwise use full text
        skills_text = sections.get('skills', text).lower()
        
        found_skills = {}  # Use dict to track categories
        
        # Extract skills by category
        for category, skill_list in self.skill_categories.items():
            found_skills[category] = []
            
            for skill in skill_list:
                # Create flexible pattern for skill matching
                skill_pattern = r'\b' + re.escape(skill.lower()).replace(r'\.', r'\.?') + r'\b'
                
                if re.search(skill_pattern, skills_text):
                    found_skills[category].append(skill.title())
        
        # Flatten and deduplicate
        all_skills = []
        for category_skills in found_skills.values():
            all_skills.extend(category_skills)
        
        # Look for additional skills using common patterns
        skill_patterns = [
            r'(?:proficient|experienced|skilled)\s+(?:in|with)\s+([^,.;\n]+)',
            r'(?:knowledge|experience)\s+(?:of|in|with)\s+([^,.;\n]+)',
            r'technologies?[:\s]+([^.\n]+)',
            r'tools?[:\s]+([^.\n]+)',
        ]
        
        for pattern in skill_patterns:
            matches = re.finditer(pattern, skills_text, re.IGNORECASE)
            for match in matches:
                skill_text = match.group(1).strip()
                # Split by common delimiters
                additional_skills = re.split(r'[,;|&]', skill_text)
                for skill in additional_skills:
                    skill = skill.strip()
                    if len(skill) > 2 and len(skill) < 30:
                        all_skills.append(skill.title())
        
        # Remove duplicates and filter
        unique_skills = []
        seen = set()
        for skill in all_skills:
            skill_lower = skill.lower()
            if skill_lower not in seen and len(skill) > 2:
                seen.add(skill_lower)
                unique_skills.append(skill)
        
        return sorted(unique_skills)
    
    def extract_experience(self, text: str) -> List[Dict[str, Any]]:
        """Enhanced experience extraction with dates and descriptions"""
        sections = self._detect_sections(text)
        exp_text = sections.get('experience', text)
        
        experiences = []
        
        # Enhanced patterns for job extraction
        job_patterns = [
            # Title at Company (Date range)
            r'([A-Z][^.\n]{10,60})\s+(?:at|@)\s+([A-Z][^.\n]{2,40})\s*[\(]?([^)]*(?:20\d{2}|19\d{2})[^)]*)\)?',
            # Company - Title (Date range)
            r'([A-Z][^.\n]{2,40})\s*[-–—]\s*([A-Z][^.\n]{10,60})\s*[\(]?([^)]*(?:20\d{2}|19\d{2})[^)]*)\)?',
            # Title\nCompany format
            r'([A-Z][^\n]{10,60})\n\s*([A-Z][^\n]{2,40})\s*[\(]?([^)]*(?:20\d{2}|19\d{2})[^)]*)\)?',
        ]
        
        # Date patterns
        date_patterns = [
            r'(\d{1,2}/\d{4})\s*[-–—]\s*(\d{1,2}/\d{4}|present|current)',
            r'(\w+\s+\d{4})\s*[-–—]\s*(\w+\s+\d{4}|present|current)',
            r'(\d{4})\s*[-–—]\s*(\d{4}|present|current)',
        ]
        
        for pattern in job_patterns:
            matches = re.finditer(pattern, exp_text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                groups = match.groups()
                
                if len(groups) >= 2:
                    # Determine which is title and which is company
                    field1, field2 = groups[0].strip(), groups[1].strip()
                    date_info = groups[2] if len(groups) > 2 else ""
                    
                    # Heuristic: titles often contain job-related keywords
                    job_keywords = ['engineer', 'developer', 'manager', 'analyst', 'consultant', 
                                   'specialist', 'lead', 'senior', 'junior', 'intern', 'director']
                    
                    if any(keyword in field1.lower() for keyword in job_keywords):
                        title, company = field1, field2
                    else:
                        title, company = field2, field1
                    
                    # Extract duration/dates
                    duration = ""
                    for date_pattern in date_patterns:
                        date_match = re.search(date_pattern, date_info, re.IGNORECASE)
                        if date_match:
                            duration = f"{date_match.group(1)} - {date_match.group(2)}"
                            break
                    
                    # Look for description in surrounding text
                    description = self._extract_job_description(exp_text, match.start(), match.end())
                    
                    experiences.append({
                        'title': title,
                        'company': company,
                        'duration': duration,
                        'description': description[:200] + "..." if len(description) > 200 else description
                    })
        
        return experiences[:10]  # Limit to 10 experiences
    
    def _extract_job_description(self, text: str, start_pos: int, end_pos: int) -> str:
        """Extract job description following the job title/company"""
        lines = text[end_pos:end_pos+500].split('\n')  # Look ahead 500 chars
        description_lines = []
        
        for line in lines[:5]:  # Max 5 lines
            line = line.strip()
            if (line and 
                not re.match(r'^[A-Z][^.]*$', line) and  # Not another title
                len(line) > 20):  # Substantial content
                description_lines.append(line)
            elif description_lines:  # Stop if we hit empty line after content
                break
        
        return ' '.join(description_lines)
    
    def extract_education(self, text: str) -> List[Dict[str, Any]]:
        """Enhanced education extraction with institution, degree, and year"""
        sections = self._detect_sections(text)
        education_text = sections.get('education', text)
        
        education = []
        
        # Enhanced education patterns
        education_patterns = [
            # Degree from Institution (Year)
            r'((?:bachelor|master|phd|doctorate|diploma|certificate).*?)\s+(?:from|at)\s+(.*?)(?:\s*[\(]?(\d{4})\)?)?',
            r'(b\.?[sa]\.?|m\.?[sa]\.?|ph\.?d\.?|m\.?tech\.?|b\.?tech\.?)\s+(?:in\s+)?(.*?)\s+(?:from|at)\s+(.*?)(?:\s*[\(]?(\d{4})\)?)?',
            # Institution - Degree (Year)
            r'(.*?university|.*?college|.*?institute)\s*[-–—]\s*(.*?)(?:\s*[\(]?(\d{4})\)?)?',
            # Degree, Institution (Year)
            r'((?:bachelor|master|phd|doctorate).*?),\s*(.*?)(?:\s*[\(]?(\d{4})\)?)?',
        ]
        
        degree_keywords = [
            'bachelor', 'master', 'phd', 'doctorate', 'diploma', 'certificate',
            'b.s', 'b.a', 'm.s', 'm.a', 'mba', 'b.tech', 'm.tech', 'b.e', 'm.e'
        ]
        
        institution_keywords = [
            'university', 'college', 'institute', 'school', 'academy'
        ]
        
        # Find education entries
        for pattern in education_patterns:
            matches = re.finditer(pattern, education_text, re.IGNORECASE)
            for match in matches:
                groups = match.groups()
                
                degree, institution, year = "", "", ""
                
                # Parse based on pattern
                if len(groups) >= 2:
                    # Determine which group is degree vs institution
                    for i, group in enumerate(groups):
                        if not group:
                            continue
                            
                        group_lower = group.lower()
                        
                        # Check if it's a year
                        if re.match(r'\d{4}', group):
                            year = group
                        # Check if it's a degree
                        elif any(keyword in group_lower for keyword in degree_keywords):
                            degree = group.strip()
                        # Check if it's an institution
                        elif any(keyword in group_lower for keyword in institution_keywords):
                            institution = group.strip()
                        # Default assignment
                        elif not degree and len(group) < 50:
                            degree = group.strip()
                        elif not institution:
                            institution = group.strip()
                
                if degree or institution:
                    education.append({
                        'degree': degree,
                        'institution': institution,
                        'year': year,
                        'type': self._classify_education_level(degree)
                    })
        
        # Also look for simple degree mentions
        simple_patterns = [
            r'\b(bachelor.*?(?:science|arts|engineering|technology))\b',
            r'\b(master.*?(?:science|arts|engineering|technology|business))\b',
            r'\b(ph\.?d\.?.*?)\b',
            r'\b(mba)\b',
        ]
        
        for pattern in simple_patterns:
            matches = re.finditer(pattern, education_text, re.IGNORECASE)
            for match in matches:
                degree = match.group(1)
                if not any(ed['degree'].lower() == degree.lower() for ed in education):
                    education.append({
                        'degree': degree.title(),
                        'institution': "",
                        'year': "",
                        'type': self._classify_education_level(degree)
                    })
        
        return education[:5]  # Limit to 5 education entries
    
    def _classify_education_level(self, degree: str) -> str:
        """Classify education level"""
        degree_lower = degree.lower()
        
        if any(word in degree_lower for word in ['phd', 'doctorate', 'ph.d']):
            return 'doctorate'
        elif any(word in degree_lower for word in ['master', 'm.s', 'm.a', 'mba', 'm.tech']):
            return 'masters'
        elif any(word in degree_lower for word in ['bachelor', 'b.s', 'b.a', 'b.tech', 'b.e']):
            return 'bachelors'
        elif any(word in degree_lower for word in ['diploma', 'certificate']):
            return 'diploma'
        else:
            return 'other'
    
    def extract_certifications(self, text: str) -> List[str]:
        """Extract professional certifications"""
        sections = self._detect_sections(text)
        cert_text = sections.get('certifications', text)
        
        certifications = []
        
        # Common certification patterns
        cert_patterns = [
            r'certified\s+(.+?)(?:\s*[-–—]\s*|\s*\(|\n|$)',
            r'certification\s+in\s+(.+?)(?:\s*[-–—]\s*|\s*\(|\n|$)',
            r'(.+?)\s+certification',
            r'(.+?)\s+certified',
        ]
        
        for pattern in cert_patterns:
            matches = re.finditer(pattern, cert_text, re.IGNORECASE)
            for match in matches:
                cert = match.group(1).strip()
                if len(cert) > 3 and len(cert) < 100:
                    certifications.append(cert.title())
        
        return list(set(certifications))[:10]
    
    def extract_projects(self, text: str) -> List[Dict[str, str]]:
        """Extract project information"""
        sections = self._detect_sections(text)
        projects_text = sections.get('projects', text)
        
        projects = []
        
        # Project patterns
        project_patterns = [
            r'project[:\s]+([^\n]+)',
            r'•\s*([A-Z][^\n•]+)',
            r'-\s*([A-Z][^\n-]+)',
        ]
        
        for pattern in project_patterns:
            matches = re.finditer(pattern, projects_text, re.IGNORECASE)
            for match in matches:
                project_name = match.group(1).strip()
                if len(project_name) > 10 and len(project_name) < 100:
                    # Look for description in next few lines
                    description = self._extract_project_description(projects_text, match.end())
                    
                    projects.append({
                        'name': project_name,
                        'description': description
                    })
        
        return projects[:5]
    
    def _extract_project_description(self, text: str, start_pos: int) -> str:
        """Extract project description following project name"""
        remaining_text = text[start_pos:start_pos+300]
        lines = remaining_text.split('\n')
        
        description_lines = []
        for line in lines[:3]:
            line = line.strip()
            if line and not line.startswith(('•', '-', 'Project')):
                description_lines.append(line)
            elif description_lines:
                break
        
        return ' '.join(description_lines)
    
    def extract_summary(self, text: str) -> str:
        """Extract professional summary or objective"""
        sections = self._detect_sections(text)
        
        # Look for summary in personal section or dedicated summary
        summary_text = sections.get('personal', sections.get('general', ''))
        
        summary_patterns = [
            r'(?:summary|objective|profile)[:\s]+(.*?)(?=\n[A-Z][A-Z\s]*:|$)',
            r'professional\s+summary[:\s]+(.*?)(?=\n[A-Z][A-Z\s]*:|$)',
        ]
        
        for pattern in summary_patterns:
            match = re.search(pattern, summary_text, re.IGNORECASE | re.DOTALL)
            if match:
                summary = match.group(1).strip()
                # Clean up and limit length
                summary = re.sub(r'\s+', ' ', summary)
                return summary[:300] + "..." if len(summary) > 300 else summary
        
        # If no explicit summary, use first substantial paragraph
        lines = summary_text.split('\n')
        for line in lines:
            line = line.strip()
            if (len(line) > 50 and 
                not re.search(r'@|phone|email|address', line, re.IGNORECASE) and
                not line.isupper()):
                return line[:300] + "..." if len(line) > 300 else line
        
        return ""
    
    def parse_resume(self, pdf_path: str = None, text_content: str = None) -> Dict[str, Any]:
        """Enhanced resume parsing with comprehensive data extraction"""
        
        if pdf_path:
            text = self.extract_text_from_pdf(pdf_path)
        elif text_content:
            text = text_content
        else:
            return {"error": "Either pdf_path or text_content must be provided"}
        
        if not text.strip():
            return {"error": "Could not extract text from input"}
        
        # Clean and normalize text
        text = self._clean_text(text)
        
        # Extract all information
        result = {
            "name": self.extract_name(text),
            "email": self.extract_email(text),
            "mobile_number": self.extract_phone(text),
            "skills": self.extract_skills(text),
            "education": self.extract_education(text),
            "experience": self.extract_experience(text),
            "summary": self.extract_summary(text),
            "certifications": self.extract_certifications(text),
            "projects": self.extract_projects(text),
            "raw_text": text[:1000] + "..." if len(text) > 1000 else text,
            "parsing_source": "enhanced_local",
            "confidence_score": self._calculate_confidence_score(text)
        }
        
        return result
    
    def _calculate_confidence_score(self, text: str) -> float:
        """Calculate confidence score based on extracted information quality"""
        score = 0.0
        
        # Check for key indicators
        if self.extract_email(text):
            score += 0.2
        if self.extract_phone(text):
            score += 0.2
        if self.extract_name(text):
            score += 0.2
        if len(self.extract_skills(text)) > 0:
            score += 0.2
        if len(self.extract_experience(text)) > 0:
            score += 0.1
        if len(self.extract_education(text)) > 0:
            score += 0.1
        
        return min(score, 1.0)
    
    def parse_text(self, text: str) -> Dict[str, Any]:
        """Parse text directly (for API compatibility)"""
        return self.parse_resume(text_content=text)

if __name__ == "__main__":
    import json
    from datetime import datetime
    
    import os

    BASE_DIR = Path(os.environ.get("DARZI_BASE_DIR", Path.cwd()))
    PDF_DIR = BASE_DIR / "backend" / "resume-data"
    OUTPUT_DIR = BASE_DIR / "backend" / "parsed-resumes"

    if not PDF_DIR.is_dir():
        raise FileNotFoundError(f"Directory not found: {PDF_DIR}")
    
    OUTPUT_DIR.mkdir(exist_ok=True)

    parser = ResumeParser()
    parsed_resumes = []

    for pdf_path in PDF_DIR.glob("*.pdf"):
        data = parser.parse_resume(str(pdf_path))
        
        # Add metadata
        data["file_name"] = pdf_path.name
        data["processed_at"] = datetime.now().isoformat()
        
        parsed_resumes.append(data)

    for i, resume_data in enumerate(parsed_resumes):
        file_name = resume_data.get("file_name", f"resume_{i+1}")
        json_filename = f"{file_name.replace('.pdf', '')}_parsed.json"
        json_path = OUTPUT_DIR / json_filename
        
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(resume_data, f, indent=2, ensure_ascii=False)

    combined_output = {
        "total_resumes": len(parsed_resumes),
        "processed_at": datetime.now().isoformat(),
        "resumes": parsed_resumes
    }
    
    combined_path = OUTPUT_DIR / "all_resumes_parsed.json"
    with open(combined_path, 'w', encoding='utf-8') as f:
        json.dump(combined_output, f, indent=2, ensure_ascii=False)