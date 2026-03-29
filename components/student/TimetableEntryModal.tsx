'use client'

import { useEffect, useState } from 'react'
import { X, Loader2 } from 'lucide-react'
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

function timeInputValue(t: string): string {
  const s = String(t || '').trim()
  const part = s.includes('T') ? (s.split('T')[1] ?? s) : s
  const m = part.match(/^(\d{1,2}):(\d{2})/)
  if (!m) return '09:00'
  return `${String(parseInt(m[1], 10)).padStart(2, '0')}:${m[2]}`
}

export default function TimetableEntryModal(props: {
  open: boolean
  mode: Mode
  slot: TimetableSlot | null
  onClose: () => void
  onSaved: () => void
}) {
  const { open, mode, slot, onClose, onSaved } = props
  const [day, setDay] = useState('Monday')
  const [start, setStart] = useState('09:00')
  const [end, setEnd] = useState('10:00')
  const [subject, setSubject] = useState('')
  const [location, setLocation] = useState('')
  const [entryType, setEntryType] = useState<'class' | 'exam'>('class')
  /** YYYY-MM-DD; empty = weekly exam (no fixed date) */
  const [examDate, setExamDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setErr(null)
    if (mode === 'edit' && slot) {
      setDay(STUDENT_TIMETABLE_DAY_SET.has(slot.day_of_week) ? slot.day_of_week : 'Monday')
      setStart(timeInputValue(slot.start_time))
      setEnd(timeInputValue(slot.end_time))
      setSubject(slot.subject || slot.courseName || '')
      setLocation(slot.location || '')
      setEntryType(slot.entry_type === 'exam' ? 'exam' : 'class')
      setExamDate(slot.exam_date ? String(slot.exam_date).slice(0, 10) : '')
    } else {
      setDay('Monday')
      setStart('09:00')
      setEnd('10:00')
      setSubject('')
      setLocation('')
      setEntryType('class')
      setExamDate('')
    }
  }, [open, mode, slot])

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

  if (!open) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setSaving(true)
    try {
      const payload = {
        day_of_week: day,
        start_time: start,
        end_time: end,
        subject: subject.trim(),
        location: location.trim() || null,
        entry_type: entryType,
        exam_date:
          entryType === 'exam' ? parseExamDateInput(examDate) : null,
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
      onSaved()
      onClose()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="timetable-entry-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 id="timetable-entry-title" className="text-lg font-bold text-gray-900">
            {mode === 'add' ? 'Add timetable slot' : 'Edit slot'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
            >
              {STUDENT_TIMETABLE_DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject / module</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              placeholder="e.g. Data Structures"
              required
              maxLength={300}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              placeholder="Room / hall"
              maxLength={200}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="entryType"
                  checked={entryType === 'class'}
                  onChange={() => {
                    setEntryType('class')
                    setExamDate('')
                  }}
                />
                Class
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="entryType"
                  checked={entryType === 'exam'}
                  onChange={() => setEntryType('exam')}
                />
                Exam
              </label>
            </div>
          </div>
          {entryType === 'exam' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam date <span className="font-normal text-gray-500">(recommended)</span>
              </label>
              <input
                type="date"
                min={todayMinIso()}
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                With a date, the reminder runs once on that day only. Leave empty if the exam repeats every week on
                this day.
              </p>
            </div>
          )}
          {err && <p className="text-sm text-red-600">{err}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : null}
              {saving ? 'Saving…' : mode === 'add' ? 'Add' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
