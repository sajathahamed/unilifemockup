'use client'

import { motion } from 'framer-motion'

export interface TimetableEntry {
  id: number
  day_of_week: string
  start_time: string
  end_time: string
  location: string
  course_code?: string | null
  course_name?: string | null
  colour?: string | null
}

interface StudentTimetableViewProps {
  entries: TimetableEntry[]
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
]

const DEFAULT_COLOUR = 'bg-primary'

export default function StudentTimetableView({ entries }: StudentTimetableViewProps) {
  const getEntriesForSlot = (day: string, time: string) => {
    return entries.filter((e) => {
      const dayMatch = e.day_of_week?.toLowerCase() === day.toLowerCase()
      const [startHour] = (e.start_time || '').split(':').map(Number)
      const [timeHour] = time.split(':').map(Number)
      return dayMatch && startHour === timeHour
    })
  }

  const getDurationHeight = (startTime: string, endTime: string) => {
    const [startHour, startMin] = (startTime || '0:0').split(':').map(Number)
    const [endHour, endMin] = (endTime || '0:0').split(':').map(Number)
    const startTotal = startHour * 60 + startMin
    const endTotal = endHour * 60 + endMin
    return Math.max(40, ((endTotal - startTotal) / 60) * 80)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Weekly Timetable</h2>
        <p className="text-white/80 text-sm mt-1">Campus schedule for the week</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-20">Time</th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-900 min-w-[180px]"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time) => (
              <tr key={time} className="border-b border-gray-200 h-20">
                <td className="px-4 py-3 text-xs font-medium text-gray-600 w-20 align-top">
                  {time}
                </td>
                {DAYS.map((day) => {
                  const slotEntries = getEntriesForSlot(day, time)
                  return (
                    <td
                      key={`${day}-${time}`}
                      className="px-4 py-3 relative min-w-[180px] bg-gray-50 align-top"
                    >
                      {slotEntries.map((entry) => {
                        const raw = (entry.colour && entry.colour.trim()) || ''
                        const bgClass = raw.startsWith('bg-') ? raw : DEFAULT_COLOUR
                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`${bgClass} text-white rounded-lg p-2 mb-1 text-xs cursor-default hover:shadow-md transition-shadow`}
                            style={{
                              minHeight: `${getDurationHeight(entry.start_time, entry.end_time)}px`,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div>
                              <p className="font-semibold line-clamp-2">
                                {entry.course_name || 'Session'}
                              </p>
                              {entry.course_code && (
                                <p className="text-xs opacity-90">{entry.course_code}</p>
                              )}
                            </div>
                            <div className="text-xs opacity-90 mt-1">
                              {entry.start_time} - {entry.end_time}
                            </div>
                            {entry.location && (
                              <div className="text-xs opacity-90">{entry.location}</div>
                            )}
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

      {entries.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-3">Entries</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {entries.map((entry) => {
              const raw = (entry.colour && entry.colour.trim()) || ''
              const bgClass = raw.startsWith('bg-') ? raw : DEFAULT_COLOUR
              return (
                <div key={entry.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${bgClass}`} />
                  <span className="text-xs text-gray-600 truncate">
                    {entry.course_code || entry.course_name || `#${entry.id}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
