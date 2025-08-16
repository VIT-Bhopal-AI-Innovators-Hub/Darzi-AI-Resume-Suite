"""Streamlit web interface for Darzi Resume Parser and Text Extractor."""

import streamlit as st
import requests
import tempfile
import os
from typing import Optional

st.set_page_config(
    page_title="Darzi Resume Parser & Text Extractor",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Configuration
API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:7860")  # Set API base URL via environment variable

def main():
    st.title("📄 Darzi Resume Parser & Text Extractor")
    st.markdown("AI-powered resume parsing and document text extraction")

    # Sidebar
    st.sidebar.title("🛠️ Tools")
    tool = st.sidebar.selectbox(
        "Choose a tool:",
        ["Resume Parser", "Text Extractor", "ATS Optimizer"]
    )

    if tool == "Resume Parser":
        resume_parser_interface()
    elif tool == "Text Extractor":
        text_extractor_interface()
    elif tool == "ATS Optimizer":
        ats_optimizer_interface()

def resume_parser_interface():
    st.header("🔍 Resume Parser")
    st.markdown("Extract structured data from resumes (PDF or text)")

    input_method = st.radio(
        "Input method:",
        ["Upload PDF", "Paste Text"]
    )

    if input_method == "Upload PDF":
        uploaded_file = st.file_uploader(
            "Choose a PDF file",
            type=["pdf"],
            help="Upload a resume in PDF format"
        )

        if uploaded_file is not None and st.button("Parse Resume"):
            with st.spinner("Parsing resume..."):
                try:
                    files = {"file": uploaded_file.getvalue()}
                    response = requests.post(f"{API_BASE_URL}/parse-pdf", files={"file": uploaded_file})
                    
                    if response.status_code == 200:
                        result = response.json()
                        display_resume_results(result)
                    else:
                        st.error(f"Error: {response.text}")
                except Exception as e:
                    st.error(f"Error: {str(e)}")

    else:  # Paste Text
        resume_text = st.text_area(
            "Paste resume text:",
            height=200,
            help="Copy and paste the resume text here"
        )

        if resume_text and st.button("Parse Resume"):
            with st.spinner("Parsing resume..."):
                try:
                    response = requests.post(
                        f"{API_BASE_URL}/parse",
                        data=resume_text,
                        headers={"Content-Type": "text/plain"}
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        display_resume_results(result)
                    else:
                        st.error(f"Error: {response.text}")
                except Exception as e:
                    st.error(f"Error: {str(e)}")

def text_extractor_interface():
    st.header("📝 Text Extractor")
    st.markdown("Extract text from PDFs, images, and documents")

    input_method = st.radio(
        "Input method:",
        ["Upload File", "Google Drive URL"]
    )

    if input_method == "Upload File":
        uploaded_file = st.file_uploader(
            "Choose a file",
            type=["pdf", "png", "jpg", "jpeg", "gif", "txt", "md", "csv"],
            help="Upload PDF, image, or text file"
        )

        if uploaded_file is not None and st.button("Extract Text"):
            with st.spinner("Extracting text..."):
                try:
                    files = {"file": uploaded_file.getvalue()}
                    response = requests.post(f"{API_BASE_URL}/api/extract", files={"file": uploaded_file})
                    
                    if response.status_code == 200:
                        result = response.json()
                        display_text_results(result)
                    else:
                        st.error(f"Error: {response.text}")
                except Exception as e:
                    st.error(f"Error: {str(e)}")

    else:  # Google Drive URL
        drive_url = st.text_input(
            "Google Drive URL:",
            help="Paste a Google Drive share link"
        )

        if drive_url and st.button("Extract Text from URL"):
            with st.spinner("Extracting text from URL..."):
                try:
                    response = requests.post(
                        f"{API_BASE_URL}/api/extract-url",
                        json={"url": drive_url}
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        display_text_results(result)
                    else:
                        st.error(f"Error: {response.text}")
                except Exception as e:
                    st.error(f"Error: {str(e)}")

def ats_optimizer_interface():
    st.header("📊 ATS Optimizer")
    st.markdown("Optimize your resume for Applicant Tracking Systems")

    resume_text = st.text_area(
        "Resume text:",
        height=200,
        help="Paste your resume text here"
    )

    job_description = st.text_area(
        "Job description (optional):",
        height=150,
        help="Paste the job description for keyword matching"
    )

    if resume_text and st.button("Analyze ATS Compatibility"):
        with st.spinner("Analyzing ATS compatibility..."):
            try:
                payload = {
                    "resume_text": resume_text,
                    "job_description": job_description if job_description else ""
                }
                response = requests.post(f"{API_BASE_URL}/optimize-ats", json=payload)
                
                if response.status_code == 200:
                    result = response.json()
                    display_ats_results(result)
                else:
                    st.error(f"Error: {response.text}")
            except Exception as e:
                st.error(f"Error: {str(e)}")

def display_resume_results(result):
    """Display resume parsing results."""
    if result.get("success"):
        data = result.get("data", {})
        metadata = result.get("metadata", {})
        
        st.success("✅ Resume parsed successfully!")
        
        # Display confidence score
        confidence = data.get("confidence_score", 0)
        st.metric("Confidence Score", f"{confidence:.2f}")
        
        # Create tabs for different sections
        tabs = st.tabs(["Personal Info", "Skills", "Experience", "Education", "Raw Data"])
        
        with tabs[0]:  # Personal Info
            col1, col2 = st.columns(2)
            with col1:
                st.subheader("📋 Personal Information")
                st.write(f"**Name:** {data.get('name', 'Not found')}")
                st.write(f"**Summary:** {data.get('summary', 'Not available')}")
            
            with col2:
                st.subheader("📞 Contact")
                emails = data.get('email', [])
                phones = data.get('mobile_number', [])
                st.write(f"**Email:** {', '.join(emails) if emails else 'Not found'}")
                st.write(f"**Phone:** {', '.join(phones) if phones else 'Not found'}")
        
        with tabs[1]:  # Skills
            st.subheader("🛠️ Skills")
            skills = data.get('skills', [])
            if skills:
                # Display skills as tags
                skills_html = " ".join([f"<span style='background-color: #e1f5fe; padding: 4px 8px; margin: 2px; border-radius: 4px; display: inline-block;'>{skill}</span>" for skill in skills])
                st.markdown(skills_html, unsafe_allow_html=True)
            else:
                st.write("No skills found")
        
        with tabs[2]:  # Experience
            st.subheader("💼 Experience")
            experience = data.get('experience', [])
            if experience:
                for i, exp in enumerate(experience):
                    st.write(f"**{i+1}.** {exp}")
            else:
                st.write("No experience found")
        
        with tabs[3]:  # Education
            st.subheader("🎓 Education")
            education = data.get('education', [])
            if education:
                for i, edu in enumerate(education):
                    st.write(f"**{i+1}.** {edu}")
            else:
                st.write("No education found")
        
        with tabs[4]:  # Raw Data
            st.subheader("📄 Raw Data")
            st.json(data)

def display_text_results(result):
    """Display text extraction results."""
    if result.get("success"):
        text = result.get("text", "")
        file_info = result.get("file_info", {})
        
        st.success("✅ Text extracted successfully!")
        
        # Display file info
        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("File Name", file_info.get("name", "Unknown"))
        with col2:
            st.metric("File Size", file_info.get("size", "Unknown"))
        with col3:
            st.metric("File Type", file_info.get("type", "Unknown"))
        
        # Display extracted text
        st.subheader("📄 Extracted Text")
        st.text_area("", value=text, height=400, disabled=True)
        
        # Download button
        st.download_button(
            label="📥 Download Text",
            data=text,
            file_name="extracted_text.txt",
            mime="text/plain"
        )

def display_ats_results(result):
    """Display ATS optimization results."""
    if result.get("success"):
        data = result.get("data", {})
        ats_score = data.get("ats_score", 0)
        suggestions = data.get("suggestions", [])
        
        st.success("✅ ATS analysis completed!")
        
        # Display ATS score with color coding
        score_color = "green" if ats_score >= 70 else "orange" if ats_score >= 50 else "red"
        st.markdown(f"### ATS Score: <span style='color: {score_color}; font-size: 2em;'>{ats_score}/100</span>", unsafe_allow_html=True)
        
        # Display suggestions
        st.subheader("💡 Improvement Suggestions")
        for i, suggestion in enumerate(suggestions, 1):
            st.write(f"{i}. {suggestion}")
        
        # Display optimized sections if available
        optimized_sections = data.get("optimized_sections", {})
        if optimized_sections:
            st.subheader("🔧 Detailed Analysis")
            
            # Keywords analysis
            if "keywords" in optimized_sections:
                keywords_data = optimized_sections["keywords"]
                st.write("**Keyword Matching:**")
                st.write(f"- Match Percentage: {keywords_data.get('match_percentage', 0)}%")
                
                missing_keywords = keywords_data.get('missing_keywords', [])
                if missing_keywords:
                    st.write("**Missing Keywords:**")
                    keywords_html = " ".join([f"<span style='background-color: #ffebee; padding: 4px 8px; margin: 2px; border-radius: 4px; display: inline-block;'>{keyword}</span>" for keyword in missing_keywords[:10]])
                    st.markdown(keywords_html, unsafe_allow_html=True)
            
            # Formatting suggestions
            if "formatting" in optimized_sections:
                formatting_suggestions = optimized_sections["formatting"]
                st.write("**Formatting Recommendations:**")
                for suggestion in formatting_suggestions:
                    st.write(f"- {suggestion}")

if __name__ == "__main__":
    main()
