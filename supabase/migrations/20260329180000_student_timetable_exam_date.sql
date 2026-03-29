-- One-off exam calendar date (optional). When set for entry_type = exam, reminders use this date only — no weekly repeat.
ALTER TABLE student_timetable_entries
  ADD COLUMN IF NOT EXISTS exam_date DATE NULL;

COMMENT ON COLUMN student_timetable_entries.exam_date IS 'When set for exams: single occurrence on this date; reminders do not repeat weekly.';
