-- Assign teacher to all courses
-- This script will assign the teacher with username 'teacher.test' to all published courses

-- First, let's get the teacher's ID
SET @teacher_id = (SELECT id FROM users WHERE username = 'teacher.test' AND user_type = 'teacher' LIMIT 1);

-- If teacher doesn't exist, show error
SELECT CASE 
    WHEN @teacher_id IS NULL THEN 'ERROR: Teacher user not found. Please create a teacher user first.'
    ELSE CONCAT('Found teacher with ID: ', @teacher_id)
END as status;

-- Delete existing assignments for this teacher (to avoid duplicates)
DELETE FROM course_teachers WHERE teacher_id = @teacher_id;

-- Assign teacher to all published courses
INSERT INTO course_teachers (course_id, teacher_id)
SELECT id, @teacher_id
FROM courses
WHERE status = 'published';

-- Show results
SELECT 
    c.course_code,
    c.course_name,
    u.username as teacher_username,
    u.first_name,
    u.last_name
FROM course_teachers ct
INNER JOIN courses c ON ct.course_id = c.id
INNER JOIN users u ON ct.teacher_id = u.id
WHERE ct.teacher_id = @teacher_id;

SELECT CONCAT('Successfully assigned teacher to ', COUNT(*), ' courses') as result
FROM course_teachers
WHERE teacher_id = @teacher_id;
