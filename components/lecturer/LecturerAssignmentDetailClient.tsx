'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Loader2, Calendar, BookOpen, ArrowLeft, Users } from 'lucide-react'
import { motion } from 'framer-motion'

interface Assignment {
  id: number
  title: string
  description?: string | null
  due_date?: string | null
  course_code?: string | null
  course_name?: string | null
}

interface LecturerAssignmentDetailClientProps {
  assignmentId: string
}

export default function LecturerAssignmentDetailClient({ assignmentId }: LecturerAssignmentDetailClientProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/lecturer/assignments/${assignmentId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then(setAssignment)
      .catch(() => setError('Assignment not found'))
      .finally(() => setLoading(false))
  }, [assignmentId])

  const formatDate = (d: string | null | undefined) => {
    if (!d) return 'No due date'
    return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="text-violet-600 animate-spin" />
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="space-y-6">
        <Link
          href="/lecturer/assignments"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} /> Back to assignments
        </Link>
        <div className="p-6 rounded-xl bg-red-50 border border-red-200 text-red-700">
          {error || 'Assignment not found.'}
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

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-8 py-6 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <FileText size={28} /> {assignment.title}
        </h1>
        <p className="text-white/90 mt-1 flex items-center gap-2">
          <BookOpen size={16} />
          {assignment.course_code && assignment.course_name
            ? `${assignment.course_code} – ${assignment.course_name}`
            : `Assignment #${assignment.id}`}
        </p>
        {assignment.due_date && (
          <p className="text-white/80 text-sm mt-2 flex items-center gap-2">
            <Calendar size={14} /> Due {formatDate(assignment.due_date)}
          </p>
        )}
      </motion.div>

      {assignment.description && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
          <p className="text-gray-600 whitespace-pre-wrap">{assignment.description}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <Users size={20} /> Submissions
        </h2>
        <p className="text-gray-500 text-sm">
          Submission list will appear here when students submit. Connect to <code className="bg-gray-100 px-1 rounded">assignment_submissions</code> table when ready.
        </p>
      </div>
    </div>
  )
}
