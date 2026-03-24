-- MySQL ALTER TABLE to update existing users table with 4 user types
-- This will modify the user_type column to support: student, teacher, admin, management

-- Update the user_type column to use ENUM with all 4 types
ALTER TABLE users 
MODIFY COLUMN user_type ENUM('student', 'teacher', 'admin', 'management') NOT NULL DEFAULT 'student';

-- Add index for user_type if it doesn't exist (optional, for better query performance)
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
