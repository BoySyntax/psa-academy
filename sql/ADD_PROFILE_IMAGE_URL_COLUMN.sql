-- Migration to add profile_image_url column to users table
-- Run this if you already have the users table created

ALTER TABLE users
ADD COLUMN profile_image_url VARCHAR(500) NULL AFTER cellphone_number;

CREATE INDEX IF NOT EXISTS idx_users_profile_image_url ON users(profile_image_url);
