// PDF export utilities for converting resume data to PDF
import type { ResumeData } from './latex-generator';

// Note: For full LaTeX to PDF conversion, this would need to be connected
// to a backend service that can compile LaTeX (like Overleaf API, local LaTeX installation, etc.)
// For now, this provides a basic PDF export functionality

export async function exportToPDF(resumeData: ResumeData): Promise<void> {
  try {
    // For now, we'll create a simple HTML version and use browser's print-to-PDF
    // In a production environment, this could be replaced with a proper LaTeX->PDF service
    
    const htmlContent = generateHTMLForPDF(resumeData);
    
    // Create a new window with the HTML content
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window. Please allow popups.');
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 100);
    };
    
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
}

function generateHTMLForPDF(data: ResumeData): string {
  const {
    fullName,
    title,
    email,
    phone,
    location,
    website,
    summary,
    skills,
    sections,
    additionalLinks,
  } = data;

  // Build contact info
  const contactParts = [];
  if (email) contactParts.push(email);
  if (phone) contactParts.push(phone);
  if (location) contactParts.push(location);
  if (website) contactParts.push(website);
  
  // Add additional links
  additionalLinks
    .filter(link => link.url || link.label)
    .forEach(link => {
      const label = link.label || link.url;
      if (label) contactParts.push(label);
    });

  const contactInfo = contactParts.join(' • ');

  // Build skills section
  const skillsList = skills
    .split(',')
    .map(skill => skill.trim())
    .filter(Boolean)
    .join(' • ');

  // Build sections HTML
  const sectionsHTML = sections
    .map(section => {
      if (!section.entries.length) return '';
      
      const sectionEntries = section.entries
        .map(entry => {
          if (!entry.position && !entry.organization) return '';
          
          const title = entry.position || '';
          const org = entry.organization || '';
          const titleLine = [title, org].filter(Boolean).join(' | ');
          
          const startDate = entry.start ? formatDateForPDF(entry.start) : '';
          const endDate = entry.end ? formatDateForPDF(entry.end) : 'Present';
          const dateRange = [startDate, endDate].filter(Boolean).join(' - ');
          
          let entryHTML = `
            <div class="entry">
              <div class="entry-header">
                <div class="entry-title">${titleLine}</div>
                <div class="entry-date">${dateRange}</div>
              </div>
          `;
          
          // Add bullets
          const bullets = entry.bullets
            .filter(bullet => bullet.trim())
            .map(bullet => `<li>${bullet}</li>`)
            .join('');
            
          if (bullets) {
            entryHTML += `<ul class="bullets">${bullets}</ul>`;
          }
          
          entryHTML += '</div>';
          return entryHTML;
        })
        .filter(Boolean)
        .join('');
      
      if (!sectionEntries) return '';
      
      return `
        <div class="section">
          <h3 class="section-title">${section.name || 'Section'}</h3>
          ${sectionEntries}
        </div>
      `;
    })
    .filter(Boolean)
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${fullName || 'Resume'}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        
        body {
          font-family: 'Times New Roman', serif;
          line-height: 1.4;
          margin: 40px;
          color: #000;
          background: white;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        
        .name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .title {
          font-size: 14px;
          font-style: italic;
          margin-bottom: 10px;
        }
        
        .contact {
          font-size: 12px;
          margin-bottom: 10px;
        }
        
        .summary {
          margin-bottom: 20px;
          font-size: 13px;
        }
        
        .section {
          margin-bottom: 20px;
        }
        
        .section-title {
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
          border-bottom: 1px solid #000;
          margin-bottom: 10px;
          padding-bottom: 2px;
        }
        
        .entry {
          margin-bottom: 15px;
        }
        
        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 5px;
        }
        
        .entry-title {
          font-weight: bold;
          font-size: 13px;
        }
        
        .entry-date {
          font-size: 11px;
          font-style: italic;
        }
        
        .bullets {
          margin: 0;
          padding-left: 20px;
        }
        
        .bullets li {
          font-size: 12px;
          margin-bottom: 3px;
        }
        
        .skills {
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="name">${fullName || 'Your Name'}</div>
        <div class="title">${title || ''}</div>
        <div class="contact">${contactInfo}</div>
      </div>
      
      ${summary ? `<div class="summary">${summary}</div>` : ''}
      
      ${skillsList ? `
        <div class="section">
          <h3 class="section-title">Skills</h3>
          <div class="skills">${skillsList}</div>
        </div>
      ` : ''}
      
      ${sectionsHTML}
    </body>
    </html>
  `;
}

function formatDateForPDF(date: string): string {
  if (!date) return '';
  try {
    const [year, month] = date.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const monthName = monthNames[parseInt(month) - 1];
    return `${monthName} ${year}`;
  } catch {
    return date;
  }
}

// Future enhancement: LaTeX to PDF conversion service
export async function compileLatexToPDF(_latexCode: string): Promise<Blob> {
  // This would connect to a LaTeX compilation service
  // For example: Overleaf API, local LaTeX installation, or cloud service
  
  throw new Error('LaTeX to PDF compilation service not yet implemented. This would require a backend service with LaTeX support.');
}