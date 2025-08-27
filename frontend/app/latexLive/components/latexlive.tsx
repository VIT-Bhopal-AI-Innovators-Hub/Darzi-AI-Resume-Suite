'use client'

import { generateResumeTex, ResumeData } from '@/lib/latexTemplate'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import ProfessionalResume from '@/app/templates/ProfessionalResume'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-800 text-gray-300">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
        <p>Loading Monaco Editor...</p>
        <p className="text-sm text-gray-400 mt-1">This may take a moment on first load</p>
      </div>
    </div>
  )
})

const WS_URL = (process.env.NEXT_PUBLIC_WS_URL as string) || 'wss://ayush-003-latexwebsocket.hf.space'

export default function ResumeGenerator(): JSX.Element {
  const [data, setData] = useState<ResumeData>({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    summary: '',
    experiences: [],
    education: [],
    skills: [],
    links: [],
  })
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern' | 'creative' | 'professional'>('classic')
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('letter')
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans-serif' | 'mono'>('serif')
  const [primaryColor, setPrimaryColor] = useState('#000000')
  const [secondaryColor, setSecondaryColor] = useState('#666666')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [log, setLog] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'preview' | 'editor' | 'rendered'>('preview')
  const [latexCode, setLatexCode] = useState<string>('')
  const [zoomLevel, setZoomLevel] = useState<number>(100)
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const debounceRef = useRef<number | null>(null)
  const pdfUrlRef = useRef<string | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const reconnectAttemptsRef = useRef<number>(0)
  const maxReconnectAttempts = 5

  const [logOpen, setLogOpen] = useState<boolean>(false)

  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return // Already connected
    }

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setLog((s) => s + '\nWS connected')
      reconnectAttemptsRef.current = 0 
    }
    ws.onmessage = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg.type === 'progress') {
          setLoading(true)
          setLog((s) => s + '\n' + (msg.text || 'progress'))
        } else if (msg.type === 'error') {
          setLoading(false)
          setLog((s) => s + '\nERROR: ' + msg.message)
        } else if (msg.type === 'pdf') {
          setLoading(false)
          const arr = Uint8Array.from(atob(msg.base64), (c) => c.charCodeAt(0))
          const blob = new Blob([arr], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          try {
            if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
          } catch {
            /* ignore */
          }
    
          pdfUrlRef.current = url
          setPdfUrl(url)
          setLog((s) => s + '\nPDF received')
        }
      } catch (e) {
        setLoading(false)
        setLog((s) => s + '\nMSG ERR: ' + String(e))
      }
    }

    ws.onclose = () => {
      setLog((s) => s + '\nWS closed')

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000) // Exponential backoff, max 30s
        setLog((s) => s + `\nAttempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts}) in ${delay/1000}s...`)
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectWebSocket()
        }, delay)
      } else {
        setLog((s) => s + '\nMax reconnection attempts reached. Please refresh the page.')
      }
    }
    ws.onerror = () => setLog((s) => s + '\nWS error')
  }, [])

  useEffect(() => {
    connectWebSocket()

    return () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
    }
  }, [connectWebSocket])

  useEffect(() => {
    if (canvasRef && pdfUrl) {
      const canvas = canvasRef
      const ctx = canvas.getContext('2d')
      if (ctx) {
        canvas.width = 595
        canvas.height = 842
        ctx.clearRect(0, 0, canvas.width, canvas.height)

      }
    }
  }, [canvasRef, pdfUrl, zoomLevel])

  const scheduleBuild = useCallback((latest: ResumeData, tmpl: typeof selectedTemplate = selectedTemplate) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current)
    debounceRef.current = window.setTimeout(() => {
      try {
        console.log('Building with template:', tmpl)
        const tex = generateResumeTex(latest, tmpl, {
          pageSize,
          fontFamily,
          primaryColor,
          secondaryColor
        })
        setLatexCode(tex)
        wsRef.current?.send(JSON.stringify({ type: 'edit', tex }))
        setLog((s) => s + '\nSent build request')
      } catch (error) {
        setLog((s) => s + '\nERROR: ' + (error instanceof Error ? error.message : 'Failed to generate LaTeX'))
        setLoading(false)
      }
    }, 700) as unknown as number
  }, [pageSize, fontFamily, primaryColor, secondaryColor, selectedTemplate])

  function updateField<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setData((prev) => {
      const next = { ...prev, [key]: value }
  scheduleBuild(next, selectedTemplate)
      return next
    })
  }
  useEffect(() => {
    if (pdfUrlRef.current) {
      try {
        URL.revokeObjectURL(pdfUrlRef.current)
      } catch {
        /* ignore */
      }
      pdfUrlRef.current = null
    }
    setPdfUrl(null)
    setLoading(true)
    setLog((s) => s + '\nTemplate/style changed — rebuilding')
  scheduleBuild(data, selectedTemplate)
  }, [selectedTemplate, pageSize, fontFamily, primaryColor, secondaryColor, data, scheduleBuild])

  function addExperience() {
    setData((prev) => {
      const next = {
        ...prev,
        experiences: [...prev.experiences, { company: '', role: '', bullets: [''] }],
      }
  scheduleBuild(next, selectedTemplate)
      return next
    })
  }

  function updateExperience(index: number, patch: Partial<ResumeData['experiences'][number]>) {
    setData((prev) => {
      const arr = [...prev.experiences]
      arr[index] = { ...arr[index], ...patch }
      const next = { ...prev, experiences: arr }
  scheduleBuild(next, selectedTemplate)
      return next
    })
  }

  function addEducation() {
    setData((prev) => {
      const next = { ...prev, education: [...prev.education, { school: '', degree: '' }] }
  scheduleBuild(next, selectedTemplate)
      return next
    })
  }

  function updateEducation(index: number, patch: Partial<ResumeData['education'][number]>) {
    setData((prev) => {
      const arr = [...prev.education]
      arr[index] = { ...arr[index], ...patch }
      const next = { ...prev, education: arr }
  scheduleBuild(next, selectedTemplate)
      return next
    })
  }

  const renderTemplate = () => {
    const templateProps = {
      data,
      pageSize,
      fontFamily,
      primaryColor,
      secondaryColor
    }

    switch (selectedTemplate) {
      case 'professional':
        return <ProfessionalResume {...templateProps} />
      default:
        return <ProfessionalResume {...templateProps} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 p-2">
      {/* Left Side - Form */}
      <div className="w-1/4 p-4 overflow-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <h2 className="mb-5 font-bold text-2xl tracking-tight">Resume Builder</h2>

        <label className="font-medium">Template</label>
        <select
          className="w-full mt-1 mb-3 px-3 py-2 border border-gray-600 bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value as 'classic' | 'modern' | 'creative' | 'professional')}
        >
          <option value="classic">Classic</option>
          <option value="modern">Modern</option>
          <option value="creative">Creative</option>
          <option value="professional">Professional</option>
        </select>

        <label className="font-medium">Page Size</label>
        <select
          className="w-full mt-1 mb-3 px-3 py-2 border border-gray-600 bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          value={pageSize}
          onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter')}
        >
          <option value="letter">Letter (8.5×11 in)</option>
          <option value="a4">A4 (8.27×11.69 in)</option>
        </select>

        <label className="font-medium">Font Family</label>
        <select
          className="w-full mt-1 mb-3 px-3 py-2 border border-gray-600 bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value as 'serif' | 'sans-serif' | 'mono')}
        >
          <option value="serif">Serif</option>
          <option value="sans-serif">Sans Serif</option>
          <option value="mono">Monospace</option>
        </select>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="font-medium block">Primary Color</label>
            <input
              type="color"
              className="w-full mt-1 h-10 border border-gray-600 bg-gray-900 cursor-pointer"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
            />
          </div>
          <div>
            <label className="font-medium block">Secondary Color</label>
            <input
              type="color"
              className="w-full mt-1 h-10 border border-gray-600 bg-gray-900 cursor-pointer"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
            />
          </div>
        </div>

        <label className="font-medium">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          className={`w-full mt-1 mb-3 px-3 py-2 border bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
            !data.name || data.name.trim() === ''
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-600'
          }`}
          value={data.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Enter your full name"
        />

        <label className="font-medium">Title</label>
        <input
          className="w-full mt-1 mb-3 px-3 py-2 border border-gray-600 bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          value={data.title}
          onChange={(e) => updateField('title', e.target.value)}
        />

        <label className="font-medium">Summary</label>
        <textarea
          className="w-full mt-1 mb-3 px-3 py-2 border border-gray-600 bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-y"
          rows={4}
          value={data.summary}
          onChange={(e) => updateField('summary', e.target.value)}
        />

        <label className="font-medium">Email</label>
        <Input
          className="w-full mt-1 mb-3 bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          value={data.email || ''}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="Enter your email"
        />

        <label className="font-medium">Phone</label>
        <Input
          className="w-full mt-1 mb-3 bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          value={data.phone || ''}
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder="Enter your phone number"
        />

        <label className="font-medium">Location</label>
        <Input
          className="w-full mt-1 mb-3 bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          value={data.location || ''}
          onChange={(e) => updateField('location', e.target.value)}
          placeholder="Enter your location"
        />

        <label className="font-medium">Website</label>
        <Input
          className="w-full mt-1 mb-3 bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          value={data.website || ''}
          onChange={(e) => updateField('website', e.target.value)}
          placeholder="Enter your website URL"
        />

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium">Experience</label>
            <Button
              onClick={addExperience}
              variant="outline"
              size="sm"
              className="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Add Experience
            </Button>
          </div>
          {data.experiences?.map((exp, index) => (
            <div key={index} className="mb-3 p-3 border border-gray-600 rounded-md bg-gray-800">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input
                  placeholder="Company"
                  value={exp.company || ''}
                  onChange={(e) => updateExperience(index, { company: e.target.value })}
                  className="bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <Input
                  placeholder="Role"
                  value={exp.role || ''}
                  onChange={(e) => updateExperience(index, { role: e.target.value })}
                  className="bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input
                  placeholder="Start Date"
                  value={exp.start || ''}
                  onChange={(e) => updateExperience(index, { start: e.target.value })}
                  className="bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <Input
                  placeholder="End Date"
                  value={exp.end || ''}
                  onChange={(e) => updateExperience(index, { end: e.target.value })}
                  className="bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="mb-2">
                <label className="text-sm text-gray-300">Bullet Points</label>
                {exp.bullets?.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex gap-2 mb-1">
                    <Input
                      placeholder="Bullet point"
                      value={bullet}
                      onChange={(e) => {
                        const newBullets = [...(exp.bullets || [])]
                        newBullets[bulletIndex] = e.target.value
                        updateExperience(index, { bullets: newBullets })
                      }}
                      className="bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                    <Button
                      onClick={() => {
                        const newBullets = [...(exp.bullets || [])]
                        newBullets.splice(bulletIndex, 1)
                        updateExperience(index, { bullets: newBullets })
                      }}
                      variant="outline"
                      size="sm"
                      className="bg-red-700 text-white border-red-600 hover:bg-red-600"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => {
                    const newBullets = [...(exp.bullets || []), '']
                    updateExperience(index, { bullets: newBullets })
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600 transition-colors"
                >
                  Add Bullet
                </Button>
              </div>
              <Button
                onClick={() => {
                  const newExperiences = [...(data.experiences || [])]
                  newExperiences.splice(index, 1)
                  setData((prev) => {
                    const next = { ...prev, experiences: newExperiences }
                    scheduleBuild(next)
                    return next
                  })
                }}
                variant="outline"
                size="sm"
                className="bg-red-700 text-white border-red-600 hover:bg-red-600"
              >
                Remove Experience
              </Button>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium">Education</label>
            <Button
              onClick={addEducation}
              variant="outline"
              size="sm"
              className="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Add Education
            </Button>
          </div>
          {data.education?.map((edu, index) => (
            <div key={index} className="mb-3 p-3 border border-gray-600 rounded-md bg-gray-800">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input
                  placeholder="School"
                  value={edu.school || ''}
                  onChange={(e) => updateEducation(index, { school: e.target.value })}
                  className="bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <Input
                  placeholder="Degree"
                  value={edu.degree || ''}
                  onChange={(e) => updateEducation(index, { degree: e.target.value })}
                  className="bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input
                  placeholder="Start Date"
                  value={edu.start || ''}
                  onChange={(e) => updateEducation(index, { start: e.target.value })}
                  className="bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <Input
                  placeholder="End Date"
                  value={edu.end || ''}
                  onChange={(e) => updateEducation(index, { end: e.target.value })}
                  className="bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <Button
                onClick={() => {
                  const newEducation = [...(data.education || [])]
                  newEducation.splice(index, 1)
                  setData((prev) => {
                    const next = { ...prev, education: newEducation }
                    scheduleBuild(next)
                    return next
                  })
                }}
                variant="outline"
                size="sm"
                className="bg-red-700 text-white border-red-600 hover:bg-red-600"
              >
                Remove Education
              </Button>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium">Skills</label>
            <Button
              onClick={() => {
                const newSkills = [...(data.skills || []), '']
                setData((prev) => {
                  const next = { ...prev, skills: newSkills }
                  scheduleBuild(next)
                  return next
                })
              }}
              variant="outline"
              size="sm"
              className="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Add Skill
            </Button>
          </div>
          {data.skills?.map((skill, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <Input
                placeholder="Skill"
                value={skill}
                onChange={(e) => {
                  const newSkills = [...(data.skills || [])]
                  newSkills[index] = e.target.value
                  setData((prev) => {
                    const next = { ...prev, skills: newSkills }
                    scheduleBuild(next)
                    return next
                  })
                }}
                className="bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              <Button
                onClick={() => {
                  const newSkills = [...(data.skills || [])]
                  newSkills.splice(index, 1)
                  setData((prev) => {
                    const next = { ...prev, skills: newSkills }
                    scheduleBuild(next)
                    return next
                  })
                }}
                variant="outline"
                size="sm"
                className="bg-red-700 text-white border-red-600 hover:bg-red-600"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium">Additional Links</label>
            <Button
              onClick={() => {
                const newLinks = [...(data.links || []), { label: '', url: '' }]
                setData((prev) => {
                  const next = { ...prev, links: newLinks }
                  scheduleBuild(next)
                  return next
                })
              }}
              variant="outline"
              size="sm"
              className="bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Add Link
            </Button>
          </div>
          {data.links?.map((link, index) => (
            <div key={index} className="mb-3 p-3 border border-gray-600 rounded-md bg-gray-800">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <Input
                  placeholder="Label (e.g. GitHub)"
                  value={link.label || ''}
                  onChange={(e) => {
                    const newLinks = [...(data.links || [])]
                    newLinks[index] = { ...newLinks[index], label: e.target.value }
                    setData((prev) => {
                      const next = { ...prev, links: newLinks }
                      scheduleBuild(next, selectedTemplate)
                      return next
                    })
                  }}
                  className="bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <Input
                  placeholder="URL"
                  value={link.url || ''}
                  onChange={(e) => {
                    const newLinks = [...(data.links || [])]
                    newLinks[index] = { ...newLinks[index], url: e.target.value }
                    setData((prev) => {
                      const next = { ...prev, links: newLinks }
                      scheduleBuild(next, selectedTemplate)
                      return next
                    })
                  }}
                  className="bg-gray-900 text-gray-100 border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
              <Button
                onClick={() => {
                  const newLinks = [...(data.links || [])]
                  newLinks.splice(index, 1)
                  setData((prev) => {
                    const next = { ...prev, links: newLinks }
                      scheduleBuild(next, selectedTemplate)
                    return next
                  })
                }}
                variant="outline"
                size="sm"
                className="bg-red-700 text-white border-red-600 hover:bg-red-600"
              >
                Remove Link
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side */}
      <div className="w-3/4 p-4 flex flex-col">
        {/* Tabs */}
        <div className="flex mb-4 space-x-2">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'preview' ? 'bg-indigo-600 text-white border border-indigo-600' : 'bg-gray-800 text-gray-100 border border-gray-600 hover:bg-gray-700'}`}
          >
            Preview
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'editor' ? 'bg-indigo-600 text-white border border-indigo-600' : 'bg-gray-800 text-gray-100 border border-gray-600 hover:bg-gray-700'}`}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab('rendered')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'rendered' ? 'bg-indigo-600 text-white border border-indigo-600' : 'bg-gray-800 text-gray-100 border border-gray-600 hover:bg-gray-700'}`}
          >
            Rendered
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-gray-800 rounded-lg overflow-hidden border border-gray-700 flex flex-col">
          {activeTab === 'preview' ? (
            <div className="h-full bg-white overflow-auto p-4 flex items-start justify-center">
              <div className="w-full max-w-4xl px-8">
                <div className="max-w-none">
                  <div key={selectedTemplate}>
                    {renderTemplate()}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'editor' ? (
            <Editor
              height="100%"
              language="latex"
              value={latexCode}
              onChange={(value) => {
                setLatexCode(value || '')
                // Optionally send to WS
                wsRef.current?.send(JSON.stringify({ type: 'edit', tex: value }))
              }}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: 'on',
                tabSize: 2,
                insertSpaces: true,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                renderWhitespace: 'selection',
                cursorBlinking: 'blink',
                cursorSmoothCaretAnimation: 'on',
                contextmenu: true,
                mouseWheelZoom: true,
                multiCursorModifier: 'ctrlCmd',
                selectOnLineNumbers: true,
                glyphMargin: true,
                useTabStops: true,
                renderLineHighlight: 'line',
                hideCursorInOverviewRuler: false,
                overviewRulerLanes: 2,
                overviewRulerBorder: false,
                scrollbar: {
                  vertical: 'visible',
                  horizontal: 'visible',
                  verticalScrollbarSize: 14,
                  horizontalScrollbarSize: 14,
                  verticalSliderSize: 14,
                  horizontalSliderSize: 14,
                },
                find: {
                  addExtraSpaceOnTop: false,
                  autoFindInSelection: 'never',
                  seedSearchStringFromSelection: 'never',
                },
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnEnter: 'on',
                quickSuggestions: {
                  other: true,
                  comments: true,
                  strings: true,
                },
                parameterHints: {
                  enabled: true,
                },
                hover: {
                  enabled: true,
                },
                bracketPairColorization: {
                  enabled: true,
                },
                guides: {
                  bracketPairs: true,
                  indentation: true,
                },
                renderValidationDecorations: 'on',
                codeLens: true,
                colorDecorators: true,
                showFoldingControls: 'always',
                matchBrackets: 'always',
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                autoSurround: 'brackets',
                formatOnPaste: true,
                formatOnType: true,
                tabCompletion: 'on',
                wordBasedSuggestions: 'currentDocument',
              }}
              onMount={(editor, monaco) => {
                // Add LaTeX-specific configurations
                monaco.languages.setMonarchTokensProvider('latex', {
                  tokenizer: {
                    root: [
                      [/%.*$/, 'comment'],
                      [/\\[a-zA-Z]+/, 'keyword'],
                      [/{/, 'delimiter.bracket'],
                      [/}/, 'delimiter.bracket'],
                      [/\$\w+\$/, 'variable'],
                      [/\$\$[\s\S]*?\$\$/, 'string'],
                      [/\$.*?\$/, 'string'],
                    ]
                  }
                })

                // Add custom theme colors for LaTeX
                monaco.editor.defineTheme('latex-dark', {
                  base: 'vs-dark',
                  inherit: true,
                  rules: [
                    { token: 'keyword', foreground: '569cd6' },
                    { token: 'comment', foreground: '6a9955' },
                    { token: 'string', foreground: 'ce9178' },
                    { token: 'variable', foreground: '9cdcfe' },
                  ],
                  colors: {
                    'editor.background': '#1f2937',
                    'editor.lineHighlightBackground': '#374151',
                    'editor.selectionBackground': '#3b82f6',
                    'editor.inactiveSelectionBackground': '#1e40af',
                  }
                })

                monaco.editor.setTheme('latex-dark')

                // Set initial value if available
                if (latexCode) {
                  editor.setValue(latexCode)
                }
              }}
            />
          ) : (
            <div className="h-full flex flex-col">
              {/* Rendered Preview Controls */}
              <div className="flex items-center justify-between p-2 bg-gray-700 border-b border-gray-600">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                    className="px-3 py-1 bg-gray-800 text-gray-100 border border-gray-600 hover:bg-gray-700 transition-colors text-sm"
                    title="Zoom Out"
                  >
                    -
                  </button>
                  <span className="text-sm text-gray-300 min-w-[60px] text-center">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={() => setZoomLevel(Math.min(300, zoomLevel + 25))}
                    className="px-3 py-1 bg-gray-800 text-gray-100 border border-gray-600 hover:bg-gray-700 transition-colors text-sm"
                    title="Zoom In"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoomLevel(100)}
                    className="px-3 py-1 bg-gray-800 text-gray-100 border border-gray-600 hover:bg-gray-700 transition-colors text-sm"
                    title="Reset Zoom"
                  >
                    100%
                  </button>
                  <button
                    onClick={() => {
                      // Fit to width - calculate zoom level to fit PDF width to container
                      const containerWidth = 800; // Approximate container width in pixels
                      const pdfWidth = 595; // A4 width in points (8.27 inches * 72 points)
                      const fitZoom = Math.floor((containerWidth / pdfWidth) * 100);
                      setZoomLevel(Math.max(25, Math.min(300, fitZoom)));
                    }}
                    className="px-3 py-1 bg-gray-800 text-gray-100 border border-gray-600 hover:bg-gray-700 transition-colors text-sm"
                    title="Fit to Width"
                  >
                    📏 Fit Width
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      // Toggle pan mode - for now just show alert
                      alert('Pan mode: Click and drag to pan the PDF');
                    }}
                    className="px-3 py-1 bg-gray-800 text-gray-100 border border-gray-600 hover:bg-gray-700 transition-colors text-sm"
                    title="Pan Mode"
                  >
                    🖱️ Pan
                  </button>
                  <button
                    onClick={() => {
                      // Download PDF
                      if (pdfUrl) {
                        const link = document.createElement('a');
                        link.href = pdfUrl;
                        link.download = 'resume.pdf';
                        link.click();
                      }
                    }}
                    className="px-3 py-1 bg-gray-800 text-gray-100 border border-gray-600 hover:bg-gray-700 transition-colors text-sm"
                    title="Download PDF"
                    disabled={!pdfUrl}
                  >
                    💾 Download
                  </button>
                  <button
                    onClick={() => {
                      // Print PDF
                      if (pdfUrl) {
                        const printWindow = window.open(pdfUrl, '_blank');
                        if (printWindow) {
                          printWindow.print();
                        }
                      }
                    }}
                    className="px-3 py-1 bg-gray-800 text-gray-100 border border-gray-600 hover:bg-gray-700 transition-colors text-sm"
                    title="Print PDF"
                    disabled={!pdfUrl}
                  >
                    🖨️ Print
                  </button>
                  <button
                    onClick={() => {
                      // Full screen mode
                      const container = document.querySelector('.flex-1.overflow-hidden.relative');
                      if (container && container.requestFullscreen) {
                        container.requestFullscreen();
                      }
                    }}
                    className="px-3 py-1 bg-gray-800 text-gray-100 border border-gray-600 hover:bg-gray-700 transition-colors text-sm"
                    title="Full Screen"
                  >
                    � Full Screen
                  </button>
                </div>
              </div>

              {/* Rendered Content */}
              <div className="flex-1 overflow-hidden relative">
                {pdfUrl ? (
                  <div className="h-full w-full flex items-center justify-center bg-gray-900">
                    <iframe
                      src={pdfUrl}
                      className="w-full h-full border-0"
                      style={{
                        transform: `scale(${zoomLevel / 100})`,
                        transformOrigin: 'center center',
                      }}
                      title="PDF Preview"
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-900 text-gray-400">
                    <div className="text-center">
                      <div className="text-4xl mb-4">📄</div>
                      <p>No PDF generated yet</p>
                      <p className="text-sm mt-2">Click "Build now" to generate your resume</p>
                    </div>
                  </div>
                )}

               
                <canvas
                  ref={setCanvasRef}
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'center center',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Buttons and Log */}
        <div className="mt-2 space-y-2">
          <div className="flex gap-4">
            <button
              className="bg-indigo-600 text-white px-5 py-2 font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-indigo-600"
              disabled={!data.name || data.name.trim() === '' || loading}
              onClick={() => {
                try {
                  console.log('Manual build with template:', selectedTemplate)
                  const tex = generateResumeTex(data, selectedTemplate, {
                    pageSize,
                    fontFamily,
                    primaryColor,
                    secondaryColor
                  })
                  setLatexCode(tex)
                  setLoading(true)
                  wsRef.current?.send(JSON.stringify({ type: 'edit', tex }))
                  setLog((s) => s + '\nManual build requested')
                } catch (error) {
                  setLog((s) => s + '\nERROR: ' + (error instanceof Error ? error.message : 'Failed to generate LaTeX'))
                  setLoading(false)
                }
              }}
            >
              Build now {loading && <Spinner />}
            </button>

            <a href={pdfUrl || '#'} download="resume.pdf">
              <button
                className="bg-green-600 text-white px-5 py-2 font-semibold hover:bg-green-700 cursor-pointer transition-colors border border-green-600"
                disabled={!pdfUrl}
              >
                Download PDF
              </button>
            </a>
          </div>

          <div>
            <button
              className="bg-gray-800 text-gray-100 border border-gray-600 px-4 py-2 font-medium hover:bg-gray-700 transition-colors"
              onClick={() => setLogOpen(!logOpen)}
            >
              {logOpen ? 'Hide compile log' : 'Show compile log'}
            </button>
            {logOpen && (
              <button
                className="bg-red-800 text-white border border-red-600 px-4 py-2 font-medium hover:bg-red-700 transition-colors ml-2"
                onClick={() => setLog('')}
              >
                Clear Log
              </button>
            )}
            {logOpen && (
              <div className="max-h-44 overflow-auto bg-gray-900 p-3 border border-gray-700 rounded mt-2">
                <h4 className="m-0 font-semibold text-sm">Compile log</h4>
                <pre className="text-xs whitespace-pre-wrap">{log}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  function Spinner() {
    return (
      <span className="inline-block w-[22px] h-[22px] border-4 border-indigo-600 border-t-transparent rounded-full animate-spin ml-2"></span>
    )
  }
}
