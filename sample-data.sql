-- =====================================================
-- SAMPLE DATA FOR UNIVERSITY LIFE MANAGEMENT SYSTEM
-- =====================================================
-- This file contains example data to test your Supabase connection
-- Copy and paste these queries into your Supabase SQL Editor


-- ============================================
-- 1. ENSURE UNIVERSITIES EXIST (Don't duplicate)
-- ============================================
INSERT INTO universities (name, city, is_active) VALUES
  ('Oxford University', 'Oxford', true),
  ('Cambridge University', 'Cambridge', true),
  ('Imperial College London', 'London', true)
ON CONFLICT DO NOTHING;

-- Get the first university ID to use for reference
-- (This ensures we use a uni_id that actually exists)
-- Check what universities we have:
SELECT id FROM universities LIMIT 1;


-- ============================================
-- 2. INSERT USERS (Students, Lecturers, Admin)
-- ============================================

-- Get first university ID (use 1 or whatever exists)
-- Students - Use uni_id=1 (this should exist)
INSERT INTO users (name, email, role, uni_id) VALUES
  ('Test Student One', 'test.student.one@uni.ac.uk', 'student', 1),
  ('Test Student Two', 'test.student.two@uni.ac.uk', 'student', 1),
  ('Test Student Three', 'test.student.three@uni.ac.uk', 'student', 1),
  ('Test Student Four', 'test.student.four@uni.ac.uk', 'student', 1)
ON CONFLICT (email) DO NOTHING;

-- Lecturers
INSERT INTO users (name, email, role, uni_id) VALUES
  ('Test Lecturer One', 'test.lecturer.one@uni.ac.uk', 'lecturer', 1),
  ('Test Lecturer Two', 'test.lecturer.two@uni.ac.uk', 'lecturer', 1)
ON CONFLICT (email) DO NOTHING;

-- Admins
INSERT INTO users (name, email, role, uni_id) VALUES
  ('Test Admin', 'test.admin@uni.ac.uk', 'admin', 1)
ON CONFLICT (email) DO NOTHING;

-- Vendors and Delivery agents
INSERT INTO users (name, email, role, uni_id) VALUES
  ('Test Vendor', 'test.vendor@uni.ac.uk', 'vendor', 1),
  ('Test Delivery', 'test.delivery@uni.ac.uk', 'delivery', 1)
ON CONFLICT (email) DO NOTHING;


-- ============================================
-- 3. INSERT COURSES
-- ============================================
INSERT INTO courses (course_code, course_name, lecturer, colour) VALUES
  ('CS101', 'Introduction to Computer Science', 'Test Lecturer One', 'bg-blue-500'),
  ('CS201', 'Data Structures', 'Test Lecturer Two', 'bg-purple-500'),
  ('CS301', 'Algorithms & Complexity', 'Test Lecturer One', 'bg-pink-500'),
  ('MATH101', 'Calculus I', 'Test Lecturer One', 'bg-green-500'),
  ('MATH201', 'Linear Algebra', 'Test Lecturer Two', 'bg-yellow-500'),
  ('ENG101', 'English Literature', 'Test Lecturer One', 'bg-red-500')
ON CONFLICT DO NOTHING;


-- ============================================
-- 4. INSERT TIMETABLE (Class Schedules)
-- ============================================
-- Using first available student (ID 1) and course (ID 1)
-- Adjust IDs based on what exists in YOUR database
INSERT INTO timetable (student_id, course_id, day_of_week, start_time, end_time, location) VALUES
  (1, 1, 'Monday', '09:00', '10:30', 'Hall A'),
  (1, 2, 'Tuesday', '10:00', '11:30', 'Lab 1'),
  (1, 3, 'Wednesday', '13:00', '14:30', 'Hall B'),
  (1, 4, 'Thursday', '09:00', '10:30', 'Lab 2'),
  (1, 5, 'Friday', '14:00', '15:30', 'Hall C')
ON CONFLICT DO NOTHING;


-- ============================================
-- 5. INSERT VENDORS (Food/Service Providers)
-- ============================================
INSERT INTO vendors (name, type, location, is_open, rating) VALUES
  ('Pizza Palace', 'food', 'Campus Center', true, 4.5),
  ('Coffee Corner', 'beverage', 'Library Building', true, 4.8),
  ('Burger King', 'fast-food', 'Main Gate', true, 4.2),
  ('Healthy Bowl', 'healthy-food', 'Sports Complex', true, 4.6),
  ('Noodle House', 'asian', 'Student Union', true, 4.4)
ON CONFLICT DO NOTHING;


-- ============================================
-- 6. INSERT FOOD CATEGORIES
-- ============================================
INSERT INTO food_categories (vendor_id, name) VALUES
  (1, 'Pizzas'),
  (1, 'Sides'),
  (1, 'Desserts'),
  (2, 'Hot Drinks'),
  (2, 'Cold Drinks'),
  (3, 'Burgers'),
  (3, 'Fries'),
  (4, 'Salads'),
  (4, 'Bowls'),
  (5, 'Noodles'),
  (5, 'Rice Dishes')
ON CONFLICT DO NOTHING;


-- ============================================
-- 7. INSERT FOOD ITEMS
-- ============================================
INSERT INTO food_items (vendor_id, category_id, name, price, is_available) VALUES
  -- Pizza Palace
  (1, 1, 'Margherita Pizza', 12.99, true),
  (1, 1, 'Pepperoni Pizza', 14.99, true),
  (1, 1, 'Vegetarian Pizza', 13.99, true),
  (1, 2, 'Garlic Bread', 4.99, true),
  (1, 3, 'Tiramisu', 5.99, true),
  
  -- Coffee Corner
  (2, 4, 'Espresso', 2.50, true),
  (2, 4, 'Cappuccino', 3.99, true),
  (2, 4, 'Latte', 3.99, true),
  (2, 5, 'Iced Coffee', 4.49, true),
  (2, 5, 'Smoothie', 5.99, true),
  
  -- Burger King
  (3, 6, 'Classic Burger', 8.99, true),
  (3, 6, 'Cheese Burger', 9.99, true),
  (3, 7, 'Regular Fries', 3.99, true),
  (3, 7, 'Large Fries', 5.99, true),
  
  -- Healthy Bowl
  (4, 8, 'Greek Salad', 9.99, true),
  (4, 8, 'Caesar Salad', 10.99, true),
  (4, 9, 'Buddha Bowl', 11.99, true),
  (4, 9, 'Protein Bowl', 13.99, true),
  
  -- Noodle House
  (5, 10, 'Pad Thai', 10.99, true),
  (5, 10, 'Ramen', 9.99, true),
  (5, 11, 'Fried Rice', 8.99, true),
  (5, 11, 'Mixed Rice', 9.49, true)
ON CONFLICT DO NOTHING;


-- ============================================
-- 8. INSERT DELIVERY AGENTS
-- ============================================
INSERT INTO delivery_agents (name, phone, is_available) VALUES
  ('John Delivery', '07700123456', true),
  ('Sarah Transport', '07700234567', true),
  ('Mike Fast', '07700345678', true)
ON CONFLICT DO NOTHING;


-- ============================================
-- 9. INSERT LAUNDRY SERVICES
-- ============================================
INSERT INTO laundry_services (name, location, price_per_kg, price_per_item, pickup_available) VALUES
  ('Quick Clean Laundry', 'Campus Center', 5.00, 2.50, true),
  ('Fresh Wash', 'Student Village', 4.50, 2.00, true),
  ('Premium Dry Cleaning', 'Main Street', 8.00, 4.00, true)
ON CONFLICT DO NOTHING;


-- ============================================
-- VERIFICATION QUERIES (Run these to check data)
-- ============================================

-- Show what universities exist
SELECT 'Universities in DB:' as info;
SELECT id, name FROM universities ORDER BY id;

-- Show what students exist
SELECT 'Students in DB:' as info;
SELECT id, name, email FROM users WHERE role = 'student' ORDER BY id LIMIT 10;

-- Show what courses exist
SELECT 'Courses in DB:' as info;
SELECT id, course_code, course_name FROM courses ORDER BY id LIMIT 10;

-- Show what schedules exist
SELECT 'Existing Schedules:' as info;
SELECT 
  t.id,
  t.student_id,
  t.course_id,
  t.day_of_week,
  t.start_time
FROM timetable t
ORDER BY t.id
LIMIT 10;

