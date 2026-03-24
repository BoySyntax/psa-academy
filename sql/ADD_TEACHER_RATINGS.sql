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
);
