#!/usr/bin/env python3
"""
Local MCP Server for Resume Parsing
Run this server locally to provide AI-enhanced parsing capabilities
"""

import asyncio
import json
import re
from typing import Dict, List, Any
from fastmcp import FastMCP

mcp = FastMCP("Resume Parser MCP")

@mcp.tool()
def parse_resume(text: str) -> dict:
    result = {
        "name": extract_name_enhanced(text),
        "email": extract_email_enhanced(text), 
        "mobile_number": extract_phone_enhanced(text),
        "skills": extract_skills_enhanced(text),
        "education": extract_education_enhanced(text),
        "experience": extract_experience_enhanced(text),
        "summary": extract_summary(text),
        "certifications": extract_certifications(text),
        "parsing_confidence": calculate_confidence(text)
    }
    
    return result

def extract_name_enhanced(text: str) -> str:
    lines = text.strip().split('\n')
    
    for line in lines[:3]:
        line = line.strip()
        if not line:
            continue
            
        if re.search(r'[@\d\.\-\(\)]+', line):
            continue
            
        words = line.split()
        if 2 <= len(words) <= 4:
            if all(word[0].isupper() and word.isalpha() for word in words):
                return line
    
    return ""

def extract_email_enhanced(text: str) -> List[str]:
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text, re.IGNORECASE)
    
    filtered_emails = []
    for email in emails:
        if not any(domain in email.lower() for domain in ['example.com', 'test.com', 'dummy']):
            filtered_emails.append(email)
    
    return filtered_emails

def extract_phone_enhanced(text: str) -> List[str]:
    phone_patterns = [
        r'\+?1?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})',
        r'\+?91[-.\s]?\d{10}',  #indian format btw
        r'\b\d{10}\b',
        r'\(\d{3}\)\s?\d{3}[-.\s]?\d{4}',
    ]
    
    phones = []
    for pattern in phone_patterns:
        matches = re.findall(pattern, text)
        for match in matches:
            if isinstance(match, tuple):
                phone = ''.join(match)
            else:
                phone = match
            
            digits_only = re.sub(r'\D', '', phone)
            if 10 <= len(digits_only) <= 15:
                phones.append(phone)
    
    return list(set(phones))  # Remove duplicates

def extract_skills_enhanced(text: str) -> List[str]:

    technical_skills = {
        'programming': ['python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab'],
        'web': ['html', 'css', 'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask', 'fastapi', 'spring', 'laravel'],
        'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'cassandra'],
        'cloud': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible'],
        'data_science': ['machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'tableau', 'power bi'],
        'tools': ['git', 'linux', 'jira', 'confluence', 'figma', 'photoshop', 'excel']
    }
    
    all_skills = []
    for category, skills in technical_skills.items():
        all_skills.extend(skills)
    
    found_skills = []
    text_lower = text.lower()
    
    skills_section = extract_skills_section(text_lower)
    search_text = skills_section if skills_section else text_lower
    
    for skill in all_skills:
        if re.search(r'\b' + re.escape(skill.lower()) + r'\b', search_text):
            found_skills.append(skill.title())
    
    soft_skills = ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'creative']
    for skill in soft_skills:
        if re.search(r'\b' + re.escape(skill.lower()) + r'\b', text_lower):
            found_skills.append(skill.title())
    
    return sorted(list(set(found_skills)))

def extract_skills_section(text: str) -> str:
    patterns = [
        r'skills?[:\s]+(.*?)(?=\n[a-z\s]*[A-Z][A-Z\s]+:|$)',
        r'technical\s+skills?[:\s]+(.*?)(?=\n[a-z\s]*[A-Z][A-Z\s]+:|$)',
        r'technologies?[:\s]+(.*?)(?=\n[a-z\s]*[A-Z][A-Z\s]+:|$)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            return match.group(1)
    return ""

def extract_education_enhanced(text: str) -> List[Dict[str, str]]:
    education = []
    
    degree_patterns = [
        r'(bachelor\s+of\s+\w+(?:\s+\w+)*)',
        r'(master\s+of\s+\w+(?:\s+\w+)*)',
        r'(b\.?(?:s|a|tech|e)\.?\s+(?:in\s+)?\w+(?:\s+\w+)*)',
        r'(m\.?(?:s|a|tech|ba)\.?\s+(?:in\s+)?\w+(?:\s+\w+)*)',
        r'(phd\s+in\s+\w+(?:\s+\w+)*)',
    ]
    
    university_pattern = r'(\w+(?:\s+\w+)*\s+(?:university|college|institute))'
    
    text_lower = text.lower()
    
    for pattern in degree_patterns:
        matches = re.findall(pattern, text_lower, re.IGNORECASE)
        for match in matches:
            degree_info = {"degree": match.title(), "institution": "", "year": ""}
            
            degree_context = text_lower[max(0, text_lower.find(match.lower())-100):text_lower.find(match.lower())+200]
            uni_match = re.search(university_pattern, degree_context, re.IGNORECASE)
            if uni_match:
                degree_info["institution"] = uni_match.group(1).title()
            
            year_match = re.search(r'(19|20)\d{2}', degree_context)
            if year_match:
                degree_info["year"] = year_match.group(0)
            
            education.append(degree_info)
    
    return education

def extract_experience_enhanced(text: str) -> List[Dict[str, str]]:
    experience = []
    
    exp_patterns = [
        r'(?:work\s+)?experience[:\s]+(.*?)(?=\n[A-Z][A-Z\s]*[:\n]|$)',
        r'employment[:\s]+(.*?)(?=\n[A-Z][A-Z\s]*[:\n]|$)',
        r'professional\s+experience[:\s]+(.*?)(?=\n[A-Z][A-Z\s]*[:\n]|$)',
    ]
    
    exp_text = text
    for pattern in exp_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            exp_text = match.group(1)
            break
    
    job_patterns = [
        r'([A-Z][a-zA-Z\s]*(?:Engineer|Developer|Manager|Analyst|Consultant|Specialist))\s*[-–—]\s*([A-Z][a-zA-Z\s&,.]*)',
        r'([A-Z][a-zA-Z\s]*)\s+at\s+([A-Z][a-zA-Z\s&,.]*)',
    ]
    
    for pattern in job_patterns:
        matches = re.findall(pattern, exp_text)
        for match in matches:
            job_info = {
                "title": match[0].strip(),
                "company": match[1].strip(),
                "duration": "",
                "description": ""
            }
            
            context = exp_text[max(0, exp_text.find(match[0])-50):exp_text.find(match[0])+300]
            duration_match = re.search(r'((?:19|20)\d{2})\s*[-–—]\s*((?:19|20)\d{2}|present)', context, re.IGNORECASE)
            if duration_match:
                job_info["duration"] = f"{duration_match.group(1)} - {duration_match.group(2)}"
            
            experience.append(job_info)
    
    return experience[:5]  

def extract_summary(text: str) -> str:
    summary_patterns = [
        r'(?:summary|objective|profile)[:\s]+(.*?)(?=\n[A-Z][A-Z\s]*[:\n]|$)',
        r'(?:professional\s+summary|career\s+objective)[:\s]+(.*?)(?=\n[A-Z][A-Z\s]*[:\n]|$)',
    ]
    
    for pattern in summary_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            summary = match.group(1).strip()
            summary = re.sub(r'\s+', ' ', summary)
            return summary[:300] + "..." if len(summary) > 300 else summary
    
    return ""

def extract_certifications(text: str) -> List[str]:
    cert_patterns = [
        r'certifications?[:\s]+(.*?)(?=\n[A-Z][A-Z\s]*[:\n]|$)',
        r'certificates?[:\s]+(.*?)(?=\n[A-Z][A-Z\s]*[:\n]|$)',
    ]
    
    certifications = []
    for pattern in cert_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        if match:
            cert_text = match.group(1)
            certs = re.split(r'[,\n•\-]', cert_text)
            for cert in certs:
                cert = cert.strip()
                if len(cert) > 3:  # Filter out short entries
                    certifications.append(cert)
    
    return certifications

def calculate_confidence(text: str) -> float:
    score = 0.0
    
    if extract_name_enhanced(text): score += 0.2
    if extract_email_enhanced(text): score += 0.2
    if extract_phone_enhanced(text): score += 0.15
    if extract_skills_enhanced(text): score += 0.25
    if extract_education_enhanced(text): score += 0.1
    if extract_experience_enhanced(text): score += 0.1
    
    return min(score, 1.0)

async def main():
    await mcp.run(transport="stdio")

if __name__ == "__main__":
    asyncio.run(main())