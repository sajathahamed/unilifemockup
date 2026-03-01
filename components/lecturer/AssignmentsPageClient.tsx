'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, FileText, Trash2, Edit2, ArrowLeft, Loader2, Calendar, BookOpen } from 'lucide-react'
import Button from '@/components/ui/Button'
import AssignmentForm, { AssignmentFormValues } from '@/components/lecturer/AssignmentForm'

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

interface Course {
  id: number
  course_code: string
  course_name: string
}

export default function AssignmentsPageClient() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Assignment | null>(null)

  const fetchAssignments = async () => {
    try {
      const res = await fetch('/api/lecturer/assignments')
      if (!res.ok) throw new Error('Failed to load assignments')
      const data = await res.json()
      setAssignments(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setAssignments([])
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/lecturer/courses')
      if (!res.ok) return
      const data = await res.json()
      setCourses(Array.isArray(data) ? data : [])
    } catch {
      setCourses([])
    }
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchAssignments(), fetchCourses()]).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (values: AssignmentFormValues) => {
    const res = await fetch('/api/lecturer/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || 'Failed to create')
    }
    await fetchAssignments()
    setFormOpen(false)
    setEditing(null)
  }

  const handleUpdate = async (values: AssignmentFormValues) => {
    if (!editing) return
    const res = await fetch(`/api/lecturer/assignments/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || 'Failed to update')
    }
    await fetchAssignments()
    setFormOpen(false)
    setEditing(null)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this assignment? Submissions will be removed too.')) return
    const res = await fetch(`/api/lecturer/assignments/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.message || 'Failed to delete')
      return
    }
    await fetchAssignments()
  }

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '—'
    const date = new Date(d)
    return date.toLocaleDateString(undefined, { dateStyle: 'medium' }) + (d.length > 10 ? ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/lecturer/dashboard"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 inline-flex items-center gap-2"
        >
          <ArrowLeft size={20} /> Back to dashboard
        </Link>
        <Button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
          leftIcon={<Plus size={18} />}
        >
          New assignment
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
        <p className="text-gray-500 text-sm mt-0.5">Create assignments and grade student submissions</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-violet-600 animate-spin" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No assignments yet</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Create an assignment for a course. Students can submit and you can grade them here.
          </p>
          <Button
            onClick={() => {
              setEditing(null)
              setFormOpen(true)
            }}
            leftIcon={<Plus size={18} />}
          >
            Create first assignment
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/lecturer/assignments/${a.id}`}
                    className="font-semibold text-gray-900 hover:text-violet-600 line-clamp-2 block"
                  >
                    {a.title}
                  </Link>
                  <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                    <BookOpen size={14} />
                    {a.course_code && a.course_name ? `${a.course_code} – ${a.course_name}` : `Course #${a.course_id}`}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(a)
                      setFormOpen(true)
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              {a.due_date && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-auto pt-2 border-t border-gray-100">
                  <Calendar size={12} /> Due {formatDate(a.due_date)}
                </p>
              )}
              <Link
                href={`/lecturer/assignments/${a.id}`}
                className="mt-3 text-sm font-medium text-violet-600 hover:text-violet-700"
              >
                View & grade submissions →
              </Link>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <AssignmentForm
          assignment={editing}
          courses={courses}
          onSubmit={editing ? handleUpdate : handleCreate}
          onClose={() => {
            setFormOpen(false)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}
