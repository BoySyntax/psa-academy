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
);
