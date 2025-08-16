<p align="center">
  <img width="30%" height="30%" src="https://github.com/user-attachments/assets/fcfbc33d-970e-42b0-befa-690e172235a8">
</p>

# Darzi: AI Resume Suite

An intelligent AI-powered resume building and optimization platform that helps job seekers create tailored resumes using advanced language models and ATS optimization techniques.

## Challenge Background
Navigating the modern job market is increasingly challenging, especially for candidates with limited access to professional resume writing services or insights into job-specific requirements. A mismatch between resumes and job descriptions often leads to rejections despite a candidate's qualifications.

With the emergence of AI, it is now possible to create intelligent systems that help job seekers present their best selves. By using LLMs, we can bridge the gap between candidate profiles and recruiter expectations.

This project aims to leverage LLMs to empower job seekers with personalized resume tailoring, ultimately improving job matching and boosting hiring success rates.

## Goal of the Project
Job seekers frequently face difficulties aligning their resumes with the expectations of specific job postings. Many fail to highlight the most relevant skills or experiences because they lack insights into what recruiters are looking for in each role.

This leads to high application drop-off rates and missed opportunities, especially for early-career professionals or candidates applying across domains. Furthermore, multilingual users often lack access to resume customization tools in their native languages, creating a barrier to equitable job access.

There is a clear need for an AI-powered, intuitive, and multilingual resume optimization tool that guides applicants through tailoring their resumes based on the exact requirements of a job post.

## 🚀 Features

### Core Functionality
- **AI-Powered Resume Builder**: Create professional resumes from scratch using intelligent AI assistance
- **Resume Parsing API**: Extract structured data from PDF resumes and plain text using hybrid local + AI parsing
- **ATS Optimization**: Ensure your resume passes Applicant Tracking Systems with tailored formatting and keyword analysis
- **LinkedIn Integration**: Import your professional profile data directly from LinkedIn
- **GitHub Project Integration**: Showcase your technical projects and contributions
- **Resume Improvement**: Enhance existing resumes with AI-powered suggestions
- **Template Selection**: Choose from various professional resume templates
- **LaTeX Output**: Generate high-quality, formatted resumes in LaTeX format

### User Workflow
1. **Authentication**: Sign up or log in to access the platform
2. **Dashboard**: Choose between creating a new resume or improving an existing one
3. **Data Input**: Provide information through LinkedIn, document upload, or manual entry
4. **AI Processing**: Advanced LLM processes and optimizes your data
5. **Results**: Receive a professional resume template with ATS score and optimization suggestions

## 🏗️ Project Structure

Check the project structure here [Project Structure](PROJECT_STRUCTURE.md)

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **pnpm** (recommended)
- **Python** (v3.8 or higher)
- **Git**

## 🚀 Quick Start


Open the Command line or Terminal.

1.  **Fork the project**
    -   Start by forking the repository to your own GitHub account. Click the "Fork" button at the top right of the main repository page. This creates a copy of the project under your username.

2.  **Clone your forked repository**
    -   Replace `[username]` with your actual GitHub username in the command below.
    ```bash
    git clone https://github.com/[username]/Darzi-AI-Resume-Suite
    ```

3.  **Move to the project folder**
    ```bash
    cd Darzi-AI-Resume-Suite
    ```

4.  **Open with VSCode**
    ```bash
    code .
    ```

## 🧑‍💻 Local Development (Frontend)

1. Copy env example and create your local env
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```
2. Edit `frontend/.env.local` and set your own Clerk keys
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=`
   - `CLERK_SECRET_KEY=`
   Do not commit `.env.local` (it is gitignored).
3. Install and run the frontend
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```
4. Open the app
   - http://localhost:3000
5. Auth routes (for testing)
   - Sign In: `/sign-in`
   - Sign Up: `/sign-up`
   - After sign-in: `/Dashboard` (protected; signed-out users are redirected to `/sign-in`)

> Backend is optional for UI testing. If needed, see `backend/README.md` for setup.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/feature-name`)
3. Commit your changes (`git commit -m 'Added some feature'`)
4. Push to the branch (`git push origin feature/feature-name`)
5. Open a Pull Request

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/VIT-Bhopal-AI-Innovators-Hub/Darzi-AI-Resume-Suite/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- Built with ❤️ by the VIT Bhopal AI Innovators Hub team
- Powered by Next.js and modern web technologies
- Special thanks to all contributors and supporters

---

**Note**: This project is actively under development. Some features may be in progress or planned for future releases.
