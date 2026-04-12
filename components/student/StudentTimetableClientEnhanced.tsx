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
  Calendar,
  Sparkles,
  TestTube2,
  Settings,
  Info,
} from 'lucide-react'
import TimetableView from '@/components/timetable/TimetableView'
import TimetableEntryModalEnhanced from '@/components/student/TimetableEntryModalEnhanced'
import TimetableReminderToast, { type ReminderItem } from '@/components/student/TimetableReminderToast'
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

  // Reminder test mode
  const [testMode, setTestMode] = useState(false)
  const [reminders, setReminders] = useState<ReminderItem[]>([])
  const [lastReminderUpdate, setLastReminderUpdate] = useState<number>(0)

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

  // Build reminder items from schedules
  useEffect(() => {
    const now = new Date()
    const today = now.getDay() // 0 = Sunday, 1 = Monday...
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    const newReminders: ReminderItem[] = []

    schedules.forEach(slot => {
      const slotDay = dayNames.findIndex(d => d.toLowerCase() === slot.day_of_week.toLowerCase())
      if (slotDay === -1) return

      // Calculate days until this slot
      let daysUntil = slotDay - today
      if (daysUntil < 0) daysUntil += 7
      if (daysUntil === 0) {
        // Check if time has passed today
        const [hours, mins] = slot.start_time.split(':').map(Number)
        const slotTime = new Date(now)
        slotTime.setHours(hours, mins, 0, 0)
        if (slotTime < now) daysUntil = 7 // Next week
      }

      // Build trigger time
      const triggerDate = new Date(now)
      triggerDate.setDate(now.getDate() + daysUntil)
      const [hours, mins] = slot.start_time.split(':').map(Number)
      triggerDate.setHours(hours, mins, 0, 0)

      // Subtract reminder minutes
      const reminderMinutes = slot.reminder_minutes_before ?? reminderMins
      triggerDate.setMinutes(triggerDate.getMinutes() - reminderMinutes)

      newReminders.push({
        id: `slot-${slot.id}-${lastReminderUpdate}`,
        title: slot.subject || slot.courseName || 'Class',
        time: slot.start_time,
        location: slot.location || undefined,
        triggerAt: triggerDate,
        entryId: slot.id,
      })
    })

    setReminders(newReminders)
  }, [schedules, reminderMins, lastReminderUpdate])

  const handleReminderTriggered = useCallback((reminder: ReminderItem) => {
    // Play notification sound if available
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Timetable Reminder', {
          body: `"${reminder.title}" starts at ${reminder.time}`,
          icon: '/favicon.ico',
        })
      }
    }
  }, [])

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
    return `${classes} class${classes !== 1 ? 'es' : ''} · ${exams} exam${exams !== 1 ? 's' : ''}`
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
    if (!confirm(`Remove "${slot.subject || slot.courseName || 'this entry'}" from your schedule?`)) return
    setError(null)
    try {
      const res = await fetch(`/api/student/timetable/entries/${slot.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Could not delete')
      setSuccess('Entry removed. Reminder cancelled.')
      setLastReminderUpdate(Date.now())
      setTimeout(() => setSuccess(null), 3000)
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
      setSuccess('Reminder updated.')
      setLastReminderUpdate(Date.now())
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

      const label = uploadKind === 'exam' ? 'exam timetable' : 'weekly schedule'

      if (data.slotsImported === 0) {
        setError(data.parseNote || `No slots found. Try a clearer image or PDF.`)
      } else {
        setSuccess(`${data.slotsImported} ${label} slot${data.slotsImported !== 1 ? 's' : ''} imported!`)
        setLastReminderUpdate(Date.now())
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
      setSuccess(`Default reminders set to ${mins} minutes before.`)
      setLastReminderUpdate(Date.now())
      setTimeout(() => setSuccess(null), 3000)
      await loadTimetable()
    } catch {
      setError('Failed to update reminder settings')
    }
  }

  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
          <Loader2 size={24} className="text-violet-600 animate-spin" />
        </div>
        <p className="text-gray-500 text-sm font-medium">Loading your schedule...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Reminder Toast System */}
      <TimetableReminderToast
        reminders={reminders}
        testMode={testMode}
        onReminderTriggered={handleReminderTriggered}
      />

      {/* Header Card */}
      <div className="bg-white rounded-[22px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-6 py-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/student/dashboard"
                className="inline-flex items-center justify-center p-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                aria-label="Back to dashboard"
              >
                <ArrowLeft size={20} strokeWidth={2.25} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Calendar size={26} />
                  My Schedule
                </h1>
                <p className="text-white/80 text-sm mt-1">
                  {gridSubtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Test Mode Toggle */}
              <button
                type="button"
                onClick={() => {
                  setTestMode(!testMode)
                  if (!testMode) {
                    setSuccess('Test mode ON: Reminders will trigger in 1 minute')
                    setLastReminderUpdate(Date.now())
                  } else {
                    setSuccess('Test mode OFF: Normal reminder timing')
                  }
                  setTimeout(() => setSuccess(null), 3000)
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                  testMode
                    ? 'bg-amber-400 text-amber-900 shadow-lg shadow-amber-500/30'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                title={testMode ? 'Disable 1-minute test mode' : 'Enable 1-minute test mode'}
              >
                <TestTube2 size={16} />
                {testMode ? '1-Min Test' : 'Test'}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-violet-700 rounded-xl font-bold text-sm shadow-md hover:bg-white/95 transition-all disabled:opacity-50"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? 'Parsing…' : 'Upload'}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,image/*" />
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex flex-wrap items-center gap-3">
          {/* Upload Type */}
          <div className="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setUploadKind('class')}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                uploadKind === 'class' ? 'bg-violet-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Classes
            </button>
            <button
              type="button"
              onClick={() => setUploadKind('exam')}
              className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                uploadKind === 'exam' ? 'bg-rose-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Exams
            </button>
          </div>

          {/* Default Reminder */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <Bell size={16} className="text-violet-600" />
            <select
              value={reminderMins}
              onChange={(e) => updateReminders(Number(e.target.value))}
              className="text-sm font-medium focus:outline-none bg-transparent cursor-pointer text-gray-700"
            >
              <option value={10}>10 min before</option>
              <option value={15}>15 min before</option>
              <option value={30}>30 min before</option>
              <option value={60}>1 hour before</option>
            </select>
          </div>

          {/* Preview SMS */}
          <button
            type="button"
            onClick={() => void fetchReminderPreview()}
            disabled={reminderPreviewLoading || schedules.length === 0}
            className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all disabled:opacity-40 shadow-sm"
          >
            {reminderPreviewLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <MessageSquareText size={16} className="text-violet-600" />
            )}
            Preview SMS
          </button>
        </div>
      </div>

      {/* Reminder Preview Panel */}
      {reminderPreviewOpen && reminderPreviewData && (
        <div className="rounded-[20px] border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <MessageSquareText size={20} className="text-violet-600" />
              SMS Reminder Preview
            </h2>
            <button
              type="button"
              onClick={() => setReminderPreviewOpen(false)}
              className="text-sm text-gray-500 hover:text-gray-800 font-medium"
            >
              Close
            </button>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-600">
              Default: <span className="font-semibold">{reminderPreviewData.default_lead_minutes} min</span> before start
            </p>
            {reminderPreviewData.sms && !reminderPreviewData.sms.has_saved_phone && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <strong>No phone saved.</strong> Add your number in{' '}
                <Link href="/student/profile" className="font-semibold underline">
                  Profile
                </Link>{' '}
                to receive SMS reminders.
              </div>
            )}
            {reminderPreviewData.sms?.has_saved_phone && (
              <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                ✓ SMS will be sent to your saved number
                {reminderPreviewData.sms.destination_last4
                  ? ` (···${reminderPreviewData.sms.destination_last4})`
                  : ''}
              </p>
            )}
            <ul className="space-y-2">
              {reminderPreviewData.preview.slice(0, 5).map((row, i) => (
                <li
                  key={i}
                  className={`rounded-xl border px-4 py-3 text-sm ${
                    row.would_schedule
                      ? 'bg-white border-gray-200'
                      : 'bg-amber-50 border-amber-100'
                  }`}
                >
                  <p className="font-mono text-gray-900 text-xs">{row.message}</p>
                  <p className="text-xs text-gray-500 mt-1.5">
                    {row.subject} · {row.entry_type} · {row.lead_minutes}m before
                    {!row.would_schedule && row.skip_reason ? ` · ${row.skip_reason}` : ''}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {(error || success) && (
        <div
          className={`p-4 rounded-[18px] border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            error ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
          }`}
        >
          {error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <p className="text-sm font-medium">{error || success}</p>
        </div>
      )}

      {/* Test Mode Info */}
      {testMode && (
        <div className="flex items-start gap-3 p-4 rounded-[18px] bg-amber-50 border border-amber-200">
          <TestTube2 size={20} className="shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">1-Minute Test Mode Active</p>
            <p className="text-xs text-amber-700 mt-1">
              All reminders will trigger 1 minute from now instead of the scheduled time. 
              This is for testing only. Toggle off to return to normal timing.
            </p>
          </div>
        </div>
      )}

      {/* Entry Modal */}
      <TimetableEntryModalEnhanced
        open={slotModalOpen}
        mode={slotModalMode}
        slot={slotModalSlot}
        existingSlots={schedules}
        onClose={() => setSlotModalOpen(false)}
        onSaved={async () => {
          setSuccess(slotModalMode === 'add' ? 'Entry added! Reminder scheduled.' : 'Entry updated! Reminder rescheduled.')
          setLastReminderUpdate(Date.now())
          setTimeout(() => setSuccess(null), 3000)
          await loadTimetable()
        }}
      />

      {/* Timetable Grid */}
      <div className="bg-white rounded-[22px] border border-gray-100 shadow-sm overflow-hidden">
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

      {/* How It Works Card */}
      <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-[20px] p-6 border border-gray-200/80">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
          <Info size={18} className="text-violet-600" />
          How It Works
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm">1</div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Upload or Add Manually</p>
              <p className="text-xs text-gray-500 mt-0.5">Upload a PDF/image of your timetable, or click "Add slot" to enter manually</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm">2</div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Set Reminder Time</p>
              <p className="text-xs text-gray-500 mt-0.5">Choose how early you want to be reminded (10 min, 30 min, etc.)</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm">3</div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Get Notified</p>
              <p className="text-xs text-gray-500 mt-0.5">Receive in-app toast and SMS reminders before each class or exam</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
              <TestTube2 size={14} />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Test Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">Enable 1-minute test mode to verify reminders work before relying on them</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
