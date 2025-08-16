"""
ATS Score Analyzer using LLM
Provides comprehensive ATS compatibility analysis
"""
import logging
from typing import Dict, Any, List, Optional
from ..llm.manager import LLMManager

logger = logging.getLogger(__name__)

class ATSScoreAnalyzer:
    """LLM-powered ATS score analyzer for resume optimization"""
    
    def __init__(self):
        self.llm_manager = LLMManager()
        logger.info(f"ATS Analyzer initialized - LLM available: {self.llm_manager.is_llm_available()}")
    
    def analyze_ats_score(
        self, 
        resume_text: str, 
        job_description: str,
        preferred_provider: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze ATS compatibility score using LLM
        
        Args:
            resume_text: The resume content to analyze
            job_description: Job posting to compare against
            preferred_provider: Preferred LLM provider (optional)
            
        Returns:
            Dict containing comprehensive ATS analysis
        """
        if not self.llm_manager.is_llm_available():
            logger.warning("LLM not available, falling back to rule-based analysis")
            return self._fallback_analysis(resume_text, job_description)
        
        try:
            # Create comprehensive ATS analysis prompt
            prompt = self._create_ats_analysis_prompt(resume_text, job_description)
            
            # Get LLM analysis using the generate_text method directly
            if preferred_provider:
                # Try to use specific provider
                for provider in self.llm_manager.providers:
                    if preferred_provider.lower() in provider.get_provider_name().lower():
                        response_text = provider.generate_text(prompt)
                        if response_text:
                            analysis = self._parse_llm_response(response_text)
                            analysis['analysis_method'] = 'llm'
                            analysis['provider_used'] = provider.get_provider_name()
                            return analysis
                        break
            
            # Use primary provider
            if self.llm_manager.primary_provider:
                response_text = self.llm_manager.primary_provider.generate_text(prompt)
                if response_text:
                    analysis = self._parse_llm_response(response_text)
                    analysis['analysis_method'] = 'llm'
                    analysis['provider_used'] = self.llm_manager.primary_provider.get_provider_name()
                    return analysis
            
            # If we get here, LLM failed
            logger.warning("LLM response was empty, using fallback")
            return self._fallback_analysis(resume_text, job_description)
                
        except Exception as e:
            logger.error(f"ATS analysis failed: {e}")
            return self._fallback_analysis(resume_text, job_description)
    
    def _create_ats_analysis_prompt(self, resume_text: str, job_description: str) -> str:
        """Create a comprehensive prompt for ATS analysis"""
        return f"""
You are an expert ATS (Applicant Tracking System) analyst and career coach. Analyze the resume against the job description and provide a comprehensive ATS compatibility assessment.

**RESUME TEXT:**
{resume_text}

**JOB DESCRIPTION:**
{job_description}

**YOUR TASK:**
Provide a detailed ATS compatibility analysis in the following JSON format:

{{
    "overall_score": <number between 0-100>,
    "keyword_analysis": {{
        "keyword_match_score": <0-100>,
        "matched_keywords": ["keyword1", "keyword2", ...],
        "missing_critical_keywords": ["missing1", "missing2", ...],
        "keyword_density": <0-100>,
        "recommendations": ["Add keyword X in skills section", ...]
    }},
    "content_analysis": {{
        "content_score": <0-100>,
        "strengths": ["strength1", "strength2", ...],
        "weaknesses": ["weakness1", "weakness2", ...],
        "missing_sections": ["section1", "section2", ...],
        "recommendations": ["Add quantified achievements", ...]
    }},
    "formatting_analysis": {{
        "formatting_score": <0-100>,
        "formatting_issues": ["issue1", "issue2", ...],
        "recommendations": ["Use standard section headers", ...]
    }},
    "skills_analysis": {{
        "skills_match_score": <0-100>,
        "matched_skills": ["skill1", "skill2", ...],
        "missing_skills": ["missing_skill1", "missing_skill2", ...],
        "skill_gaps": ["gap1", "gap2", ...],
        "recommendations": ["Add Python programming", ...]
    }},
    "experience_analysis": {{
        "experience_score": <0-100>,
        "relevant_experience": ["experience1", "experience2", ...],
        "experience_gaps": ["gap1", "gap2", ...],
        "recommendations": ["Highlight project management experience", ...]
    }},
    "improvement_priority": {{
        "high_priority": ["critical_fix1", "critical_fix2", ...],
        "medium_priority": ["medium_fix1", "medium_fix2", ...],
        "low_priority": ["nice_to_have1", "nice_to_have2", ...]
    }},
    "ats_optimization_tips": [
        "tip1",
        "tip2",
        "tip3"
    ],
    "predicted_ats_pass_rate": <0-100>,
    "summary": "Brief 2-3 sentence summary of the analysis"
}}

**ANALYSIS GUIDELINES:**
1. **Keyword Analysis**: Compare technical skills, tools, technologies, and industry terms
2. **Content Quality**: Assess achievements, quantified results, relevant experience
3. **ATS Compatibility**: Consider formatting, section headers, and parsability
4. **Skills Matching**: Evaluate technical and soft skills alignment
5. **Experience Relevance**: Assess how well experience matches job requirements
6. **Improvement Priority**: Rank suggestions by impact on ATS score

**SCORING CRITERIA:**
- 90-100: Excellent ATS compatibility, likely to pass all systems
- 80-89: Good compatibility, minor improvements needed
- 70-79: Fair compatibility, several improvements recommended
- 60-69: Poor compatibility, significant changes needed
- Below 60: Major overhaul required

Return ONLY the JSON object, no additional text.
"""
    
    def _parse_llm_response(self, response_text: str) -> Dict[str, Any]:
        """Parse LLM response text into structured analysis"""
        try:
            # Try to extract JSON from the response
            import json
            import re
            
            # Look for JSON in the response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
                parsed_data = json.loads(json_str)
                return self._process_llm_analysis(parsed_data)
            else:
                logger.warning("No JSON found in LLM response")
                return self._get_default_analysis()
                
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM JSON response: {e}")
            return self._get_default_analysis()
        except Exception as e:
            logger.error(f"Error parsing LLM response: {e}")
            return self._get_default_analysis()
    
    def _process_llm_analysis(self, llm_content: Dict[str, Any]) -> Dict[str, Any]:
        """Process and validate LLM analysis results"""
        try:
            # Ensure all required fields are present with defaults
            analysis = {
                'overall_score': llm_content.get('overall_score', 0),
                'keyword_analysis': llm_content.get('keyword_analysis', {}),
                'content_analysis': llm_content.get('content_analysis', {}),
                'formatting_analysis': llm_content.get('formatting_analysis', {}),
                'skills_analysis': llm_content.get('skills_analysis', {}),
                'experience_analysis': llm_content.get('experience_analysis', {}),
                'improvement_priority': llm_content.get('improvement_priority', {}),
                'ats_optimization_tips': llm_content.get('ats_optimization_tips', []),
                'predicted_ats_pass_rate': llm_content.get('predicted_ats_pass_rate', 0),
                'summary': llm_content.get('summary', 'Analysis completed'),
                'confidence_score': 0.9,  # High confidence for LLM analysis
                'analysis_timestamp': self._get_timestamp()
            }
            
            # Validate scores are within range
            for score_field in ['overall_score', 'predicted_ats_pass_rate']:
                if score_field in analysis:
                    analysis[score_field] = max(0, min(100, analysis[score_field]))
            
            # Validate sub-scores
            for sub_analysis in ['keyword_analysis', 'content_analysis', 'formatting_analysis', 'skills_analysis', 'experience_analysis']:
                if sub_analysis in analysis and isinstance(analysis[sub_analysis], dict):
                    for key, value in analysis[sub_analysis].items():
                        if key.endswith('_score') and isinstance(value, (int, float)):
                            analysis[sub_analysis][key] = max(0, min(100, value))
            
            return analysis
            
        except Exception as e:
            logger.error(f"Failed to process LLM analysis: {e}")
            return self._get_default_analysis()
    
    def _fallback_analysis(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """Fallback rule-based analysis when LLM is not available"""
        logger.info("Using rule-based ATS analysis")
        
        # Basic keyword extraction and matching
        job_keywords = self._extract_keywords(job_description)
        resume_keywords = self._extract_keywords(resume_text)
        
        matched_keywords = list(set(job_keywords) & set(resume_keywords))
        missing_keywords = list(set(job_keywords) - set(resume_keywords))
        
        keyword_score = (len(matched_keywords) / len(job_keywords) * 100) if job_keywords else 0
        
        # Basic content analysis
        content_score = self._analyze_content_basic(resume_text)
        
        # Basic formatting analysis
        formatting_score = self._analyze_formatting_basic(resume_text)
        
        # Overall score calculation
        overall_score = (keyword_score * 0.4 + content_score * 0.4 + formatting_score * 0.2)
        
        return {
            'overall_score': round(overall_score),
            'keyword_analysis': {
                'keyword_match_score': round(keyword_score),
                'matched_keywords': matched_keywords[:10],
                'missing_critical_keywords': missing_keywords[:10],
                'keyword_density': round(keyword_score * 0.8),
                'recommendations': [
                    f"Add missing keywords: {', '.join(missing_keywords[:5])}" if missing_keywords else "Keyword coverage is good"
                ]
            },
            'content_analysis': {
                'content_score': round(content_score),
                'strengths': self._identify_strengths(resume_text),
                'weaknesses': self._identify_weaknesses(resume_text),
                'missing_sections': self._find_missing_sections(resume_text),
                'recommendations': [
                    "Add quantified achievements",
                    "Include more specific technical skills",
                    "Expand professional summary"
                ]
            },
            'formatting_analysis': {
                'formatting_score': round(formatting_score),
                'formatting_issues': self._find_formatting_issues(resume_text),
                'recommendations': [
                    "Use standard section headers",
                    "Ensure consistent formatting",
                    "Avoid complex layouts"
                ]
            },
            'skills_analysis': {
                'skills_match_score': round(keyword_score * 0.9),
                'matched_skills': matched_keywords[:8],
                'missing_skills': missing_keywords[:8],
                'skill_gaps': missing_keywords[:5],
                'recommendations': [
                    "Add technical skills mentioned in job description",
                    "Include relevant certifications"
                ]
            },
            'experience_analysis': {
                'experience_score': round(content_score * 0.9),
                'relevant_experience': ["Previous roles analyzed"],
                'experience_gaps': ["Industry-specific experience"],
                'recommendations': [
                    "Highlight relevant project experience",
                    "Quantify achievements with metrics"
                ]
            },
            'improvement_priority': {
                'high_priority': [
                    "Add missing critical keywords",
                    "Include quantified achievements"
                ],
                'medium_priority': [
                    "Improve section formatting",
                    "Expand technical skills"
                ],
                'low_priority': [
                    "Add professional summary",
                    "Include additional certifications"
                ]
            },
            'ats_optimization_tips': [
                "Use standard section headers like 'Work Experience', 'Education', 'Skills'",
                "Include keywords from the job description naturally",
                "Quantify achievements with specific numbers and percentages",
                "Save resume as PDF to preserve formatting",
                "Avoid graphics, tables, and unusual fonts"
            ],
            'predicted_ats_pass_rate': round(overall_score * 0.85),
            'summary': f"ATS compatibility score: {round(overall_score)}/100. Focus on keyword optimization and content improvements.",
            'confidence_score': 0.6,  # Lower confidence for rule-based analysis
            'analysis_method': 'rule_based',
            'provider_used': 'local_rules',
            'analysis_timestamp': self._get_timestamp()
        }
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract relevant keywords from text"""
        # Common technical and professional keywords
        keywords = []
        text_lower = text.lower()
        
        # Technical skills keywords
        tech_keywords = [
            'python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue',
            'node.js', 'express', 'django', 'flask', 'spring', 'sql', 'mysql',
            'postgresql', 'mongodb', 'redis', 'aws', 'azure', 'gcp', 'docker',
            'kubernetes', 'jenkins', 'git', 'agile', 'scrum', 'machine learning',
            'data science', 'artificial intelligence', 'tensorflow', 'pytorch'
        ]
        
        # Find technical keywords
        for keyword in tech_keywords:
            if keyword in text_lower:
                keywords.append(keyword)
        
        # Extract capitalized words (likely to be technologies/tools)
        import re
        capitalized = re.findall(r'\b[A-Z][a-zA-Z]{2,}\b', text)
        tech_caps = [word for word in capitalized if len(word) > 3 and word not in ['The', 'And', 'For', 'With', 'This', 'That']]
        keywords.extend(tech_caps[:15])
        
        return list(set(keywords))
    
    def _analyze_content_basic(self, text: str) -> float:
        """Basic content quality analysis"""
        score = 0
        text_lower = text.lower()
        
        # Check for quantified achievements
        import re
        numbers = re.findall(r'\d+%|\$\d+|\d+\+', text)
        if numbers:
            score += 30
        
        # Check for action verbs
        action_verbs = ['led', 'managed', 'developed', 'created', 'implemented', 'improved', 'increased', 'reduced']
        verb_count = sum(1 for verb in action_verbs if verb in text_lower)
        score += min(20, verb_count * 3)
        
        # Check for standard sections
        sections = ['experience', 'education', 'skills', 'summary', 'objective']
        section_count = sum(1 for section in sections if section in text_lower)
        score += min(30, section_count * 8)
        
        # Length check
        if 1000 <= len(text) <= 5000:
            score += 20
        elif len(text) < 1000:
            score += 10
        
        return min(100, score)
    
    def _analyze_formatting_basic(self, text: str) -> float:
        """Basic formatting analysis"""
        score = 80  # Start with good score
        
        # Check for problematic formatting
        if '\\t' in text or '\\n\\n\\n' in text:
            score -= 10
        
        # Check for reasonable line breaks
        lines = text.split('\n')
        if len(lines) < 10:
            score -= 20
        
        # Check for email and phone
        import re
        if re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text):
            score += 10
        if re.search(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', text):
            score += 10
        
        return min(100, max(0, score))
    
    def _identify_strengths(self, text: str) -> List[str]:
        """Identify resume strengths"""
        strengths = []
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['led', 'managed', 'supervised']):
            strengths.append("Shows leadership experience")
        
        if any(word in text_lower for word in ['%', 'increased', 'improved', 'reduced']):
            strengths.append("Includes quantified achievements")
        
        if len([word for word in ['python', 'java', 'javascript', 'sql'] if word in text_lower]) >= 2:
            strengths.append("Strong technical skills")
        
        if 'education' in text_lower or 'degree' in text_lower:
            strengths.append("Educational background included")
        
        return strengths[:5]
    
    def _identify_weaknesses(self, text: str) -> List[str]:
        """Identify resume weaknesses"""
        weaknesses = []
        text_lower = text.lower()
        
        if 'summary' not in text_lower and 'objective' not in text_lower:
            weaknesses.append("Missing professional summary")
        
        if not any(word in text_lower for word in ['%', 'increased', 'improved', 'reduced']):
            weaknesses.append("Lacks quantified achievements")
        
        if len(text) < 1000:
            weaknesses.append("Resume may be too brief")
        
        if 'skills' not in text_lower:
            weaknesses.append("Skills section not clearly defined")
        
        return weaknesses[:5]
    
    def _find_missing_sections(self, text: str) -> List[str]:
        """Find missing standard sections"""
        text_lower = text.lower()
        standard_sections = ['experience', 'education', 'skills', 'summary']
        missing = [section for section in standard_sections if section not in text_lower]
        return missing
    
    def _find_formatting_issues(self, text: str) -> List[str]:
        """Find formatting issues"""
        issues = []
        
        if len(text.split('\n')) < 10:
            issues.append("May need better section separation")
        
        if '\\t' in text:
            issues.append("Contains tab characters")
        
        import re
        if not re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text):
            issues.append("Email address not clearly visible")
        
        return issues[:3]
    
    def _get_default_analysis(self) -> Dict[str, Any]:
        """Return default analysis structure"""
        return {
            'overall_score': 0,
            'keyword_analysis': {},
            'content_analysis': {},
            'formatting_analysis': {},
            'skills_analysis': {},
            'experience_analysis': {},
            'improvement_priority': {},
            'ats_optimization_tips': [],
            'predicted_ats_pass_rate': 0,
            'summary': 'Analysis failed',
            'confidence_score': 0.0,
            'analysis_method': 'failed',
            'provider_used': 'none',
            'analysis_timestamp': self._get_timestamp()
        }
    
    def _get_timestamp(self) -> str:
        """Get current timestamp"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    def get_analyzer_status(self) -> Dict[str, Any]:
        """Get status of the ATS analyzer"""
        return {
            'llm_available': self.llm_manager.is_llm_available(),
            'available_providers': self.llm_manager.get_available_providers(),
            'primary_provider': self.llm_manager.get_primary_provider_name() if self.llm_manager.is_llm_available() else None,
            'fallback_available': True,  # Rule-based analysis always available
            'recommended_method': 'llm' if self.llm_manager.is_llm_available() else 'rule_based'
        }
