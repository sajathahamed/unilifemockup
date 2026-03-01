# Database Schema Guide & Connection Test

## Quick Start - Fix Environment Variables ✅
Your `.env` file has been updated with correct Next.js environment variable names:
```
NEXT_PUBLIC_SUPABASE_URL=https://eugltxikxnfibbxrjdch.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Architecture Overview

### **Core Entities**

#### 1. **Universities Table**
Stores information about academic institutions.

| Column | Type | Purpose |
|--------|------|---------|
| id | INT | Unique identifier |
| name | VARCHAR(100) | University name |
| city | VARCHAR(100) | Location |
| is_active | BOOLEAN | Active status |

**Example Data:**
```sql
INSERT INTO universities (name, city) VALUES 
  ('Oxford University', 'Oxford'),
  ('Cambridge University', 'Cambridge');
```

---

#### 2. **Users Table** ⭐ (Core)
Stores all user profiles across the platform.

| Column | Type | Purpose |
|--------|------|---------|
| id | INT | User ID |
| name | VARCHAR(100) | Full name |
| email | VARCHAR(100) | Email (unique) |
| role | ENUM | One of: student, lecturer, admin, vendor, delivery, super_admin |
| uni_id | INT | University they belong to |
| created_at | TIMESTAMP | Registration date |

**Roles Explained:**
- **student** - Can view schedule, access vendors, order food
- **lecturer** - Can create & manage class schedules
- **admin** - Can manage users, view dashboards
- **vendor** - Can manage food items and orders
- **delivery** - Can track deliveries
- **super_admin** - Full platform access

**Example Users:**
```sql
-- Student
INSERT INTO users (name, email, role, uni_id) VALUES
  ('John Smith', 'john@uni.ac.uk', 'student', 1);

-- Lecturer
INSERT INTO users (name, email, role, uni_id) VALUES
  ('Dr. Peter Taylor', 'peter@uni.ac.uk', 'lecturer', 1);

-- Admin
INSERT INTO users (name, email, role, uni_id) VALUES
  ('Admin User', 'admin@uni.ac.uk', 'admin', 1);
```

---

#### 3. **Courses Table**
Academic course information.

| Column | Type | Purpose |
|--------|------|---------|
| id | INT | Course ID |
| course_code | VARCHAR(50) | Code (e.g., CS101) |
| course_name | VARCHAR(100) | Full name |
| lecturer | VARCHAR(100) | Lecturer name |
| colour | VARCHAR(20) | Display color |

**Example:**
```sql
INSERT INTO courses (course_code, course_name, lecturer, colour) VALUES
  ('CS101', 'Introduction to Computer Science', 'Dr. Peter Taylor', 'bg-blue-500'),
  ('MATH101', 'Calculus I', 'Prof. Margaret White', 'bg-green-500');
```

---

#### 4. **Timetable Table** ⭐ (Schedule Management)
Class schedules linking students to courses.

| Column | Type | Purpose |
|--------|------|---------|
| id | INT | Schedule ID |
| student_id | INT | Student taking the course |
| course_id | INT | Course ID |
| day_of_week | VARCHAR(20) | Monday-Friday |
| start_time | TIME | Class start (HH:MM) |
| end_time | TIME | Class end (HH:MM) |
| location | VARCHAR(100) | Room/Hall name |

**Example:**
```sql
INSERT INTO timetable (student_id, course_id, day_of_week, start_time, end_time, location) VALUES
  (1, 1, 'Monday', '09:00', '10:30', 'Hall A'),
  (1, 2, 'Tuesday', '10:00', '11:30', 'Lab 1'),
  (1, 4, 'Wednesday', '13:00', '14:30', 'Hall B');
```

**Query to View Schedule:**
```sql
SELECT 
  u.name as student,
  c.course_code,
  c.course_name,
  t.day_of_week,
  t.start_time,
  t.end_time,
  t.location
FROM timetable t
JOIN users u ON t.student_id = u.id
JOIN courses c ON t.course_id = c.id
WHERE t.student_id = 1;
```

---

### **Vendor & Food Management**

#### 5. **Vendors Table**
Food vendors on campus.

| Column | Type | Purpose |
|--------|------|---------|
| id | INT | Vendor ID |
| name | VARCHAR(100) | Vendor name |
| type | VARCHAR(50) | Category (food, beverage, etc.) |
| location | VARCHAR(100) | Campus location |
| is_open | BOOLEAN | Currently open? |
| rating | DECIMAL(2,1) | User rating (4.5 stars) |

**Example:**
```sql
INSERT INTO vendors (name, type, location, is_open, rating) VALUES
  ('Pizza Palace', 'food', 'Campus Center', true, 4.5),
  ('Coffee Corner', 'beverage', 'Library Building', true, 4.8);
```

---

#### 6. **Food Items Table**
Menu items offered by vendors.

| Column | Type | Purpose |
|--------|------|---------|
| id | INT | Item ID |
| vendor_id | INT | Which vendor owns this |
| category_id | INT | Item category |
| name | VARCHAR(100) | Item name |
| price | DECIMAL(10,2) | Price |
| image_url | VARCHAR(255) | Image (optional) |
| is_available | BOOLEAN | In stock? |

**Example:**
```sql
INSERT INTO food_items (vendor_id, category_id, name, price) VALUES
  (1, 1, 'Margherita Pizza', 12.99),
  (2, 4, 'Cappuccino', 3.99);
```

---

#### 7. **Shops Table**
General merchandise shops (not food vendors).

| Column | Type | Purpose |
|--------|------|---------|
| id | INT | Shop ID |
| name | VARCHAR(100) | Shop name |
| owner_id | INT | Owner user ID |
| shop_type | VARCHAR(50) | Type (electronics, books, etc.) |
| status | ENUM | 'open' or 'closed' |

---

### **Delivery System**

#### 8. **Delivery Agents Table**
People who deliver orders.

| Column | Type | Purpose |
|--------|------|---------|
| id | INT | Agent ID |
| name | VARCHAR(100) | Agent name |
| phone | VARCHAR(20) | Contact number |
| is_available | BOOLEAN | Currently available? |

**Example:**
```sql
INSERT INTO delivery_agents (name, phone, is_available) VALUES
  ('John Delivery', '07700123456', true),
  ('Sarah Transport', '07700234567', true);
```

---

### **Laundry Services**

#### 9. **Laundry Services Table**
Campus laundry facilities.

| Column | Type | Purpose |
|--------|------|---------|
| id | INT | Service ID |
| name | VARCHAR(100) | Service name |
| location | VARCHAR(100) | Campus location |
| price_per_kg | DECIMAL(10,2) | Bulk pricing |
| price_per_item | DECIMAL(10,2) | Per-item pricing |
| pickup_available | BOOLEAN | Offer pickup? |

---

## How to Add Sample Data

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**

### Step 2: Run Sample Data Script
Copy the entire content from `sample-data.sql` file and paste it into the SQL editor, then click **Run**.

This will insert:
- 5 universities
- 12+ users (students, lecturers, admins)
- 6 courses
- 13 class schedules
- 5 food vendors
- 22 food items
- Delivery agents & laundry services

### Step 3: Verify Connection
After running the sample data, run this verification query:

```sql
SELECT 
  'Users' as table_name, COUNT(*) as total_records FROM users
UNION ALL
SELECT 'Courses', COUNT(*) FROM courses
UNION ALL
SELECT 'Timetable', COUNT(*) FROM timetable
UNION ALL
SELECT 'Food Items', COUNT(*) FROM food_items
UNION ALL
SELECT 'Vendors', COUNT(*) FROM vendors;
```

Expected output:
- Users: 13
- Courses: 6
- Timetable: 13
- Food Items: 22
- Vendors: 5

---

## Testing Connection in Your App

### Method 1: Check Server Logs
Run your app with:
```bash
npm run dev
```

The middleware should now work without the "Your project's URL and Key are required" error.

### Method 2: Test API Route
Visit: `http://localhost:3000/api/lecturer/courses`

You should see JSON response with course data:
```json
[
  {
    "id": 1,
    "course_code": "CS101",
    "course_name": "Introduction to Computer Science",
    "colour": "bg-blue-500"
  }
]
```

### Method 3: Test with cURL
```bash
curl http://localhost:3000/api/lecturer/courses
```

---

## Common Queries for Testing

### Get All Students
```sql
SELECT id, name, email FROM users WHERE role = 'student';
```

### Get a Student's Schedule
```sql
SELECT 
  c.course_code,
  c.course_name,
  t.day_of_week,
  t.start_time,
  t.end_time,
  t.location
FROM timetable t
JOIN courses c ON t.course_id = c.id
WHERE t.student_id = 1
ORDER BY t.day_of_week, t.start_time;
```

### Get All Available Food Items
```sql
SELECT 
  v.name as vendor,
  fi.name as item,
  fi.price
FROM food_items fi
JOIN vendors v ON fi.vendor_id = v.id
WHERE fi.is_available = true;
```

### Get Delivery Agents' Status
```sql
SELECT name, phone, is_available FROM delivery_agents;
```

---

## Features Now Working ✅

After environment variables are fixed and sample data is added:

1. **User Management (Admin Panel)**
   - Create/Edit users
   - Filter by role
   - Delete users

2. **Lecturer Schedule**
   - View all schedules
   - Create new class schedules
   - Edit schedules
   - Delete schedules
   - Search by course

3. **Student Dashboard**
   - View personal schedule
   - Filter by day

4. **Food/Vendor Module** (Ready for implementation)
   - Browse vendors
   - View food items
   - Order food

5. **Delivery System** (Ready)
   - Track deliveries
   - Manage delivery agents

---

## Troubleshooting

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"
✅ Already fixed - your `.env` now has correct variable names

### Error: "Connection refused"
- Verify your Supabase project is running
- Check URL: https://eugltxikxnfibbxrjdch.supabase.co

### No data showing in dropdowns?
- Run the `sample-data.sql` script
- Check Supabase RLS (Row-Level Security) policies

### API returns 401 Unauthorized
- Make sure you're logged in with correct role
- Check authentication tokens in browser console

---

## Next Steps

1. ✅ Fix environment variables (DONE)
2. Run `sample-data.sql` to populate test data
3. Start app: `npm run dev`
4. Test each module:
   - Login as student → View schedule
   - Login as lecturer → Create schedule
   - Login as admin → Manage users

Enjoy testing! 🚀
