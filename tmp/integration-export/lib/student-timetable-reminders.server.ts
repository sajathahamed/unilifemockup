/**
 * Compute next calendar occurrence of a weekly slot (local server TZ).
 */
const DAY_TO_JS: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

export function nextStartDate(dayName: string, timeHHMMSS: string): Date {
  const want = DAY_TO_JS[dayName]
  if (want === undefined) return new Date(NaN)
  const [hh, mm, ss] = timeHHMMSS.split(':').map((x) => parseInt(x, 10))
  const now = new Date()
  const d = new Date(now)
  const cur = d.getDay()
  let add = (want - cur + 7) % 7
  d.setDate(d.getDate() + add)
  d.setHours(hh || 0, mm || 0, ss || 0, 0)
  if (d.getTime() < now.getTime() - 60_000) {
    d.setDate(d.getDate() + 7)
  }
  return d
}

/** Local start instant for a one-off exam (exam_date + start_time). */
export function examOccurrenceAtLocal(examDateStr: string, timeHHMMSS: string): Date {
  const m = examDateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return new Date(NaN)
  const y = parseInt(m[1], 10)
  const mo = parseInt(m[2], 10) - 1
  const d = parseInt(m[3], 10)
  const [hh, mm, ss] = timeHHMMSS.split(':').map((x) => parseInt(x, 10))
  return new Date(y, mo, d, hh || 0, mm || 0, ss || 0, 0)
}

/**
 * Next reminder-relevant start: dated exams use exam_date once; others use next weekly occurrence.
 */
export function resolveSlotStart(entry: TimetableEntryLike): Date {
  const timeStr = String(entry.start_time ?? '')
  if (entry.entry_type === 'exam' && entry.exam_date) {
    return examOccurrenceAtLocal(String(entry.exam_date), timeStr)
  }
  return nextStartDate(String(entry.day_of_week ?? ''), timeStr)
}

/** Human-readable date for exam SMS (stable English, not locale-default slash formats). */
function formatExamReminderDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export type TimetableEntryLike = {
  id?: number
  day_of_week?: string | null
  start_time?: string | null
  subject?: string | null
  location?: string | null
  entry_type?: string | null
  reminder_minutes_before?: number | string | null
  /** YYYY-MM-DD when set for exams — single occurrence, no weekly repeat */
  exam_date?: string | null
}

/**
 * Exact SMS body used by cron (Dialog) — single source of truth.
 * For exams, `occurrenceAt` is the exam start (dated or next weekly slot); the date is included in the text.
 */
export function buildTimetableReminderMessage(
  entry: TimetableEntryLike,
  leadMinutes: number,
  occurrenceAt: Date | null = null
): string {
  const subject =
    (entry.subject || '').trim() || (entry.entry_type === 'exam' ? 'Exam' : 'Class')
  const loc = (entry.location || '').trim()
  const place = loc ? ` at ${loc}` : ''
  const isExam = entry.entry_type === 'exam'
  const dateOk = occurrenceAt && !isNaN(occurrenceAt.getTime())
  const datePart =
    isExam && dateOk ? ` on ${formatExamReminderDate(occurrenceAt)}` : ''
  return isExam
    ? `Reminder: ${subject} exam starts in ${leadMinutes} mins${datePart}${place}.`
    : `Reminder: ${subject} class starts in ${leadMinutes} mins${place}.`
}

function resolveLeadMinutes(entry: TimetableEntryLike, defaultOffsetMins: number): number {
  const leadRaw = entry.reminder_minutes_before
  if (leadRaw != null && leadRaw !== '') {
    return Math.min(180, Math.max(5, Number(leadRaw)))
  }
  return defaultOffsetMins
}

export type ReminderPreviewRow = {
  entry_id: number | null
  subject: string
  entry_type: 'class' | 'exam'
  day_of_week: string
  start_time: string
  lead_minutes: number
  next_class_start: string | null
  notify_at: string | null
  message: string
  /** Rows that would be inserted as scheduled */
  would_schedule: boolean
  skip_reason: string | null
}

/**
 * Preview what SMS texts would be (same as DB + cron), without writing notifications.
 */
export async function previewTimetableReminders(
  userId: string | number,
  supabase: any
): Promise<{ default_lead_minutes: number; reminders: ReminderPreviewRow[] }> {
  const { data: user } = await supabase
    .from('users')
    .select('timetable_reminder_minutes')
    .eq('id', userId)
    .single()

  const defaultOffsetMins = user?.timetable_reminder_minutes ?? 15

  const { data: entries } = await supabase
    .from('student_timetable_entries')
    .select('*')
    .eq('user_id', userId)

  if (!entries?.length) {
    return { default_lead_minutes: defaultOffsetMins, reminders: [] }
  }

  const now = Date.now()
  const reminders: ReminderPreviewRow[] = []

  for (const e of entries as TimetableEntryLike[]) {
    const lead = resolveLeadMinutes(e, defaultOffsetMins)
    const nextStart = resolveSlotStart(e)
    const subject = (e.subject || '').trim() || (e.entry_type === 'exam' ? 'Exam' : 'Class')
    const entryType = e.entry_type === 'exam' ? 'exam' : 'class'
    const isDatedExam = entryType === 'exam' && !!e.exam_date

    if (isNaN(nextStart.getTime())) {
      reminders.push({
        entry_id: e.id ?? null,
        subject,
        entry_type: entryType,
        day_of_week: String(e.day_of_week ?? ''),
        start_time: String(e.start_time ?? ''),
        lead_minutes: lead,
        next_class_start: null,
        notify_at: null,
        message: buildTimetableReminderMessage(e, lead, null),
        would_schedule: false,
        skip_reason: isDatedExam ? 'Invalid exam date or time' : 'Invalid day or time',
      })
      continue
    }

    const notifyAt = new Date(nextStart.getTime() - lead * 60 * 1000)
    const tooLate = notifyAt.getTime() < now
    const message = buildTimetableReminderMessage(e, lead, nextStart)

    reminders.push({
      entry_id: e.id ?? null,
      subject,
      entry_type: entryType,
      day_of_week: String(e.day_of_week ?? ''),
      start_time: String(e.start_time ?? ''),
      lead_minutes: lead,
      next_class_start: nextStart.toISOString(),
      notify_at: tooLate ? null : notifyAt.toISOString(),
      message,
      would_schedule: !tooLate,
      skip_reason: tooLate
        ? isDatedExam
          ? 'That exam date is past or the reminder window has already passed'
          : 'Reminder time is already in the past this week (refresh after upload or wait for next week)'
        : null,
    })
  }

  return { default_lead_minutes: defaultOffsetMins, reminders: reminders }
}

export async function refreshUserReminders(userId: string | number, supabase: any) {
  const { data: user } = await supabase
    .from('users')
    .select('timetable_reminder_minutes')
    .eq('id', userId)
    .single()

  const defaultOffsetMins = user?.timetable_reminder_minutes ?? 15

  await supabase.from('timetable_notifications').delete().eq('user_id', userId).eq('status', 'scheduled')

  const { data: entries } = await supabase
    .from('student_timetable_entries')
    .select('*')
    .eq('user_id', userId)

  if (!entries || entries.length === 0) return

  const notifications = entries
    .map((e: TimetableEntryLike) => {
      const nextStart = resolveSlotStart(e)
      if (isNaN(nextStart.getTime())) return null

      const lead = resolveLeadMinutes(e, defaultOffsetMins)
      const notifyAt = new Date(nextStart.getTime() - lead * 60 * 1000)
      if (notifyAt.getTime() < Date.now()) return null

      const message = buildTimetableReminderMessage(e, lead, nextStart)

      return {
        user_id: userId,
        entry_id: e.id,
        notify_at: notifyAt.toISOString(),
        channel: 'sms',
        message,
        status: 'scheduled',
      }
    })
    .filter(Boolean)

  if (notifications.length > 0) {
    await supabase.from('timetable_notifications').insert(notifications)
  }
}
