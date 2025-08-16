"""
Flexible field extraction utilities for dynamic resume parsing
"""
from typing import Dict, Any, List, Optional, Union
import re
from datetime import datetime

class FlexibleFieldExtractor:
    """Extract and normalize fields from dynamically parsed resume data"""
    
    def __init__(self, parsed_data: Dict[str, Any]):
        self.data = parsed_data
        self.normalized = {}
        
    def extract_contact_info(self) -> Dict[str, Any]:
        """Extract contact information from various possible sections"""
        contact_info = {}
        
        # Common section names for contact info
        contact_sections = [
            'contact_information', 'personal_details', 'personal_info',
            'contact_details', 'personal', 'contact', 'header_info'
        ]
        
        for section_name in contact_sections:
            if section_name in self.data:
                section = self.data[section_name]
                if isinstance(section, dict):
                    contact_info.update(section)
                    break
        
        # Also check top-level fields
        top_level_contact_fields = ['name', 'email', 'phone', 'location', 'address']
        for field in top_level_contact_fields:
            if field in self.data:
                contact_info[field] = self.data[field]
        
        return self._normalize_contact_info(contact_info)
    
    def extract_experience(self) -> List[Dict[str, Any]]:
        """Extract work experience from various possible sections"""
        experience_sections = [
            'work_experience', 'professional_experience', 'employment_history',
            'experience', 'career_history', 'employment', 'work_history',
            'professional_background', 'job_history'
        ]
        
        for section_name in experience_sections:
            if section_name in self.data:
                experience = self.data[section_name]
                if isinstance(experience, list):
                    return [self._normalize_experience_item(item) for item in experience]
                elif isinstance(experience, dict):
                    return [self._normalize_experience_item(experience)]
        
        return []
    
    def extract_education(self) -> List[Dict[str, Any]]:
        """Extract education from various possible sections"""
        education_sections = [
            'education', 'academic_background', 'educational_background',
            'academic_history', 'schooling', 'qualifications'
        ]
        
        for section_name in education_sections:
            if section_name in self.data:
                education = self.data[section_name]
                if isinstance(education, list):
                    return [self._normalize_education_item(item) for item in education]
                elif isinstance(education, dict):
                    return [self._normalize_education_item(education)]
        
        return []
    
    def extract_skills(self) -> Dict[str, List[str]]:
        """Extract skills from various sections and categorize them"""
        skills = {}
        
        # Direct skill sections
        skill_sections = [
            'skills', 'technical_skills', 'core_competencies', 'expertise',
            'proficiencies', 'capabilities', 'competencies'
        ]
        
        for section_name in skill_sections:
            if section_name in self.data:
                section = self.data[section_name]
                if isinstance(section, dict):
                    skills.update(section)
                elif isinstance(section, list):
                    skills['general_skills'] = section
        
        # Look for specific skill categories
        skill_categories = [
            'programming_languages', 'frameworks', 'libraries', 'databases',
            'cloud_platforms', 'tools', 'software', 'technologies',
            'languages', 'soft_skills', 'certifications'
        ]
        
        for category in skill_categories:
            if category in self.data:
                skills[category] = self.data[category] if isinstance(self.data[category], list) else [self.data[category]]
        
        return skills
    
    def extract_projects(self) -> List[Dict[str, Any]]:
        """Extract projects from various possible sections"""
        project_sections = [
            'projects', 'portfolio', 'personal_projects', 'side_projects',
            'notable_projects', 'key_projects', 'project_experience'
        ]
        
        for section_name in project_sections:
            if section_name in self.data:
                projects = self.data[section_name]
                if isinstance(projects, list):
                    return [self._normalize_project_item(item) for item in projects]
                elif isinstance(projects, dict):
                    return [self._normalize_project_item(projects)]
        
        return []
    
    def extract_summary(self) -> str:
        """Extract professional summary from various sections"""
        summary_sections = [
            'professional_summary', 'summary', 'objective', 'profile',
            'career_objective', 'professional_profile', 'overview',
            'about', 'introduction', 'bio'
        ]
        
        for section_name in summary_sections:
            if section_name in self.data:
                summary = self.data[section_name]
                if isinstance(summary, str):
                    return summary.strip()
        
        return ""
    
    def extract_additional_sections(self) -> Dict[str, Any]:
        """Extract any additional sections not covered by standard categories"""
        standard_sections = {
            'contact_information', 'personal_details', 'personal_info',
            'work_experience', 'professional_experience', 'employment_history',
            'education', 'academic_background', 'skills', 'technical_skills',
            'projects', 'portfolio', 'professional_summary', 'summary',
            '_metadata'
        }
        
        additional = {}
        for key, value in self.data.items():
            if key not in standard_sections:
                additional[key] = value
        
        return additional
    
    def get_normalized_resume(self) -> Dict[str, Any]:
        """Get a normalized resume structure with all extracted fields"""
        return {
            'contact_information': self.extract_contact_info(),
            'professional_summary': self.extract_summary(),
            'work_experience': self.extract_experience(),
            'education': self.extract_education(),
            'skills': self.extract_skills(),
            'projects': self.extract_projects(),
            'additional_sections': self.extract_additional_sections(),
            'raw_parsed_data': self.data,
            'extraction_metadata': {
                'sections_found': list(self.data.keys()),
                'total_sections': len(self.data.keys()),
                'extraction_timestamp': datetime.utcnow().isoformat()
            }
        }
    
    def _normalize_contact_info(self, contact: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize contact information fields"""
        normalized = {}
        
        # Name variations
        name_fields = ['full_name', 'name', 'full name', 'candidate_name']
        for field in name_fields:
            if field in contact:
                normalized['full_name'] = contact[field]
                break
        
        # Email
        email_fields = ['email', 'email_address', 'e-mail']
        for field in email_fields:
            if field in contact:
                normalized['email'] = contact[field]
                break
        
        # Phone
        phone_fields = ['phone', 'phone_number', 'mobile', 'telephone', 'contact_number']
        for field in phone_fields:
            if field in contact:
                normalized['phone'] = contact[field]
                break
        
        # Location
        location_fields = ['location', 'address', 'city', 'residence']
        for field in location_fields:
            if field in contact:
                normalized['location'] = contact[field]
                break
        
        # Links
        link_fields = ['linkedin', 'linkedin_url', 'github', 'github_url', 'portfolio', 'website']
        for field in link_fields:
            if field in contact:
                normalized[field] = contact[field]
        
        return normalized
    
    def _normalize_experience_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize a work experience item"""
        if not isinstance(item, dict):
            return {}
        
        normalized = {}
        
        # Company
        company_fields = ['company', 'employer', 'organization', 'firm']
        for field in company_fields:
            if field in item:
                normalized['company'] = item[field]
                break
        
        # Position
        position_fields = ['position', 'title', 'role', 'job_title', 'designation']
        for field in position_fields:
            if field in item:
                normalized['position'] = item[field]
                break
        
        # Duration/Dates
        date_fields = ['duration', 'dates', 'period', 'start_date', 'end_date']
        for field in date_fields:
            if field in item:
                normalized[field] = item[field]
        
        # Description
        desc_fields = ['description', 'responsibilities', 'duties', 'achievements', 'summary']
        for field in desc_fields:
            if field in item:
                normalized[field] = item[field]
        
        # Copy any other fields
        for key, value in item.items():
            if key not in normalized:
                normalized[key] = value
        
        return normalized
    
    def _normalize_education_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize an education item"""
        if not isinstance(item, dict):
            return {}
        
        normalized = {}
        
        # Institution
        institution_fields = ['institution', 'school', 'university', 'college']
        for field in institution_fields:
            if field in item:
                normalized['institution'] = item[field]
                break
        
        # Degree
        degree_fields = ['degree', 'qualification', 'program']
        for field in degree_fields:
            if field in item:
                normalized['degree'] = item[field]
                break
        
        # Field of study
        field_fields = ['field', 'field_of_study', 'major', 'specialization', 'subject']
        for field in field_fields:
            if field in item:
                normalized['field_of_study'] = item[field]
                break
        
        # Copy any other fields
        for key, value in item.items():
            if key not in normalized:
                normalized[key] = value
        
        return normalized
    
    def _normalize_project_item(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize a project item"""
        if not isinstance(item, dict):
            return {}
        
        normalized = {}
        
        # Name
        name_fields = ['name', 'title', 'project_name']
        for field in name_fields:
            if field in item:
                normalized['name'] = item[field]
                break
        
        # Description
        desc_fields = ['description', 'summary', 'details']
        for field in desc_fields:
            if field in item:
                normalized['description'] = item[field]
                break
        
        # Technologies
        tech_fields = ['technologies', 'technologies_used', 'tech_stack', 'tools']
        for field in tech_fields:
            if field in item:
                normalized['technologies'] = item[field]
                break
        
        # Copy any other fields
        for key, value in item.items():
            if key not in normalized:
                normalized[key] = value
        
        return normalized
