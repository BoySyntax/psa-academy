-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('student', 'teacher', 'admin', 'management')) DEFAULT 'student',
  
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for username lookup
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy: Users can read their own data
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Create RLS Policy: Users can update their own data
CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();
