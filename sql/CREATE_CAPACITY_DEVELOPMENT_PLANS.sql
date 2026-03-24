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
