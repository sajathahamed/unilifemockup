# Fixing the Schedule Creation Error

## Error Analysis

```
Add schedule error: new row violates row-level security policy for table "timetable"
Error: insert or update on table "timetable" violates foreign key constraint
Key (student_id)=(2) is not present in table "users"
```

**What this means:**
- You're trying to create a schedule for **student_id=2**
- But **student with id=2 doesn't exist** in your users table
- Additionally, RLS (Row-Level Security) policies may be blocking inserts

---

## Solution: Step by Step

### Step 1: Check What Users Exist in Your Database

Open Supabase SQL Editor and run:

```sql
SELECT id, name, email, role FROM users ORDER BY id LIMIT 20;
```

**You should see output like:**
```
id | name              | email                    | role
1  | John Smith        | john.smith@uni.ac.uk     | student
2  | Sarah Johnson     | sarah.johnson@uni.ac.uk  | student
3  | Michael Brown     | michael.brown@uni.ac.uk  | student
```

### Step 2: Check What Courses Exist

```sql
SELECT id, course_code, course_name FROM courses ORDER BY id LIMIT 10;
```

**Expected output:**
```
id | course_code | course_name
1  | CS101       | Introduction to Computer Science
2  | CS201       | Data Structures
3  | MATH101     | Calculus I
```

### Step 3: If No Data Exists, Insert Sample Data

If the above queries return empty results, you haven't run the sample data yet:

1. Open `sample-data.sql` file in your editor
2. Copy ALL the content
3. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/_/settings/api)
4. Click **SQL Editor** → **New Query**
5. Paste the entire content from `sample-data.sql`
6. Click **Run**
7. Wait for it to complete (should see green checkmark)

### Step 4: Get Actual Student and Course IDs

After sample data is inserted, run:

```sql
-- Get first student
SELECT id FROM users WHERE role = 'student' LIMIT 1;
-- Result: id = 1

-- Get first course
SELECT id FROM courses LIMIT 1;
-- Result: id = 1
```

**Remember these numbers!** You'll use them in the form.

### Step 5: Test Creating a Schedule in Your App

1. Go to Lecturer Schedule page
2. Click "Add New Schedule"
3. **Fill in exactly:**
   - **Student ID:** `1` (from Step 4)
   - **Course ID:** `1` (from Step 4)
   - **Day:** Monday
   - **Start Time:** 09:00
   - **End Time:** 10:30
   - **Location:** Hall A
4. Click Submit

**It should work now!** ✅

---

## Fixing RLS (Row-Level Security) Issues

If you still get "violates row-level security" errors, you need to check/disable RLS:

### Option A: Check RLS Status (View Only)

```sql
-- Check which tables have RLS enabled
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'timetable';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'timetable';
```

### Option B: Disable RLS Temporarily (for testing)

In Supabase Dashboard:
1. Go to **Table Editor**
2. Select **timetable** table
3. Click **Policies** (top right)
4. Click **Disable RLS** button
5. Confirm

⚠️ **WARNING:** Only disable RLS for testing. Re-enable it before production!

### Option C: Create Proper RLS Policy

If you disabled RLS, enable it again and create this policy:

```sql
-- Enable RLS
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;

-- Create policy allowing authenticated users to insert their own schedules
CREATE POLICY "Allow insert timetable"
  ON timetable
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Or allow all inserts for testing:
CREATE POLICY "Allow all inserts for testing"
  ON timetable
  FOR INSERT
  WITH CHECK (true);
```

---

## Quick Verification Checklist

Run these queries to confirm everything is set up:

```sql
-- ✅ Check users exist
SELECT COUNT(*) as users_count FROM users;
-- Should return: 13+ (or at least 1)

-- ✅ Check courses exist
SELECT COUNT(*) as courses_count FROM courses;
-- Should return: 6+ (or at least 1)

-- ✅ Check universities exist
SELECT COUNT(*) as universities_count FROM universities;
-- Should return: 5+ (or at least 1)

-- ✅ Verify student 1 exists
SELECT id, name FROM users WHERE id = 1;
-- Should show a student name

-- ✅ Verify course 1 exists
SELECT id, course_code FROM courses WHERE id = 1;
-- Should show a course code
```

---

## Common Issues & Fixes

### Issue: "Key (student_id)=(2) is not present"
**Fix:** Use student_id=1 instead (that's the first user in database)

### Issue: "violates row-level security policy"
**Fix:** Either:
- Disable RLS in table settings (for development)
- Or create proper RLS policies (for production)

### Issue: No data appears after running sample-data.sql
**Fix:** 
1. Check for error messages in SQL output
2. Run individually:
   ```sql
   INSERT INTO universities (name, city) VALUES ('Test Uni', 'City');
   ```
3. See which table fails

### Issue: "Duplicate key value"
**Fix:** Data already exists. That's fine! Just use those IDs.

---

## Testing Flow

```
1. ✅ Run sample-data.sql
   ↓
2. ✅ Verify users, courses exist (Step 1-2 above)
   ↓
3. ✅ Note the IDs returned
   ↓
4. ✅ Fill form with those IDs
   ↓
5. ✅ Disable RLS if still getting security errors
   ↓
6. ✅ Submit form
   ↓
7. ✅ Schedule should be created!
```

---

## Still Having Issues?

Check these in order:

1. **Are users in database?**
   ```sql
   SELECT COUNT(*) FROM users;
   ```
   If 0 → Run `sample-data.sql`

2. **What IDs actually exist?**
   ```sql
   SELECT id FROM users LIMIT 5;
   ```
   Use these IDs in the form

3. **Can you manually insert a schedule?**
   ```sql
   INSERT INTO timetable (student_id, course_id, day_of_week, start_time, end_time, location)
   VALUES (1, 1, 'Monday', '09:00', '10:30', 'Hall A');
   ```
   If this works → Form issue
   If this fails → Database/RLS issue

4. **Check RLS policies**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'timetable';
   ```
   If results show restrictive policies → Disable RLS

---

## Next Steps

1. Run `test-connection.sql` to check current state
2. Run `sample-data.sql` if database is empty
3. Note the student and course IDs returned
4. Use those IDs in your app form
5. If RLS errors persist, disable RLS for now (re-enable later)

Good luck! 🚀
