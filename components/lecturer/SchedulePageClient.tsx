'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Clock, MapPin, Users, Download, Filter, Search, BarChart3 } from 'lucide-react'
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

export default function SchedulePageClient() {
  const [schedules, setSchedules] = useState<Schedule[]>(sampleSchedules)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDay, setFilterDay] = useState<string>('All')

  const handleAddSchedule = (newSchedule: Omit<Schedule, 'id'>) => {
    const schedule: Schedule = {
      ...newSchedule,
      id: Date.now().toString(),
    }
    setSchedules([...schedules, schedule])
    setIsFormOpen(false)
  }

  const handleEditSchedule = (updatedSchedule: Schedule | Omit<Schedule, 'id'>) => {
    
    if ('id' in updatedSchedule) {
      setSchedules(
        schedules.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
      )
    }
    
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

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch = schedule.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         schedule.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDay = filterDay === 'All' || schedule.day === filterDay
    return matchesSearch && matchesDay
  })

  return (
    <div className="space-y-6">
      {/* Header */}
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
              <p className="text-3xl font-bold text-white">{schedules.length}</p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <p className="text-white/70 text-sm">This Week</p>
              <p className="text-3xl font-bold text-white">{schedules.filter(s => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(s.day)).length}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
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
                      <span>{schedule.day} • {schedule.startTime} - {schedule.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span>{schedule.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      <span>{schedule.capacity} students</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
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
