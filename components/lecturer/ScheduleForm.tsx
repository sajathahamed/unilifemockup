'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, Zap, Check } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

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

interface ScheduleFormProps {
  schedule?: Schedule | null
  onSubmit: (schedule: Schedule | Omit<Schedule, 'id'>) => void
  onClose: () => void
}

interface FormValues {
  courseName: string
  courseCode: string
  day: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  color: string
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
    courseName: schedule?.courseName || '',
    courseCode: schedule?.courseCode || '',
    day: schedule?.day || 'Monday',
    startTime: schedule?.startTime || '09:00',
    endTime: schedule?.endTime || '10:30',
    location: schedule?.location || '',
    capacity: schedule?.capacity ?? 30,
    color: schedule?.color || 'bg-blue-500',
  })


  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string | undefined> = {}

    if (!formData.courseName.trim()) {
      newErrors.courseName = 'Course name is required'
    } else if (formData.courseName.length < 3) {
      newErrors.courseName = 'Must be at least 3 characters'
    }

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = 'Course code is required'
    } else if (!/^[A-Z]{2,}\d{3}$/i.test(formData.courseCode)) {
      newErrors.courseCode = 'Format: CS101'
    }

    if (!formData.location.trim()) newErrors.location = 'Location is required'

    if (formData.capacity < 1) newErrors.capacity = 'Minimum capacity is 1'
    if (formData.capacity > 1000) newErrors.capacity = 'Maximum capacity is 1000'

    const [startHour, startMin] = formData.startTime.split(':').map(Number)
    const [endHour, endMin] = formData.endTime.split(':').map(Number)
    const startInMinutes = startHour * 60 + startMin
    const endInMinutes = endHour * 60 + endMin

    if (startInMinutes >= endInMinutes) {
      newErrors.endTime = 'End time must be after start time'
    }

    if ((endInMinutes - startInMinutes) < 30) {
      newErrors.endTime = 'Minimum duration is 30 minutes'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value,
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
      
      if (schedule?.id) {
        onSubmit({
          ...formData,
          id: schedule.id,
          lecturer: schedule.lecturer,
        } as Schedule)
      } else {
        onSubmit({
          ...formData,
          lecturer: 'Dr. Smith',
        })
      }

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
            {/* Section 1: Course Information */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                <h3 className="text-lg font-semibold text-gray-900">Course Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
                <div>
                  <Input
                    label="Course Name"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleChange}
                    placeholder="e.g., Introduction to Computer Science"
                    error={errors.courseName}
                  />
                  {!errors.courseName && formData.courseName && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <Check size={14} /> Valid
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    label="Course Code"
                    name="courseCode"
                    value={formData.courseCode}
                    onChange={handleChange}
                    placeholder="e.g., CS101"
                    error={errors.courseCode}
                  />
                  {!errors.courseCode && formData.courseCode && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <Check size={14} /> Valid
                    </p>
                  )}
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
                      name="day"
                      value={formData.day}
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        errors.endTime ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-300 focus:ring-purple-500/20 focus:border-purple-500'
                      }`}
                    />
                    {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
                  </div>
                  <div>
                    <Input
                      label="Student Capacity"
                      name="capacity"
                      type="number"
                      value={formData.capacity.toString()}
                      onChange={handleChange}
                      placeholder="Number of students"
                      error={errors.capacity}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200" />

            {/* Section 3: Color Selection */}
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold text-sm">3</div>
                <h3 className="text-lg font-semibold text-gray-900">Course Color</h3>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 pl-11">
                {COLORS.map((colorObj) => (
                  <button
                    key={colorObj.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: colorObj.value }))}
                    className={`w-12 h-12 rounded-lg ${colorObj.value} transition-all transform ${
                      formData.color === colorObj.value
                        ? 'ring-4 ring-offset-2 ring-gray-900 scale-110 shadow-lg'
                        : 'hover:scale-105 shadow hover:shadow-md'
                    }`}
                    title={colorObj.name}
                  />
                ))}
              </div>
            </div>

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
