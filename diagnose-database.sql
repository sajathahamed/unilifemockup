-- =====================================================
-- DIAGNOSTIC SCRIPT - Check Your Database
-- =====================================================
-- Run this FIRST to understand your database structure
-- Copy and paste into Supabase SQL Editor


-- STEP 1: Check Universities
SELECT 'STEP 1: UNIVERSITIES IN YOUR DATABASE' as header;
SELECT id, name, city, is_active FROM universities ORDER BY id;
-- Result: Write down the IDs here (e.g., 1, 2, 3, etc.)


-- STEP 2: Check Users by Role
SELECT 'STEP 2: STUDENTS IN YOUR DATABASE' as header;
SELECT id, name, email, role, uni_id FROM users WHERE role = 'student' ORDER BY id LIMIT 20;

SELECT 'STEP 2B: LECTURERS IN YOUR DATABASE' as header;
SELECT id, name, email, role, uni_id FROM users WHERE role = 'lecturer' ORDER BY id LIMIT 10;

SELECT 'STEP 2C: ALL USERS AND THEIR UNIVERSITIES' as header;
SELECT 
  u.id,
  u.name,
  u.role,
  u.uni_id,
  COALESCE(uni.name, 'NO UNIVERSITY') as university_name
FROM users u
LEFT JOIN universities uni ON u.uni_id = uni.id
ORDER BY u.id;


-- STEP 3: Check Courses
SELECT 'STEP 3: COURSES IN YOUR DATABASE' as header;
SELECT id, course_code, course_name FROM courses ORDER BY id LIMIT 20;


-- STEP 4: Check Existing Schedules
SELECT 'STEP 4: EXISTING SCHEDULES IN YOUR DATABASE' as header;
SELECT 
  t.id as schedule_id,
  t.student_id,
  t.course_id,
  t.day_of_week,
  t.start_time,
  t.end_time,
  t.location
FROM timetable t
ORDER BY t.id
LIMIT 20;


-- STEP 5: Check What's Broken (Missing References)
SELECT 'STEP 5: USERS WITH INVALID UNIVERSITY IDS (BROKEN REFERENCES)' as header;
SELECT u.id, u.name, u.uni_id, 'NO MATCHING UNIVERSITY' as issue
FROM users u
WHERE u.uni_id IS NOT NULL AND u.uni_id NOT IN (SELECT id FROM universities);


-- STEP 6: Summary
SELECT 'STEP 6: DATABASE SUMMARY' as header;
SELECT 
  'Universities' as entity,
  COUNT(*) as total
FROM universities
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Students', COUNT(*) FROM users WHERE role = 'student'
UNION ALL
SELECT 'Lecturers', COUNT(*) FROM users WHERE role = 'lecturer'
UNION ALL
SELECT 'Courses', COUNT(*) FROM courses
UNION ALL
SELECT 'Schedules', COUNT(*) FROM timetable;
