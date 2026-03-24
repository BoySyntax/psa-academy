-- MySQL version of the users table schema
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  user_type ENUM('student', 'teacher', 'admin', 'management') NOT NULL DEFAULT 'student',
  
  -- Personal Information
  first_name VARCHAR(255) NOT NULL,
  middle_name VARCHAR(255),
  last_name VARCHAR(255) NOT NULL,
  suffix VARCHAR(50),
  date_of_birth DATE NOT NULL,
  sex VARCHAR(50) NOT NULL,
  blood_type VARCHAR(10),
  civil_status VARCHAR(50) NOT NULL,
  type_of_disability VARCHAR(100),
  religion VARCHAR(100),
  educational_attainment VARCHAR(100) NOT NULL,
  
  -- Address
  house_no_and_street VARCHAR(500) NOT NULL,
  barangay VARCHAR(255) NOT NULL,
  municipality VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,
  
  -- Contact Information
  cellphone_number VARCHAR(20) NOT NULL,
  profile_image_url VARCHAR(500),
  
  -- Employment Details
  type_of_employment VARCHAR(100),
  civil_service_eligibility_level VARCHAR(100),
  salary_grade VARCHAR(50),
  present_position VARCHAR(255),
  office VARCHAR(255),
  service VARCHAR(255),
  division_province VARCHAR(255),
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_relationship VARCHAR(100),
  emergency_contact_address VARCHAR(500),
  emergency_contact_number VARCHAR(20),
  emergency_contact_email VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index for username lookup
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index for user_type lookup
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);

-- Create index for profile image url lookup
CREATE INDEX IF NOT EXISTS idx_users_profile_image_url ON users(profile_image_url);
