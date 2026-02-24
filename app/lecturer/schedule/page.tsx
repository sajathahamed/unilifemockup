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

export default function SchedulePage() {
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
            <p className="text-white/90 text-xs font-bold mb-2 tracking-widest">LECTURE MANAGEMENT</p>
            <h1 className="text-4xl font-bold text-white mb-2">Class Schedule</h1>
            <p className="text-white/80 text-sm">Manage and organize your teaching schedule with ease</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-all shadow-lg">
              <Download size={18} />
              Export
            </button>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="!bg-white !text-purple-600 hover:!bg-gray-50 !shadow-lg flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={18} />
              New Schedule
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search courses or codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <option>All</option>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
              </select>
            </div>
            <button className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2">
              <BarChart3 size={18} />
              Analytics
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timetable view - 2 columns */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <TimetableView schedules={filteredSchedules.length > 0 ? filteredSchedules : schedules} />
        </motion.div>

        {/* Schedules list - 1 column */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
            <h3 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
              <BarChart3 size={16} /> STATISTICS
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Total Classes:</span>
                <span className="font-bold text-blue-900">{filteredSchedules.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Total Students:</span>
                <span className="font-bold text-blue-900">{filteredSchedules.reduce((a, s) => a + s.capacity, 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Locations:</span>
                <span className="font-bold text-blue-900">{new Set(filteredSchedules.map(s => s.location)).size}</span>
              </div>
            </div>
          </div>

          {/* Classes List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                {filterDay === 'All' ? 'All' : filterDay}'s Classes
              </h2>
              <p className="text-indigo-100 text-xs mt-1">{filteredSchedules.length} schedules</p>
            </div>

            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {filteredSchedules.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p className="text-sm">No classes match your filters</p>
                </div>
              ) : (
                filteredSchedules.map((schedule, idx) => (
                  <motion.div
                    key={schedule.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2.5 h-8 rounded-full ${schedule.color}`} />
                          <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
                            {schedule.courseName}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-600 ml-4.5 font-medium">{schedule.courseCode}</p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEditForm(schedule)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
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