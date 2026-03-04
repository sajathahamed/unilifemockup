'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react'

interface Course {
  id: number
  course_code: string
  course_name: string
  colour?: string | null
}

export default function StudentCoursesClient() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/student/courses')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load'))))
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load courses'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <Link
        href="/student/dashboard"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={18} /> Back to dashboard
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
        <p className="text-gray-500 text-sm mt-0.5">Browse available courses</p>
      </div>
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-blue-600 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No courses available yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900">{c.course_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{c.course_code}</p>
                </div>
                <Link
                  href="/student/assignments"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium shrink-0"
                >
                  Assignments →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
