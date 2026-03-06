'use client'

import { useState, useEffect } from 'react'
import { Calendar, Loader2, Save } from 'lucide-react'
import Link from 'next/link'

interface Course {
  id: number
  course_code: string | null
  course_name: string | null
  colour: string | null
}

interface Student {
  id: number
  name: string | null
  email: string | null
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export default function AdminTimetableAddForm() {
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState({
    student_id: '',
    course_id: '',
    day_of_week: 'monday',
    start_time: '09:00',
    end_time: '10:00',
    location: '',
    academic_year: '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/courses').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/admin/students').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([c, s]) => {
        setCourses(Array.isArray(c) ? c : [])
        setStudents(Array.isArray(s) ? s : [])
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load courses or students' }))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (!form.course_id) {
      setMessage({ type: 'error', text: 'Select a course' })
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: form.student_id || null,
          course_id: form.course_id,
          day_of_week: form.day_of_week,
          start_time: form.start_time,
          end_time: form.end_time,
          location: form.location || null,
          academic_year: form.academic_year || null,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setMessage({ type: 'success', text: 'Timetable entry created.' })
        setForm((prev) => ({
          ...prev,
          start_time: '09:00',
          end_time: '10:00',
          location: '',
        }))
      } else {
        setMessage({ type: 'error', text: data?.message || 'Failed to create' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          <Calendar size={20} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">New Timetable Entry</h2>
          <p className="text-sm text-gray-500">Matches student timetable (timetable table).</p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-4 px-4 py-3 rounded-xl text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
          <select
            value={form.course_id}
            onChange={(e) => setForm((p) => ({ ...p, course_id: e.target.value }))}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.course_code || c.course_name || `Course ${c.id}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Student (optional)</label>
          <select
            value={form.student_id}
            onChange={(e) => setForm((p) => ({ ...p, student_id: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">All students / template</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.email || `Student ${s.id}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Day *</label>
          <select
            value={form.day_of_week}
            onChange={(e) => setForm((p) => ({ ...p, day_of_week: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start time *</label>
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End time *</label>
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            placeholder="Room / building"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic year (1–4)</label>
          <select
            value={form.academic_year}
            onChange={(e) => setForm((p) => ({ ...p, academic_year: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="">—</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Add entry
          </button>
          <Link
            href="/admin/timetable"
            className="inline-flex items-center px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
          >
            View timetable
          </Link>
        </div>
      </form>
    </div>
  )
}
