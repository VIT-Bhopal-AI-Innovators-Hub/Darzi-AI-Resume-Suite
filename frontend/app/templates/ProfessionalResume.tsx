import React from "react";
import { ResumeData } from "@/lib/latexTemplate";

interface ProfessionalResumeProps {
  data: ResumeData;
  pageSize: 'a4' | 'letter';
  fontFamily: 'serif' | 'sans-serif' | 'mono';
  primaryColor: string;
  secondaryColor: string;
}

const ProfessionalResume: React.FC<ProfessionalResumeProps> = ({
  data,
  pageSize,
  fontFamily,
  primaryColor,
  secondaryColor
}) => {
  const pageDimensions = pageSize === 'a4'
    ? { width: '8.27in', height: '11.69in' }
    : { width: '8.5in', height: '11in' };

  const getFontFamily = () => {
    switch (fontFamily) {
      case 'sans-serif': return 'sans-serif';
      case 'mono': return 'monospace';
      default: return 'serif';
    }
  };

  return (
    <div style={{
      fontFamily: getFontFamily(),
      lineHeight: '1.2',
      textAlign: 'left',
      margin: '0',
      padding: '1in',
      width: pageDimensions.width,
      minHeight: pageDimensions.height,
      backgroundColor: 'white',
      color: primaryColor,
      position: 'relative'
    }}>
      <header style={{
        textAlign: 'center',
        marginBottom: '0.5in',
        paddingBottom: '0.25in',
        borderBottom: `1px solid ${primaryColor}`
      }}>
        <h1 style={{
          fontSize: '2em',
          fontWeight: 'bold',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          margin: '0 0 0.1in 0',
          padding: '0',
          color: primaryColor
        }}>
          {data.name}
        </h1>
        <div style={{
          fontSize: '0.8em',
          color: secondaryColor,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.2in'
        }}>
          {[data.phone, data.email, data.location, data.website].filter(Boolean).join(' | ')}
          {data.links && data.links.length > 0 && (
            <>
              {([data.phone, data.email, data.location, data.website].filter(Boolean).length > 0 ? ' | ' : '') + 
               data.links.map(link => link.label || link.url).filter(Boolean).join(' | ')}
            </>
          )}
        </div>
      </header>

      {data.summary && (
        <section style={{marginBottom: '0.3in'}}>
          <p style={{
            fontSize: '0.9em',
            lineHeight: '1.4',
            textAlign: 'left',
            marginLeft: 'auto',
            marginRight: 'auto',
            maxWidth: '6in',
            color: primaryColor
          }}>{data.summary}</p>
        </section>
      )}

      {data.education && data.education.length > 0 && (
        <section style={{marginBottom: '0.3in'}}>
          <h2 style={{
            fontSize: '1.2em',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: '0.15in',
            borderBottom: `1px solid ${primaryColor}`,
            paddingBottom: '0.05in',
            color: primaryColor
          }}>
            Education
          </h2>
          <div style={{marginTop: '0.15in'}}>
            {data.education.map((edu, i) => (
              <div key={i} style={{
                marginBottom: '0.15in',
                display: 'table',
                width: '100%'
              }}>
                <div style={{
                  display: 'table-row'
                }}>
                  <div style={{
                    display: 'table-cell',
                    verticalAlign: 'top',
                    fontWeight: 'bold',
                    color: primaryColor
                  }}>
                    {edu.school}
                  </div>
                  <div style={{
                    display: 'table-cell',
                    textAlign: 'right',
                    verticalAlign: 'top',
                    color: secondaryColor
                  }}>
                    {edu.start} — {edu.end}
                  </div>
                </div>
                <div style={{
                  display: 'table-row'
                }}>
                  <div style={{
                    display: 'table-cell',
                    fontStyle: 'italic',
                    fontSize: '0.9em',
                    color: secondaryColor
                  }}>
                    {edu.degree}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {data.experiences && data.experiences.length > 0 && (
        <section style={{marginBottom: '0.3in'}}>
          <h2 style={{
            fontSize: '1.2em',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: '0.15in',
            borderBottom: `1px solid ${primaryColor}`,
            paddingBottom: '0.05in',
            color: primaryColor
          }}>
            Experience
          </h2>
          <div style={{marginTop: '0.15in'}}>
            {data.experiences.map((experience, i) => (
              <div key={i} style={{marginBottom: '0.2in'}}>
                <div style={{
                  display: 'table',
                  width: '100%',
                  marginBottom: '0.1in'
                }}>
                  <div style={{
                    display: 'table-row'
                  }}>
                    <div style={{
                      display: 'table-cell',
                      verticalAlign: 'top',
                      fontWeight: 'bold',
                      color: primaryColor
                    }}>
                      {experience.role}
                    </div>
                    <div style={{
                      display: 'table-cell',
                      textAlign: 'right',
                      verticalAlign: 'top',
                      color: secondaryColor
                    }}>
                      {experience.start} — {experience.end}
                    </div>
                  </div>
                  <div style={{
                    display: 'table-row'
                  }}>
                    <div style={{
                      display: 'table-cell',
                      fontStyle: 'italic',
                      fontSize: '0.9em',
                      color: secondaryColor
                    }}>
                      {experience.company}
                    </div>
                  </div>
                </div>
                {experience.bullets && experience.bullets.length > 0 && (
                  <ul style={{
                    listStyleType: 'disc',
                    marginLeft: '0.3in',
                    marginTop: '0.1in',
                    paddingLeft: '0.1in'
                  }}>
                    {experience.bullets.map((bullet, j) => (
                      <li key={j} style={{
                        fontSize: '0.85em',
                        lineHeight: '1.3',
                        marginBottom: '0.05in',
                        color: primaryColor
                      }}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {data.skills && data.skills.length > 0 && (
        <section style={{marginBottom: '0.3in'}}>
          <h2 style={{
            fontSize: '1.2em',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginBottom: '0.15in',
            borderBottom: `1px solid ${primaryColor}`,
            paddingBottom: '0.05in',
            color: primaryColor
          }}>
            Technical Skills
          </h2>
          <div style={{
            marginTop: '0.15in',
            fontSize: '0.85em',
            color: primaryColor
          }}>
            <div>
              {data.skills?.join(', ')}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProfessionalResume;
