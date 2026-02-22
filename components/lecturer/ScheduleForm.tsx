'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle } from 'lucide-react'
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

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-red-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-yellow-500',
]

export default function ScheduleForm({ schedule, onSubmit, onClose }: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    courseName: schedule?.courseName || '',
    courseCode: schedule?.courseCode || '',
    day: schedule?.day || 'Monday',
    startTime: schedule?.startTime || '09:00',
    endTime: schedule?.endTime || '10:30',
    location: schedule?.location || '',
    capacity: schedule?.capacity || 30,
    color: schedule?.color || 'bg-blue-500',
  })

  const [errors, setErrors] = useState<Partial<typeof formData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {}

    if (!formData.courseName.trim()) newErrors.courseName = 'Course name is required'
    if (!formData.courseCode.trim()) newErrors.courseCode = 'Course code is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1'

    // Time validation
    const [startHour, startMin] = formData.startTime.split(':').map(Number)
    const [endHour, endMin] = formData.endTime.split(':').map(Number)
    const startInMinutes = startHour * 60 + startMin
    const endInMinutes = endHour * 60 + endMin

    if (startInMinutes >= endInMinutes) {
      newErrors.endTime = 'End time must be after start time'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) : value,
    }))
    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }))
  }

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      color,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (schedule?.id) {
        onSubmit({
          ...formData,
          id: schedule.id,
          lecturer: schedule.lecturer,
        } as Schedule)
      } else {
        onSubmit({
          ...formData,
          lecturer: 'Dr. Smith', // Replace with actual user
        })
      }
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
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-primary to-primary/80 px-6 py-4 flex items-center justify-between border-b border-primary/20">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {schedule ? 'Edit Schedule' : 'Add New Schedule'}
              </h2>
              <p className="text-white/80 text-sm mt-1">
                {schedule ? 'Update the class details' : 'Create a new class schedule'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Course Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Course Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Course Name"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleChange}
                    placeholder="e.g., Introduction to Computer Science"
                    error={errors.courseName}
                  />
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
                </div>
              </div>
            </div>

            {/* Schedule Information */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Schedule Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Input
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Hall A, Lab 1"
                    error={errors.location}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.endTime && (
                    <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
                  )}
                </div>
                <div>
                  <Input
                    label="Capacity"
                    name="capacity"
                    type="number"
                    value={formData.capacity.toString()}
                    onChange={handleChange}
                    placeholder="Student count"
                    error={errors.capacity}
                  />
                </div>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Course Color</h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className={`w-10 h-10 rounded-lg ${color} transition-transform hover:scale-110 ${
                      formData.color === color
                        ? 'ring-2 ring-gray-900 ring-offset-2 scale-110'
                        : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    {schedule ? 'Update Schedule' : 'Add Schedule'}
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
