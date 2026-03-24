ALTER TABLE course_enrollments
ADD COLUMN IF NOT EXISTS student_seen TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS management_message TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_enrollments_student_seen ON course_enrollments(student_id, student_seen);
