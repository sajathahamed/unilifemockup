'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { CardLoader } from '@/components/ui/LoadingSpinner'

interface Course {
  id: number
  course_code: string
  course_name: string
  colour?: string | null
}

interface LecturerCoursesClientProps {
  /** Courses loaded on the server so the page shows data even before client fetch */
  initialCourses?: Course[]
}

export default function LecturerCoursesClient({ initialCourses = [] }: LecturerCoursesClientProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [loading, setLoading] = useState(initialCourses.length === 0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/lecturer/courses')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          throw new Error((data && typeof data.message === 'string') ? data.message : res.statusText || 'Failed to load courses')
        }
        return data
      })
      .then((data) => setCourses(Array.isArray(data) ? data : []))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load courses'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-8 py-8 shadow-lg mb-8 mt-4"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-24 blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BookOpen size={36} /> My Courses
          </h1>
          <p className="text-white/90 text-lg">Courses you teach</p>
          <div className="mt-4 flex items-center gap-4 text-white/80 text-sm">
            <span>{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <CardLoader variant="academic" text="Loading courses..." />
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No courses assigned yet.</p>
          <Link href="/lecturer/schedule" className="inline-flex items-center gap-2 mt-4 text-violet-600 hover:text-violet-700 font-medium">
            Go to Schedule <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg mb-3 ${c.colour || 'bg-violet-500'} opacity-90`} />
                  <p className="font-semibold text-gray-900">{c.course_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{c.course_code}</p>
                </div>
                <Link
                  href="/lecturer/assignments"
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium shrink-0 flex items-center gap-1"
                >
                  Assignments <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
