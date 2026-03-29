-- Timetable flow: programs, semesters, shared timetable per semester,
-- lecturer ↔ university M:N, courses.lecturer_id, student program/semester on users.

-- ---------------------------------------------------------------------------
-- Reference tables
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS programs (
  id SERIAL PRIMARY KEY,
  university_id INT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (university_id, name)
);

CREATE TABLE IF NOT EXISTS semesters (
  id SERIAL PRIMARY KEY,
  program_id INT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  academic_year TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (program_id, name)
);

CREATE TABLE IF NOT EXISTS lecturer_university (
  lecturer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  university_id INT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
  PRIMARY KEY (lecturer_id, university_id)
);

CREATE INDEX IF NOT EXISTS idx_semesters_program_id ON semesters(program_id);
CREATE INDEX IF NOT EXISTS idx_programs_university_id ON programs(university_id);

-- ---------------------------------------------------------------------------
-- users: academic context + lecturer active university
-- ---------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS program_id INT REFERENCES programs(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS semester_id INT REFERENCES semesters(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS active_university_id INT REFERENCES universities(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- courses: link to lecturer account (users.id, role lecturer)
-- ---------------------------------------------------------------------------
ALTER TABLE courses ADD COLUMN IF NOT EXISTS lecturer_id INT REFERENCES users(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- timetable: shared by semester (student_id optional / legacy)
-- ---------------------------------------------------------------------------
ALTER TABLE timetable ADD COLUMN IF NOT EXISTS semester_id INT REFERENCES semesters(id) ON DELETE CASCADE;

ALTER TABLE timetable ALTER COLUMN student_id DROP NOT NULL;

-- ---------------------------------------------------------------------------
-- Seed default program + semester per university (for existing deployments)
-- ---------------------------------------------------------------------------
INSERT INTO programs (university_id, name)
SELECT u.id, 'General Program'
FROM universities u
WHERE NOT EXISTS (
  SELECT 1 FROM programs p WHERE p.university_id = u.id AND p.name = 'General Program'
);

INSERT INTO semesters (program_id, name, academic_year)
SELECT p.id, 'Default Semester', 'Current'
FROM programs p
WHERE p.name = 'General Program'
  AND NOT EXISTS (
    SELECT 1 FROM semesters s WHERE s.program_id = p.id AND s.name = 'Default Semester'
  );

-- Backfill timetable.semester_id from first semester under each university’s General Program
UPDATE timetable t
SET semester_id = sub.sem_id
FROM (
  SELECT s.id AS sem_id
  FROM semesters s
  JOIN programs p ON p.id = s.program_id
  WHERE p.name = 'General Program'
  ORDER BY p.university_id, s.id
  LIMIT 1
) sub
WHERE t.semester_id IS NULL;

-- Lecturer ↔ university from legacy uni_id
INSERT INTO lecturer_university (lecturer_id, university_id)
SELECT id, uni_id FROM users
WHERE role = 'lecturer' AND uni_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Match courses.lecturer text to lecturer users (best-effort)
UPDATE courses c
SET lecturer_id = u.id
FROM users u
WHERE c.lecturer_id IS NULL
  AND c.lecturer IS NOT NULL
  AND TRIM(c.lecturer) <> ''
  AND u.role = 'lecturer'
  AND u.name = c.lecturer;

CREATE INDEX IF NOT EXISTS idx_timetable_semester_id ON timetable(semester_id);
CREATE INDEX IF NOT EXISTS idx_courses_lecturer_id ON courses(lecturer_id);
