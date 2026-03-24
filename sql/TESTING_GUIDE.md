# User Management & Course Management Testing Guide

## Prerequisites
1. XAMPP running with Apache and MySQL
2. Database `charming_lms` created
3. All SQL schemas imported:
   - `DATABASE_SCHEMA_MYSQL.sql` (users table)
   - `DATABASE_COURSES_SCHEMA.sql` (courses tables)
   - `DATABASE_CONTENT_SCHEMA.sql` (content tables)

## User Management Testing

### 1. View All Users
- Navigate to: Admin Dashboard → User Management
- **Expected**: Table displays all users from database
- **API Endpoint**: `GET http://localhost/charming_api/admin/users.php`

### 2. Search Users
- Type in search box (username, email, first name, or last name)
- **Expected**: Table filters in real-time

### 3. Filter by User Type
- Use dropdown to filter: All, Student, Teacher, Admin, Management
- **Expected**: Table shows only selected user type

### 4. View User Details
- Click "View" button on any user row
- **Expected**: Dialog opens showing all user information

### 5. Delete User
- Click "Delete" button on any user row
- Confirm deletion in dialog
- **Expected**: User removed from table, success toast shown
- **API Endpoint**: `DELETE http://localhost/charming_api/admin/users.php?id={userId}`

## Course Management Testing

### 1. View All Courses
- Navigate to: Admin Dashboard → Course Management
- **Expected**: Table displays all courses from database
- **API Endpoint**: `GET http://localhost/charming_api/admin/courses.php`

### 2. Search Courses
- Type in search box (course code or title)
- **Expected**: Table filters in real-time

### 3. Filter by Status
- Use dropdown to filter: All, Active, Inactive, Archived
- **Expected**: Table shows only courses with selected status

### 4. View Course Details
- Click "View" button on any course row
- **Expected**: Dialog opens showing course information and assigned teachers

### 5. Delete Course
- Click "Delete" button on any course row
- Confirm deletion in dialog
- **Expected**: Course removed from table, success toast shown
- **API Endpoint**: `DELETE http://localhost/charming_api/admin/courses.php?id={courseId}`

## Common Issues & Solutions

### Issue: "Failed to fetch users/courses"
**Solution**: 
1. Check XAMPP Apache is running
2. Verify database connection in `xampp/htdocs/charming_api/config/database.php`
3. Check browser console for CORS errors
4. Verify API URL in `.env.local`: `VITE_API_BASE_URL=http://localhost/charming_api`

### Issue: Table is empty
**Solution**:
1. Check if database tables exist: `SHOW TABLES;`
2. Check if tables have data: `SELECT * FROM users;` or `SELECT * FROM courses;`
3. Verify PHP error logs in XAMPP

### Issue: Delete not working
**Solution**:
1. Check browser console for errors
2. Verify user/course ID is being passed correctly
3. Check PHP error logs

## API Endpoints Reference

### User Management
- `GET /admin/users.php` - Get all users
- `GET /admin/users.php?id={id}` - Get single user
- `POST /admin/users.php` - Create user
- `PUT /admin/users.php?id={id}` - Update user
- `DELETE /admin/users.php?id={id}` - Delete user

### Course Management
- `GET /admin/courses.php` - Get all courses
- `GET /admin/courses.php?id={id}` - Get single course
- `POST /admin/courses.php` - Create course
- `PUT /admin/courses.php?id={id}` - Update course
- `DELETE /admin/courses.php?id={id}` - Delete course

### Teacher Assignment
- `GET /admin/course-teachers.php?course_id={id}` - Get course teachers
- `POST /admin/course-teachers.php` - Assign teacher to course
- `DELETE /admin/course-teachers.php?course_id={id}&user_id={id}` - Remove teacher from course
