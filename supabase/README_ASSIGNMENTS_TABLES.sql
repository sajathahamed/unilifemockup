-- Optional: use this if you need to (re)create assignments tables with academic_year and created_by.
-- Run in Supabase SQL Editor. Requires: tables "courses" and "users" must already exist.

-- Drop and recreate only if you want a clean slate (removes data)
-- DROP TABLE IF EXISTS assignment_submissions;
-- DROP TABLE IF EXISTS assignments;

CREATE TABLE IF NOT EXISTS assignments (
  id BIGSERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  academic_year SMALLINT CHECK (academic_year IN (1, 2, 3, 4)),
  created_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id BIGSERIAL PRIMARY KEY,
  assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  grade DECIMAL(5,2),
  feedback TEXT,
  status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded')),
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments(created_by);
CREATE INDEX IF NOT EXISTS idx_assignments_academic_year ON assignments(academic_year);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);

COMMENT ON TABLE assignments IS 'Lecturer-created assignments per course';
COMMENT ON COLUMN assignments.academic_year IS 'Study year: 1, 2, 3, or 4';
COMMENT ON TABLE assignment_submissions IS 'Student submissions for assignments';

-- If table already exists without academic_year, run this once:
-- ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS academic_year SMALLINT CHECK (academic_year IN (1, 2, 3, 4));
