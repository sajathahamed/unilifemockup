# QUICK START - Get Schedule Working in 5 Minutes

## The Problem
You're entering **student_id=2** but that student doesn't exist in your database.

## The Solution - Follow These 3 Steps

### STEP 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard → Select your project → **SQL Editor** → **New Query**

### STEP 2: Check What Users You Have
Copy and paste this single query:

```sql
SELECT id, name, email, role FROM users WHERE role = 'student' ORDER BY id LIMIT 1;
```

**Run it** and look at the result.

**You will see something like:**
```
id | name         | email              | role
1  | John Smith   | john.smith@uni.ac.uk | student
```

**Write down the ID number** (usually 1 or something similar)

### STEP 3: Get a Course ID
Still in SQL Editor, run:

```sql
SELECT id, course_code, course_name FROM courses ORDER BY id LIMIT 1;
```

**Result will be like:**
```
id | course_code | course_name
1  | CS101       | Intro to CS
```

**Write down the ID number** (usually 1)

---

## STEP 4: Use Those Numbers in Your App

Go to your Lecturer Schedule page:
1. Click **Add New Schedule**
2. **Student ID:** Enter the number from STEP 2 (e.g., `1`)
3. **Course ID:** Enter the number from STEP 3 (e.g., `1`)
4. **Day:** Monday
5. **Start Time:** 09:00
6. **End Time:** 10:30
7. **Location:** Hall A
8. Click **Submit**

✅ **It should work!**

---

## If You Have NO Users in Database

### Quick Fix - Insert One User Manually

In SQL Editor, run:

```sql
-- Create University
INSERT INTO universities (name, city) VALUES ('Test University', 'Test City');

-- Create Student (the university ID is 1)
INSERT INTO users (name, email, role, uni_id) 
VALUES ('Test Student', 'test@test.com', 'student', 1)
ON CONFLICT (email) DO NOTHING;

-- Create Course
INSERT INTO courses (course_code, course_name, lecturer, colour)
VALUES ('TEST101', 'Test Course', 'Test Prof', 'bg-blue-500')
ON CONFLICT DO NOTHING;

-- Verify
SELECT id FROM users WHERE role = 'student';
SELECT id FROM courses;
```

---

## STILL Getting "Row Level Security" Error?

In Supabase Dashboard:
1. Go to **Table Editor** (left sidebar)
2. Click **timetable** table
3. Look for **🔒 Policies** button (top right)
4. Click it and select **Disable RLS** 
5. Confirm

Now try again! ✅

---

## That's It! 🎉

You should now be able to create schedules. The key is:
- ✅ Get valid student ID from database
- ✅ Get valid course ID from database
- ✅ Use those numbers in the form
- ✅ Disable RLS if still getting security errors

Need help? Check `SCHEDULE_ERROR_FIX.md` for detailed troubleshooting.
