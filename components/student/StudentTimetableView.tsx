'use client'

import { useRef, useEffect } from 'react'
import { Clock, MapPin } from 'lucide-react'

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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)

function getHourFromTime(timeStr: string): number {
  if (timeStr == null || timeStr === '') return 0
  const s = String(timeStr).trim()
  const timePart = s.includes('T') ? s.split('T')[1] : s
  const match = timePart.match(/^(\d{1,2})/)
  if (match) {
    const hour = parseInt(match[1], 10)
    if (!Number.isNaN(hour) && hour >= 0 && hour <= 23) return hour
  }
  const parts = timePart.split(':')
  const hour = parseInt(parts[0], 10)
  return Number.isNaN(hour) ? 0 : Math.max(0, Math.min(23, hour))
}

function normalizeDay(day: string): string {
  const d = (day || '').trim()
  if (!d) return ''
  return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase()
}

function formatTime(t: string): string {
  const s = String(t).trim()
  const part = s.includes('T') ? s.split('T')[1] : s
  const segments = (part || s).split(':')
  if (segments.length >= 2) return `${segments[0]}:${segments[1]}`
  return s
}

export default function StudentTimetableView({ entries }: { entries: TimetableEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const getEntriesForSlot = (day: string, time: string) => {
    const [timeHour] = time.split(':').map(Number)
    return entries.filter((e) => {
      const startHour = getHourFromTime(e.start_time)
      return normalizeDay(e.day_of_week) === normalizeDay(day) && startHour === timeHour
    })
  }

  const getDurationHeight = (startTime: string, endTime: string) => {
    const startHour = getHourFromTime(startTime)
    const endHour = getHourFromTime(endTime)
    const startMin = parseInt(String(startTime).split(':')[1], 10) || 0
    const endMin = parseInt(String(endTime).split(':')[1], 10) || 0
    const startTotal = startHour * 60 + startMin
    const endTotal = endHour * 60 + endMin
    const hours = (endTotal - startTotal) / 60
    return Math.max(hours * 52, 40)
  }

  const firstHour = entries.length
    ? Math.min(...entries.map((e) => getHourFromTime(e.start_time)))
    : 8
  useEffect(() => {
    if (entries.length === 0) return
    const slotId = `slot-${String(firstHour).padStart(2, '0')}-00`
    requestAnimationFrame(() => {
      const row = scrollRef.current?.querySelector(`[data-slot="${slotId}"]`)
      if (row) row.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [entries.length, firstHour])

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock size={20} /> Weekly Timetable
        </h2>
        <p className="text-blue-100 text-sm mt-1">Your classes for the week</p>
      </div>
      <div ref={scrollRef} className="overflow-x-auto overflow-y-auto max-h-[70vh]">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 w-20">Time</th>
              {DAYS.map((day) => (
                <th key={day} className="px-4 py-3 text-left text-sm font-bold text-gray-800 min-w-[160px] border-l border-gray-100">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time, idx) => (
              <tr
                key={time}
                data-slot={`slot-${time.replace(':', '-')}`}
                className={`border-b border-gray-100 h-14 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
              >
                <td className={`px-4 py-3 text-xs font-semibold text-gray-500 w-20 sticky left-0 border-r border-gray-100 z-[1] ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                  {time}
                </td>
                {DAYS.map((day) => {
                  const slotEntries = getEntriesForSlot(day, time)
                  return (
                    <td key={`${day}-${time}`} className="px-3 py-2 align-top border-l border-gray-100 min-w-[160px]">
                      {slotEntries.map((e) => {
                        const colour = e.colour ? String(e.colour) : ''
                        const borderClass = colour && colour.startsWith('bg-') ? `border-l-4 ${colour}` : 'border-l-4 border-blue-500'
                        return (
                          <div
                            key={e.id}
                            className={`bg-gray-50 ${borderClass} rounded-xl p-3 shadow-sm border border-gray-200 text-black`}
                            style={{
                              minHeight: `${getDurationHeight(e.start_time, e.end_time)}px`,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{e.course_name || 'Course'}</p>
                              <p className="text-xs text-gray-700">{e.course_code || ''}</p>
                            </div>
                            <div className="mt-2 text-xs text-gray-800 flex items-center gap-1">
                              <MapPin size={12} /> {e.location || '—'}
                            </div>
                            <div className="text-xs text-gray-800">
                              <Clock size={12} className="inline mr-1" />
                              {formatTime(e.start_time)} – {formatTime(e.end_time)}
                            </div>
                          </div>
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
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
        {entries.length} class{entries.length !== 1 ? 'es' : ''} this week
      </div>
    </div>
  )
}
