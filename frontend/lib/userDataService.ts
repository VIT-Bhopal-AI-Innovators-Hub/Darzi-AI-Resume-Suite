import { ResumeData } from "@/types/resume";

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

// Simulate API call delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class UserDataService {
  /**
   * Fetch user data from API endpoint
   * In a real application, this would make an HTTP request to your backend
   */
  static async fetchUserData(userId?: string): Promise<ResumeData> {
    try {
      // Simulate API delay
      await delay(1000);
      
      // In a real implementation, you would do:
      // const response = await fetch(`/api/users/${userId}/resume-data`);
      // if (!response.ok) throw new Error('Failed to fetch user data');
      // return await response.json();
      
      // For now, return sample data
      console.log(`Fetching data for user: ${userId || 'anonymous'}`);
      return { ...sampleUserData };
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw new Error('Failed to load user data');
    }
  }

  /**
   * Save user data to API endpoint
   * In a real application, this would make an HTTP request to your backend
   */
  static async saveUserData(data: ResumeData, userId?: string): Promise<void> {
    try {
      // Simulate API delay
      await delay(500);
      
      // In a real implementation, you would do:
      // const response = await fetch(`/api/users/${userId}/resume-data`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // if (!response.ok) throw new Error('Failed to save user data');
      
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