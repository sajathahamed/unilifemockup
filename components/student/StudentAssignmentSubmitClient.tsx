'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Send, Calendar, BookOpen } from 'lucide-react'
import Button from '@/components/ui/Button'

interface Assignment {
  id: number
  title: string
  description?: string | null
  due_date?: string | null
  course_code?: string | null
  course_name?: string | null
}

interface StudentAssignmentSubmitClientProps {
  assignmentId: number
}

export default function StudentAssignmentSubmitClient({ assignmentId }: StudentAssignmentSubmitClientProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/student/assignments/${assignmentId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Assignment not found')
        return res.json()
      })
      .then((data) => {
        setAssignment(data)
        return fetch(`/api/student/assignments/${assignmentId}/submission`).then((r) => (r.ok ? r.json() : null))
      })
      .then((sub) => {
        if (sub?.content) setContent(sub.content)
      })
      .catch(() => setError('Failed to load assignment'))
      .finally(() => setLoading(false))
  }, [assignmentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/student/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to submit')
      }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={40} className="text-blue-600 animate-spin" />
      </div>
    )
  }

  if (error && !assignment) {
    return (
      <div className="space-y-4">
        <Link href="/student/assignments" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={18} /> Back to assignments
        </Link>
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>
      </div>
    )
  }

  const formatDate = (d: string | null | undefined) =>
    d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'No due date'

  return (
    <div className="space-y-6">
      <Link href="/student/assignments" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft size={18} /> Back to assignments
      </Link>

      {assignment && (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-white">
              <h1 className="text-2xl font-bold">{assignment.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-white/90 text-sm">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={16} />
                  {assignment.course_code && assignment.course_name
                    ? `${assignment.course_code} – ${assignment.course_name}`
                    : `Assignment #${assignment.id}`}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={16} /> Due {formatDate(assignment.due_date)}
                </span>
              </div>
            </div>
            {assignment.description && (
              <div className="p-6 border-b border-gray-100">
                <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your submission</h2>
            {success ? (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
                Submission saved. You can edit and resubmit below.
              </div>
            ) : null}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your answer / notes</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your submission here..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              <Button type="submit" isLoading={submitting} leftIcon={<Send size={18} />}>
                {content.trim() ? 'Submit / Update' : 'Save draft'}
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
