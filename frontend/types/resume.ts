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
