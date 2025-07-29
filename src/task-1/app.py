import streamlit as st
import spacy
import json
from prototypes.read_resume import extract_text_from_pdf
from prototypes.parse_text import preprocess_text, extract_contact_info, extract_skills_from_section

@st.cache_resource
def load_spacy_model():
    return spacy.load("en_core_web_sm")

# --- App UI ---
st.title("📄 Darzi AI: Resume Parser Prototype")
st.write("Upload a PDF resume to see the extracted structured data. This demonstrates the first step of our AI pipeline.")

uploaded_file = st.file_uploader("Choose a resume PDF...", type="pdf")

if uploaded_file is not None:
    # To read the file, we need to save it temporarily
    with open("temp_resume.pdf", "wb") as f:
        f.write(uploaded_file.getbuffer())

    st.write("---")
    st.subheader("Parsing in progress...")

    # --- Run the Parsing Logic ---
    raw_text = extract_text_from_pdf("temp_resume.pdf")
    
    if "Error" in raw_text:
        st.error(raw_text)
    else:
        # 1. Preprocess text
        resume_text = preprocess_text(raw_text)
        
        # 2. Load NLP model
        nlp = load_spacy_model()
        
        # 3. Build the final structured data
        final_data = {
            "contact_info": extract_contact_info(resume_text),
            "skills": extract_skills_from_section(resume_text),
            # You can add more parsed data here as you build it
        }

        st.success("Parsing complete!")
        st.subheader("✅ Final Structured JSON Output")
        st.json(final_data)

        # ADD THIS SECTION TO SEE THE RAW TEXT
        st.subheader("📄 Raw Extracted Text")
        st.text_area("This is the text extracted from the PDF before parsing:", resume_text, height=300)