/** Grid view model (shared student timetable UI). */
export interface TimetableSlot {
  id: number
  course_id?: number
  day_of_week: string
  start_time: string
  end_time: string
  location: string
  /** Display title */
  courseName?: string
  courseCode?: string
  subject?: string
  color?: string
  entry_type?: 'class' | 'exam'
  /** YYYY-MM-DD for one-off exams; omit/null = repeats weekly on day_of_week */
  exam_date?: string | null
  /** Per-subject override; null = use profile default */
  reminder_minutes_before?: number | null
  effectiveReminderMinutes?: number
}
