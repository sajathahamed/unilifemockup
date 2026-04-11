-- Add entry_type support for timetable entries (class vs exam)
ALTER TABLE student_timetable_entries 
ADD COLUMN IF NOT EXISTS entry_type TEXT NOT NULL DEFAULT 'class';

-- Add index to help with type-aware deletes and fetching
CREATE INDEX IF NOT EXISTS idx_stt_entries_type ON student_timetable_entries(entry_type);
