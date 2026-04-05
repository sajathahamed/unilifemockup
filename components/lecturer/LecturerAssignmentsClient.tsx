'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { FileText, Calendar, BookOpen, ArrowRight, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import AssignmentCreateForm, { type CourseOption } from '@/components/lecturer/AssignmentCreateForm'
import { CardLoader } from '@/components/ui/LoadingSpinner'

interface Assignment {
  id: number
  title: string
  description?: string | null
  due_date?: string | null
  course_id?: number | null
  course_code?: string | null
  course_name?: string | null
  academic_year?: number | null
}

function loadAssignments(academicYear?: number | null): Promise<Assignment[]> {
  const url = academicYear != null ? `/api/lecturer/assignments?academic_year=${academicYear}` : '/api/lecturer/assignments'
  return fetch(url)
    .then(async (res) => {
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error((data && typeof data.message === 'string') ? data.message : res.statusText || 'Failed to load assignments')
      return data
    })
    .then((data) => (Array.isArray(data) ? data : []))
}

interface LecturerAssignmentsClientProps {
  /** Courses loaded on the server so the create-assignment dropdown is populated */
  initialCourses?: CourseOption[]
}

const ACADEMIC_YEAR_OPTIONS = [
  { value: '', label: 'All years' },
  { value: '1', label: 'Year 1' },
  { value: '2', label: 'Year 2' },
  { value: '3', label: 'Year 3' },
  { value: '4', label: 'Year 4' },
]

export default function LecturerAssignmentsClient({ initialCourses = [] }: LecturerAssignmentsClientProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [courses, setCourses] = useState<CourseOption[]>(initialCourses)
  const [filterYear, setFilterYear] = useState<string>('')

  const refreshAssignments = useCallback(() => {
    const yearNum = filterYear ? parseInt(filterYear, 10) : null
    loadAssignments(yearNum)
      .then(setAssignments)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load assignments'))
  }, [filterYear])

  useEffect(() => {
    const yearNum = filterYear ? parseInt(filterYear, 10) : null
    loadAssignments(yearNum)
      .then(setAssignments)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load assignments'))
      .finally(() => setLoading(false))
  }, [filterYear])

  const openCreate = () => {
    setCreateOpen(true)
    setError(null)
    // If we already have courses from server, keep them; else try to fetch
    if (courses.length === 0) {
      fetch('/api/lecturer/courses')
        .then(async (res) => {
          const data = await res.json().catch(() => ({}))
          if (!res.ok) return []
          return Array.isArray(data) ? data : []
        })
        .then(setCourses)
        .catch(() => setCourses([]))
    }
  }

  const handleCreateSubmit = async (data: {
    title: string
    description: string
    due_date: string
    course_id: number | null
    academic_year: number | null
  }) => {
    const res = await fetch('/api/lecturer/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        description: data.description || null,
        due_date: data.due_date || null,
        course_id: data.course_id,
        academic_year: data.academic_year,
      }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error((body && typeof body.message === 'string') ? body.message : 'Failed to create assignment')
    refreshAssignments()
  }

  const formatDate = (d: string | null | undefined) => {
    if (!d) return 'No due date'
    return new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-8 py-8 shadow-lg mb-8 mt-4"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-24 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <FileText size={36} /> Assignments
            </h1>
            <p className="text-white/90 text-lg">Create and manage assignments</p>
            <Button
              onClick={openCreate}
              className="mt-4 bg-white text-violet-600 hover:bg-gray-50"
              leftIcon={<Plus size={18} />}
            >
              Create assignment
            </Button>
          </div>
          <div className="hidden lg:flex items-center gap-6 bg-white/10 backdrop-blur-md rounded-xl px-6 py-4">
            <p className="text-white/70 text-sm">Total</p>
            <p className="text-3xl font-bold text-white">{assignments.length}</p>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Academic year</label>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white"
        >
          {ACADEMIC_YEAR_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <CardLoader variant="academic" text="Loading assignments..." />
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No assignments yet.</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Create your first assignment using the button above.</p>
          <Button onClick={openCreate} leftIcon={<Plus size={18} />} className="bg-violet-600 text-white hover:bg-violet-700">
            Create assignment
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-gray-900">{a.title}</h2>
                    {a.academic_year != null && (
                      <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-xs font-medium">
                        Year {a.academic_year}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                    <BookOpen size={14} />
                    {a.course_code || a.course_name
                      ? [a.course_code, a.course_name].filter(Boolean).join(' – ')
                      : `Assignment #${a.id}`}
                  </p>
                  {a.due_date && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar size={12} /> Due {formatDate(a.due_date)}
                    </p>
                  )}
                </div>
                <Link
                  href={`/lecturer/assignments/${a.id}`}
                  className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium text-sm"
                >
                  View submissions <ArrowRight size={14} />
                </Link>
              </div>
              {a.description && (
                <p className="text-sm text-gray-600 mt-3 whitespace-pre-wrap line-clamp-2">{a.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {createOpen && (
        <AssignmentCreateForm
          courses={courses}
          onSubmit={handleCreateSubmit}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </div>
  )
}
