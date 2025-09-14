

import { NextApiRequest, NextApiResponse } from 'next';
import { ResumeData } from '@/types/resume';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  
  if (req.method === 'GET') {
    try {
      
      const sampleData: ResumeData = {
        name: "John Doe",
        title: "Software Engineer",
        email: "john@example.com",
        phone: "+1234567890",
        location: "San Francisco, CA",
        website: "https://johndoe.dev",
        summary: "Experienced developer...",
        experiences: [],
        education: [],
        skills: [],
        links: [],
        customSections: [],
      };
      
      res.status(200).json(sampleData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  } 
  
  else if (req.method === 'PUT') {
    try {
      const resumeData: ResumeData = req.body;
      
      
      console.log(`Saving resume data for user ${userId}:`, resumeData);
      
      res.status(200).json({ message: 'Resume data saved successfully' });
    } catch (error) {
      console.error('Error saving user data:', error);
      res.status(500).json({ error: 'Failed to save user data' });
    }
  } 
  
  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


export async function validateUserAccess(userId: string, authToken: string): Promise<boolean> {

  console.log(`Validating access for user ${userId} with token ${authToken}`);
  return true; 
}

export async function validateResumeData(data: unknown): Promise<boolean> {

  console.log('Validating resume data:', data);
  return true;
}

