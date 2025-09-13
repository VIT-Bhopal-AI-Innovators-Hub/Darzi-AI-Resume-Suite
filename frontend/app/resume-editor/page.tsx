"use client";

import React, { useState } from "react";
import Sidebar from "../../components/main/sidebar";
import Header from "@/components/main/header";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Bot, Plus, Trash2 } from "lucide-react";
import FooterSection from "@/components/footer";

type SectionEntry = {
  id: string;
  position: string;
  organization: string;
  start: string;
  end: string;
  bullets: string[];
  linkLabel?: string;
  linkUrl?: string;
};
type Section = {
  id: string;
  name: string;
  entries: SectionEntry[];
};

export default function ResumeEditorPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string>("React, TypeScript, Next.js");
  const [sections, setSections] = useState<Section[]>([
    {
      id: crypto.randomUUID(),
      name: "Experience",
      entries: [
        {
          id: crypto.randomUUID(),
          position: "Frontend Engineer",
          organization: "Your Company Here",
          start: "20XX-01",
          end: "Present",
          bullets: ["Built reusable UI", "Improved performance by 25%"],
          linkLabel: "Portfolio",
          linkUrl: "", // cleared to avoid accidental leftover link
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: "Education",
      entries: [
        {
          id: crypto.randomUUID(),
          position: "B.S. Computer Science",
          organization: "University Name",
          start: "20XX-09",
          end: "20XX-06",
          bullets: [
            "Graduated with Honors (GPA 9.0/10.0)",
            "Relevant Coursework: Algorithms, Systems, Databases",
          ],
          linkLabel: "Transcript",
          linkUrl: "",
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      name: "Misc",
      entries: [
        {
          id: crypto.randomUUID(),
          position: "Open Source Contributor",
          organization: "GitHub",
          start: "20XX-04",
          end: "Present",
          bullets: [
            "Contributed to 5+ popular React libraries",
            "Maintainer of a small utility with 1k+ monthly downloads",
          ],
          linkLabel: "GitHub Profile",
          linkUrl: "", // left empty to not be left in accidentsally
        },
      ],
    },
  ]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [links, setLinks] = useState<
    { id: string; label: string; url: string }[]
  >([]);

  const addSection = () =>
    setSections((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "New Section",
        entries: [
          {
            id: crypto.randomUUID(),
            position: "",
            organization: "",
            start: "",
            end: "",
            bullets: [""],
            linkLabel: "",
            linkUrl: "",
          },
        ],
      },
    ]);

  const updateSection = (id: string, patch: Partial<Section>) =>
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );

  const removeSection = (id: string) =>
    setSections((prev) => prev.filter((s) => s.id !== id));

  const addEntry = (sectionId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              entries: [
                ...s.entries,
                {
                  id: crypto.randomUUID(),
                  position: "",
                  organization: "",
                  start: "",
                  end: "",
                  bullets: [""],
                  linkLabel: "",
                  linkUrl: "",
                },
              ],
            }
          : s
      )
    );

  const updateEntry = (
    sectionId: string,
    entryId: string,
    patch: Partial<SectionEntry>
  ) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              entries: s.entries.map((e) =>
                e.id === entryId ? { ...e, ...patch } : e
              ),
            }
          : s
      )
    );

  const removeEntry = (sectionId: string, entryId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? { ...s, entries: s.entries.filter((e) => e.id !== entryId) }
          : s
      )
    );

  const updateBullet = (
    sectionId: string,
    entryId: string,
    idx: number,
    value: string
  ) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              entries: s.entries.map((e) =>
                e.id === entryId
                  ? {
                      ...e,
                      bullets: e.bullets.map((b, i) => (i === idx ? value : b)),
                    }
                  : e
              ),
            }
          : s
      )
    );

  const addBullet = (sectionId: string, entryId: string) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              entries: s.entries.map((e) =>
                e.id === entryId ? { ...e, bullets: [...e.bullets, ""] } : e
              ),
            }
          : s
      )
    );

  const removeBullet = (sectionId: string, entryId: string, idx: number) =>
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              entries: s.entries.map((e) =>
                e.id === entryId
                  ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) }
                  : e
              ),
            }
          : s
      )
    );

  const addLink = () =>
    setLinks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: "", url: "" },
    ]);

  const updateLink = (
    id: string,
    patch: Partial<{ label: string; url: string }>
  ) =>
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const removeLink = (id: string) =>
    setLinks((prev) => prev.filter((l) => l.id !== id));

  return (
    <>
      <SignedIn>
        <div className="bg-black text-white min-h-screen font-sans">
          <Sidebar onToggle={setSidebarCollapsed} />
          <main
            className={`transition-all duration-300 ease-in-out ${
              sidebarCollapsed ? "ml-20" : "ml-64"
            } min-h-screen`}
          >
            <Header pageName="Resume Editor" />
            <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* MAIN editor panel */}
              <div className="space-y-6">
                <section className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h2 className="font-bold mb-4 text-sm tracking-wide">
                    BASIC INFO
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400">Full Name</label>
                      <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Title</label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
                        placeholder="Frontend Engineer"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-xs text-gray-400">
                      Professional Summary
                    </label>
                    <textarea
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      rows={4}
                      className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm resize-y outline-none focus:border-white/30"
                      placeholder="2–3 line impactful summary..."
                    />
                  </div>
                  <div className="mt-4">
                    <label className="text-xs text-gray-400">
                      Skills (comma separated)
                    </label>
                    <input
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
                      placeholder="React, TypeScript, Tailwind"
                    />
                  </div>
                  {/* contact info grid */}
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400">Email</label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="john.doe@email.com"
                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Phone</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 1234 5678 90"
                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Location</label>
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, Country / Remote"
                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">
                        Website / Primary Link
                      </label>
                      <input
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm outline-none focus:border-white/30"
                      />
                    </div>
                  </div>

                  {/* additional links if user wants */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-400">
                        Additional Links
                      </label>
                      <button
                        type="button"
                        onClick={addLink}
                        className="text-[11px] px-2 py-1 rounded bg-white text-black font-semibold hover:bg-gray-200"
                      >
                        + Add
                      </button>
                    </div>
                    {links.length === 0 && (
                      <p className="text-[11px] text-gray-500">
                        (Optional) Add portfolio, GitHub, publications, etc.
                      </p>
                    )}
                    <div className="space-y-2">
                      {links.map((l) => (
                        <div key={l.id} className="flex gap-2">
                          <input
                            value={l.label}
                            onChange={(e) =>
                              updateLink(l.id, { label: e.target.value })
                            }
                            placeholder="Label (e.g. GitHub)"
                            className="flex-1 bg-black/40 border border-white/10 rounded-md px-2 py-1 text-xs outline-none focus:border-white/30"
                          />
                          <input
                            value={l.url}
                            onChange={(e) =>
                              updateLink(l.id, { url: e.target.value })
                            }
                            placeholder="https://..."
                            className="flex-[1.4] bg-black/40 border border-white/10 rounded-md px-2 py-1 text-xs outline-none focus:border-white/30"
                          />
                          <button
                            onClick={() => removeLink(l.id)}
                            className="text-gray-400 hover:text-red-400 text-xs px-2"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* REPLACED EXPERIENCE WITH GENERIC SECTIONS */}
                <section className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-sm tracking-wide">
                      SECTIONS
                    </h2>
                    <button
                      onClick={addSection}
                      className="text-xs flex items-center gap-1 bg-white text-black font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Section
                    </button>
                  </div>

                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className="border border-white/10 rounded-lg p-4 space-y-4 bg-black/40"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          value={section.name}
                          onChange={(e) =>
                            updateSection(section.id, { name: e.target.value })
                          }
                          placeholder="Section Name (e.g. Experience, Education, Projects)"
                          className="flex-1 bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm outline-none focus:border-white/30 font-semibold"
                        />
                        {sections.length > 1 && (
                          <button
                            onClick={() => removeSection(section.id)}
                            className="text-gray-400 hover:text-red-400"
                            title="Remove section"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-6">
                        {section.entries.map((entry) => (
                          <div
                            key={entry.id}
                            className="bg-black/30 border border-white/10 rounded-md p-4 space-y-3"
                          >
                            <div className="flex gap-3">
                              <input
                                value={entry.position}
                                onChange={(e) =>
                                  updateEntry(section.id, entry.id, {
                                    position: e.target.value,
                                  })
                                }
                                placeholder="Title / Role"
                                className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-white/30"
                              />
                              <input
                                value={entry.organization}
                                onChange={(e) =>
                                  updateEntry(section.id, entry.id, {
                                    organization: e.target.value,
                                  })
                                }
                                placeholder="Organization"
                                className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-white/30"
                              />
                            </div>
                            <div className="flex gap-3 items-center">
                              <input
                                type="month"
                                value={entry.start}
                                onChange={(e) =>
                                  updateEntry(section.id, entry.id, {
                                    start: e.target.value,
                                  })
                                }
                                className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-white/30"
                              />
                              <input
                                type="month"
                                value={entry.end}
                                onChange={(e) =>
                                  updateEntry(section.id, entry.id, {
                                    end: e.target.value,
                                  })
                                }
                                className="bg-black/40 border border-white/10 rounded px-2 py-1 text-sm outline-none focus:border-white/30"
                              />
                              <button
                                onClick={() =>
                                  removeEntry(section.id, entry.id)
                                }
                                className="ml-auto text-gray-400 hover:text-red-400"
                                title="Remove entry"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="space-y-2">
                              {entry.bullets.map((b, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <textarea
                                    value={b}
                                    onChange={(e) =>
                                      updateBullet(
                                        section.id,
                                        entry.id,
                                        idx,
                                        e.target.value
                                      )
                                    }
                                    rows={1}
                                    className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-sm resize-y outline-none focus:border-white/30"
                                    placeholder="Achievement / Detail..."
                                  />
                                  {entry.bullets.length > 1 && (
                                    <button
                                      onClick={() =>
                                        removeBullet(section.id, entry.id, idx)
                                      }
                                      className="text-gray-500 hover:text-red-400"
                                      title="Remove bullet"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                onClick={() => addBullet(section.id, entry.id)}
                                className="text-xs text-gray-300 hover:text-white"
                              >
                                + Add bullet
                              </button>
                            </div>

                            {/* NEW LINK LABEL & URL INPUTS */}
                            <div className="space-y-1">
                              <label className="text-[10px] uppercase tracking-wide text-gray-400">
                                Link
                              </label>
                              <div className="flex gap-3">
                                <input
                                  value={entry.linkLabel || ""}
                                  onChange={(e) =>
                                    updateEntry(section.id, entry.id, {
                                      linkLabel: e.target.value,
                                    })
                                  }
                                  placeholder="Link Label (e.g. Repo)"
                                  className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-white/30"
                                />
                                <input
                                  value={entry.linkUrl || ""}
                                  onChange={(e) =>
                                    updateEntry(section.id, entry.id, {
                                      linkUrl: e.target.value,
                                    })
                                  }
                                  placeholder="https://link"
                                  className="flex-[1.4] bg-black/40 border border-white/10 rounded px-2 py-1 text-xs outline-none focus:border-white/30"
                                />
                              </div>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={() => addEntry(section.id)}
                          className="text-xs flex items-center gap-1 bg-white text-black font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Entry
                        </button>
                      </div>
                    </div>
                  ))}
                </section>

                <section className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h2 className="font-bold mb-4 text-sm tracking-wide flex items-center gap-2">
                    <Bot className="h-4 w-4" /> AI SUGGESTIONS (Placeholder)
                  </h2>
                  <p className="text-xs text-gray-400">
                    Maybe we can stream suggestions here? hook it up to our
                    cloud model? placeholder for now, heres some examples
                  </p>
                  <div className="mt-3 text-sm space-y-2">
                    <div className="p-3 rounded-md bg-black/40 border border-white/10">
                      Add more quantified metrics in bullets.
                    </div>
                    <div className="p-3 rounded-md bg-black/40 border border-white/10">
                      Tailor your skills to target role keywords for stronger
                      ATS score.
                    </div>
                  </div>
                </section>
              </div>

              {/* PREVIEW */}
              <div className="space-y-6">
                <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-sm tracking-wide">
                      LIVE PREVIEW
                    </h2>
                    <button className="text-xs bg-white text-black font-semibold px-3 py-1.5 rounded-md hover:bg-gray-200">
                      Export (Coming Soon)
                    </button>
                  </div>
                  <div className="bg-white text-black rounded-md p-8 text-sm leading-relaxed font-[350] shadow-inner">
                    <h1 className="text-2xl font-semibold tracking-wide">
                      {fullName || "John Doe"}
                    </h1>
                    <p className="uppercase tracking-wide text-xs mt-1 text-gray-600">
                      {title || "Frontend Engineer"}
                    </p>
                    {([email, phone, location, website].some(Boolean) ||
                      links.length > 0) && (
                      <p className="text-[11px] mt-2 text-gray-700 flex flex-wrap gap-x-2 gap-y-1">
                        {email && <span>{email}</span>}
                        {phone && <span>{phone}</span>}
                        {location && <span>{location}</span>}
                        {website && <span>{website}</span>}
                        {links
                          .filter((l) => l.url || l.label)
                          .map((l) => {
                            const text = l.label || l.url;
                            const href =
                              l.url ||
                              (l.label?.startsWith("http") ? l.label : "");
                            return href ? (
                              <a
                                key={l.id}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                              >
                                {text}
                              </a>
                            ) : (
                              <span key={l.id}>{text}</span>
                            );
                          })}
                      </p>
                    )}
                    <hr className="my-4 border-gray-300" />
                    {summary && <p className="text-[13px] mb-4">{summary}</p>}
                    <h3 className="font-semibold text-sm tracking-wide mb-1">
                      SKILLS
                    </h3>
                    <p className="text-[12px] mb-4">
                      {skills
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                    <h3 className="font-semibold text-sm tracking-wide mb-2">
                      {/* Dynamic heading */}
                    </h3>
                    <div className="space-y-6">
                      {sections.map((section) => (
                        <div key={section.id}>
                          <h4 className="font-semibold text-sm tracking-wide mb-2">
                            {section.name || "Section"}
                          </h4>
                          <div className="space-y-4">
                            {section.entries.map((entry) => (
                              <div key={entry.id}>
                                <div className="flex justify-between">
                                  <p className="font-semibold text-[13px]">
                                    {entry.position || "Title"}
                                    {entry.organization ? " | " : ""}
                                    {entry.organization}
                                    {entry.linkUrl && (
                                      <a
                                        href={entry.linkUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-2 text-[11px] underline font-normal"
                                      >
                                        {entry.linkLabel || "Link"}
                                      </a>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-gray-600">
                                    {entry.start || "YYYY-MM"} -{" "}
                                    {entry.end || "Present"}
                                  </p>
                                </div>
                                <ul className="list-disc ml-4 mt-1 space-y-1">
                                  {entry.bullets
                                    .filter((b) => b.trim())
                                    .map((b, i) => (
                                      <li key={i} className="text-[12px]">
                                        {b}
                                      </li>
                                    ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* we can leave the rest of preview unchanged */}
                  </div>
                </section>
              </div>
            </div>
            <FooterSection />
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="bg-black text-white min-h-screen flex items-center justify-center">
          <RedirectToSignIn />
        </div>
      </SignedOut>
    </>
  );
}