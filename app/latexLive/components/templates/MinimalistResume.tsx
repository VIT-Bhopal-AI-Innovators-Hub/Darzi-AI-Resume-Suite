import React from "react";

// Minimal types (adjust/import from your project as needed)
export interface Experience {
  role?: string;
  company?: string;
  start_date?: string;
  end_date?: string;
  bullets?: string[];
}

export interface Education {
  degree?: string;
  school?: string;
  year?: string;
}

export interface LinkItem {
  name?: string;
  url?: string;
}

export interface CustomSection {
  id: string | number;
  title: string;
  content: string;
}

export interface ResumeData {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  experiences?: Experience[];
  education?: Education[];
  skills?: string[];
  links?: LinkItem[];
  customSections?: CustomSection[];
}

interface MinimalistResumeProps {
  data: ResumeData;
  pageSize?: "a4" | "letter";
  fontFamily?: "serif" | "sans-serif" | "mono";
  primaryColor?: string;
  secondaryColor?: string;
  sectionSpacingMm?: number;
}

export default function MinimalistResume({
  data,
  pageSize = "a4",
  fontFamily = "sans-serif",
  primaryColor = "#1f6feb",
  secondaryColor = "#6b7280",
  sectionSpacingMm = 3,
}: MinimalistResumeProps) {
  const mmToPx = (mm: number) => `${Math.round(mm * 3.78)}px`;
  const sectionMb = mmToPx(sectionSpacingMm);
  void sectionMb;
  const smallMb = mmToPx(Math.max(0, sectionSpacingMm));
  const mediumMb = mmToPx(Math.max(1, Math.round(sectionSpacingMm * 1.5)));
  const columnGap = mmToPx(5);

  // CSS variables used for fine control
  const rootVars: React.CSSProperties & Record<string, string> = {
    ['--primary-color']: primaryColor,
    ['--secondary-color']: secondaryColor,
    ['--section-spacing']: `${sectionSpacingMm}mm`,
    ['--small-spacing']: smallMb,
    ['--medium-spacing']: mediumMb,
    fontFamily:
      fontFamily === "sans-serif"
        ? "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
        : fontFamily === "mono"
        ? "\"Roboto Mono\", Menlo, Monaco, \"Courier New\", monospace"
        : "Georgia, \"Times New Roman\", Times, serif",
  };

  return (
    <div
      className="bg-white text-black p-6 min-h-full"
      style={{ ...rootVars, maxWidth: pageSize === "a4" ? "210mm" : "216mm" }}
    >
      {/* Header */}
      <div style={{ marginBottom: mediumMb, textAlign: "center" }}>
        <h1
          style={{
            color: "var(--primary-color)",
            margin: 0,
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {data.name || "Your Name"}
        </h1>

        {data.title && (
          <h2
            style={{
              color: "var(--secondary-color)",
              margin: "6px 0 0 0",
              fontWeight: 300,
              fontSize: 14,
            }}
          >
            {data.title}
          </h2>
        )}

        <div
          style={{
            marginTop: 6,
            color: "var(--secondary-color)",
            fontSize: 12,
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.location && <span>{data.location}</span>}
        </div>
      </div>

      {/* Summary (kept before columns for ATS) */}
      {data.summary && (
        <div style={{ marginBottom: mediumMb }}>
          <p style={{ margin: 0, fontSize: 13 }}>{data.summary}</p>
        </div>
      )}

      {/* Two-column layout.
          IMPORTANT: DOM order kept as MAIN then SIDEBAR so ATS sees MAIN first.
          Visual layout: left = SIDEBAR (300px), right = MAIN (flex).
          We explicitly place MAIN into gridColumn: 2 and SIDEBAR into gridColumn: 1
          and ensure both start at the same vertical position (alignItems: 'start', alignSelf:'start').
      */}
      <div
        style={{
          display: "grid",
          // make the left column a fixed-ish width but allow the right column to shrink
          // use minmax to avoid column collapse when there are long/overflowing children
          gridTemplateColumns: "300px minmax(0, 1fr)", // left sidebar, right main (visual)
          columnGap,
          // ensure both grid items live in the same implicit row and stretch to
          // match the height of the tallest column so one column doesn't leave
          // a large empty gap while the other continues further down.
          gridAutoRows: "minmax(0, 1fr)",
          alignItems: "stretch",
          // ensure no implicit row gaps are introduced by baseline alignment
          alignContent: "start",
        }}
      >
        {/* MAIN: DOM-first for ATS, explicitly placed into the right column visually */}
        <main
          style={{
            gridColumn: 2,
            alignSelf: "stretch",
            minWidth: 0,
            overflowWrap: "break-word",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            // ensure the main column fills the implicit row created by the grid
            minHeight: 0,
          }}
        >
          {/* Profile */}
          {data.summary && (
            <section style={{ marginBottom: smallMb }}>
              <h3
                style={{
                  margin: 0,
                  marginBottom: 8,
                  color: "var(--primary-color)",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                Profile
              </h3>
              <div style={{ color: "var(--secondary-color)", fontSize: 13, fontWeight: 300 }}>
                {data.summary}
              </div>
            </section>
          )}

          {/* Experience */}
          {data.experiences && data.experiences.length > 0 && (
            <section style={{ marginBottom: mediumMb }}>
              <h3
                style={{
                  margin: 0,
                  marginBottom: 12,
                  color: "var(--primary-color)",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                Experience
              </h3>

              {data.experiences.map((exp, idx) => (
                <div key={idx} style={{ marginBottom: mediumMb }}>
                  <div style={{ marginBottom: smallMb }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{exp.role}</div>
                    <div style={{ color: "var(--secondary-color)", fontWeight: 300 }}>{exp.company}</div>
                    {(exp.start_date || exp.end_date) && (
                      <div style={{ color: "var(--secondary-color)", marginTop: 4, fontSize: 12 }}>
                        {exp.start_date || ""}{exp.start_date && exp.end_date ? " — " : ""}{exp.end_date || ""}
                      </div>
                    )}
                  </div>

                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul style={{ paddingLeft: 16, margin: 0, listStyle: "none" }}>
                      {exp.bullets.filter(Boolean).map((b, i) => (
                        <li key={i} style={{ display: "flex", gap: 8, marginBottom: smallMb }}>
                          <span style={{ width: 8, height: 8, borderRadius: 9999, marginTop: 6, background: "var(--primary-color)", flex: "0 0 8px" }} />
                          <span style={{ fontSize: 13 }}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <section style={{ marginBottom: mediumMb }}>
              <h3
                style={{
                  margin: 0,
                  marginBottom: 12,
                  color: "var(--primary-color)",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                }}
              >
                Education
              </h3>

              {data.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: smallMb }}>
                  <div style={{ fontWeight: 600 }}>{edu.degree}</div>
                  <div style={{ color: "var(--secondary-color)", fontWeight: 300 }}>{edu.school}</div>
                  {edu.year && <div style={{ color: "var(--secondary-color)", fontSize: 12 }}>{edu.year}</div>}
                </div>
              ))}
            </section>
          )}

          {/* Custom Sections */}
          {data.customSections && data.customSections.length > 0 && (
            <div>
              {data.customSections.map((sec) => (
                <section key={sec.id} style={{ marginBottom: smallMb }}>
                  <h3
                    style={{
                      margin: 0,
                      marginBottom: 8,
                      color: "var(--primary-color)",
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 1.2,
                    }}
                  >
                    {sec.title}
                  </h3>
                  <div style={{ whiteSpace: "pre-wrap", color: "var(--secondary-color)", fontWeight: 300 }}>{sec.content}</div>
                </section>
              ))}
            </div>
          )}
        </main>

        {/* SIDEBAR: visually left (gridColumn: 1) and aligned to start */}
        <aside
          style={{
            gridColumn: 1,
            alignSelf: "stretch",
            paddingLeft: 12,
            borderLeft: "1px solid rgba(0,0,0,0.04)",
            boxSizing: "border-box",
            marginLeft: 0,
            // prevent the sidebar's contents from forcing the grid to expand
            minWidth: 0,
            overflowWrap: "break-word",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            minHeight: 0,
          }}
          aria-label="Sidebar"
        >
          <div style={{ marginBottom: smallMb }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--primary-color)" }}>{data.name || "Your Name"}</div>
            {data.title && <div style={{ color: "var(--secondary-color)", fontWeight: 300 }}>{data.title}</div>}
          </div>

          <div style={{ marginBottom: smallMb }}>
            <h4 style={{ margin: 0, marginBottom: 6, fontSize: 13, letterSpacing: 1 }}>Contact</h4>
            <div style={{ color: "var(--secondary-color)", fontWeight: 300, fontSize: 13 }}>
              {data.email && <div>{data.email}</div>}
              {data.phone && <div>{data.phone}</div>}
              {data.location && <div>{data.location}</div>}
            </div>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid rgba(0,0,0,0.06)", margin: "12px 0" }} />

          {data.skills && data.skills.length > 0 && (
            <div style={{ marginBottom: smallMb }}>
              <h4 style={{ margin: 0, marginBottom: 6, fontSize: 13, letterSpacing: 1 }}>Skills</h4>
              <div style={{ color: "var(--secondary-color)", fontWeight: 300 }}>{data.skills.join(" • ")}</div>
            </div>
          )}

          <hr style={{ border: 0, borderTop: "1px solid rgba(0,0,0,0.06)", margin: "12px 0" }} />

          {data.links && data.links.length > 0 && (
            <div style={{ marginBottom: smallMb }}>
              <h4 style={{ margin: 0, marginBottom: 6, fontSize: 13, letterSpacing: 1 }}>Links</h4>
              <div>
                {data.links.map((l, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    {l.name && <div style={{ fontWeight: 600 }}>{l.name}</div>}
                    {l.url && <div style={{ color: "var(--secondary-color)", wordBreak: "break-word", fontWeight: 300 }}>{l.url}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr style={{ border: 0, borderTop: "1px solid rgba(0,0,0,0.06)", margin: "12px 0" }} />

          {data.education && data.education.length > 0 && (
            <div style={{ marginTop: 6 }}>
              <h4 style={{ margin: 0, marginBottom: 6, fontSize: 13, letterSpacing: 1 }}>Education</h4>
              <div style={{ color: "var(--secondary-color)", fontWeight: 300 }}>
                {data.education.slice(0, 2).map((edu, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600 }}>{edu.degree}</div>
                    <div>{edu.school}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <div style={{ marginTop: mediumMb, borderTop: "1px solid rgba(0,0,0,0.06)", height: 8 }} />
    </div>
  );
}