import joblib
import pandas as pd
import re
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from sklearn.metrics.pairwise import cosine_similarity
import spacy # Need spacy for skill extraction, assuming the model is saved/loaded

# --- Configuration ---
# Define the path to the saved TF-IDF vectorizer
vectorizer_path = 'ats_tfidf_vectorizer/tfidf_vectorizer.pkl'

try:
    tfidf_vectorizer = joblib.load(vectorizer_path)
    print(f"Successfully loaded TF-IDF vectorizer from {vectorizer_path}")
except FileNotFoundError:
    print(f"Error: TF-IDF vectorizer not found at {vectorizer_path}")
    tfidf_vectorizer = None
except Exception as e:
    print(f"An error occurred while loading the TF-IDF vectorizer: {e}")
    tfidf_vectorizer = None

# Load spaCy model if available (optional for TF-IDF matching demo)
# try:
#     nlp = spacy.load(spacy_model_path)
#     print(f"Successfully loaded spaCy model from {spacy_model_path}")
# except:
#     print("Could not load spaCy model. Skill extraction will not be available.")
#     nlp = None


# --- Text Cleaning Function (from previous steps) ---
# Ensure this function is the same as the one used during training
stemmer = PorterStemmer()
stop_words = set(stopwords.words('english'))

def clean_text(text):
    if isinstance(text, str):
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        text = ' '.join([stemmer.stem(word) for word in text.split() if word not in stop_words])
        return text
    return ''

# --- Skill Extraction Function (requires spaCy model) ---
# This function would be used for resume-only scoring and providing suggestions
# def extract_skills_from_text(text, spacy_model, esco_matcher):
#     if spacy_model and text:
#         doc = spacy_model(text)
#         matches = esco_matcher(doc) # esco_matcher needs to be initialized with ESCO patterns
#         skills = [doc[start:end].text for match_id, start, end in matches]
#         return list(set(skills))
#     return []


# --- Resume Scoring Function (Resume-only) ---
# This would ideally use extracted skills for a more meaningful score
# For this demo, we'll skip a detailed resume-only score without the spaCy model
# def get_resume_skill_score(extracted_skills):
#     return len(set(extracted_skills))


# --- Resume-JD Matching Function ---
def get_resume_jd_match_score(resume_text, jd_text, vectorizer):
    if vectorizer is None:
        print("Vectorizer not loaded. Cannot calculate match score.")
        return None

    # Clean and vectorize the resume and JD text
    cleaned_resume = clean_text(resume_text)
    cleaned_jd = clean_text(jd_text)

    # Transform the cleaned texts using the loaded vectorizer
    # Use transform, not fit_transform, as the vectorizer is already fitted
    try:
        resume_vector = vectorizer.transform([cleaned_resume])
        jd_vector = vectorizer.transform([cleaned_jd])
    except Exception as e:
        print(f"Error transforming text: {e}")
        return None


    # Calculate cosine similarity between the resume and JD vectors
    # Handle cases where vectors might be empty (e.g., no common words after cleaning)
    if resume_vector.shape[1] == 0 or jd_vector.shape[1] == 0:
         return 0.0 # Or handle as appropriate, e.g., return None

    similarity_score = cosine_similarity(resume_vector, jd_vector)[0][0]

    return similarity_score

# --- Function to Predict Top Resumes ---
def predict_top_resumes(job_description, resumes_df, vectorizer, n=5):
    if vectorizer is None:
        print("Vectorizer not loaded. Cannot predict top resumes.")
        return pd.DataFrame() # Return empty DataFrame

    # Clean and vectorize the job description
    cleaned_jd = clean_text(job_description)
    try:
        jd_vector = vectorizer.transform([cleaned_jd])
    except Exception as e:
        print(f"Error transforming job description: {e}")
        return pd.DataFrame()

    if jd_vector.shape[1] == 0:
        print("Job description vector is empty after cleaning and vectorization.")
        return pd.DataFrame()

    # Add a column for match scores if it doesn't exist
    if 'match_score' not in resumes_df.columns:
        resumes_df['match_score'] = 0.0 # Initialize with 0

    # Calculate match score for each resume
    for index, row in resumes_df.iterrows():
        resume_text = row['cleaned_resume_text'] # Assuming 'cleaned_resume_text' exists
        if isinstance(resume_text, str) and resume_text.strip():
            try:
                # Transform the cleaned resume text
                resume_vector = vectorizer.transform([resume_text])

                # Calculate similarity only if resume vector is not empty
                if resume_vector.shape[1] > 0:
                     score = cosine_similarity(resume_vector, jd_vector)[0][0]
                     resumes_df.loc[index, 'match_score'] = score
                else:
                     resumes_df.loc[index, 'match_score'] = 0.0 # Assign 0 if resume vector is empty

            except Exception as e:
                 print(f"Error processing resume at index {index}: {e}")
                 resumes_df.loc[index, 'match_score'] = 0.0 # Assign 0 on error
        else:
             resumes_df.loc[index, 'match_score'] = 0.0 # Assign 0 for empty/invalid resume text


    # Rank resumes by match score
    ranked_resumes = resumes_df.sort_values(by='match_score', ascending=False)

    # Return the top N resumes
    return ranked_resumes.head(n)


# --- Example Usage ---

# Assume you have a DataFrame of resumes, like the resume_df we used
# For this demo, let's create a small sample DataFrame
data = {
    'resume_id': [1, 2, 3, 4, 5],
    'raw_resume_text': [
        "Experienced software engineer with skills in Python, Java, and SQL. Worked on web development projects.",
        "Data Scientist with background in machine learning, R, and statistical modeling.",
        "Project Manager with experience in Agile methodologies and team leadership.",
        "Full-stack developer proficient in JavaScript, React, and Node.js.",
        "Business Analyst with strong communication and analytical skills."
    ]
}
sample_resumes_df = pd.DataFrame(data)

# Clean the sample resume text
sample_resumes_df['cleaned_resume_text'] = sample_resumes_df['raw_resume_text'].apply(clean_text)


# Define a sample job description
sample_jd = """
We are looking for a Data Scientist with expertise in machine learning, Python, and statistical analysis.
Experience with SQL and cloud platforms is a plus. Strong analytical skills required.
"""

# --- Demonstrate Resume-JD Matching for a single resume ---
# Let's use the second sample resume (index 1)
single_resume_text = sample_resumes_df.loc[1, 'raw_resume_text']
match_score = get_resume_jd_match_score(single_resume_text, sample_jd, tfidf_vectorizer)

print(f"\nMatch score between sample resume 2 and sample JD: {match_score:.4f}")


# --- Demonstrate Predicting Top Resumes ---
if tfidf_vectorizer:
    print("\nPredicting top 3 resumes for the sample JD:")
    top_resumes = predict_top_resumes(sample_jd, sample_resumes_df.copy(), tfidf_vectorizer, n=3) # Use .copy() to avoid modifying the original sample_resumes_df

    # Display the top resumes and their scores
    display(top_resumes[['resume_id', 'raw_resume_text', 'match_score']])
else:
    print("\nCannot demonstrate predicting top resumes because the vectorizer was not loaded.")