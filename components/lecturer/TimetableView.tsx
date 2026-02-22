'use client'

import { motion } from 'framer-motion'

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

  const getTimePosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return (hours - 8) * 60 + minutes
  }

  const getDurationHeight = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    const startTotal = startHour * 60 + startMin
    const endTotal = endHour * 60 + endMin
    return ((endTotal - startTotal) / 60) * 80
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
        <h2 className="text-lg font-semibold text-white">Weekly Timetable</h2>
        <p className="text-white/80 text-sm mt-1">Your teaching schedule for the week</p>
      </div>

      {/* Timetable */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 w-20">
                Time
              </th>
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
            {TIME_SLOTS.map((time, idx) => (
              <tr key={time} className="border-b border-gray-200 h-20">
                <td className="px-4 py-3 text-xs font-medium text-gray-600 w-20 align-top">
                  {time}
                </td>
                {DAYS.map((day) => {
                  const daySchedules = getSchedulesForSlot(day, time)
                  return (
                    <td
                      key={`${day}-${time}`}
                      className="px-4 py-3 relative min-w-[180px] bg-gray-50 align-top"
                    >
                      {daySchedules.map((schedule) => (
                        <motion.div
                          key={schedule.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`${schedule.color} text-white rounded-lg p-2 mb-1 text-xs cursor-pointer hover:shadow-md transition-shadow`}
                          style={{
                            minHeight: `${getDurationHeight(
                              schedule.startTime,
                              schedule.endTime
                            )}px`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <p className="font-semibold line-clamp-2">{schedule.courseName}</p>
                            <p className="text-xs opacity-90">{schedule.courseCode}</p>
                          </div>
                          <div className="text-xs opacity-90 mt-1">
                            {schedule.startTime} - {schedule.endTime}
                          </div>
                          <div className="text-xs opacity-90">{schedule.location}</div>
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

      {/* Legend */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-600 mb-3">Course Colors</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded ${schedule.color}`} />
              <span className="text-xs text-gray-600 truncate">{schedule.courseCode}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
