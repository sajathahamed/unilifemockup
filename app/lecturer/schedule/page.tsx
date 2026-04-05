'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Clock, MapPin, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import ScheduleForm from '@/components/lecturer/ScheduleForm'
import TimetableView from '@/components/lecturer/TimetableView'

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

// Sample data - replace with API call
const sampleSchedules: Schedule[] = [
  {
    id: '1',
    courseCode: 'CS101',
    courseName: 'Introduction to Computer Science',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:30',
    location: 'Hall A',
    capacity: 50,
    color: 'bg-blue-500',
    lecturer: 'Dr. Smith',
  },
  {
    id: '2',
    courseCode: 'CS102',
    courseName: 'Data Structures',
    day: 'Tuesday',
    startTime: '10:00',
    endTime: '11:30',
    location: 'Lab 2',
    capacity: 30,
    color: 'bg-purple-500',
    lecturer: 'Dr. Smith',
  },
  {
    id: '3',
    courseCode: 'CS103',
    courseName: 'Web Development',
    day: 'Wednesday',
    startTime: '14:00',
    endTime: '15:30',
    location: 'Lab 1',
    capacity: 40,
    color: 'bg-green-500',
    lecturer: 'Dr. Smith',
  },
  {
    id: '4',
    courseCode: 'CS104',
    courseName: 'Database Management',
    day: 'Thursday',
    startTime: '09:00',
    endTime: '10:30',
    location: 'Hall B',
    capacity: 45,
    color: 'bg-orange-500',
    lecturer: 'Dr. Smith',
  },
  {
    id: '5',
    courseCode: 'CS105',
    courseName: 'Software Engineering',
    day: 'Friday',
    startTime: '10:00',
    endTime: '11:30',
    location: 'Meeting Room',
    capacity: 25,
    color: 'bg-red-500',
    lecturer: 'Dr. Smith',
  },
]

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<Schedule[]>(sampleSchedules)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)

  const handleAddSchedule = (newSchedule: Omit<Schedule, 'id'>) => {
    const schedule: Schedule = {
      ...newSchedule,
      id: Date.now().toString(),
    }
    setSchedules([...schedules, schedule])
    setIsFormOpen(false)
  }

  const handleEditSchedule = (updatedSchedule: Schedule | Omit<Schedule, 'id'>) => {
    if (!('id' in updatedSchedule)) {
      // Should not happen for edit flow, but guard against missing id
      setIsFormOpen(false)
      setEditingSchedule(null)
      return
    }

    setSchedules(
      schedules.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
    )
    setEditingSchedule(null)
    setIsFormOpen(false)
  }

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id))
  }

  const openEditForm = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingSchedule(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/80 to-purple-600 px-6 py-5 shadow-lg mb-8 mt-4"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-24" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full -ml-36 -mb-24" />

        {/* Content */}
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-white/80 text-xs font-medium mb-2">Lecturer Dashboard</p>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">Class Schedule</h1>
            <p className="text-white/90 text-sm">Manage your teaching schedule and courses</p>
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="!bg-white !text-primary hover:!bg-gray-50 !shadow-md whitespace-nowrap flex-shrink-0 mt-1"
          >
            <Plus size={18} />
            Add Schedule
          </Button>
        </div>
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timetable view */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <TimetableView schedules={schedules} />
        </motion.div>

        {/* Schedules list */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">All Schedules</h2>
              <p className="text-white/80 text-sm mt-1">{schedules.length} classes</p>
            </div>

            <div className="divide-y divide-gray-200">
              {schedules.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>No schedules yet. Add your first class schedule!</p>
                </div>
              ) : (
                schedules.map((schedule) => (
                  <motion.div
                    key={schedule.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {schedule.courseName}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">{schedule.courseCode}</p>
                      </div>
                      <div
                        className={`w-2 h-10 rounded-full ${schedule.color}`}
                      />
                    </div>

                    <div className="space-y-1 mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock size={14} />
                        <span>
                          {schedule.day} • {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin size={14} />
                        <span>{schedule.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Users size={14} />
                        <span>{schedule.capacity} students</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(schedule)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={14} className="inline mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} className="inline mr-1" />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <ScheduleForm
          schedule={editingSchedule}
          onSubmit={editingSchedule ? handleEditSchedule : handleAddSchedule}
          onClose={closeForm}
        />
      )}
    </div>
  )
}
