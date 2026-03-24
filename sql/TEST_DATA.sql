-- Test data for User Management and Course Management
-- Run this after importing all schema files

-- Insert test users (if not already exist)
INSERT IGNORE INTO users (
    id, username, email, password, user_type,
    first_name, last_name, date_of_birth, sex, civil_status,
    educational_attainment, house_no_and_street, barangay,
    municipality, province, region, cellphone_number
) VALUES 
(
    'test-admin-001',
    'admin.test',
    'admin@test.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'admin',
    'Admin',
    'User',
    '1990-01-01',
    'Male',
    'Single',
    'Bachelor',
    '123 Test St',
    'Test Barangay',
    'Test City',
    'Test Province',
    'Test Region',
    '09123456789'
),
(
    'test-teacher-001',
    'teacher.test',
    'teacher@test.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'teacher',
    'Teacher',
    'User',
    '1985-05-15',
    'Female',
    'Married',
    'Masters',
    '456 Test Ave',
    'Test Barangay',
    'Test City',
    'Test Province',
    'Test Region',
    '09123456788'
),
(
    'test-student-001',
    'student.test',
    'student@test.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'student',
    'Student',
    'User',
    '2000-03-20',
    'Male',
    'Single',
    'High School',
    '789 Test Blvd',
    'Test Barangay',
    'Test City',
    'Test Province',
    'Test Region',
    '09123456787'
);

-- Insert test courses (using correct schema)
INSERT INTO courses (
    course_code, course_name, description, category, duration_hours, max_students, status, thumbnail_url
) VALUES 
(
    'MATH101',
    'College Algebra',
    'Learn fundamental algebraic concepts including equations, functions, and graphing. Perfect for students preparing for advanced mathematics.',
    'Mathematics',
    40,
    30,
    'published',
    NULL
),
(
    'CS101',
    'Introduction to Programming',
    'Master the basics of programming using Python. Learn variables, loops, functions, and object-oriented programming concepts.',
    'Computer Science',
    60,
    25,
    'published',
    NULL
),
(
    'ENG101',
    'English Composition',
    'Develop your writing and communication skills. Learn essay writing, grammar, and effective communication techniques.',
    'English',
    45,
    35,
    'published',
    NULL
),
(
    'PSA101',
    'PSA Academy Training Program',
    'Comprehensive training program at PSA Academy. Learn essential skills and knowledge for professional development.',
    'Professional Development',
    50,
    40,
    'published',
    NULL
);

-- Get course IDs for reference
SET @math_course_id = (SELECT id FROM courses WHERE course_code = 'MATH101' LIMIT 1);
SET @cs_course_id = (SELECT id FROM courses WHERE course_code = 'CS101' LIMIT 1);
SET @eng_course_id = (SELECT id FROM courses WHERE course_code = 'ENG101' LIMIT 1);
SET @psa_course_id = (SELECT id FROM courses WHERE course_code = 'PSA101' LIMIT 1);

-- Insert course modules
INSERT INTO course_modules (course_id, module_name, description, order_index) VALUES
-- Math modules
(@math_course_id, 'Introduction', 'Welcome to College Algebra', 1),
(@math_course_id, 'Linear Equations', 'Solving linear equations and inequalities', 2),
(@math_course_id, 'Functions', 'Understanding functions and their graphs', 3),

-- CS modules
(@cs_course_id, 'Getting Started', 'Introduction to programming concepts', 1),
(@cs_course_id, 'Variables and Data Types', 'Working with data in Python', 2),
(@cs_course_id, 'Control Structures', 'Loops and conditional statements', 3),

-- English modules
(@eng_course_id, 'Introduction', 'Course overview and expectations', 1),
(@eng_course_id, 'Essay Writing', 'Structure and organization of essays', 2),

-- PSA modules
(@psa_course_id, 'Introduction', 'Overview of PSA Academy programs', 1),
(@psa_course_id, 'Core Training', 'Essential training content', 2),
(@psa_course_id, 'Assessment and Evaluation', 'Final assessment and certification', 3);

-- Get module IDs
SET @math_mod1 = (SELECT id FROM course_modules WHERE course_id = @math_course_id AND order_index = 1 LIMIT 1);
SET @math_mod2 = (SELECT id FROM course_modules WHERE course_id = @math_course_id AND order_index = 2 LIMIT 1);
SET @cs_mod1 = (SELECT id FROM course_modules WHERE course_id = @cs_course_id AND order_index = 1 LIMIT 1);
SET @cs_mod2 = (SELECT id FROM course_modules WHERE course_id = @cs_course_id AND order_index = 2 LIMIT 1);
SET @psa_mod1 = (SELECT id FROM course_modules WHERE course_id = @psa_course_id AND order_index = 1 LIMIT 1);
SET @psa_mod2 = (SELECT id FROM course_modules WHERE course_id = @psa_course_id AND order_index = 2 LIMIT 1);
SET @psa_mod3 = (SELECT id FROM course_modules WHERE course_id = @psa_course_id AND order_index = 3 LIMIT 1);

-- Insert course lessons
INSERT INTO course_lessons (module_id, lesson_title, lesson_content, lesson_type, duration_minutes, order_index, is_published) VALUES
-- Math lessons
(@math_mod1, 'Welcome to College Algebra', '<h2>Welcome!</h2><p>This course will help you master algebraic concepts.</p>', 'reading', 15, 1, 1),
(@math_mod1, 'Course Overview Video', '<p>Watch this video to understand what you will learn.</p>', 'video', 20, 2, 1),
(@math_mod2, 'Solving Linear Equations', '<h2>Linear Equations</h2><p>Learn how to solve equations of the form ax + b = c</p>', 'reading', 30, 1, 1),
(@math_mod2, 'Practice Quiz', '<p>Test your understanding of linear equations.</p>', 'quiz', 25, 2, 1),

-- CS lessons
(@cs_mod1, 'What is Programming?', '<h2>Introduction to Programming</h2><p>Programming is giving instructions to computers.</p>', 'reading', 20, 1, 1),
(@cs_mod1, 'Setting Up Python', '<p>Install Python and set up your development environment.</p>', 'document', 30, 2, 1),
(@cs_mod2, 'Variables Explained', '<h2>Variables</h2><p>Variables store data that can be used later in your program.</p>', 'reading', 25, 1, 1),
(@cs_mod2, 'Variables Assignment', '<p>Complete exercises on variable declaration and usage.</p>', 'assignment', 45, 2, 1),

-- PSA lessons
(@psa_mod1, 'Academy Overview', '<p>Welcome to PSA Academy. This introduction covers our programs and expectations.</p>', 'reading', 10, 1, 1),
(@psa_mod2, 'Pre-Assessment Quiz', '<h2>Pre-Assessment</h2><p>Answer these questions to assess your current knowledge.</p>', 'quiz', 30, 1, 1),
(@psa_mod2, 'Foundation Training', '<h2>Core Concepts</h2><p>Learn the fundamental concepts and principles.</p><p><strong>Attempts allowed:</strong> 1</p><p><strong>Grade to pass:</strong> 22.50 out of 30.00</p>', 'quiz', 45, 2, 1),
(@psa_mod2, 'Training Materials', '<p>Download and review the training presentation materials.</p>', 'document', 60, 3, 1),
(@psa_mod3, 'Program Evaluation', '<p>Provide feedback on the training program.</p>', 'assignment', 20, 1, 1),
(@psa_mod3, 'Final Assessment', '<h2>Post-Test</h2><p>Final assessment to earn your certificate.</p>', 'quiz', 45, 2, 1);

-- Assign teacher to courses (using correct table structure)
INSERT INTO course_teachers (course_id, teacher_id) VALUES 
(@math_course_id, 2),
(@cs_course_id, 2),
(@eng_course_id, 2),
(@psa_course_id, 2);

-- Note: Students can enroll through the frontend interface
-- Or you can manually enroll them:
-- INSERT INTO course_enrollments (course_id, student_id, status, progress_percentage) VALUES 
-- (@psa_course_id, 1, 'enrolled', 0.00);
