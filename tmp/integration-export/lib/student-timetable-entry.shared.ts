/** Shared validation for student_timetable_entries API + forms. */

export const STUDENT_TIMETABLE_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export const STUDENT_TIMETABLE_DAY_SET = new Set<string>(STUDENT_TIMETABLE_DAYS)

export function padTimeToDb(t: string): string | null {
  const m = String(t).trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (!m) return null
  const h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  if (h < 0 || h > 23 || min < 0 || min > 59) return null
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`
}

/** YYYY-MM-DD or null. Invalid values return null. */
export function parseExamDateInput(v: unknown): string | null {
  if (v == null || v === '') return null
  const s = String(v).trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const [y, m, d] = s.split('-').map((x) => parseInt(x, 10))
  const dt = new Date(y, m - 1, d)
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null
  return s
}

/** Local calendar: exam must be today or later. */
export function validateExamDateNotPast(
  exam_date: string | null,
  entry_type: 'class' | 'exam'
): string | null {
  if (entry_type !== 'exam' || !exam_date) return null
  const parsed = parseExamDateInput(exam_date)
  if (!parsed) return 'Invalid exam date'
  const [y, m, d] = parsed.split('-').map((x) => parseInt(x, 10))
  const examDay = new Date(y, m - 1, d)
  const startToday = new Date()
  startToday.setHours(0, 0, 0, 0)
  examDay.setHours(0, 0, 0, 0)
  if (examDay < startToday) return 'Exam date cannot be in the past'
  return null
}

export type ParsedTimetableEntry = {
  day_of_week: string
  start_time: string
  end_time: string
  subject: string
  location: string | null
  notes: string | null
  entry_type: 'class' | 'exam'
  /** Set for one-off exams; null = weekly on day_of_week (exam) or regular class. */
  exam_date: string | null
}

export function parseTimetableEntryInput(o: Record<string, unknown>): ParsedTimetableEntry | null {
  const day = String(o.day_of_week ?? '').trim()
  const subject = String(o.subject ?? '').trim()
  const start = padTimeToDb(String(o.start_time ?? ''))
  const end = padTimeToDb(String(o.end_time ?? ''))
  if (!STUDENT_TIMETABLE_DAY_SET.has(day) || !subject || !start || !end) return null
  const entry_type = o.entry_type === 'exam' ? 'exam' : 'class'
  const exam_date =
    entry_type === 'exam' ? parseExamDateInput(o.exam_date) : null
  return {
    day_of_week: day,
    start_time: start,
    end_time: end,
    subject: subject.slice(0, 300),
    location: o.location != null ? String(o.location).slice(0, 200) : null,
    notes: o.notes != null ? String(o.notes).slice(0, 500) : null,
    entry_type,
    exam_date,
  }
}
