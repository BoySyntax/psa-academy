-- Migration to add subcategory column to courses table
-- Run this if you already have the courses table created

ALTER TABLE courses 
ADD COLUMN subcategory VARCHAR(100) AFTER category;

-- Add index for subcategory for better performance
CREATE INDEX IF NOT EXISTS idx_courses_subcategory ON courses(subcategory);
