-- Migration to add 'pending' status to course_enrollments for approval workflow
-- This allows management users to approve student enrollment applications

-- Modify the status ENUM to include 'pending' and 'rejected'
ALTER TABLE course_enrollments 
MODIFY COLUMN status ENUM('pending', 'enrolled', 'in_progress', 'completed', 'dropped', 'rejected') 
NOT NULL DEFAULT 'pending';

-- Add columns to track approval workflow
ALTER TABLE course_enrollments 
ADD COLUMN IF NOT EXISTS approved_by INT(11) NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;

-- Add foreign key for approved_by
ALTER TABLE course_enrollments 
ADD CONSTRAINT fk_enrollments_approved_by 
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for pending enrollments lookup
CREATE INDEX IF NOT EXISTS idx_enrollments_pending ON course_enrollments(status, enrollment_date);
