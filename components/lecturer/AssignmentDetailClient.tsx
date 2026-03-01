'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Calendar, BookOpen, CheckCircle, Clock } from 'lucide-react'
import Button from '@/components/ui/Button'

interface Assignment {
  id: number
  course_id: number
  title: string
  description?: string | null
  due_date?: string | null
  created_at?: string
  course_code?: string | null
  course_name?: string | null
}

interface Submission {
  id: number
  student_id: number
  student_name?: string | null
  student_email?: string | null
  content?: string | null
  submitted_at: string
  grade?: number | null
  feedback?: string | null
  status: string
}

interface AssignmentDetailClientProps {
  assignmentId: number
}

export default function AssignmentDetailClient({ assignmentId }: AssignmentDetailClientProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gradingId, setGradingId] = useState<number | null>(null)
  const [gradeInput, setGradeInput] = useState<Record<number, string>>({})
  const [feedbackInput, setFeedbackInput] = useState<Record<number, string>>({})

  const fetchAssignment = async () => {
    try {
      const res = await fetch(`/api/lecturer/assignments/${assignmentId}`)
      if (!res.ok) {
        if (res.status === 404) setError('Assignment not found')
        else setError('Failed to load')
        return
      }
      const data = await res.json()
      setAssignment(data)
    } catch {
      setError('Failed to load')
    }
  }

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`/api/lecturer/assignments/${assignmentId}/submissions`)
      if (!res.ok) return
      const data = await res.json()
      setSubmissions(Array.isArray(data) ? data : [])
    } catch {
      setSubmissions([])
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchAssignment(), fetchSubmissions()]).finally(() => setLoading(false))
  }, [assignmentId])

  useEffect(() => {
    const grade: Record<number, string> = {}
    const feedback: Record<number, string> = {}
    submissions.forEach((s) => {
      if (s.grade != null) grade[s.id] = String(s.grade)
      if (s.feedback != null) feedback[s.id] = s.feedback
    })
    setGradeInput((prev) => ({ ...prev, ...grade }))
    setFeedbackInput((prev) => ({ ...prev, ...feedback }))
  }, [submissions])

  const handleGrade = async (subId: number) => {
    setGradingId(subId)
    try {
      const grade = gradeInput[subId]?.trim()
      const feedback = feedbackInput[subId]?.trim()
      const res = await fetch(
        `/api/lecturer/assignments/${assignmentId}/submissions/${subId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grade: grade === '' ? null : parseFloat(grade),
            feedback: feedback || null,
          }),
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.message || 'Failed to save grade')
        return
      }
      await fetchSubmissions()
    } finally {
      setGradingId(null)
    }
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={40} className="text-violet-600 animate-spin" />
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="space-y-4">
        <Link
          href="/lecturer/assignments"
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

  return (
    <div className="space-y-6">
      <Link
        href="/lecturer/assignments"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={18} /> Back to assignments
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-5 text-white">
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-white/90 text-sm">
            <span className="flex items-center gap-1.5">
              <BookOpen size={16} />
              {assignment.course_code && assignment.course_name
                ? `${assignment.course_code} – ${assignment.course_name}`
                : `Course #${assignment.course_id}`}
            </span>
            {assignment.due_date && (
              <span className="flex items-center gap-1.5">
                <Calendar size={16} />
                Due {formatDate(assignment.due_date)}
              </span>
            )}
          </div>
        </div>
        {assignment.description && (
          <div className="p-6 border-b border-gray-100">
            <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Submissions</h2>
          <span className="text-sm text-gray-500">
            {submissions.length} submission{submissions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Clock size={40} className="mx-auto mb-3 opacity-50" />
            <p>No submissions yet. Students can submit from their dashboard when this feature is enabled.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {submissions.map((sub) => (
              <li key={sub.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{sub.student_name ?? `Student #${sub.student_id}`}</p>
                    <p className="text-sm text-gray-500">{sub.student_email}</p>
                    <p className="text-xs text-gray-400 mt-1">Submitted {formatDate(sub.submitted_at)}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-3 py-1 rounded-full ${
                      sub.status === 'graded'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {sub.status === 'graded' ? (
                      <span className="flex items-center gap-1"><CheckCircle size={12} /> Graded</span>
                    ) : (
                      'Pending'
                    )}
                  </span>
                </div>
                {sub.content && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                    {sub.content}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Grade</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      placeholder="—"
                      value={gradeInput[sub.id] ?? (sub.grade != null ? String(sub.grade) : '')}
                      onChange={(e) => setGradeInput((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                      className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Feedback (optional)"
                      value={feedbackInput[sub.id] ?? (sub.feedback ?? '')}
                      onChange={(e) => setFeedbackInput((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    isLoading={gradingId === sub.id}
                    onClick={() => handleGrade(sub.id)}
                  >
                    {sub.status === 'graded' ? 'Update grade' : 'Save grade'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
