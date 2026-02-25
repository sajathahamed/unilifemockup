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
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
]

export default function TimetableView({ schedules }: TimetableViewProps) {
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
    return ((endTotal - startTotal) / 60) * 80
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

      {/* Timetable */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th className="px-4 py-4 text-left text-sm font-bold text-gray-900 w-20">
                Time
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="px-4 py-4 text-left text-sm font-bold text-gray-900 min-w-[180px] border-l border-gray-200"
                >
                  <div className="flex flex-col">
                    <span>{day}</span>
                    <span className="text-xs font-normal text-gray-500 mt-1">
                      {new Date(`2026-02-24`).toLocaleDateString()}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time, idx) => (
              <tr key={time} className={`border-b border-gray-200 h-24 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="px-4 py-3 text-xs font-bold text-gray-700 w-20 align-top sticky left-0 bg-white border-r border-gray-200">
                  {time}
                </td>
                {DAYS.map((day) => {
                  const daySchedules = getSchedulesForSlot(day, time)
                  return (
                    <td
                      key={`${day}-${time}`}
                      className="px-4 py-3 relative min-w-[180px] align-top border-l border-gray-200"
                    >
                      {daySchedules.map((schedule) => (
                        <motion.div
                          key={schedule.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.02 }}
                          className={`${schedule.color} text-white rounded-lg p-2.5 mb-2 cursor-pointer hover:shadow-lg transition-all font-semibold`}
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
                            <p className="text-xs opacity-90 mt-0.5">{schedule.courseCode}</p>
                          </div>
                          <div className="text-xs opacity-90 flex items-center gap-1 mt-1">
                            <MapPin size={12} /> {schedule.location}
                          </div>
                          <div className="text-xs opacity-90 flex items-center gap-1">
                            <Clock size={12} /> {schedule.startTime} - {schedule.endTime}
                          </div>
                        </motion.div>
                      ))}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend & Info */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-600 mb-3">COURSE COLORS</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${schedule.color}`} />
                  <span className="text-xs text-gray-600 font-medium truncate">{schedule.courseCode}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            <p>📚 {schedules.length} classes scheduled</p>
            <p>👥 {schedules.reduce((a, s) => a + s.capacity, 0)} total students</p>
          </div>
        </div>
      </div>
    </div>
  )
}
