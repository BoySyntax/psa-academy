-- MySQL schema for courses and related tables

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  course_code VARCHAR(50) UNIQUE NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  duration_hours INT,
  max_students INT,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
  thumbnail_url VARCHAR(500),
  created_by INT(11),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course teachers assignment table (many-to-many)
CREATE TABLE IF NOT EXISTS course_teachers (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  course_id INT(11) NOT NULL,
  teacher_id INT(11) NOT NULL,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_course_teacher (course_id, teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course enrollments table (students enrolled in courses)
CREATE TABLE IF NOT EXISTS course_enrollments (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  course_id INT(11) NOT NULL,
  student_id INT(11) NOT NULL,
  enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completion_date TIMESTAMP NULL,
  status ENUM('pending', 'enrolled', 'in_progress', 'completed', 'dropped', 'rejected') NOT NULL DEFAULT 'pending',
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  approved_by INT(11) NULL,
  approved_at TIMESTAMP NULL,
  rejection_reason TEXT NULL,
  student_seen TINYINT(1) NOT NULL DEFAULT 0,
  management_message TEXT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_course_student (course_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course modules table
CREATE TABLE IF NOT EXISTS course_modules (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  course_id INT(11) NOT NULL,
  module_name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance (IF NOT EXISTS to avoid duplicates)
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_subcategory ON courses(subcategory);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_course_teachers_course ON course_teachers(course_id);
CREATE INDEX IF NOT EXISTS idx_course_teachers_teacher ON course_teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_pending ON course_enrollments(status, enrollment_date);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_seen ON course_enrollments(student_id, student_seen);
CREATE INDEX IF NOT EXISTS idx_modules_course ON course_modules(course_id);
