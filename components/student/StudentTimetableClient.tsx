'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import StudentTimetableView from '@/components/student/StudentTimetableView'
import { CardLoader } from '@/components/ui/LoadingSpinner'

interface TimetableEntry {
  id: number
  day_of_week: string
  start_time: string
  end_time: string
  location: string
  course_code?: string | null
  course_name?: string | null
  colour?: string | null
}

export default function StudentTimetableClient() {
  const [entries, setEntries] = useState<TimetableEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/student/timetable')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('Failed to load'))))
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load timetable'))
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
        <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
        <p className="text-gray-500 text-sm mt-0.5">Your weekly class schedule</p>
      </div>
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
      {loading ? (
        <CardLoader variant="academic" text="Loading timetable..." />
      ) : (
        <StudentTimetableView entries={entries} />
      )}
    </div>
  )
}
