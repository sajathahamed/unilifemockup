# Database Foreign Key Error - How to Fix

## 🔴 The Error

```
ERROR: 23503: insert or update on table "users" violates foreign key constraint
DETAIL: Key (uni_id)=(2) is not present in table "universities"
```

**What it means:** You're trying to insert a user with `uni_id=2`, but no university with ID=2 exists.

---

## ✅ How to Fix It - 4 Steps

### STEP 1: Check Your Database
Run `diagnose-database.sql` in Supabase SQL Editor:
1. Open Supabase Dashboard → SQL Editor → New Query
2. Copy all content from `diagnose-database.sql`
3. Click **Run**
4. Look at the results carefully

You will see:
- **UNIVERSITIES:** Which university IDs actually exist (1, 2, 3, etc.)
- **USERS:** Which student/user IDs exist and what uni_id they reference
- **COURSES:** Which course IDs exist
- **BROKEN REFERENCES:** Users with uni_id that don't exist (the problem!)

---

### STEP 2: Identify the Problem

From the diagnostic results, look for:

**"USERS WITH INVALID UNIVERSITY IDS"** section

If it shows anything, those are broken references. For example:
```
id=2, name=John, uni_id=5, issue=NO MATCHING UNIVERSITY
```

This means user ID 2 has `uni_id=5`, but no university with ID=5 exists!

---

### STEP 3: Fix the Broken References

**Option A: Add Missing Universities**

If you see that uni_id=2 or 5 don't exist, add them:

```sql
INSERT INTO universities (id, name, city, is_active) 
VALUES 
  (1, 'Test University', 'Test City', true),
  (2, 'Second University', 'Another City', true)
ON CONFLICT DO NOTHING;
```

**Option B: Fix Users to Use Valid uni_id**

If universities exist but with different IDs, update the users:

```sql
-- Example: If only uni_id=1 exists, update all users to use it
UPDATE users 
SET uni_id = 1 
WHERE uni_id IS NULL OR uni_id NOT IN (SELECT id FROM universities);
```

---

### STEP 4: Now Run the Updated Sample Data

After fixing the universities, run the **updated `sample-data.sql`**:
1. Open Supabase SQL Editor → New Query
2. Copy all from `sample-data.sql`
3. Click **Run**

It will now work because:
- ✅ It uses `ON CONFLICT DO NOTHING` (won't duplicate)
- ✅ All users reference `uni_id=1` (which definitely exists)
- ✅ All schedules use valid student_id and course_id

---

## 📋 Complete Workflow

```
1. Run diagnose-database.sql
   ↓
2. Review results:
   - Note university IDs that exist
   - Note broken references
   ↓
3. Fix broken references:
   - Add missing universities, OR
   - Update users to valid uni_id
   ↓
4. Run updated sample-data.sql
   ↓
5. Test in your app!
```

---

## 🎯 For Your Schedule Form

After running the fixed sample data:

**Check which IDs to use:**
```sql
-- Copy these and run them
SELECT id, name FROM users WHERE role = 'student' LIMIT 1;
SELECT id, course_code FROM courses LIMIT 1;
```

**Then in your app form:**
- **Student ID:** Use the ID from first query (e.g., 1)
- **Course ID:** Use the ID from second query (e.g., 1)
- Other fields: Day, Time, Location
- **Submit** ✅

---

## 🔧 Quick SQL Commands

### Check if universities exist
```sql
SELECT COUNT(*) FROM universities;
```

### See all universities with IDs
```sql
SELECT id, name FROM universities;
```

### Find broken user references
```sql
SELECT id, name, uni_id FROM users 
WHERE uni_id NOT IN (SELECT id FROM universities);
```

### Fix: Set all users to first university
```sql
UPDATE users SET uni_id = 1;
```

### Fix: Add a missing university
```sql
INSERT INTO universities (id, name, city, is_active)
VALUES (1, 'My University', 'My City', true);
```

---

## Summary

**The root cause:** Your database has broken foreign key relationships (users referencing universities that don't exist)

**The solution:** 
1. ✅ Diagnose with `diagnose-database.sql`
2. ✅ Fix broken references (add universities or update users)
3. ✅ Run updated `sample-data.sql`
4. ✅ Use valid IDs in your app

**Expected result:** All inserts will work, no more foreign key errors! 🎉
