import { ResumeData } from "@/types/resume";

const BACKEND_API_BASE = process.env.NEXT_PUBLIC_BACKEND_API_BASE || "http://localhost:8000";

// Sample user data for testing - this would normally come from your backend
const sampleUserData: ResumeData = {
  name: "John Doe",
  title: "Senior Software Engineer",
  email: "john.doe@example.com",
  phone: "+1 (415) 555-0198",
  location: "San Francisco, CA",
  website: "https://johndoe.dev",
  summary:
    "Product-focused senior software engineer with 8 years of experience building high-throughput web services and consumer-facing applications. Experienced in leading cross-functional teams, shipping end-to-end features, and improving system reliability at scale.",
  experiences: [
    {
      company: "Nimbus Analytics",
      role: "Senior Software Engineer",
      bullets: [
        "Designed and implemented a microservices-based analytics pipeline that processed 2TB of event data per day, improving query latency by 65% through partitioning and indexing strategies",
        "Led a team of 6 engineers to ship a real-time dashboard product used by 300+ enterprise customers, increasing monthly revenue by 22%",
        "Architected and migrated core services to AWS (ECS, RDS, S3) and introduced IaC with Terraform to reduce environment drift",
        "Introduced contract testing and a staged CI/CD flow which cut production incidents by 45%"
      ]
    },
    // {
    //   company: "BrightLeaf Labs",
    //   role: "Software Engineer II",
    //   bullets: [
    //     "Built customer-facing React + TypeScript application with accessibility-first design, raising user satisfaction scores by 18%",
    //     "Developed backend services in Node.js and PostgreSQL including a feature flag system and metrics exporter",
    //     "Optimized slow analytical queries and added appropriate indexes, reducing report generation time from 90s to 7s",
    //     "Collaborated with data scientists to productionize ML models, adding automated retraining and A/B testing"
    //   ]
    // },
    // {
    //   company: "StartupXYZ",
    //   role: "Full Stack Developer",
    //   bullets: [
    //     "Owned end-to-end development of the payments flow, integrating Stripe and implementing PCI-compliant patterns",
    //     "Authored a shared component library and design tokens used across 4 product teams, decreasing UI bugs and development time",
    //     "Instrumented the app with telemetry (OpenTelemetry) which surfaced a memory leak and prevented customer-facing outages",
    //     "Wrote onboarding docs and mentored interns; two mentees were promoted to mid-level roles"
    //   ]
    // }
  ],
  education: [
    {
      school: "University of California, Berkeley",
      degree: "B.S. in Computer Science, 2014 - 2018"
    },
    {
      school: "Stanford University",
      degree: "M.S. in Software Engineering, 2018 - 2020"
    }
  ],
  skills: [
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
    "Redis",
    "AWS (ECS, Lambda, S3, RDS)",
    "Docker",
    "Terraform",
    "Kubernetes",
    "OpenTelemetry",
    "GraphQL",
    "CI/CD (GitHub Actions)"
  ],
  links: [
    { label: "GitHub", url: "https://github.com/johndoe" },
    { label: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
    { label: "Portfolio", url: "https://johndoe.dev" }
  ],
  customSections: [
    {
      id: "certifications",
      title: "Certifications",
      content:
        "AWS Certified Solutions Architect – Associate (2022)\nGoogle Cloud Professional Data Engineer (2021)"
    },
    {
      id: "notable-projects",
      title: "Notable Projects",
      content:
        "Realtime Insights Dashboard — Built a streaming analytics dashboard using Kafka, Flink, and React; reduced BI reporting time from hours to minutes.\nOpen Source: contributed to an auth library (40+ PRs), improved test coverage and documentation."
    },
    {
      id: "awards",
      title: "Awards & Activities",
      content: "Tech Innovation Award (2023) — Team lead for customer analytics product; Speaker at JSConf 2022"
    }
  ]
};


{
  const s = sampleUserData as unknown as Record<string, unknown>;
  s.roll = "2001CS101";
  s.course = "B.Tech in Computer Science and Engineering";
  s.emaila = s.email; 
  s.emailb = "john.personal@example.com"; 
  s.github = "johndoe";
  s.linkedin = "john-doe";

  s.educationDetailed = [
    { degree: (sampleUserData.education[0].degree), institute: (sampleUserData.education[0].school), score: "3.8/4.0", year: "2018" },
    { degree: (sampleUserData.education[1].degree), institute: (sampleUserData.education[1].school), score: "3.9/4.0", year: "2020" }
  ];
  s.experience = [
    {
      company: s.experiences[0].company,
      location: s.location,
      role: s.experiences[0].role,
      dates: "2018 - Present",
      work: s.experiences[0].bullets
    }
  ];

  s.projects = [
    {
      name: "Realtime Insights Dashboard",
      role: "Lead Developer",
      date: "2022",
      work: ["Built streaming pipeline", "Implemented dashboard UI"],
      description: "Streaming analytics dashboard used by enterprise customers."
    }
  ];

  s.skillsCategorized = [
    { category: "Languages", tools: "TypeScript, JavaScript, Python" },
    { category: "Frameworks", tools: "React, Node.js" },
    { category: "DevOps", tools: "Docker, Terraform, AWS" }
  ];

  s.courses = [{ year: "2023", list: "Machine Learning, Cloud Computing" }];
  s.certifications = ["AWS Certified Solutions Architect – Associate (2022)"];
  s.positions = [{ position: "Team Lead", organization: "Nimbus Analytics", date: "2021 - 2023" }];
  s.activities = [{ name: "Volunteer Tutor", description: "Taught data structures and algorithms to freshmen." }];
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class UserDataService {
 
  /**
   * Parse one or more resume files using backend `/parse-data` and return the first resumeData.
   * For multi-file uploads, prefer `parseAndMerge` which calls `/generate-resume` for a merged output.
   */
  static async parseFiles(files: FileList | File[]): Promise<ResumeData> {
    const form = new FormData();
    const list = Array.from(files as unknown as Iterable<File>);
    list.forEach((f) => form.append("files", f));
    const res = await fetch(`${BACKEND_API_BASE}/parse-data`, { method: "POST", body: form });
    if (!res.ok) throw new Error(`Parse failed (${res.status})`);
    type BackendParsedItem = { parsed?: unknown; resumeData?: ResumeData; filename?: string; text_length?: number; [k: string]: unknown };
    type BackendParsedMap = Record<string, BackendParsedItem>;
    const body: BackendParsedMap = await res.json();
    const firstKey = Object.keys(body)[0];
    const first = body[firstKey];
    const rd = first?.resumeData;
    if (rd && this.validateResumeData(rd)) return rd;
    return this.getEmptyResumeData();
  }

  /**
   * Parse files and then request backend to merge the parsed content into a single resume using `/generate-resume`.
   * Returns `ResumeData` mapped to the frontend schema.
   */
  static async parseAndMerge(files: FileList | File[]): Promise<ResumeData> {
    const form = new FormData();
    const list = Array.from(files as unknown as Iterable<File>);
    list.forEach((f) => form.append("files", f));
    const res = await fetch(`${BACKEND_API_BASE}/parse-data`, { method: "POST", body: form });
    if (!res.ok) throw new Error(`Parse failed (${res.status})`);
    type BackendParsedItem = { parsed?: unknown; resumeData?: ResumeData; filename?: string; text_length?: number; [k: string]: unknown };
    type BackendParsedMap = Record<string, BackendParsedItem>;
    const parsedMap: BackendParsedMap = await res.json();

    // Build payload for /generate-resume using the raw `parsed` objects returned from /parse-data
    const dataPayload: Record<string, { parsed: unknown }> = {};
    Object.entries(parsedMap || {}).forEach(([key, val]) => {
      if (val && typeof val === "object") {
        dataPayload[key] = { parsed: (val.parsed ?? val) as unknown };
      }
    });

    const res2 = await fetch(`${BACKEND_API_BASE}/generate-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: dataPayload }),
    });
    if (!res2.ok) throw new Error(`Generate failed (${res2.status})`);
    const merged = await res2.json();
    const rd = merged?.resumeData;
    if (rd && this.validateResumeData(rd)) return rd;
    return this.getEmptyResumeData();
  }

  static async fetchUserData(userId?: string): Promise<ResumeData> {
    try {
      // Prefer existing app API (can be backed by DB or fall back to mocked data)
      const response = await fetch(API_ENDPOINTS.getUserData(userId || "anonymous"));
      if (response.ok) {
        const json = await response.json();
        if (this.validateResumeData(json)) return json;
      }
      // Fallback to local sample if not available
      await delay(500);
      return { ...sampleUserData };
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw new Error('Failed to load user data');
    }
  }


  static async saveUserData(data: ResumeData, userId?: string): Promise<void> {
    try {
      // Simulate API delay
      await delay(500);
      
      console.log(`User data saved successfully for user: ${userId || 'anonymous'}`, data);
    } catch (error) {
      console.error('Error saving user data:', error);
      throw new Error('Failed to save user data');
    }
  }

  /**
   * Get empty/default resume data structure
   */
  static getEmptyResumeData(): ResumeData {
    return {
      name: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      summary: "",
      experiences: [],
      education: [],
      skills: [],
      links: [],
      customSections: [],
    };
  }

  /**
   * Validate resume data structure
   */
  static validateResumeData(data: unknown): data is ResumeData {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof (data as ResumeData).name === 'string' &&
      typeof (data as ResumeData).email === 'string' &&
      Array.isArray((data as ResumeData).experiences) &&
      Array.isArray((data as ResumeData).education) &&
      Array.isArray((data as ResumeData).skills)
    );
  }
}

// API endpoints configuration
export const API_ENDPOINTS = {
  getUserData: (userId: string) => `/api/users/${userId}/resume-data`,
  saveUserData: (userId: string) => `/api/users/${userId}/resume-data`,
  // Add more endpoints as needed
};

export { sampleUserData };