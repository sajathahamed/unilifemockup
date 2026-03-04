'use client'

import { motion } from 'framer-motion'
import { Clock, Users, MapPin } from 'lucide-react'

interface Schedule {
  id: string
  courseCode: string
  courseName: string
  day: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  color: string
  lecturer: string
}

interface TimetableViewProps {
  schedules: Schedule[]
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
// Full 24h (00:00–23:00) so all classes are visible regardless of time
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) =>
  `${String(i).padStart(2, '0')}:00`
)

/** Returns Monday of the week containing `date` */
function getWeekDates(base: Date): Date[] {
  const d = new Date(base)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return Array.from({ length: 5 }, (_, i) => {
    const x = new Date(d)
    x.setDate(d.getDate() + i)
    return x
  })
}

/** Light background colors need dark text for readability */
const LIGHT_COLORS = ['bg-yellow-500', 'bg-cyan-500', 'bg-lime-400']
function isLightColor(color: string): boolean {
  return LIGHT_COLORS.some((c) => color.includes(c) || color === c)
}

export default function TimetableView({ schedules }: TimetableViewProps) {
  const weekDates = getWeekDates(new Date())

  const getSchedulesForSlot = (day: string, time: string) => {
    return schedules.filter((s) => {
      const [startHour] = s.startTime.split(':').map(Number)
      const [timeHour] = time.split(':').map(Number)
      return s.day === day && startHour === timeHour
    })
  }

  const getDurationHeight = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    const startTotal = startHour * 60 + startMin
    const endTotal = endHour * 60 + endMin
    return ((endTotal - startTotal) / 60) * 56
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Clock size={20} /> Weekly Timetable
        </h2>
        <p className="text-indigo-100 text-sm mt-1">Your teaching schedule for the week</p>
      </div>

      {/* Timetable - scrollable for 24h */}
      <div className="overflow-auto max-h-[65vh]">
        <table className="w-full min-w-[700px]">
          <thead className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 shadow-sm">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold text-gray-900 w-20 bg-gray-50">
                Time
              </th>
              {DAYS.map((day, i) => (
                <th
                  key={day}
                  className="px-4 py-3 text-left text-sm font-bold text-gray-900 min-w-[160px] border-l border-gray-200"
                >
                  <div className="flex flex-col">
                    <span>{day}</span>
                    <span className="text-xs font-normal text-gray-500 mt-0.5">
                      {weekDates[i]?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time, idx) => (
              <tr key={time} className={`border-b border-gray-200 h-14 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className={`px-3 py-2 text-xs font-bold text-gray-700 w-20 align-top sticky left-0 border-r border-gray-200 z-[1] ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  {time}
                </td>
                {DAYS.map((day) => {
                  const daySchedules = getSchedulesForSlot(day, time)
                  return (
                    <td
                      key={`${day}-${time}`}
                      className="px-2 py-2 relative min-w-[160px] align-top border-l border-gray-200"
                    >
                      {daySchedules.map((schedule) => {
                        const useDarkText = isLightColor(schedule.color)
                        return (
                          <motion.div
                            key={schedule.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ scale: 1.02 }}
                            className={`${schedule.color} rounded-lg p-2 mb-1.5 cursor-pointer hover:shadow-lg transition-all font-semibold border border-black/10 ${
                              useDarkText ? 'text-gray-900' : 'text-white'
                            }`}
                            style={{
                              minHeight: `${getDurationHeight(
                                schedule.startTime,
                                schedule.endTime
                              )}px`,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                            }}
                            title={`${schedule.courseName} (${schedule.capacity} students)`}
                          >
                            <div>
                              <p className="font-semibold text-sm line-clamp-2 leading-tight">{schedule.courseName}</p>
                              <p className={`text-xs mt-0.5 ${useDarkText ? 'text-gray-700' : 'opacity-90'}`}>{schedule.courseCode}</p>
                            </div>
                            <div className={`text-xs flex items-center gap-1 mt-1 ${useDarkText ? 'text-gray-800' : 'opacity-90'}`}>
                              <MapPin size={12} /> {schedule.location}
                            </div>
                            <div className={`text-xs flex items-center gap-1 ${useDarkText ? 'text-gray-800' : 'opacity-90'}`}>
                              <Clock size={12} /> {schedule.startTime} - {schedule.endTime}
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

      {/* Course legend & info */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-600 mb-3">COURSE LEGEND</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${schedule.color}`} />
                  <span className="text-xs text-gray-600 font-medium truncate">{schedule.courseCode}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-4">
            <span className="flex items-center gap-1">📚 {schedules.length} class{schedules.length !== 1 ? 'es' : ''} this week</span>
            <span>👥 {schedules.reduce((a, s) => a + s.capacity, 0)} total students</span>
          </div>
        </div>
      </div>
    </div>
  )
}
