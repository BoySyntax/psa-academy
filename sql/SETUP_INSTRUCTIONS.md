# Setup Instructions for User Management & Course Management

## Step 1: Database Setup

1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Create database `charming_lms` if not exists
3. Import schemas in this order:
   ```sql
   -- 1. Import users table
   SOURCE c:/Users/User/Downloads/charming-logins-main/charming-logins-main/DATABASE_SCHEMA_MYSQL.sql;
   
   -- 2. Import courses tables
   SOURCE c:/Users/User/Downloads/charming-logins-main/charming-logins-main/DATABASE_COURSES_SCHEMA.sql;
   
   -- 3. Import content tables
   SOURCE c:/Users/User/Downloads/charming-logins-main/charming-logins-main/DATABASE_CONTENT_SCHEMA.sql;
   
   -- 4. Import test data
   SOURCE c:/Users/User/Downloads/charming-logins-main/charming-logins-main/TEST_DATA.sql;
   ```

## Step 2: Environment Configuration

Create `.env.local` file in project root with:
```
VITE_API_BASE_URL=http://localhost/charming_api
```

## Step 3: Verify Backend API

Test if backend is working:

### Test Users API
Open browser and go to:
```
http://localhost/charming_api/admin/users.php
```

**Expected Response:**
```json
{
  "users": [
    {
      "id": "test-admin-001",
      "username": "admin.test",
      "email": "admin@test.com",
      "user_type": "admin",
      ...
    }
  ]
}
```

### Test Courses API
```
http://localhost/charming_api/admin/courses.php
```

**Expected Response:**
```json
{
  "courses": [
    {
      "id": 1,
      "course_code": "CS101",
      "course_title": "Introduction to Computer Science",
      ...
    }
  ]
}
```

## Step 4: Start Frontend

```bash
npm run dev
```

## Step 5: Login and Test

1. Go to http://localhost:5173
2. Login with test admin account:
   - Username: `admin.test`
   - Password: `password`
3. Navigate to User Management
4. Navigate to Course Management

## What Should Work Now

### User Management ✓
- [x] View all users in table
- [x] Search users by username, email, name
- [x] Filter users by type (student, teacher, admin, management)
- [x] View user details in dialog
- [x] Delete users with confirmation

### Course Management ✓
- [x] View all courses in table
- [x] Search courses by code or title
- [x] Filter courses by status (active, inactive, archived)
- [x] View course details with assigned teachers
- [x] Delete courses with confirmation

## Features Not Yet Implemented

### User Management
- [ ] Create new user dialog/form
- [ ] Edit user dialog/form
- [ ] Bulk operations

### Course Management
- [ ] Create new course dialog/form
- [ ] Edit course dialog/form
- [ ] Assign/remove teachers dialog
- [ ] Bulk operations

## Troubleshooting

### CORS Error
If you see CORS errors in browser console:
1. Check `xampp/htdocs/charming_api/admin/users.php` has CORS headers
2. Restart Apache in XAMPP

### Database Connection Error
1. Check `xampp/htdocs/charming_api/config/database.php`
2. Verify MySQL is running in XAMPP
3. Verify database name is `charming_lms`

### Empty Tables
1. Run `TEST_DATA.sql` to populate test data
2. Check browser Network tab for API response
3. Check PHP error logs in XAMPP

### API Not Found (404)
1. Verify XAMPP Apache is running
2. Check `charming_api` folder exists in `xampp/htdocs/`
3. Verify `.env.local` has correct API URL
