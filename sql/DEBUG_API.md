# Debug API Error - "Unexpected token '<'"

## What This Error Means
Your PHP backend is returning HTML (an error page) instead of JSON. This happens when there's a PHP error.

## Quick Diagnosis Steps

### Step 1: Check Which Page is Failing
Open browser and go directly to the API:
- **Users API**: http://localhost/charming_api/admin/users.php
- **Courses API**: http://localhost/charming_api/admin/courses.php

You should see JSON like:
```json
{"users": [...]}
```

If you see HTML error instead, that's the problem.

### Step 2: Enable PHP Error Display
Edit `xampp/htdocs/charming_api/admin/users.php` - add at the top (after `<?php`):
```php
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
```

Refresh the API URL in browser - you'll now see the actual PHP error.

### Step 3: Common Fixes

#### A. Database Connection Error
**Error**: "Connection failed" or "Access denied"

**Fix**: Check `xampp/htdocs/charming_api/config/database.php`:
```php
private $host = "localhost";
private $db_name = "charming_lms";  // Make sure this database exists!
private $username = "root";
private $password = "";  // Default XAMPP password is empty
```

**Verify database exists**:
1. Open phpMyAdmin: http://localhost/phpmyadmin
2. Check if `charming_lms` database exists
3. If not, create it: `CREATE DATABASE charming_lms;`

#### B. Table Doesn't Exist
**Error**: "Table 'charming_lms.users' doesn't exist"

**Fix**: Import the schema files in phpMyAdmin:
1. Select `charming_lms` database
2. Go to "Import" tab
3. Import these files in order:
   - `DATABASE_SCHEMA_MYSQL.sql`
   - `DATABASE_COURSES_SCHEMA.sql`
   - `DATABASE_CONTENT_SCHEMA.sql`
   - `TEST_DATA.sql`

Or run in SQL tab:
```sql
USE charming_lms;
SOURCE c:/Users/User/Downloads/charming-logins-main/charming-logins-main/DATABASE_SCHEMA_MYSQL.sql;
SOURCE c:/Users/User/Downloads/charming-logins-main/charming-logins-main/DATABASE_COURSES_SCHEMA.sql;
SOURCE c:/Users/User/Downloads/charming-logins-main/charming-logins-main/DATABASE_CONTENT_SCHEMA.sql;
SOURCE c:/Users/User/Downloads/charming-logins-main/charming-logins-main/TEST_DATA.sql;
```

#### C. PHP Syntax Error
**Error**: "Parse error" or "Syntax error"

**Fix**: Check the PHP file for typos. The error message will show the line number.

#### D. Missing config/database.php
**Error**: "Failed opening required '../config/database.php'"

**Fix**: Make sure `xampp/htdocs/charming_api/config/database.php` exists.

If missing, create it:
```php
<?php
class Database {
    private $host = "localhost";
    private $db_name = "charming_lms";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>
```

### Step 4: Test API Directly

Open browser console (F12) and run:
```javascript
fetch('http://localhost/charming_api/admin/users.php')
  .then(r => r.text())
  .then(console.log)
```

This will show you the exact response from the server.

### Step 5: Check XAMPP Logs

If still stuck, check PHP error logs:
- Windows: `C:\xampp\apache\logs\error.log`
- Look for recent errors related to your API files

## Most Likely Solution

**90% of the time it's one of these:**
1. ❌ Database `charming_lms` doesn't exist → Create it in phpMyAdmin
2. ❌ Tables don't exist → Import SQL schema files
3. ❌ MySQL not running → Start MySQL in XAMPP Control Panel
4. ❌ Wrong database credentials → Check config/database.php

## Quick Test Checklist

- [ ] XAMPP Apache is running (green in control panel)
- [ ] XAMPP MySQL is running (green in control panel)
- [ ] Database `charming_lms` exists in phpMyAdmin
- [ ] Tables `users` and `courses` exist in database
- [ ] Can access http://localhost/charming_api/admin/users.php in browser
- [ ] Browser shows JSON, not HTML error
