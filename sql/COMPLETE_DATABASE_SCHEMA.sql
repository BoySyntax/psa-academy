-- Complete PSA Academy Database Schema
-- Generated from phpMyAdmin structure and existing SQL files

-- Users table (core authentication and profile data)
CREATE TABLE IF NOT EXISTS users (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  user_type ENUM('student', 'teacher', 'admin', 'management') NOT NULL DEFAULT 'student',
  
  -- Personal Information
  first_name VARCHAR(255) NOT NULL,
  middle_name VARCHAR(255),
  last_name VARCHAR(255) NOT NULL,
  suffix VARCHAR(50),
  date_of_birth DATE NOT NULL,
  sex ENUM('male', 'female', 'other') NOT NULL,
  blood_type VARCHAR(10),
  civil_status VARCHAR(50) NOT NULL,
  type_of_disability VARCHAR(100),
  religion VARCHAR(100),
  educational_attainment VARCHAR(100) NOT NULL,
  
  -- Address
  house_no_and_street VARCHAR(500) NOT NULL,
  barangay VARCHAR(255) NOT NULL,
  municipality VARCHAR(255) NOT NULL,
  province VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,
  
  -- Contact Information
  cellphone_number VARCHAR(20) NOT NULL,
  
  -- Employment Details
  type_of_employment VARCHAR(100),
  civil_service_eligibility_level VARCHAR(100),
  salary_grade VARCHAR(50),
  present_position VARCHAR(255),
  office VARCHAR(255),
  service VARCHAR(255),
  division_province VARCHAR(255),
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_relationship VARCHAR(100),
  emergency_contact_address VARCHAR(500),
  emergency_contact_number VARCHAR(20),
  emergency_contact_email VARCHAR(255),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

-- Course enrollments table
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

-- Capacity Development Plans table
CREATE TABLE IF NOT EXISTS capacity_development_plans (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  plan_year INT NOT NULL,
  course_id INT(11) NOT NULL,
  proposed_training_schedule VARCHAR(255) DEFAULT NULL,
  target_participants TEXT DEFAULT NULL,
  estimated_participants INT DEFAULT NULL,
  status_notes TEXT DEFAULT NULL,
  created_by INT(11) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cdp_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_cdp_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_cdp_year_course (plan_year, course_id),
  INDEX idx_cdp_plan_year (plan_year),
  INDEX idx_cdp_course_id (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Teacher Ratings table
CREATE TABLE IF NOT EXISTS teacher_ratings (
  id INT(11) PRIMARY KEY AUTO_INCREMENT,
  user_id INT(11) NOT NULL,
  course_id INT(11) NOT NULL,
  teacher_id INT(11) NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_teacher_ratings_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_teacher_ratings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_teacher_ratings_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_teacher_ratings_teacher FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_teacher_rating (user_id, course_id, teacher_id),
  KEY idx_teacher_ratings_teacher (teacher_id),
  KEY idx_teacher_ratings_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Skill Audit table (SATNA - Skill Audit and Training Needs Assessment)
CREATE TABLE IF NOT EXISTS skill_audit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  year INT NOT NULL,
  audit_data LONGTEXT NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_skill_audit_user_year (user_id, year),
  CONSTRAINT fk_skill_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Career Leverage Inventory table (CLI)
CREATE TABLE IF NOT EXISTS career_leverage_inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  year INT NOT NULL,
  cli_data LONGTEXT NOT NULL,
  submitted_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_cli_user_year (user_id, year),
  KEY idx_cli_year (year),
  CONSTRAINT fk_cli_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Individual Development Plan table (IDP)
CREATE TABLE IF NOT EXISTS individual_development_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  year INT NOT NULL,
  idp_data LONGTEXT NOT NULL,
  submitted_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_idp_user_year (user_id, year),
  KEY idx_idp_year (year),
  CONSTRAINT fk_idp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Training Evaluations table
CREATE TABLE IF NOT EXISTS training_evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  evaluation_data LONGTEXT NOT NULL,
  level_1_data TEXT NULL,
  level_2_data TEXT NULL,
  level_3_data TEXT NULL,
  training_objectives TEXT NULL,
  submitted_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_training_eval_user_course (user_id, course_id),
  CONSTRAINT fk_training_eval_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_training_eval_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Course Content table
CREATE TABLE IF NOT EXISTS course_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT NOT NULL,
  content_type ENUM('video', 'document', 'image', 'link', 'quiz', 'assignment') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  file_url VARCHAR(500) NULL,
  content_data LONGTEXT NULL,
  order_index INT NOT NULL DEFAULT 0,
  is_required TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_course_content_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
  is_read TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_office ON users(office);
CREATE INDEX IF NOT EXISTS idx_users_service ON users(service);
CREATE INDEX IF NOT EXISTS idx_users_division_province ON users(division_province);

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
CREATE INDEX IF NOT EXISTS idx_enrollments_completion ON course_enrollments(course_id, status, completion_date);

CREATE INDEX IF NOT EXISTS idx_modules_course ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_modules_order ON course_modules(course_id, order_index);

CREATE INDEX IF NOT EXISTS idx_content_course ON course_content(course_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON course_content(content_type);
CREATE INDEX IF NOT EXISTS idx_content_order ON course_content(course_id, order_index);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_evaluations_user ON training_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_course ON training_evaluations(course_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_submitted ON training_evaluations(submitted_at);

-- Create foreign key constraints for tables that might be missing them
ALTER TABLE skill_audit ADD CONSTRAINT fk_skill_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE career_leverage_inventory ADD CONSTRAINT fk_cli_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE individual_development_plans ADD CONSTRAINT fk_idp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE training_evaluations ADD CONSTRAINT fk_training_eval_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE training_evaluations ADD CONSTRAINT fk_training_eval_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE course_content ADD CONSTRAINT fk_course_content_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
