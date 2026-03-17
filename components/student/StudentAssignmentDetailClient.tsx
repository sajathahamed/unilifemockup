'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Calendar, BookOpen, CheckCircle, FileText, Upload, X } from 'lucide-react'
import Button from '@/components/ui/Button'

interface Assignment {
  id: number
  course_id: number
  title: string
  description?: string | null
  due_date?: string | null
  course_code?: string | null
  course_name?: string | null
}

interface Submission {
  id: number
  content: string | null
  status: string
  submitted_at: string | null
  grade?: number | null
  feedback?: string | null
  file_url?: string | null
  file_name?: string | null
}

interface AssignmentDetailResponse extends Assignment {
  submission: Submission | null
}

interface StudentAssignmentDetailClientProps {
  assignmentId: number
}

export default function StudentAssignmentDetailClient({
  assignmentId,
}: StudentAssignmentDetailClientProps) {
  const [data, setData] = useState<AssignmentDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [content, setContent] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await fetch(`/api/student/assignments/${assignmentId}`)
        if (!res.ok) {
          if (res.status === 404) setError('Assignment not found')
          else setError('Failed to load')
          return
        }
        const json = await res.json()
        setData(json)
        setContent(json.submission?.content ?? '')
      } catch {
        setError('Failed to load')
      } finally {
        setLoading(false)
      }
    }
    fetchAssignment()
  }, [assignmentId])

  const handleSubmit = async () => {
    setSubmitting(true)
    setSuccess(false)
    try {
      let res: Response
      if (selectedFile) {
        const formData = new FormData()
        formData.set('content', content.trim() || '')
        formData.set('file', selectedFile)
        res = await fetch(`/api/student/assignments/${assignmentId}/submit`, {
          method: 'POST',
          body: formData,
        })
      } else {
        res = await fetch(`/api/student/assignments/${assignmentId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: content.trim() || null }),
        })
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        alert(err.message || 'Failed to submit')
        return
      }
      setSuccess(true)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      const updated = await fetch(`/api/student/assignments/${assignmentId}`).then((r) => r.json())
      setData(updated)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '—'
    return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={40} className="text-primary animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <Link
          href="/student/assignments"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} /> Back to assignments
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          {error || 'Assignment not found'}
        </div>
      </div>
    )
  }

  const submitted = !!data.submission && data.submission.status === 'submitted'

  return (
    <div className="space-y-6">
      <Link
        href="/student/assignments"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={18} /> Back to assignments
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-indigo-600 px-6 py-5 text-white">
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-white/90 text-sm">
            <span className="flex items-center gap-1.5">
              <BookOpen size={16} />
              {data.course_code && data.course_name
                ? `${data.course_code} – ${data.course_name}`
                : `Course #${data.course_id}`}
            </span>
            {data.due_date && (
              <span className="flex items-center gap-1.5">
                <Calendar size={16} />
                Due {formatDate(data.due_date)}
              </span>
            )}
            {submitted && (
              <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-0.5">
                <CheckCircle size={16} /> Submitted
              </span>
            )}
          </div>
        </div>
        {data.description && (
          <div className="p-6 border-b border-gray-100">
            <p className="text-gray-700 whitespace-pre-wrap">{data.description}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Your submission</h2>
        {data.submission?.submitted_at && (
          <p className="text-sm text-gray-500 mb-3">
            Last submitted: {formatDate(data.submission.submitted_at)}
          </p>
        )}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your submission here (optional)..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
        />

        {/* File upload: PDF, DOC, DOCX */}
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Attach file (PDF, DOC or DOCX — max 10MB)</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            className="hidden"
            id="submission-file"
          />
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="submission-file"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer text-sm font-medium text-gray-700"
            >
              <Upload size={18} /> Choose file
            </label>
            {selectedFile && (
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm">
                <FileText size={16} />
                {selectedFile.name}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="p-0.5 hover:bg-primary/20 rounded"
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
              </span>
            )}
            {data.submission?.file_url && !selectedFile && (
              <span className="inline-flex items-center gap-2 text-sm text-gray-600">
                <FileText size={16} />
                Current file:
                <a
                  href={data.submission.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {data.submission.file_name || 'Download'}
                </a>
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            onClick={handleSubmit}
            isLoading={submitting}
            disabled={submitting}
          >
            {submitted ? 'Update submission' : 'Submit'}
          </Button>
          {success && (
            <span className="text-green-600 text-sm font-medium flex items-center gap-1">
              <CheckCircle size={16} /> Saved
            </span>
          )}
        </div>
        {data.submission?.grade != null && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm font-medium text-gray-700">Grade: {data.submission.grade}</p>
            {data.submission.feedback && (
              <p className="text-sm text-gray-600 mt-1">{data.submission.feedback}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
