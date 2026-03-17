'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import TimetableView from '@/components/lecturer/TimetableView'
import type { Schedule } from '@/components/lecturer/types'

interface TimetableRow {
  id: number
  course_id: number
  day_of_week: string
  start_time: string
  end_time: string
  location: string
  course_code?: string | null
  course_name?: string | null
  color?: string
}

function toSchedule(row: TimetableRow): Schedule {
  return {
    id: row.id,
    course_id: row.course_id,
    day_of_week: row.day_of_week,
    start_time: row.start_time,
    end_time: row.end_time,
    location: row.location,
    courseCode: row.course_code ?? undefined,
    courseName: row.course_name ?? undefined,
    color: row.color ?? 'bg-blue-500',
  }
}

export default function StudentTimetableClient() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await fetch('/api/student/timetable')
        if (!res.ok) throw new Error('Failed to load timetable')
        const data = await res.json()
        const list = Array.isArray(data) ? data : []
        setSchedules(list.map((r: TimetableRow) => toSchedule(r)))
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
        setSchedules([])
      } finally {
        setLoading(false)
      }
    }
    fetchTimetable()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/student/dashboard"
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-500 text-sm">Your weekly class schedule</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <TimetableView schedules={schedules} subtitle="Your weekly class schedule" />
    </div>
  )
}
