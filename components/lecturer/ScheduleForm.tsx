'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Zap, Check } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import type { Schedule } from '@/components/lecturer/types'

interface ScheduleFormProps {
  schedule?: Schedule | null | undefined
  onSubmit: (schedule: Omit<Schedule, 'id' | 'courseCode' | 'courseName' | 'color'> | Schedule) => void
  onClose: () => void
}


interface FormValues {
  academic_year: string
  course_id: number | string
  day_of_week: string
  start_time: string
  end_time: string
  location: string
}

interface Student {
  id: number
  name: string
  email: string
}

interface Course {
  id: number
  course_code: string
  course_name: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const COLORS = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
]

const LOCATIONS = [
  'Hall A',
  'Hall B',
  'Hall C',
  'Lab 1',
  'Lab 2',
  'Lab 3',
  'Meeting Room',
  'Auditorium',
]

export default function ScheduleForm({ schedule, onSubmit, onClose }: ScheduleFormProps) {
  const [formData, setFormData] = useState<FormValues>({
    academic_year: schedule?.academic_year || '',
    course_id: schedule?.course_id || '',
    day_of_week: schedule?.day_of_week || 'Monday',
    start_time: schedule?.start_time || '09:00',
    end_time: schedule?.end_time || '10:30',
    location: schedule?.location || '',
  })

  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [courseError, setCourseError] = useState<string | null>(null)

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true)
        const coursesRes = await fetch('/api/lecturer/courses')
        if (coursesRes.ok) {
          const data = await coursesRes.json()
          setCourses(data || [])
        } else {
          setCourseError('Failed to load courses')
        }
      } catch (err) {
        setCourseError('Error loading courses')
        console.error('Fetch courses error:', err)
      } finally {
        setLoadingCourses(false)
      }
    }
    fetchCourses()
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string | undefined> = {}


    if (!formData.academic_year) {
      newErrors.academic_year = 'Academic year is required'
    }

    if (!formData.course_id) {
      newErrors.course_id = 'Course is required'
    }

    if (!formData.location.trim()) newErrors.location = 'Location is required'

    const [startHour, startMin] = formData.start_time.split(':').map(Number)
    const [endHour, endMin] = formData.end_time.split(':').map(Number)
    const startInMinutes = startHour * 60 + startMin
    const endInMinutes = endHour * 60 + endMin

    if (startInMinutes >= endInMinutes) {
      newErrors.end_time = 'End time must be after start time'
    }

    if ((endInMinutes - startInMinutes) < 30) {
      newErrors.end_time = 'Minimum duration is 30 minutes'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'course_id' ? parseInt(value) || '' : value,
    }))
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setShowSuccess(true)
      
      onSubmit({
        ...formData,
        course_id: formData.course_id as number,
      } as Omit<Schedule, 'id' | 'courseCode' | 'courseName' | 'color'>)

      setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 1000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto"
        >
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 px-8 py-6 flex items-start justify-between border-b border-purple-400/20 shadow-lg">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {schedule ? <Zap size={28} className="text-white" /> : <CheckCircle size={28} className="text-white" />}
                <h2 className="text-2xl font-bold text-white">
                  {schedule ? 'Edit Class Schedule' : 'Create Class Schedule'}
                </h2>
              </div>
              <p className="text-purple-100 text-sm ml-11">
                {schedule ? 'Update course and schedule details' : 'Add a new class to your teaching schedule'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors ml-4"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-8 py-4 flex items-center gap-3 text-green-700 text-sm"
              >
                <Check size={20} className="text-green-600" />
                <span className="font-medium">Schedule saved successfully!</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Section 1: Selection */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                <h3 className="text-lg font-semibold text-gray-900">Selection</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                  <select
                    name="academic_year"
                    value={formData.academic_year}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.academic_year ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300 focus:ring-purple-500/20 focus:border-purple-500'
                    }`}
                  >
                    <option value="">Select academic year</option>
                    <option value="Year 1">Year 1</option>
                    <option value="Year 2">Year 2</option>
                    <option value="Year 3">Year 3</option>
                    <option value="Year 4">Year 4</option>
                  </select>
                  {errors.academic_year && <p className="text-red-500 text-xs mt-1">{errors.academic_year}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                  <select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                      errors.course_id ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300 focus:ring-purple-500/20 focus:border-purple-500'
                    }`}
                    disabled={loadingCourses}
                  >
                    <option value="">{loadingCourses ? 'Loading courses...' : 'Select course'}</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.course_code} - {course.course_name}
                      </option>
                    ))}
                  </select>
                  {errors.course_id && <p className="text-red-500 text-xs mt-1">{errors.course_id}</p>}
                  {courseError && <p className="text-red-500 text-xs mt-1">{courseError}</p>}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Section 2: Schedule Details */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">2</div>
                <h3 className="text-lg font-semibold text-gray-900">Schedule Details</h3>
              </div>

              <div className="pl-11 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                    <select
                      name="day_of_week"
                      value={formData.day_of_week}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    >
                      {DAYS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.location ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300 focus:ring-purple-500/20 focus:border-purple-500'
                      }`}
                    >
                      <option value="">Select location</option>
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.end_time ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300 focus:ring-purple-500/20 focus:border-purple-500'
                      }`}
                    />
                    {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Form Actions */}
            <div className="border-t border-gray-200 pt-8 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    {schedule ? 'Update Schedule' : 'Create Schedule'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
