'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Loader2, CheckCircle, Clock, ExternalLink } from 'lucide-react'

interface Assignment {
  id: number
  course_id: number
  title: string
  description?: string | null
  due_date?: string | null
  course_code?: string | null
  course_name?: string | null
  submission_id: number | null
  submission_status: string | null
  submitted_at: string | null
}

export default function StudentAssignmentsClient() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await fetch('/api/student/assignments')
        if (!res.ok) throw new Error('Failed to load assignments')
        const data = await res.json()
        setAssignments(Array.isArray(data) ? data : [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
        setAssignments([])
      } finally {
        setLoading(false)
      }
    }
    fetchAssignments()
  }, [])

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '—'
    const date = new Date(d)
    return date.toLocaleDateString(undefined, { dateStyle: 'medium' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/student/dashboard"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-500 text-sm">
            {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} · View and submit
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {assignments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No assignments yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {assignments.map((a) => {
              const submitted = !!a.submission_id && a.submission_status === 'submitted'
              return (
                <li key={a.id} className="hover:bg-gray-50 transition-colors">
                  <Link
                    href={`/student/assignments/${a.id}`}
                    className="flex items-center gap-4 px-6 py-4 block"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        submitted ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {submitted ? (
                        <CheckCircle size={20} />
                      ) : (
                        <FileText size={20} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{a.title}</p>
                      <p className="text-sm text-gray-500">
                        {a.course_name ?? 'Course'} ({a.course_code ?? ''})
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          Due {formatDate(a.due_date)}
                        </span>
                        {submitted && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={12} />
                            Submitted {formatDate(a.submitted_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink size={18} className="text-gray-400 shrink-0" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
