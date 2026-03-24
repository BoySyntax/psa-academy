# XAMPP + phpMyAdmin Registration Backend Setup Guide

This guide will help you set up a local PHP backend using XAMPP to handle user registration and login.

## Step 1: Install XAMPP

1. Download XAMPP from: https://www.apachefriends.org/download.html
2. Choose the Windows version
3. Run the installer and follow the setup wizard
4. Install it to a location like `C:\xampp`
5. Choose components to install (Apache + MySQL are required)

## Step 2: Start XAMPP Services

1. Open XAMPP Control Panel (`C:\xampp\xampp-control.exe`)
2. Click **Start** next to:
   - **Apache** (for web server)
   - **MySQL** (for database)
3. Both should show "Running" in green

## Step 3: Access phpMyAdmin

1. Open your browser and go to: `http://localhost/phpmyadmin`
2. You should see the phpMyAdmin dashboard
3. Leave username as `root` and password empty (default)

## Step 4: Create Database

1. In phpMyAdmin, click **New** on the left sidebar
2. Database name: `charming_logins`
3. Collation: `utf8mb4_unicode_ci`
4. Click **Create**

## Step 5: Create Users Table

1. Click on the new `charming_logins` database
2. Click **SQL** tab at the top
3. Copy and paste this SQL:

```sql
3
```

4. Click **Go** or press Ctrl+Enter
5. You should see "1 row inserted" message

## Step 6: Create PHP Backend Files

Create a folder for your API:
- Go to `C:\xampp\htdocs`
- Create a new folder: `charming_api`
- Create these files inside:

### File 1: `config.php`
Path: `C:\xampp\htdocs\charming_api\config.php`

```php
<?php
// Database Configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'charming_logins');

// Create connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

// Set charset to utf8
$conn->set_charset('utf8mb4');

// Enable CORS for local development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
```

### File 2: `register.php`
Path: `C:\xampp\htdocs\charming_api\register.php`

```php
<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

// Get JSON input
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
$required = ['username', 'email', 'password', 'firstName', 'lastName', 'cellphoneNumber'];
foreach ($required as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Missing required field: $field"]);
        exit();
    }
}

// Sanitize inputs
$username = $conn->real_escape_string($data['username']);
$email = $conn->real_escape_string($data['email']);
$password = password_hash($data['password'], PASSWORD_BCRYPT);
$firstName = $conn->real_escape_string($data['firstName']);
$middleName = $conn->real_escape_string($data['middleName'] ?? '');
$lastName = $conn->real_escape_string($data['lastName']);
$suffix = $conn->real_escape_string($data['suffix'] ?? '');
$dateOfBirth = $data['dateOfBirth'] ?? null;
$sex = $conn->real_escape_string($data['sex'] ?? '');
$bloodType = $conn->real_escape_string($data['bloodType'] ?? '');
$civilStatus = $conn->real_escape_string($data['civilStatus'] ?? '');
$typeOfDisability = $conn->real_escape_string($data['typeOfDisability'] ?? '');
$religion = $conn->real_escape_string($data['religion'] ?? '');
$educationalAttainment = $conn->real_escape_string($data['educationalAttainment'] ?? '');

// Address
$houseNoAndStreet = $conn->real_escape_string($data['houseNoAndStreet'] ?? '');
$barangay = $conn->real_escape_string($data['barangay'] ?? '');
$municipality = $conn->real_escape_string($data['municipality'] ?? '');
$province = $conn->real_escape_string($data['province'] ?? '');
$region = $conn->real_escape_string($data['region'] ?? '');

// Contact
$cellphoneNumber = $conn->real_escape_string($data['cellphoneNumber']);

// Employment
$typeOfEmployment = $conn->real_escape_string($data['typeOfEmployment'] ?? '');
$civilServiceEligibilityLevel = $conn->real_escape_string($data['civilServiceEligibilityLevel'] ?? '');
$salaryGrade = $conn->real_escape_string($data['salaryGrade'] ?? '');
$presentPosition = $conn->real_escape_string($data['presentPosition'] ?? '');
$office = $conn->real_escape_string($data['office'] ?? '');
$service = $conn->real_escape_string($data['service'] ?? '');
$divisionProvince = $conn->real_escape_string($data['divisionProvince'] ?? '');

// Emergency Contact
$emergencyContactName = $conn->real_escape_string($data['emergencyContactName'] ?? '');
$emergencyContactRelationship = $conn->real_escape_string($data['emergencyContactRelationship'] ?? '');
$emergencyContactAddress = $conn->real_escape_string($data['emergencyContactAddress'] ?? '');
$emergencyContactNumber = $conn->real_escape_string($data['emergencyContactNumber'] ?? '');

// Check if username or email already exists
$check = $conn->query("SELECT id FROM users WHERE username='$username' OR email='$email'");
if ($check->num_rows > 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username or email already exists']);
    exit();
}

// Insert user
$sql = "INSERT INTO users (
    username, email, password, first_name, middle_name, last_name, suffix,
    date_of_birth, sex, blood_type, civil_status, type_of_disability, religion,
    educational_attainment, house_no_and_street, barangay, municipality, province,
    region, cellphone_number, type_of_employment, civil_service_eligibility_level,
    salary_grade, present_position, office, service, division_province,
    emergency_contact_name, emergency_contact_relationship, emergency_contact_address,
    emergency_contact_number
) VALUES (
    '$username', '$email', '$password', '$firstName', '$middleName', '$lastName', '$suffix',
    '$dateOfBirth', '$sex', '$bloodType', '$civilStatus', '$typeOfDisability', '$religion',
    '$educationalAttainment', '$houseNoAndStreet', '$barangay', '$municipality', '$province',
    '$region', '$cellphoneNumber', '$typeOfEmployment', '$civilServiceEligibilityLevel',
    '$salaryGrade', '$presentPosition', '$office', '$service', '$divisionProvince',
    '$emergencyContactName', '$emergencyContactRelationship', '$emergencyContactAddress',
    '$emergencyContactNumber'
)";

if ($conn->query($sql)) {
    echo json_encode([
        'success' => true,
        'message' => 'Registration successful! Please check your email to confirm your account.',
        'userId' => $conn->insert_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $conn->error]);
}

$conn->close();
?>
```

### File 3: `login.php`
Path: `C:\xampp\htdocs\charming_api\login.php`

```php
<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['username']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Username and password required']);
    exit();
}

$username = $conn->real_escape_string($data['username']);
$result = $conn->query("SELECT id, password, first_name, last_name FROM users WHERE username='$username'");

if ($result->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    exit();
}

$user = $result->fetch_assoc();

if (!password_verify($data['password'], $user['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Invalid username or password']);
    exit();
}

echo json_encode([
    'success' => true,
    'message' => 'Login successful!',
    'user' => [
        'id' => $user['id'],
        'firstName' => $user['first_name'],
        'lastName' => $user['last_name']
    ]
]);

$conn->close();
?>
```

## Step 7: Test Your API

### Test Registration:
Open Postman or curl and send:

```bash
curl -X POST http://localhost/charming_api/register.php \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "cellphoneNumber": "09171234567"
  }'
```

### Test Login:
```bash
curl -X POST http://localhost/charming_api/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

## Step 8: Update React App Registration Service

Replace your current `src/services/registration.ts` with this:

```typescript
// Update the API URLs to point to your XAMPP backend
const API_BASE_URL = 'http://localhost/charming_api';

export const registrationService = {
  async registerUser(data: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/register.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Registration successful!',
          user: result,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Registration failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  },

  async loginUser(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: result.message || 'Login successful!',
          user: result.user,
        };
      } else {
        return {
          success: false,
          message: result.message || 'Login failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
      };
    }
  },

  async logoutUser() {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  },

  async getCurrentUser() {
    return {
      success: false,
      message: 'Not implemented',
    };
  },

  async getUserProfile(userId: number) {
    return {
      success: false,
      message: 'Not implemented',
    };
  },
};
```

## Verification Steps

1. ✅ XAMPP Apache and MySQL running
2. ✅ Database `charming_logins` created
3. ✅ `users` table created with all columns
4. ✅ PHP files in `C:\xampp\htdocs\charming_api\`
5. ✅ Registration API responds at `http://localhost/charming_api/register.php`
6. ✅ Login API responds at `http://localhost/charming_api/login.php`
7. ✅ React app updated with new API URLs

## Troubleshooting

**"Cannot connect to database"**
- Make sure MySQL is running in XAMPP Control Panel
- Check database credentials in `config.php`

**"CORS error"**
- The `config.php` file includes CORS headers
- Make sure all API files include `require_once 'config.php'`

**"Table not found"**
- Verify table was created in phpMyAdmin
- Check spelling: `users` (lowercase)

**Port conflicts**
- Default Apache port: 8080 if 80 is in use
- Check XAMPP Control Panel Config to see actual port
- Access phpMyAdmin at: `http://localhost:8080/phpmyadmin` if needed

Once everything is set up, you can test the registration form in your React app!
