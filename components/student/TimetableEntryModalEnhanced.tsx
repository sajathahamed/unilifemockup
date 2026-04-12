'use client'

import { useEffect, useState, useCallback } from 'react'
import { X, Loader2, Calendar, Clock, MapPin, BookOpen, AlertCircle, CheckCircle2, GraduationCap, FileText } from 'lucide-react'
import type { TimetableSlot } from '@/components/timetable/types'
import {
  STUDENT_TIMETABLE_DAYS,
  STUDENT_TIMETABLE_DAY_SET,
  parseExamDateInput,
  validateExamDateNotPast,
} from '@/lib/student-timetable-entry.shared'

function todayMinIso(): string {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}

type Mode = 'add' | 'edit'

interface ValidationErrors {
  subject?: string
  start?: string
  end?: string
  day?: string
  examDate?: string
  duplicate?: string
}

function timeInputValue(t: string): string {
  const s = String(t || '').trim()
  const part = s.includes('T') ? (s.split('T')[1] ?? s) : s
  const m = part.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return '09:00'
  return `${String(parseInt(m[1], 10)).padStart(2, '0')}:${m[2]}`
}

interface SavedEntryData {
  id?: number
  day_of_week: string
  start_time: string
  end_time: string
  subject: string
  location: string | null
  entry_type: 'class' | 'exam'
  exam_date: string | null
}

interface TimetableEntryModalProps {
  open: boolean
  mode: Mode
  slot: TimetableSlot | null
  existingSlots?: TimetableSlot[]
  testMode?: boolean
  onClose: () => void
  onSaved: (entryData?: SavedEntryData) => void
}

export default function TimetableEntryModal({
  open,
  mode,
  slot,
  existingSlots = [],
  testMode = false,
  onClose,
  onSaved,
}: TimetableEntryModalProps) {
  const [day, setDay] = useState('Monday')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('10:00')
  const [subject, setSubject] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')
  const [entryType, setEntryType] = useState<'class' | 'exam'>('class')
  const [examDate, setExamDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Reset form when modal opens
  useEffect(() => {
    if (!open) return
    setErrors({})
    setTouched(new Set())
    setSubmitError(null)
    setSubmitSuccess(false)
    
    if (mode === 'edit' && slot) {
      setDay(STUDENT_TIMETABLE_DAY_SET.has(slot.day_of_week) ? slot.day_of_week : 'Monday')
      setStart(timeInputValue(slot.start_time))
      setEnd(timeInputValue(slot.end_time))
      setSubject(slot.subject || slot.courseName || '')
      setLocation(slot.location || '')
      setNotes('')
      setEntryType(slot.entry_type === 'exam' ? 'exam' : 'class')
      setExamDate(slot.exam_date ? String(slot.exam_date).slice(0, 10) : '')
    } else {
      setDay('Monday')
      setStart('09:00')
      setEnd('10:00')
      setSubject('')
      setLocation('')
      setNotes('')
      setEntryType('class')
      setExamDate('')
    }
  }, [open, mode, slot])

  // Auto-set day when exam date changes
  useEffect(() => {
    if (!open || entryType !== 'exam') return
    const parsed = parseExamDateInput(examDate)
    if (!parsed) return
    const [y, m, d] = parsed.split('-').map((x) => parseInt(x, 10))
    const dt = new Date(y, m - 1, d)
    const wd = dt.getDay()
    const names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
    setDay(names[wd])
  }, [open, entryType, examDate])

  // Validation logic
  const validateField = useCallback((field: string, value: string): string | undefined => {
    switch (field) {
      case 'subject':
        if (!value.trim()) return 'Title is required'
        if (value.trim().length < 3) return 'Title must be at least 3 characters'
        if (/^[\d\W]+$/.test(value.trim())) return 'Title cannot be only numbers or symbols'
        return undefined
        
      case 'start':
        if (!value) return 'Start time is required'
        if (!/^\d{2}:\d{2}$/.test(value)) return 'Invalid time format'
        return undefined
        
      case 'end':
        if (!value) return 'End time is required'
        if (!/^\d{2}:\d{2}$/.test(value)) return 'Invalid time format'
        if (value && start) {
          // Convert to minutes for comparison
          const toMins = (t: string) => {
            const [h, m] = t.split(':').map(Number)
            return h * 60 + m
          }
          const startMins = toMins(start)
          const endMins = toMins(value)
          const duration = endMins - startMins
          
          if (duration <= 0) return 'End time must be after start time'
          if (duration < 30) return 'Minimum duration is 30 minutes'
        }
        return undefined
        
      case 'examDate':
        if (entryType === 'exam' && examDate) {
          const pastErr = validateExamDateNotPast(examDate, 'exam')
          if (pastErr) return 'Exam date cannot be in the past'
        }
        return undefined
        
      default:
        return undefined
    }
  }, [start, entryType, examDate])

  // Check for time overlap between two slots
  const timesOverlap = useCallback((start1: string, end1: string, start2: string, end2: string): boolean => {
    // Convert HH:MM to minutes for comparison
    const toMins = (t: string) => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }
    const s1 = toMins(start1)
    const e1 = toMins(end1)
    const s2 = toMins(start2)
    const e2 = toMins(end2)
    
    // Overlap if one starts before the other ends
    return s1 < e2 && s2 < e1
  }, [])

  // Check for duplicates or overlapping slots
  const checkDuplicate = useCallback((): string | undefined => {
    const conflicting = existingSlots.find(s => {
      // Don't compare with self when editing
      if (mode === 'edit' && slot && s.id === slot.id) return false
      
      const sameDay = s.day_of_week.toLowerCase() === day.toLowerCase()
      if (!sameDay) return false
      
      // For exams, also check exam date
      if (entryType === 'exam' && examDate) {
        if (s.exam_date !== examDate) return false
      }
      
      // Check if times overlap
      const existingStart = timeInputValue(s.start_time)
      const existingEnd = timeInputValue(s.end_time)
      
      return timesOverlap(start, end, existingStart, existingEnd)
    })
    
    if (conflicting) {
      const conflictSubject = conflicting.subject || conflicting.courseName || 'Another class'
      const conflictTime = `${timeInputValue(conflicting.start_time)} - ${timeInputValue(conflicting.end_time)}`
      return `Time conflict with "${conflictSubject}" (${conflictTime})`
    }
    
    return undefined
  }, [existingSlots, day, start, end, entryType, examDate, mode, slot, timesOverlap])

  // Validate all fields
  const validateAll = useCallback((): ValidationErrors => {
    const newErrors: ValidationErrors = {}
    
    const subjectErr = validateField('subject', subject)
    if (subjectErr) newErrors.subject = subjectErr
    
    const startErr = validateField('start', start)
    if (startErr) newErrors.start = startErr
    
    const endErr = validateField('end', end)
    if (endErr) newErrors.end = endErr
    
    const examDateErr = validateField('examDate', examDate)
    if (examDateErr) newErrors.examDate = examDateErr
    
    const duplicateErr = checkDuplicate()
    if (duplicateErr) newErrors.duplicate = duplicateErr
    
    return newErrors
  }, [subject, start, end, examDate, validateField, checkDuplicate])

  // Real-time validation
  useEffect(() => {
    if (touched.size === 0) return
    const newErrors = validateAll()
    setErrors(newErrors)
  }, [subject, start, end, day, examDate, entryType, touched, validateAll])

  const handleBlur = (field: string) => {
    setTouched(prev => new Set(prev).add(field))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched(new Set(['subject', 'start', 'end', 'day', 'examDate']))
    
    const validationErrors = validateAll()
    setErrors(validationErrors)
    
    if (Object.keys(validationErrors).length > 0) {
      setSubmitError('Please fix the errors above')
      return
    }

    setSubmitError(null)
    setSaving(true)

    try {
      const payload = {
        day_of_week: day,
        start_time: start,
        end_time: end,
        subject: subject.trim(),
        location: location.trim() || null,
        notes: notes.trim() || null,
        entry_type: entryType,
        exam_date: entryType === 'exam' ? parseExamDateInput(examDate) : null,
      }

      if (mode === 'add') {
        const res = await fetch('/api/student/timetable/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ append: true, entry: payload }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || 'Could not add slot')
      } else if (slot) {
        const res = await fetch(`/api/student/timetable/entries/${slot.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || 'Could not update slot')
      }

      setSubmitSuccess(true)
      
      // Build entry data for parent callback
      const savedEntry: SavedEntryData = {
        day_of_week: day,
        start_time: start,
        end_time: end,
        subject: subject.trim(),
        location: location.trim() || null,
        entry_type: entryType,
        exam_date: entryType === 'exam' ? parseExamDateInput(examDate) : null,
      }
      
      setTimeout(() => {
        onSaved(savedEntry)
        onClose()
      }, 500)
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-[20px] shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timetable-entry-title"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 rounded-t-[20px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                entryType === 'exam' 
                  ? 'bg-rose-50 text-rose-600' 
                  : 'bg-violet-50 text-violet-600'
              }`}>
                {entryType === 'exam' ? <GraduationCap size={20} /> : <BookOpen size={20} />}
              </div>
              <div>
                <h2 id="timetable-entry-title" className="text-lg font-bold text-gray-900">
                  {mode === 'add' ? 'Add to Schedule' : 'Edit Entry'}
                </h2>
                <p className="text-xs text-gray-500">
                  {entryType === 'exam' ? 'Exam slot' : 'Class slot'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Title/Subject */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText size={14} className="text-gray-400" />
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onBlur={() => handleBlur('subject')}
              className={`w-full rounded-xl border px-4 py-3 text-sm transition-colors ${
                touched.has('subject') && errors.subject
                  ? 'border-rose-300 bg-rose-50/50 focus:border-rose-400 focus:ring-rose-200'
                  : 'border-gray-200 focus:border-violet-400 focus:ring-violet-200'
              } focus:ring-2 focus:outline-none`}
              placeholder="e.g., Data Structures, Physics Lecture"
              maxLength={300}
            />
            {touched.has('subject') && errors.subject && (
              <p className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-600">
                <AlertCircle size={12} />
                {errors.subject}
              </p>
            )}
          </div>

          {/* Type Selection */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setEntryType('class'); setExamDate(''); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                entryType === 'class'
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <BookOpen size={16} />
              Class
            </button>
            <button
              type="button"
              onClick={() => setEntryType('exam')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                entryType === 'exam'
                  ? 'border-rose-500 bg-rose-50 text-rose-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <GraduationCap size={16} />
              Exam
            </button>
          </div>

          {/* Day Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={14} className="text-gray-400" />
              Day
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              disabled={entryType === 'exam' && !!examDate}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500"
            >
              {STUDENT_TIMETABLE_DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {entryType === 'exam' && examDate && (
              <p className="text-xs text-gray-500 mt-1.5">
                Day auto-set from exam date
              </p>
            )}
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Clock size={14} className="text-gray-400" />
                Start <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                onBlur={() => handleBlur('start')}
                className={`w-full rounded-xl border px-4 py-3 text-sm transition-colors ${
                  touched.has('start') && errors.start
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-gray-200'
                } focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:outline-none`}
                required
              />
              {touched.has('start') && errors.start && (
                <p className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-600">
                  <AlertCircle size={12} />
                  {errors.start}
                </p>
              )}
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Clock size={14} className="text-gray-400" />
                End <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                onBlur={() => handleBlur('end')}
                className={`w-full rounded-xl border px-4 py-3 text-sm transition-colors ${
                  touched.has('end') && errors.end
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-gray-200'
                } focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:outline-none`}
                required
              />
              {touched.has('end') && errors.end && (
                <p className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-600">
                  <AlertCircle size={12} />
                  {errors.end}
                </p>
              )}
            </div>
          </div>

          {/* Exam Date */}
          {entryType === 'exam' && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar size={14} className="text-gray-400" />
                Exam Date
              </label>
              <input
                type="date"
                min={todayMinIso()}
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                onBlur={() => handleBlur('examDate')}
                className={`w-full rounded-xl border px-4 py-3 text-sm transition-colors ${
                  touched.has('examDate') && errors.examDate
                    ? 'border-rose-300 bg-rose-50/50'
                    : 'border-gray-200'
                } focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:outline-none`}
              />
              {touched.has('examDate') && errors.examDate && (
                <p className="flex items-center gap-1.5 mt-1.5 text-xs text-rose-600">
                  <AlertCircle size={12} />
                  {errors.examDate}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1.5">
                Set a specific date for one-time exam, or leave empty for weekly recurring
              </p>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <MapPin size={14} className="text-gray-400" />
              Location <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:outline-none"
              placeholder="e.g., Room 201, Main Hall"
              maxLength={200}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <FileText size={14} className="text-gray-400" />
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:outline-none resize-none"
              placeholder="Any additional notes..."
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Duplicate Warning */}
          {errors.duplicate && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
              <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">{errors.duplicate}</p>
            </div>
          )}

          {/* Submit Error */}
          {submitError && (
            <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
              <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
              <p className="text-sm text-rose-800">{submitError}</p>
            </div>
          )}

          {/* Success */}
          {submitSuccess && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <p className="text-sm text-emerald-800 font-medium">
                {mode === 'add' ? 'Entry added! Reminder scheduled.' : 'Entry updated! Reminder rescheduled.'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || submitSuccess || hasErrors}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${
                entryType === 'exam'
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-violet-600 text-white hover:bg-violet-700'
              }`}
            >
              {saving && <Loader2 className="animate-spin" size={16} />}
              {saving ? 'Saving…' : submitSuccess ? 'Done!' : mode === 'add' ? 'Add Entry' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
