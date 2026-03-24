-- Add module tests (pre-test and post-test) functionality
-- Run this migration to add test tables to the database

-- Module tests table (stores pre-test and post-test for each module)
CREATE TABLE IF NOT EXISTS module_tests (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  module_id INT(11) NOT NULL,
  test_type ENUM('pre_test', 'post_test') NOT NULL,
  test_title VARCHAR(255) NOT NULL,
  description TEXT,
  passing_score INT DEFAULT 70,
  time_limit_minutes INT DEFAULT NULL,
  is_published TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
  UNIQUE KEY unique_module_test_type (module_id, test_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Test questions table
CREATE TABLE IF NOT EXISTS test_questions (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  test_id INT(11) NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL DEFAULT 'multiple_choice',
  points INT DEFAULT 1,
  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (test_id) REFERENCES module_tests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Question answer options table (for multiple choice and true/false)
CREATE TABLE IF NOT EXISTS question_answers (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  question_id INT(11) NOT NULL,
  answer_text TEXT NOT NULL,
  is_correct TINYINT(1) DEFAULT 0,
  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES test_questions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student test attempts table
CREATE TABLE IF NOT EXISTS student_test_attempts (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  test_id INT(11) NOT NULL,
  student_id INT(11) NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  score DECIMAL(5,2) DEFAULT NULL,
  passed TINYINT(1) DEFAULT NULL,
  time_taken_minutes INT DEFAULT NULL,
  FOREIGN KEY (test_id) REFERENCES module_tests(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_student_test (student_id, test_id),
  INDEX idx_test_student (test_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Student answers table
CREATE TABLE IF NOT EXISTS student_test_answers (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  attempt_id INT(11) NOT NULL,
  question_id INT(11) NOT NULL,
  selected_answer_id INT(11) NULL,
  answer_text TEXT NULL,
  is_correct TINYINT(1) DEFAULT NULL,
  points_earned DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (attempt_id) REFERENCES student_test_attempts(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES test_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (selected_answer_id) REFERENCES question_answers(id) ON DELETE SET NULL,
  UNIQUE KEY unique_attempt_question (attempt_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_module_tests_module ON module_tests(module_id);
CREATE INDEX IF NOT EXISTS idx_module_tests_type ON module_tests(test_type);
CREATE INDEX IF NOT EXISTS idx_test_questions_test ON test_questions(test_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_question ON question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_student_attempts_student ON student_test_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attempts_test ON student_test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_attempt ON student_test_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_question ON student_test_answers(question_id);
