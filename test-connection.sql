-- =====================================================
-- QUICK TEST - Check what data exists in your database
-- =====================================================
-- Run these queries in Supabase SQL Editor to see what data you have

-- 1. Check how many users exist
SELECT COUNT(*) as total_users FROM users;

-- 2. See all users that exist
SELECT id, name, email, role FROM users ORDER BY id;

-- 3. Check how many courses exist
SELECT COUNT(*) as total_courses FROM courses;

-- 4. See all courses
SELECT id, course_code, course_name FROM courses ORDER BY id;

-- 5. Check existing schedules
SELECT COUNT(*) as total_schedules FROM timetable;

-- 6. See existing schedules
SELECT 
  t.id,
  t.student_id,
  t.course_id,
  t.day_of_week,
  t.start_time,
  t.end_time
FROM timetable t
ORDER BY t.id;

-- 7. Check universities
SELECT id, name FROM universities;


-- =====================================================
-- IF NO DATA EXISTS, RUN THIS MINIMAL INSERT
-- =====================================================

-- Add University (if not exists)
INSERT INTO universities (name, city, is_active) 
VALUES ('Test University', 'Test City', true)
ON CONFLICT DO NOTHING;

-- Add a Student User
INSERT INTO users (name, email, role, uni_id) 
VALUES ('Test Student', 'student1@test.com', 'student', 1)
ON CONFLICT (email) DO NOTHING;

-- Add a Course
INSERT INTO courses (course_code, course_name, lecturer, colour)
VALUES ('TEST101', 'Test Course', 'Test Lecturer', 'bg-blue-500')
ON CONFLICT DO NOTHING;

-- Now check that user ID was created
SELECT id, name FROM users WHERE role = 'student' LIMIT 1;

-- =====================================================
-- AFTER YOU HAVE USERS AND COURSES, TRY THIS TEST INSERT
-- =====================================================
-- Replace the IDs below with actual IDs from your database

INSERT INTO timetable (student_id, course_id, day_of_week, start_time, end_time, location)
VALUES (1, 1, 'Monday', '09:00', '10:30', 'Test Hall');

-- Verify it worked
SELECT * FROM timetable WHERE student_id = 1;
