-- Per-entry reminder lead time (minutes before start). NULL = use users.timetable_reminder_minutes.
ALTER TABLE student_timetable_entries
  ADD COLUMN IF NOT EXISTS reminder_minutes_before INT NULL;
