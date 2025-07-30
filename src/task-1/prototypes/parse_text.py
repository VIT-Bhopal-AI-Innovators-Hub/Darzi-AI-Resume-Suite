import re
import spacy
import json
from spacy.matcher import Matcher
from prototypes.read_resume import extract_text_from_pdf

def preprocess_text(text):
    """Cleans the raw text to improve parsing."""
    # Insert a space before a capital letter if it's preceded by a lowercase letter
    text = re.sub(r"([a-z])([A-Z])", r"\1 \2", text)
    return text

def extract_contact_info(text):
    """Extracts email and phone number using RegEx."""
    contact_info = {
        "email": None,
        "phone": None
    }
    
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    phone_pattern = r'(\+?\d{1,3})?[-.\s]?\(?\d{3,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{4,5}'
    
    emails = re.findall(email_pattern, text)
    phone_match = re.search(phone_pattern, text)
    
    if emails:
        contact_info["email"] = emails[0]
    if phone_match:
        # .group(0) returns entire matched string
        contact_info["phone"] = phone_match.group(0)
        
    return contact_info

"""
def extract_skills(nlp, text):
    # Uses spaCy's rule-based Matcher to find a list of known skills.
    SKILLS_LIST = [
        "Python", "C++", "SQL", "MySQL", "Pandas", "NumPy", 
        "Matplotlib", "Scikit-learn", "OpenCV", "Git", "Tableau", 
        "GCP", "MATLAB", "React.js"
    ]
    
    matcher = Matcher(nlp.vocab)
    for skill in SKILLS_LIST:
        pattern = [{"LOWER": skill.lower()}]
        matcher.add(skill, [pattern])
        
    doc = nlp(text)
    matches = matcher(doc)
    
    found_skills = set()
    for match_id, start, end in matches:
        found_skills.add(doc[start:end].text)
        
    return list(found_skills)
"""

def extract_skills_from_section(text):
    """
    Extracts skills by finding a skills-related heading and reading until the next major heading.
    """
    print("\n--- Parsing Skills from Section ---")
    
    # This pattern looks for "TECHNICAL SKILLS" or "SKILLS", captures everything until
    # it sees the next major heading like "PROJECTS" or "EXPERIENCE".
    # re.IGNORECASE makes it case-insensitive.
    skills_section_pattern = r"(?:TECHNICAL SKILLS|SKILLS)\s*(.*?)\s*(?:PROJECTS|EXPERIENCE & AWARDS|EDUCATION|CERTIFICATIONS)"
    
    skills_match = re.search(skills_section_pattern, text, re.DOTALL | re.IGNORECASE)
    
    if skills_match:
        # Get the captured text and split it into lines
        skills_text = skills_match.group(1).strip()
        
        # Process the text to get a clean list of skills
        # This splits by common delimiters like newlines, commas, or colons
        skills = [skill.strip() for skill in re.split(r'\n|:|–', skills_text) if skill.strip()]
        
        # A further cleanup step for lines like "Languages & Databases:Python,C++,SQL"
        clean_skills = []
        for skill_line in skills:
            # Remove the category part like "Languages & Databases:"
            parts = skill_line.split(':')
            if len(parts) > 1:
                # If there's a colon, take the second part and split by comma
                clean_skills.extend([s.strip() for s in parts[1].split(',') if s.strip()])
            else:
                # Otherwise, just add the line
                clean_skills.append(skill_line)

        return clean_skills
    
    return []




# --- Main Execution Logic ---
if __name__ == "__main__":
    # 1. Extract and preprocess text
    pdf_path = 'prototypes/Resume.pdf'
    raw_text = extract_text_from_pdf(pdf_path)
    
    if "Error" in raw_text:
        print(raw_text)
    else:
        resume_text = preprocess_text(raw_text)
        
        # 2. Load the spaCy model once
        nlp = spacy.load("en_core_web_sm")
        
        # 3. Build the final structured data
        final_data = {
            "contact_info": extract_contact_info(resume_text),
            "skills": extract_skills_from_section(nlp, resume_text),
            "work_experience": [], # Placeholder for future development
            "education": [], # Placeholder for future development
            "raw_text": resume_text # Include the cleaned text for the AI later
        }
        
        # 4. Print the final JSON output
        # print("\n--- Final Structured JSON Output ---")
        # print(json.dumps(final_data, indent=2))