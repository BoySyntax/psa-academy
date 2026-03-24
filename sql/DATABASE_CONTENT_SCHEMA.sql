-- MySQL schema for course content (lessons and materials)

-- Course lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  module_id INT(11) NOT NULL,
  lesson_title VARCHAR(255) NOT NULL,
  lesson_content TEXT,
  lesson_type ENUM('video', 'document', 'quiz', 'assignment', 'reading') NOT NULL DEFAULT 'reading',
  duration_minutes INT,
  order_index INT NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Learning materials table (files, videos, documents)
CREATE TABLE IF NOT EXISTS learning_materials (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  lesson_id INT(11),
  course_id INT(11),
  material_name VARCHAR(255) NOT NULL,
  material_type ENUM('pdf', 'video', 'image', 'document', 'link', 'other') NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size INT,
  description TEXT,
  uploaded_by INT(11),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student lesson progress tracking
CREATE TABLE IF NOT EXISTS lesson_progress (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  student_id INT(11) NOT NULL,
  lesson_id INT(11) NOT NULL,
  status ENUM('not_started', 'in_progress', 'completed') NOT NULL DEFAULT 'not_started',
  progress_percentage DECIMAL(5,2) DEFAULT 0.00,
  time_spent_minutes INT DEFAULT 0,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
  UNIQUE KEY unique_student_lesson (student_id, lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX idx_lessons_module ON course_lessons(module_id);
CREATE INDEX idx_lessons_type ON course_lessons(lesson_type);
CREATE INDEX idx_lessons_published ON course_lessons(is_published);
CREATE INDEX idx_materials_lesson ON learning_materials(lesson_id);
CREATE INDEX idx_materials_course ON learning_materials(course_id);
CREATE INDEX idx_materials_type ON learning_materials(material_type);
CREATE INDEX idx_progress_student ON lesson_progress(student_id);
CREATE INDEX idx_progress_lesson ON lesson_progress(lesson_id);
CREATE INDEX idx_progress_status ON lesson_progress(status);
