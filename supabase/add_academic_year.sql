-- Add academic_year to timetable (schedule) and assignments
-- Run in Supabase SQL Editor (New query -> Paste -> Run).

-- 1) Timetable: add academic_year (1, 2, 3, 4)
ALTER TABLE public.timetable ADD COLUMN IF NOT EXISTS academic_year SMALLINT CHECK (academic_year IN (1, 2, 3, 4));
CREATE INDEX IF NOT EXISTS idx_timetable_academic_year ON public.timetable(academic_year);

-- 2) Assignments: add academic_year (1, 2, 3, 4)
ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS academic_year SMALLINT CHECK (academic_year IN (1, 2, 3, 4));
CREATE INDEX IF NOT EXISTS idx_assignments_academic_year ON public.assignments(academic_year);
