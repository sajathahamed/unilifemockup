'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Loader2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Bell,
  Clock,
  MessageSquareText,
} from 'lucide-react'
import TimetableView from '@/components/timetable/TimetableView'
import TimetableEntryModal from '@/components/student/TimetableEntryModal'
import type { TimetableSlot } from '@/components/timetable/types'

type UploadKind = 'class' | 'exam'

export default function StudentTimetableClient() {
  const [schedules, setSchedules] = useState<TimetableSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [reminderMins, setReminderMins] = useState(15)
  const [uploadKind, setUploadKind] = useState<UploadKind>('class')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [reminderPreviewOpen, setReminderPreviewOpen] = useState(false)
  const [reminderPreviewLoading, setReminderPreviewLoading] = useState(false)
  const [reminderPreviewData, setReminderPreviewData] = useState<{
    default_lead_minutes: number
    preview: Array<{
      message: string
      would_schedule: boolean
      skip_reason: string | null
      subject: string
      entry_type: string
      lead_minutes: number
      notify_at: string | null
    }>
    scheduled_in_db: Array<{
      id: number
      message: string
      notify_at: string
      entry_id: number | null
    }>
    sms?: { has_saved_phone: boolean; destination_last4: string | null }
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [slotModalOpen, setSlotModalOpen] = useState(false)
  const [slotModalMode, setSlotModalMode] = useState<'add' | 'edit'>('add')
  const [slotModalSlot, setSlotModalSlot] = useState<TimetableSlot | null>(null)

  const loadTimetable = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/student/timetable')
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load')
      setSchedules(data.slots || [])
      if (data.reminderMinutes != null) setReminderMins(Number(data.reminderMinutes))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
      setSchedules([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTimetable()
  }, [loadTimetable])

  const fetchReminderPreview = async () => {
    setReminderPreviewLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/student/timetable/reminder-preview')
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Preview failed')
      setReminderPreviewData(data)
      setReminderPreviewOpen(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load reminder preview')
    } finally {
      setReminderPreviewLoading(false)
    }
  }

  const gridSubtitle = useMemo(() => {
    const classes = schedules.filter((s) => s.entry_type !== 'exam').length
    const exams = schedules.filter((s) => s.entry_type === 'exam').length
    return `${classes} class slot${classes !== 1 ? 's' : ''} · ${exams} exam slot${exams !== 1 ? 's' : ''}`
  }, [schedules])

  const openAddSlot = () => {
    setSlotModalMode('add')
    setSlotModalSlot(null)
    setSlotModalOpen(true)
  }

  const openEditSlot = (slot: TimetableSlot) => {
    setSlotModalMode('edit')
    setSlotModalSlot(slot)
    setSlotModalOpen(true)
  }

  const deleteSlot = async (slot: TimetableSlot) => {
    if (!confirm(`Remove “${slot.subject || slot.courseName || 'this slot'}” from your timetable?`)) return
    setError(null)
    try {
      const res = await fetch(`/api/student/timetable/entries/${slot.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Could not delete')
      setSuccess('Slot removed.')
      setTimeout(() => setSuccess(null), 2500)
      await loadTimetable()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  const handleEntryReminder = async (entryId: number, minutesBefore: number | null) => {
    setError(null)
    try {
      const res = await fetch(`/api/student/timetable/entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderMinutesBefore: minutesBefore }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Could not update reminder')
      setSuccess('Reminder updated for that subject.')
      setTimeout(() => setSuccess(null), 2500)
      await loadTimetable()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update reminder')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('timetableType', uploadKind)

    try {
      const res = await fetch('/api/student/timetable/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')

      const label = uploadKind === 'exam' ? 'exam timetable' : 'weekly class timetable'

      if (data.slotsImported === 0) {
        setError(
          data.parseNote ||
            `No slots found for your ${label}. Use a clear photo or a text-based PDF.`
        )
      } else {
        setSuccess(`${data.slotsImported} ${label} slot${data.slotsImported !== 1 ? 's' : ''} imported.`)
        loadTimetable()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const updateReminders = async (mins: number) => {
    setReminderMins(mins)
    try {
      await fetch('/api/student/timetable', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reminderMinutes: mins }),
      })
      setSuccess(`Default reminders set to ${mins} minutes before each class or exam (where you use “Default”).`)
      setTimeout(() => setSuccess(null), 3000)
      await loadTimetable()
    } catch {
      setError('Failed to update reminder settings')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 shadow-sm transition-all hover:bg-indigo-50/80 hover:border-indigo-200 active:scale-[0.98]"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={24} strokeWidth={2.25} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Weekly timetable</h1>
            <p className="text-gray-500 text-sm">
              Upload class and exam schedules separately — each subject can have its own SMS reminder time.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
            <Bell size={16} className="text-primary" />
            <select
              value={reminderMins}
              onChange={(e) => updateReminders(Number(e.target.value))}
              className="text-sm font-medium focus:outline-none bg-transparent cursor-pointer"
            >
              <option value={10}>Default: 10 min before</option>
              <option value={15}>Default: 15 min before</option>
              <option value={30}>Default: 30 min before</option>
              <option value={60}>Default: 1 hour before</option>
            </select>
          </div>

          <div className="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setUploadKind('class')}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                uploadKind === 'class' ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Weekly classes
            </button>
            <button
              type="button"
              onClick={() => setUploadKind('exam')}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                uploadKind === 'exam' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Exam timetable
            </button>
          </div>

          <button
            type="button"
            onClick={() => void fetchReminderPreview()}
            disabled={reminderPreviewLoading || schedules.length === 0}
            title="See the exact SMS text the system will send (same as cron)"
            className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 bg-white text-gray-800 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-40"
          >
            {reminderPreviewLoading ? (
              <Loader2 size={18} className="animate-spin shrink-0" />
            ) : (
              <MessageSquareText size={18} className="shrink-0 text-primary" />
            )}
            Preview SMS
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {uploading ? 'Parsing…' : 'Upload'}
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,image/*" />
        </div>
      </div>

      {reminderPreviewOpen && reminderPreviewData && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <MessageSquareText size={20} className="text-primary" />
              Reminder SMS preview
            </h2>
            <button
              type="button"
              onClick={() => setReminderPreviewOpen(false)}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Close
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Default lead time: <span className="font-semibold">{reminderPreviewData.default_lead_minutes} min</span>
            before start (unless you set a per-subject override). Text below is exactly what the SMS cron sends.
          </p>
          {reminderPreviewData.sms && !reminderPreviewData.sms.has_saved_phone && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              No mobile saved on your profile. Add your number under{' '}
              <Link href="/student/profile" className="font-semibold underline">
                Profile
              </Link>{' '}
              so timetable SMS can be delivered.
            </div>
          )}
          {reminderPreviewData.sms?.has_saved_phone && (
            <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              SMS will go to the number saved on your profile
              {reminderPreviewData.sms.destination_last4
                ? ` (ends with ···${reminderPreviewData.sms.destination_last4})`
                : ''}
              .
            </p>
          )}
          {reminderPreviewData.scheduled_in_db.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Queued in database (scheduled)
              </p>
              <ul className="space-y-2 text-sm">
                {reminderPreviewData.scheduled_in_db.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 font-mono text-emerald-900"
                  >
                    {row.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Per slot (computed now)
            </p>
            <ul className="space-y-3">
              {reminderPreviewData.preview.map((row, i) => (
                <li
                  key={i}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    row.would_schedule
                      ? 'bg-slate-50 border-slate-200'
                      : 'bg-amber-50 border-amber-100'
                  }`}
                >
                  <p className="font-mono text-gray-900">{row.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {row.subject} · {row.entry_type} · {row.lead_minutes} min before
                    {!row.would_schedule && row.skip_reason ? ` · ${row.skip_reason}` : ''}
                    {row.notify_at ? ` · notify_at ${new Date(row.notify_at).toLocaleString()}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {(error || success) && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            error ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'
          }`}
        >
          {error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <p className="text-sm font-medium">{error || success}</p>
        </div>
      )}

      <TimetableEntryModal
        open={slotModalOpen}
        mode={slotModalMode}
        slot={slotModalSlot}
        onClose={() => setSlotModalOpen(false)}
        onSaved={async () => {
          setSuccess(slotModalMode === 'add' ? 'Slot added.' : 'Slot updated.')
          setTimeout(() => setSuccess(null), 2500)
          await loadTimetable()
        }}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <TimetableView
          schedules={schedules}
          subtitle={gridSubtitle}
          defaultReminderMinutes={reminderMins}
          onEntryReminderChange={handleEntryReminder}
          editable
          onAddSlot={openAddSlot}
          onEntryEdit={openEditSlot}
          onEntryDelete={deleteSlot}
        />
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-primary/5 rounded-2xl p-6 border border-primary/10">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
          <Clock size={18} className="text-primary" /> How it works
        </h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex gap-2">
            <span className="font-bold text-primary">1.</span>
            Choose “Weekly classes” or “Exam timetable”, then upload a PDF or image. Only that schedule is replaced;
            the other type is kept.
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-primary">2.</span>
            We extract real rows from your file (no guessing). Scanned PDFs are read with the same AI as photos.
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-primary">3.</span>
            The grid includes Saturday and Sunday. Use pencil / trash on a block to fix bad uploads, or Add slot in the timetable header for a new row.
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-primary">4.</span>
            Per-block SMS reminder time uses the dropdown on each block, or the default above.
          </li>
        </ul>
      </div>
    </div>
  )
}
