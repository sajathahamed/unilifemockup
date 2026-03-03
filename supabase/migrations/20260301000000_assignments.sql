-- Assignments and submissions for lecturer module
-- Run this in Supabase: SQL Editor → New query → paste and run.
-- (Or use Supabase CLI migrations if you have them set up.)

CREATE TABLE IF NOT EXISTS assignments (
  id BIGSERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
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
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);

COMMENT ON TABLE assignments IS 'Lecturer-created assignments per course';
COMMENT ON TABLE assignment_submissions IS 'Student submissions for assignments';
