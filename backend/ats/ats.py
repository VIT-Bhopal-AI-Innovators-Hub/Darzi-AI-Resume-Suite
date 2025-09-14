import pandas as pd
import re
import os
import zipfile
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from collections import Counter
import spacy
from spacy.matcher import PhraseMatcher






resume_file_path = "/content/Resume_AyushPandey_V15.pdf"



esco_zip_path = '/content/ESCO dataset - v1.2.0 - classification - en - csv.zip'

target_csv_name = 'skills_en.csv'
extracted_csv_path = f'/tmp/{target_csv_name}' 


stemmer = PorterStemmer()
stop_words = set(stopwords.words('english'))

def clean_text(text):
    """Cleans and preprocesses text."""
    if isinstance(text, str):
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        text = ' '.join([stemmer.stem(word) for word in text.split() if word not in stop_words])
        return text
    return ''







def extract_text_from_resume_pdf(pdf_path):
    """
    Extracts text content from a PDF file.
    Requires 'tika' library and a running Tika server (or it will try to start one).
    Alternatively, you can use other PDF parsing libraries.
    """
    try:
        from tika import parser
        parsed_resume = parser.from_file(pdf_path)
        return parsed_resume.get('content', '')
    except ImportError:
        print("Tika library not found. Please install it (`pip install tika`).")
        return ""
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""


resume_text = extract_text_from_resume_pdf(resume_file_path)

if not resume_text or not resume_text.strip():
    print(f"Could not extract text from {resume_file_path}. Exiting.")
    exit() 


print("Analyzing for buzzwords...")
buzzwords = [
    "machine learning", "deep learning", "artificial intelligence", "data science",
    "big data", "cloud computing", "aws", "azure", "gcp", "devops", "agile", "scrum",
    "python", "r", "sql", "nosql", "docker", "kubernetes", "ci/cd", "nlp",
    "computer vision", "predictive modeling", "statistical analysis", "data mining",
    "business intelligence", "ETL", "API", "microservices", "containerization",
    "javascript", "react", "angular", "vue", "node.js", "backend", "frontend",
    "full-stack", "cybersecurity", "blockchain", "iot", "data engineering",
    "data visualization", "tableau", "power bi", "spark", "hadoop", "kafka",
    "tensorflow", "pytorch", "scikit-learn", "statistical modeling",
    "natural language processing", "reinforcement learning", "supervised learning",
    "unsupervised learning", "feature engineering", "model deployment", " scalable",
    "robust", "efficient", "optimize", "automate", "innovative", "strategic",
    "leadership", "communication", "collaboration", "problem-solving",
    "critical thinking", "quantitative", "qualitative", "analytical",
    "customer-facing", "cross-functional", "stakeholders", " ROI", "KPIs",
    "A/B testing", "workflow", "pipeline", "architecture", "design patterns",
    "best practices", "documentation", "testing", "debugging", "performance tuning",
    "scalability", "reliability", "security", " compliance", "governance",
    "mentoring", "training", "presentation", "reporting", "dashboarding",
    "monitoring", "alerting", "logging", "troubleshooting", "optimization",
    "automation", "innovation", "strategy", "execution", "delivery", "roadmap",
    "vision", "mission", "values", "culture", "team player", "independent",
    "proactive", "results-oriented", "detail-oriented", "organized", "flexible",
    "adaptable", "resourceful", "creative", "passionate", "driven", "motivated",
    "enthusiastic", "committed", "dedicated", "reliable", "responsible",
    "ethical", "professional", "positive attitude", "strong work ethic",
    "time management", "prioritization", "multitasking", "negotiation",
    "persuasion", "influence", "mentorship", "coaching", "feedback",
    "performance", "evaluation", "recruitment", "hiring", "onboarding",
    "retention", "engagement", "satisfaction", "loyalty", "advocacy",
    "brand", "marketing", "sales", "finance", "accounting", "legal",
    "HR", "operations", "supply chain", "logistics", "procurement",
    "inventory", "warehousing", "transportation", "customer service",
    "user experience", "ui/ux", "product management", "project management",
    "program management", "portfolio management", "risk management",
    "quality assurance", "testing", "automation testing", "manual testing",
    "performance testing", "security testing", "usability testing",
    "accessibility testing", "compliance testing", "governance testing",
    "audit", "compliance", "regulation", "policy", "standard", "framework",
    "methodology", "process", "workflow", "procedure", "guideline",
    "best practice", "lessons learned", "post-mortem", "retrospective",
    "stand-up", "sprint", "epic", "user story", "task", "bug", "feature",
    "release", "version control", "git", "github", "gitlab", "bitbucket",
    "jira", "confluence", "slack", "microsoft teams", "google workspace",
    "office 365", "salesforce", "servicenow", "zendesk", "hubspot",
    "marketo", "pardot", "salesloft", "outreach", "zoominfo",
    "linkedin sales navigator", "crunchbase", "clearbit", "zoom",
    "google meet", "microsoft teams", "webex", "skype", "slack",
    "jira", "confluence", "trello", "asana", "monday.com",
    "smartsheet", "microsoft project", "primavera", "servicenow",
    "zendes",
]

resume_text_lower = str(resume_text).lower()
buzzword_count = 0
for buzzword in buzzwords:
    if buzzword in resume_text_lower:
        buzzword_count += 1
print(f"Identified {buzzword_count} buzzwords.")


print("\nAnalyzing for quantifiable impact...")
refined_quantifiable_patterns = [
    r'(?:increased|reduced|improved|decreased|boosted|cut|grew)\s+.*?by\s+([\d,\.]+\s*%?)',
    r'(?:managed|led|oversaw)\s+(?:a\s+team\s+of|[\d,\.]+\s+projects?)',
    r'(?:saved)\s+([\$\€\£]?[\d,\.]+)',
    r'(?:achieved|delivered)\s+(?:a\s+)?([\d,\.]+%?)\s+.*?',
    r'(?:handled|processed)\s+([\d,\.]+)\s+(?:data\s+records?|transactions?)',
    r'(?:developed|implemented)\s+.*?for\s+([\d,\.]+)\s+users?',
    r'(?:optimized|streamlined)\s+.*?resulting\s+in\s+([\d,\.]+%?)\s+reduction',
    r'(?:optimized|streamlined)\s+.*?leading\s+to\s+([\d,\.]+%?)\s+improvement',
    r'([\d,\.]+%?)\s+(?:increase|reduction|improvement|gain|growth)',
    r'(?:handled|processed|managed|completed)\s+([\d,\.]+)\s+.*?(?:tasks|projects|clients|transactions|users)',
    r'(?:generated)\s+([\$\€\£]?[\d,\.]+)\s+(?:in\s+revenue|sales)',
    r'(?:served)\s+([\d,\.]+)\s+clients?',
    r'(?:grew)\s+.*?by\s+([\d,\.]+\s*%)',
    r'(?:decreased)\s+.*?by\s+([\d,\.]+\s*%)',
    r'(?:cut)\s+costs?\s+by\s+([\d,\.]+\s*%)',
    r'(?:boosted)\s+.*?by\s+([\d,\.]+\s*%)',
    r'(?:reduced)\s+[\w\s]+by\s+([\d,\.]+%?)\s+\w+'
]

quantifiable_achievements_refined = []
resume_text_lower = str(resume_text).lower()
for pattern in refined_quantifiable_patterns:
    matches = re.findall(pattern, resume_text_lower)
    if matches:
        for match in matches:
            if isinstance(match, tuple):
                quantifiable_achievements_refined.extend([item for item in match if item])
            else:
                quantifiable_achievements_refined.append(match)

quantifiable_count = len(quantifiable_achievements_refined)
print(f"Identified {quantifiable_count} quantifiable achievements.")


print("\nAnalyzing date formats...")
date_patterns = [
    r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b',
    r'\b\d{1,2}/\d{4}\b',
    r'\b\d{4}-\d{2}-\d{2}\b',
    r'\b\d{4}\b',
    r'\bPresent\b|\bTo Date\b|\bCurrent\b',
    r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\s*-\s*(?:Present|To Date|Current|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\b\d{1,2}/\d{4}|\b\d{4}-\d{2}-\d{2}|\b\d{4})\b',
    r'\b\d{1,2}/\d{4}\s*-\s*(?:Present|To Date|Current|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\b\d{1,2}/\d{4}|\b\d{4}-\d{2}-\d{2}|\b\d{4})\b',
    r'\b\d{4}\s*-\s*(?:Present|To Date|Current|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\b\d{1,2}/\d{4}|\b\d{4}-\d{2}-\d{2}|\b\d{4})\b'
]

identified_dates = []
resume_text_lower = str(resume_text).lower()
for pattern in date_patterns:
    matches = re.findall(pattern, resume_text_lower, re.IGNORECASE)
    if matches:
        for match in matches:
            if isinstance(match, tuple):
                identified_dates.extend([item for item in match if item])
            else:
                identified_dates.append(match)




date_consistency = False 
print(f"Identified date strings: {identified_dates}")
print(f"Date format consistency assessed as: {date_consistency}")



print("\nAnalyzing for repetitions...")
words = re.findall(r'\b\w+\b', str(resume_text).lower())
word_counts = Counter(words)


repetition_penalty = 0

ignore_words = set(stopwords.words('english') + ['com', 'https', 'www', 'ayushpandey003', 'github', 'linkedin', 'leetcode', 'project', 'skill', 'experi', 'develop', 'system'])

high_frequency_words = [word for word, count in word_counts.most_common(50) if count > 10 and word not in ignore_words]

if high_frequency_words:
    repetition_penalty = len(high_frequency_words) * 5 
    print(f"Potential excessive repetition of words detected: {high_frequency_words}")
else:
    print("Excessive repetition does not appear to be a major issue based on common words.")

print(f"Repetition penalty applied: {repetition_penalty}")


print("\nAnalyzing for technical quality words from ESCO...")
unique_technical_terms_count = 0 

try:
    
    with zipfile.ZipFile(esco_zip_path, 'r') as zip_ref:
        if target_csv_name in zip_ref.namelist():
            zip_ref.extract(target_csv_name, path='/tmp/')
            print(f"Successfully extracted {target_csv_name} from the zip.")
        else:
            print(f"Error: '{target_csv_name}' not found in the zip archive.")
            extracted_csv_path = None

    if extracted_csv_path and os.path.exists(extracted_csv_path):
        
        esco_skills_df = pd.read_csv(extracted_csv_path)
        print("Successfully loaded ESCO dataset.")

        
        os.remove(extracted_csv_path)
        print(f"Cleaned up temporary file: {extracted_csv_path}")

        
        required_cols = ['preferredLabel', 'altLabels', 'description']
        if all(col in esco_skills_df.columns for col in required_cols):
            esco_terms = []
            for index, row in esco_skills_df.iterrows():
                if pd.notna(row['preferredLabel']) and isinstance(row['preferredLabel'], str):
                    esco_terms.append(row['preferredLabel'])
                if pd.notna(row['altLabels']) and isinstance(row['altLabels'], str):
                    alt_labels = [label.strip() for label in row['altLabels'].split(',') if label.strip()]
                    esco_terms.extend(alt_labels)
                if pd.notna(row['description']) and isinstance(row['description'], str):
                    esco_terms.append(row['description'])

            esco_terms = list(set([str(term) for term in esco_terms if term]))
            cleaned_esco_terms = [clean_text(term) for term in esco_terms]
            cleaned_esco_terms = [term for term in cleaned_esco_terms if term]

            
            nlp_esco_matcher = spacy.blank("en")
            esco_matcher = PhraseMatcher(nlp_esco_matcher.vocab)
            esco_term_docs = list(nlp_esco_matcher.pipe(cleaned_esco_terms, disable=["parser", "ner"]))
            esco_patterns = [nlp_esco_matcher.make_doc(doc.text) for doc in esco_term_docs]
            esco_matcher.add("TECHNICAL_TERMS", esco_patterns)

            cleaned_resume_text_esco = clean_text(resume_text)
            if cleaned_resume_text_esco:
                resume_doc_esco = nlp_esco_matcher(cleaned_resume_text_esco)
                esco_matches = esco_matcher(resume_doc_esco)
                identified_technical_terms = [resume_doc_esco[start:end].text for match_id, start, end in esco_matches]
                unique_technical_terms_count = len(set(identified_technical_terms))
                print(f"Identified {unique_technical_terms_count} unique technical quality words.")
            else:
                 print("Cleaned resume text is empty, cannot extract technical terms.")
        else:
             print("Error: Required columns not found in ESCO dataset.")

    else:
        print("Failed to extract or find the target CSV in the zip.")

except FileNotFoundError:
    print(f"Error: ESCO zip file not found at {esco_zip_path}")
except Exception as e:
    print(f"An error occurred during ESCO processing: {e}")


print("\nAnalyzing resume structure (sections)...")
section_titles = [
    "summary", "objective", "education", "experience", "work experience",
    "professional experience", "skills", "technical skills", "projects",
    "portfolio", "awards", "honors", "publications", "presentations",
    "licenses", "certifications", "volunteering", "interests", "contact",
    "contact information"
]
resume_text_lower = str(resume_text).lower()
identified_sections_count = 0
for title in section_titles:
    if re.search(r'\b' + re.escape(title) + r'\b', resume_text_lower):
        identified_sections_count += 1
print(f"Estimated number of sections: {identified_sections_count}")


def calculate_comprehensive_resume_score(
    buzzword_count,
    quantifiable_count,
    date_consistency,
    repetition_penalty,
    unique_technical_terms_count,
    sections_count
):
    """Calculates a comprehensive resume quality score."""
    buzzword_points = buzzword_count * 0.5
    quantifiable_points = quantifiable_count * 10
    date_consistency_points = 30 if date_consistency else -10
    technical_terms_points = unique_technical_terms_count * 2
    sections_points = sections_count * 5

    total_score = (
        buzzword_points +
        quantifiable_points +
        date_consistency_points +
        technical_terms_points +
        sections_points -
        repetition_penalty
    )
    return max(0, int(total_score))


comprehensive_resume_score = calculate_comprehensive_resume_score(
    buzzword_count,
    quantifiable_count,
    date_consistency,
    repetition_penalty,
    unique_technical_terms_count,
    identified_sections_count
)


print("\n--- Resume Quality Analysis Results ---")
print(f"Comprehensive Resume Quality Score: {comprehensive_resume_score}")

print("\nDetailed Feedback:")


print("\nDate Format Consistency:")
if date_consistency:
    print("Date formats appear consistent.")
else:
    print("Inconsistent date formats found. Suggestion: Use a single, standard format (e.g., 'Month YYYY - Month YYYY').")


quantifiable_threshold = 5
print("\nQuantifiable Achievements:")
print(f"Identified {quantifiable_count} quantifiable achievements.")
if quantifiable_count < quantifiable_threshold:
    print(f"Suggestion: Add more quantifiable achievements using numbers and metrics.")
else:
    print("Good job including quantifiable achievements.")


buzzword_threshold = 20
print("\nIndustry Keywords (Buzzwords):")
print(f"Identified {buzzword_count} industry-specific keywords.")
if buzzword_count < buzzword_threshold:
    print(f"Suggestion: Incorporate more relevant industry-specific keywords.")
else:
    print("Your resume includes a good number of relevant industry keywords.")


print("\nRepetition:")
if repetition_penalty > 0:
     print(f"Some potential word or phrase repetition noted (penalty applied: {repetition_penalty}). Suggestion: Review for varied language.")
else:
     print("Excessive repetition does not appear to be a significant issue.")


technical_terms_threshold = 15
print("\nTechnical Quality Words (from ESCO):")
print(f"Identified {unique_technical_terms_count} unique technical quality words.")
if unique_technical_terms_count < technical_terms_threshold:
    print(f"Suggestion: Include more specific technical skills and knowledge relevant to your target roles.")
else:
    print("Your resume includes a good range of relevant technical quality words.")


sections_threshold = 4
print("\nResume Structure (Sections):")
print(f"Estimated number of sections: {identified_sections_count}.")
if identified_sections_count < sections_threshold:
    print("Suggestion: Organize your resume into standard sections.")
else:
    print("Your resume appears to have a good structural organization.")

print("\n--- Key Areas for Improvement ---")
improvement_suggestions = []
if not date_consistency:
    improvement_suggestions.append("Ensure consistent date formats throughout.")
if quantifiable_count < quantifiable_threshold:
    improvement_suggestions.append("Add more quantifiable achievements with metrics.")
if repetition_penalty > 0:
    improvement_suggestions.append("Review for and reduce word/phrase repetitions.")
if unique_technical_terms_count < technical_terms_threshold:
    improvement_suggestions.append("Include more specific technical skills and knowledge.")
if identified_sections_count < sections_threshold:
    improvement_suggestions.append("Improve resume structure by adding standard sections.")

if improvement_suggestions:
    for suggestion in improvement_suggestions:
        print(f"- {suggestion}")
else:
    print("Based on the analysis, your resume is well-structured and contains relevant content. Continue to tailor it for specific job applications.")