'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Clock, MapPin, Users, Download, Filter, Search, BarChart3, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import ScheduleForm from '@/components/lecturer/ScheduleForm'
import TimetableView from '@/components/lecturer/TimetableView'
import type { Schedule } from '@/components/lecturer/types'

// Sample data fallback - empty since we fetch from database
const sampleSchedules: Schedule[] = []

export default function SchedulePageClient() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDay, setFilterDay] = useState<string>('All')
  const [filterAcademicYear, setFilterAcademicYear] = useState<string>('All')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const mapScheduleFromApi = (data: Record<string, unknown>[]): Schedule[] => {
    return (data || [])
      .filter((s: Record<string, unknown>) => s && (typeof s.id === 'number' || typeof s.id === 'string') && !isNaN(Number(s.id)))
      .map((s: Record<string, unknown>) => {
        const id = Number(s.id)
        const colour = (s.colour as string) || ''
        const colorClass = colour && (colour.startsWith('bg-') ? colour : `bg-${colour}-500`)
        return {
          id,
          student_id: typeof s.student_id === 'number' ? s.student_id : undefined,
          course_id: Number(s.course_id),
          academic_year: (s.academic_year as string) || undefined,
          day_of_week: String(s.day_of_week ?? ''),
          start_time: String(s.start_time ?? ''),
          end_time: String(s.end_time ?? ''),
          location: String(s.location ?? ''),
          courseName: (s.course_name as string) || undefined,
          courseCode: (s.course_code as string) || undefined,
          color: colorClass || 'bg-blue-500',
        } as Schedule
      })
  }

  const fetchSchedules = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch('/api/lecturer/schedule')
      if (!response.ok) throw new Error('Failed to fetch schedule')
      const data = await response.json()
      setSchedules(mapScheduleFromApi(data))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule')
      setSchedules(sampleSchedules)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/lecturer/courses')
        if (res.ok) await res.json()
      } catch (err) {
        console.error('Failed to fetch courses:', err)
      }
    }
    fetchSchedules()
    fetchCourses()
  }, [])

  const handleAddSchedule = async (newSchedule: Omit<Schedule, 'id' | 'student_id'>) => {
    try {
      const response = await fetch('/api/lecturer/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to create schedule (${response.status})`)
      }
      await fetchSchedules()
      setIsFormOpen(false)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create schedule'
      setError(message)
      console.error('Add schedule error:', message)
    }
  }

  const handleEditSchedule = async (updatedSchedule: Schedule) => {
    try {
      const response = await fetch(`/api/lecturer/schedule/${updatedSchedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSchedule),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to update schedule (${response.status})`)
      }
      await fetchSchedules()
      setEditingSchedule(null)
      setIsFormOpen(false)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update schedule'
      setError(message)
      console.error('Edit schedule error:', message)
    }
  }

  const handleDeleteSchedule = async (id: number | string | undefined) => {
    const numId = id != null ? Number(id) : NaN
    if (numId === undefined || isNaN(numId) || numId < 1) {
      setError('Invalid schedule ID')
      return
    }
    try {
      const response = await fetch(`/api/lecturer/schedule/${numId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Failed to delete schedule (${response.status})`)
      }
      setSchedules(schedules.filter((s) => Number(s.id) !== numId))
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete schedule'
      setError(message)
      console.error('Delete schedule error:', message)
    }
  }

  const openEditForm = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingSchedule(null)
  }

  // Enrich with fallbacks (API data is mapped to courseCode/courseName in mapScheduleFromApi)
  const enrichedSchedules = schedules.map(schedule => ({
    ...schedule,
    courseCode: schedule.courseCode || 'N/A',
    courseName: schedule.courseName || 'Unknown Course',
    color: schedule.color || 'bg-blue-500',
  }))

  const academicYearOptions = ['All', ...Array.from(new Set(schedules.map(s => s.academic_year).filter(Boolean) as string[]))].sort()

  const normalizeDay = (d: string) => (d || '').trim().toLowerCase().replace(/^\w/, (c) => c.toUpperCase())

  const filteredSchedules = enrichedSchedules.filter((schedule) => {
    const matchesSearch = (schedule.courseName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                         (schedule.courseCode?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    const matchesDay = filterDay === 'All' || normalizeDay(schedule.day_of_week) === normalizeDay(filterDay)
    const matchesAcademicYear = filterAcademicYear === 'All' || schedule.academic_year === filterAcademicYear
    return matchesSearch && matchesDay && matchesAcademicYear
  })

  return (
    <div className="space-y-6">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-violet-600 animate-spin" />
            <p className="text-gray-600">Loading schedule...</p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-50 border border-red-200"
        >
          <p className="text-red-800">{error}</p>
        </motion.div>
      )}

      {!isLoading && (
        <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-8 py-8 shadow-lg mb-8 mt-4"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-24 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-400/10 rounded-full -ml-36 -mb-24 blur-3xl" />

        {/* Content */}
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">📅 Class Schedule</h1>
            <p className="text-white/90 text-lg mb-4">Manage your teaching schedule and timetable</p>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-white text-violet-600 hover:bg-gray-50"
              >
                <Plus size={18} className="mr-2" />
                Add New Schedule
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="hidden lg:flex items-center gap-6 bg-white/10 backdrop-blur-md rounded-xl px-6 py-4">
            <div className="text-center">
              <p className="text-white/70 text-sm">Total Classes</p>
              <p className="text-3xl font-bold text-white">{enrichedSchedules.length}</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <p className="text-white/70 text-sm">This Week</p>
              <p className="text-3xl font-bold text-white">{enrichedSchedules.filter(s => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(s.day_of_week)).length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by course name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={filterAcademicYear}
          onChange={(e) => setFilterAcademicYear(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          title="Academic year"
        >
          {academicYearOptions.map((opt) => (
            <option key={opt} value={opt}>{opt === 'All' ? 'All years' : opt}</option>
          ))}
        </select>
        <select
          value={filterDay}
          onChange={(e) => setFilterDay(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          <option>All</option>
          <option>Monday</option>
          <option>Tuesday</option>
          <option>Wednesday</option>
          <option>Thursday</option>
          <option>Friday</option>
        </select>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timetable View */}
        <div className="lg:col-span-2">
          <TimetableView schedules={filteredSchedules} />
        </div>

        {/* Schedule List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:sticky lg:top-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">📋 Schedule List</h2>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
              <BarChart3 size={18} />
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredSchedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No schedules found</p>
                {(searchQuery || filterDay !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilterDay('All')
                    }}
                    className="text-xs text-violet-600 hover:text-violet-700 mt-2 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              filteredSchedules.map((schedule, index) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:border-violet-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${schedule.color}`} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{schedule.courseName}</h3>
                        <p className="text-xs text-gray-500">{schedule.courseCode}</p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditForm(schedule)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600 ml-4.5">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span>{schedule.day_of_week} • {schedule.start_time} - {schedule.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span>{schedule.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      <span>Capacity: N/A</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
        </>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <ScheduleForm
          schedule={editingSchedule || undefined}
          onSubmit={async (schedule) => {
            if (editingSchedule && 'id' in schedule) {
              await handleEditSchedule(schedule as Schedule)
            } else {
              await handleAddSchedule(schedule as Omit<Schedule, 'id' | 'courseCode' | 'courseName' | 'color'>)
            }
          }}
          onClose={closeForm}
        />
      )}
    </div>
  )
}
