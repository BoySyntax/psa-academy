-- Add user_type column to existing users table
-- Run this if the user_type column doesn't exist yet

ALTER TABLE users 
ADD COLUMN user_type ENUM('student', 'teacher', 'admin', 'management') NOT NULL DEFAULT 'student';

-- Add index for user_type for better query performance
CREATE INDEX idx_users_user_type ON users(user_type);
