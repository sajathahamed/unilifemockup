'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Check, BookOpen, Calendar, GraduationCap } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export interface CourseOption {
  id: number
  course_code: string
  course_name: string
  colour?: string | null
}

const ACADEMIC_YEARS = [
  { value: 1, label: 'Year 1' },
  { value: 2, label: 'Year 2' },
  { value: 3, label: 'Year 3' },
  { value: 4, label: 'Year 4' },
]

interface AssignmentCreateFormProps {
  courses: CourseOption[]
  onSubmit: (data: { title: string; description: string; due_date: string; course_id: number | null; academic_year: number | null }) => Promise<void>
  onClose: () => void
}

export default function AssignmentCreateForm({ courses, onSubmit, onClose }: AssignmentCreateFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [courseId, setCourseId] = useState<string>(courses[0]?.id ? String(courses[0].id) : '')
  const [academicYear, setAcademicYear] = useState<number | null>(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const validate = () => {
    const next: Record<string, string> = {}
    if (!title.trim()) next.title = 'Title is required'
    else if (title.trim().length < 2) next.title = 'Title must be at least 2 characters'
    if (!courseId) next.course_id = 'Please select a course'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || '',
        due_date: dueDate || '',
        course_id: courseId ? parseInt(courseId, 10) : null,
        academic_year: academicYear,
      })
      setShowSuccess(true)
      setTimeout(() => onClose(), 1200)
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to create assignment' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 px-6 py-5 flex items-start justify-between border-b border-purple-400/20 shadow-lg z-10">
            <div className="flex items-center gap-3">
              <FileText size={24} className="text-white" />
              <div>
                <h2 className="text-xl font-bold text-white">Create Assignment</h2>
                <p className="text-purple-100 text-sm">Add a new assignment for your course</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={22} className="text-white" />
            </button>
          </div>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center gap-3 text-green-700 text-sm"
              >
                <Check size={20} className="text-green-600" />
                <span className="font-medium">Assignment created successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errors.submit && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {errors.submit}
              </div>
            )}

            <div>
              <Input
                label="Assignment title"
                name="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (errors.title) setErrors((p) => ({ ...p, title: '' }))
                }}
                placeholder="e.g. Week 3 Programming Task"
                error={errors.title}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optional)</label>
              <textarea
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Instructions and requirements..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-y min-h-[100px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <BookOpen size={16} /> Course
              </label>
              <select
                name="course_id"
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value)
                  if (errors.course_id) setErrors((p) => ({ ...p, course_id: '' }))
                }}
                className={`w-full px-4 py-3 rounded-xl border transition-all bg-white ${
                  errors.course_id ? 'border-red-300 focus:ring-red-500/20' : 'border-gray-200 focus:ring-violet-500/20 focus:border-violet-500'
                }`}
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.course_code} – {c.course_name}
                  </option>
                ))}
              </select>
              {errors.course_id && <p className="text-red-500 text-xs mt-1">{errors.course_id}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <GraduationCap size={16} /> Academic year
              </label>
              <select
                value={academicYear ?? ''}
                onChange={(e) => setAcademicYear(e.target.value ? parseInt(e.target.value, 10) : null)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all bg-white"
              >
                <option value="">Optional</option>
                {ACADEMIC_YEARS.map((y) => (
                  <option key={y.value} value={y.value}>
                    {y.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Calendar size={16} /> Due date (optional)
              </label>
              <input
                type="datetime-local"
                name="due_date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Creating...' : 'Create assignment'}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
