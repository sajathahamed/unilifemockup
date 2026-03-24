'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Calendar, BookOpen, Send } from 'lucide-react'
import Button from '@/components/ui/Button'
import { CardLoader } from '@/components/ui/LoadingSpinner'

interface Assignment {
  id: number
  title: string
  description?: string | null
  due_date?: string | null
  course_code?: string | null
  course_name?: string | null
}

export default function StudentAssignmentsClient() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/student/assignments')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load'))))
      .then((data) => setAssignments(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load assignments'))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (d: string | null | undefined) => {
    if (!d) return 'No due date'
    return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  }

  return (
    <div className="space-y-6">
      <Link
        href="/student/dashboard"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={18} /> Back to dashboard
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-500 text-sm mt-0.5">View and submit assignments</p>
      </div>
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
      {loading ? (
        <CardLoader variant="academic" text="Loading assignments..." />
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No assignments yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-gray-900">{a.title}</h2>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                    <BookOpen size={14} />
                    {a.course_code && a.course_name ? `${a.course_code} – ${a.course_name}` : `Assignment #${a.id}`}
                  </p>
                  {a.due_date && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar size={12} /> Due {formatDate(a.due_date)}
                    </p>
                  )}
                </div>
                <Link href={`/student/assignments/${a.id}`}>
                  <Button size="sm" leftIcon={<Send size={14} />}>
                    View & submit
                  </Button>
                </Link>
              </div>
              {a.description && (
                <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap line-clamp-2">{a.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
