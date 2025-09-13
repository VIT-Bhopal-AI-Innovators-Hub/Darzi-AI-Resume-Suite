export interface Resume {
  name: string;
  title?: string; // optional if not always present
  contact: {
    location: string;
    phone: string;
    email: string;
  };
  links: {
    github: string;
    linkedin: string;
  };
  problemSolving: {
    codeforces: string;
    leetcode: string;
    gfg: string;
  };
  skills: string[];
  education: {
    degree: string;
    university: string;
    duration: string;
  };
  projects: {
    title: string;
    technologies: string;
    description: string;
  }[];
  experience?: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  experiences: {
    company: string;
    role: string;
    bullets: string[];
    date?: string;
  }[];
  education: {
    school: string;
    degree: string;
    date?: string;
  }[];
  skills: string[];
  links: {
    name: string;
    url: string;
  }[];
  projects?: {
    title: string;
    technologies?: string;
    description?: string;
    date?: string;
  }[];
  customSections?: {
    id: string;
    title: string;
    content: string;
  }[];
}
