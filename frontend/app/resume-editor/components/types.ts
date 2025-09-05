// Resume Editor Types
export interface Link {
  id: string;
  label: string;
  url: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  gpa: string;
}

export interface Project {
  id: string;
  name: string;
  technologies: string;
  link: string;
  description: string;
}

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface ResumeSection {
  id: string;
  type: 'basic' | 'skills' | 'experience' | 'education' | 'projects' | 'custom';
  title: string;
  order: number;
}

export interface ResumeFormData {
  fullName: string;
  title: string;
  summary: string;
  skills: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  links: Link[];
  experiences: Experience[];
  educations: Education[];
  projects: Project[];
  customSections: CustomSection[];
}

export interface LaTeXSettings {
  selectedTemplate: "classic" | "modern" | "creative" | "professional";
  pageSize: "letter" | "a4";
  fontFamily: "serif" | "sans-serif" | "mono";
  primaryColor: string;
  secondaryColor: string;
}
