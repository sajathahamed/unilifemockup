'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export interface AssignmentFormValues {
  course_id: number | string
  title: string
  description: string
  due_date: string
}

interface AssignmentFormProps {
  assignment?: { id: number; course_id: number; title: string; description?: string | null; due_date?: string | null } | null
  courses: { id: number; course_code: string; course_name: string }[]
  onSubmit: (values: AssignmentFormValues) => Promise<void>
  onClose: () => void
}

export default function AssignmentForm({
  assignment,
  courses,
  onSubmit,
  onClose,
}: AssignmentFormProps) {
  const [title, setTitle] = useState(assignment?.title ?? '')
  const [description, setDescription] = useState(assignment?.description ?? '')
  const [courseId, setCourseId] = useState<String | number>(assignment?.course_id ?? (courses[0]?.id ?? ''))
  const [dueDate, setDueDate] = useState(
    assignment?.due_date ? String(assignment.due_date).slice(0, 16) : ''
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (assignment) {
      setTitle(assignment.title)
      setDescription(assignment.description ?? '')
      setCourseId(assignment.course_id)
      setDueDate(assignment.due_date ? String(assignment.due_date).slice(0, 16) : '')
    } else if (courses.length) {
      setCourseId(courses[0].id)
    }
  }, [assignment, courses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const t = title.trim()
    if (!t) {
      setError('Title is required')
      return
    }
    if (!courseId) {
      setError('Select a course')
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        course_id: Number(courseId),
        title: t,
        description: description.trim(),
        due_date: dueDate || '',
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {assignment ? 'Edit assignment' : 'New assignment'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
            <select
              value={String(courseId)}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_code} – {c.course_name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Week 3 Programming Task"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instructions for students..."
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Due date (optional)</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" isLoading={loading} className="flex-1">
              {assignment ? 'Update' : 'Create'} assignment
            </Button>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
