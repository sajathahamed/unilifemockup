'use client'

import { useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Clock, MapPin, Calendar } from 'lucide-react'
import type { Schedule } from '@/components/lecturer/types'

interface TimetableViewProps {
  schedules: Schedule[]
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
// 24/7: full day from 00:00 to 23:00
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, '0')}:00`
)

/** Get Monday–Friday dates for the current week */
function getWeekDates(): Date[] {
  const today = new Date()
  const day = today.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + mondayOffset)
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

/** Format time for display (e.g. "07:30:00" -> "07:30") */
function formatTimeDisplay(t: string): string {
  const s = String(t).trim()
  const part = s.includes('T') ? s.split('T')[1] : s
  const segments = (part || s).split(':')
  if (segments.length >= 2) return `${segments[0]}:${segments[1]}`
  return s
}

/** Parse hour from start_time - supports "HH:MM:SS", "H:MM", or ISO "YYYY-MM-DDTHH:MM:SS" */
function getHourFromTime(timeStr: string): number {
  if (timeStr == null || timeStr === '') return 0
  const s = String(timeStr).trim()
  let timePart = s
  if (s.includes('T')) timePart = s.split('T')[1] ?? s
  const match = timePart.match(/^(\d{1,2})/)
  if (match) {
    const hour = parseInt(match[1], 10)
    if (!Number.isNaN(hour) && hour >= 0 && hour <= 23) return hour
  }
  const parts = timePart.split(':')
  const hour = parseInt(parts[0], 10)
  return Number.isNaN(hour) ? 0 : Math.max(0, Math.min(23, hour))
}

/** Get minutes from time string (for duration calc) */
function getMinFromTime(timeStr: string): number {
  const s = String(timeStr).trim()
  const timePart = s.includes('T') ? s.split('T')[1] : s
  const parts = (timePart || s).split(':')
  const min = parseInt(parts[1], 10)
  return Number.isNaN(min) ? 0 : min
}

/** Normalize day name for comparison (e.g. "thursday" -> "Thursday") */
function normalizeDay(day: string): string {
  const d = (day || '').trim()
  if (!d) return ''
  return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase()
}

export default function TimetableView({ schedules }: TimetableViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const weekDates = useMemo(() => getWeekDates(), [])
  const todayDayIndex = useMemo(() => {
    const today = new Date().getDay()
    return today === 0 ? 4 : today - 1
  }, [])

  const getSchedulesForSlot = (day: string, time: string) => {
    const [timeHour] = time.split(':').map(Number)
    return schedules.filter((s) => {
      const startHour = getHourFromTime(s.start_time)
      const dayMatch = normalizeDay(s.day_of_week) === normalizeDay(day)
      return dayMatch && startHour === timeHour
    })
  }

  // Scroll to first row that has any schedule so blocks are visible on load
  useEffect(() => {
    if (schedules.length === 0) return
    const firstHour = schedules.reduce((min, s) => {
      const h = getHourFromTime(s.start_time)
      return h < min ? h : min
    }, 24)
    if (firstHour > 23) return
    const slotId = `slot-${String(firstHour).padStart(2, '0')}-00`
    requestAnimationFrame(() => {
      const row = scrollRef.current?.querySelector(`[data-slot="${slotId}"]`)
      if (row) row.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [schedules])

  const getDurationHeight = (startTime: string, endTime: string) => {
    const startTotal = getHourFromTime(startTime) * 60 + getMinFromTime(startTime)
    const endTotal = getHourFromTime(endTime) * 60 + getMinFromTime(endTime)
    const hours = (endTotal - startTotal) / 60
    return Math.max(hours * 52, 40)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ring-1 ring-black/5">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-6 py-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.06)_100%)]" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Calendar size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Weekly Timetable</h2>
            <p className="text-white/90 text-sm mt-0.5">Your teaching schedule for the week</p>
          </div>
        </div>
      </div>

      {/* Timetable - 24/7 scrollable */}
      <div ref={scrollRef} className="overflow-x-auto overflow-y-auto max-h-[70vh]">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 shadow-sm">
            <tr className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-200">
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-20 bg-white border-r border-gray-100">
                Time
              </th>
              {DAYS.map((day, dayIdx) => {
                const isToday = dayIdx === todayDayIndex
                const date = weekDates[dayIdx]
                return (
                  <th
                    key={day}
                    className={`px-4 py-3.5 text-left text-sm font-bold min-w-[160px] border-l border-gray-100 ${
                      isToday
                        ? 'bg-violet-50/80 text-violet-800 border-violet-200/60'
                        : 'bg-white text-gray-800'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className={isToday ? 'text-violet-700' : ''}>{day}</span>
                      <span className={`text-xs font-normal ${isToday ? 'text-violet-600' : 'text-gray-500'}`}>
                        {date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time, idx) => (
              <tr
                key={time}
                data-slot={`slot-${time.replace(':', '-')}`}
                className={`border-b border-gray-100 h-14 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
              >
                <td className={`px-4 py-3 text-xs font-semibold text-gray-500 w-20 align-top sticky left-0 border-r border-gray-100 z-[1] ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                  {time}
                </td>
                {DAYS.map((day, dayIdx) => {
                  const daySchedules = getSchedulesForSlot(day, time)
                  const isToday = dayIdx === todayDayIndex
                  return (
                    <td
                      key={`${day}-${time}`}
                      className={`px-3 py-2 relative min-w-[160px] align-top border-l border-gray-100 ${
                        isToday ? 'bg-violet-50/30' : ''
                      }`}
                    >
                      {daySchedules.map((schedule) => {
                        const borderClass = schedule.color
                          ? schedule.color.replace(/^bg-/, 'border-l-4 border-')
                          : 'border-l-4 border-blue-500'
                        return (
                          <motion.div
                            key={schedule.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            whileHover={{ scale: 1.02, boxShadow: '0 8px 25px -5px rgb(0 0 0 / 0.12)' }}
                            className={`bg-white ${borderClass} text-gray-900 rounded-xl p-3 mb-2 cursor-pointer shadow-md hover:shadow-lg transition-all font-semibold ring-1 ring-gray-200/80`}
                            style={{
                              minHeight: `${getDurationHeight(
                                schedule.start_time,
                                schedule.end_time
                              )}px`,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                            title={`${schedule.courseName} · ${schedule.location}`}
                          >
                            <div>
                              <p className="font-semibold text-sm line-clamp-2 leading-tight text-gray-900">
                                {schedule.courseName}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5 font-medium">{schedule.courseCode}</p>
                            </div>
                            <div className="mt-2 space-y-0.5">
                              <div className="text-xs text-gray-700 flex items-center gap-1.5">
                                <MapPin size={12} className="text-gray-500 shrink-0" />
                                <span className="truncate">{schedule.location}</span>
                              </div>
                              <div className="text-xs text-gray-600 flex items-center gap-1.5">
                                <Clock size={12} className="text-gray-500 shrink-0" />
                                {formatTimeDisplay(schedule.start_time)} – {formatTimeDisplay(schedule.end_time)}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend & Info */}
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-t border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Course legend</p>
            <div className="flex flex-wrap gap-4">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center gap-2">
                  <div
                    className={`h-3 w-3 rounded-md ${schedule.color} shadow-sm ring-1 ring-black/5`}
                  />
                  <span className="text-sm text-gray-600 font-medium">{schedule.courseCode}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-gray-200">
              📚 {schedules.length} class{schedules.length !== 1 ? 'es' : ''} this week
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
