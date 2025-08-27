import { generateResumeTex } from './latexTemplate';

// Test data
const testData = {
  name: 'John Doe',
  title: 'Software Engineer',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  summary: 'Experienced software engineer with a passion for building scalable applications.',
  experiences: [
    {
      company: 'Tech Corp',
      role: 'Senior Developer',
      start: 'Jan 2020',
      end: 'Present',
      bullets: [
        'Led development of microservices architecture',
        'Improved system performance by 40%',
        'Mentored junior developers'
      ]
    }
  ],
  education: [
    {
      school: 'University of Technology',
      degree: 'Bachelor of Science in Computer Science',
      start: '2016',
      end: '2020'
    }
  ],
  skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python']
};

// Test different templates
const templates = ['classic', 'modern', 'creative', 'professional'];

console.log('Testing LaTeX generation...\n');

templates.forEach(template => {
  try {
    const latex = generateResumeTex(testData, template, {
      pageSize: 'letter',
      fontFamily: 'serif',
      primaryColor: '#2563eb',
      secondaryColor: '#64748b'
    });
    console.log(`✅ ${template} template: Generated successfully (${latex.length} characters)`);
  } catch (error) {
    console.log(`❌ ${template} template: Failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

console.log('\nTest completed!');
