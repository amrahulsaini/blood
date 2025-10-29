-- ==========================================
-- BLOOD DONATION SYSTEM - DATABASE SCHEMA
-- TheLifeSaviours Platform
-- ==========================================

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS `donor_messages`;
DROP TABLE IF EXISTS `blood_requests`;
DROP TABLE IF EXISTS `donor_entries`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `community_posts`;
DROP TABLE IF EXISTS `current_orders`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `donor_certificates`;

-- ==========================================
-- USERS TABLE
-- ==========================================
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20),
  `role` ENUM('donor', 'recipient', 'admin', 'partner') DEFAULT 'donor',
  `profile_image` VARCHAR(500),
  `is_verified` BOOLEAN DEFAULT FALSE,
  `verification_token` VARCHAR(255),
  `reset_token` VARCHAR(255),
  `reset_token_expiry` DATETIME,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- DONOR ENTRIES TABLE
-- ==========================================
CREATE TABLE `donor_entries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  `age` INT NOT NULL,
  `weight` DECIMAL(5,2),
  `gender` ENUM('Male', 'Female', 'Other') NOT NULL,
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `pincode` VARCHAR(10) NOT NULL,
  `last_donation_date` DATE,
  `medical_conditions` TEXT,
  `is_available` BOOLEAN DEFAULT TRUE,
  `total_donations` INT DEFAULT 0,
  `latitude` DECIMAL(10, 8),
  `longitude` DECIMAL(11, 8),
  `status` ENUM('pending', 'approved', 'rejected', 'inactive') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_blood_group` (`blood_group`),
  INDEX `idx_city` (`city`),
  INDEX `idx_status` (`status`),
  INDEX `idx_available` (`is_available`),
  INDEX `idx_location` (`latitude`, `longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- BLOOD REQUESTS TABLE
-- ==========================================
CREATE TABLE `blood_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `patient_name` VARCHAR(255) NOT NULL,
  `requester_name` VARCHAR(255) NOT NULL,
  `requester_email` VARCHAR(255) NOT NULL,
  `requester_phone` VARCHAR(20) NOT NULL,
  `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  `units_needed` INT NOT NULL,
  `hospital_name` VARCHAR(255) NOT NULL,
  `hospital_address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `pincode` VARCHAR(10) NOT NULL,
  `urgency` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  `required_date` DATE NOT NULL,
  `reason` TEXT,
  `additional_notes` TEXT,
  `latitude` DECIMAL(10, 8),
  `longitude` DECIMAL(11, 8),
  `status` ENUM('pending', 'in_progress', 'fulfilled', 'cancelled', 'expired') DEFAULT 'pending',
  `fulfilled_date` DATETIME,
  `matched_donors` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_blood_group` (`blood_group`),
  INDEX `idx_status` (`status`),
  INDEX `idx_urgency` (`urgency`),
  INDEX `idx_required_date` (`required_date`),
  INDEX `idx_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- DONOR MESSAGES TABLE
-- ==========================================
CREATE TABLE `donor_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `request_id` INT NOT NULL,
  `donor_id` INT,
  `donor_name` VARCHAR(255) NOT NULL,
  `donor_email` VARCHAR(255) NOT NULL,
  `donor_phone` VARCHAR(20) NOT NULL,
  `message` TEXT,
  `willing_to_donate` BOOLEAN DEFAULT TRUE,
  `preferred_date` DATE,
  `status` ENUM('pending', 'accepted', 'declined', 'completed') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`request_id`) REFERENCES `blood_requests`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`donor_id`) REFERENCES `donor_entries`(`id`) ON DELETE SET NULL,
  INDEX `idx_request_id` (`request_id`),
  INDEX `idx_donor_id` (`donor_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- CURRENT ORDERS TABLE
-- ==========================================
CREATE TABLE `current_orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `request_id` INT NOT NULL,
  `donor_id` INT,
  `order_number` VARCHAR(50) UNIQUE NOT NULL,
  `patient_name` VARCHAR(255) NOT NULL,
  `donor_name` VARCHAR(255),
  `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  `units` INT NOT NULL,
  `hospital_name` VARCHAR(255) NOT NULL,
  `donation_date` DATE NOT NULL,
  `donation_time` TIME,
  `status` ENUM('scheduled', 'in_transit', 'donated', 'completed', 'cancelled') DEFAULT 'scheduled',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`request_id`) REFERENCES `blood_requests`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`donor_id`) REFERENCES `donor_entries`(`id`) ON DELETE SET NULL,
  INDEX `idx_order_number` (`order_number`),
  INDEX `idx_status` (`status`),
  INDEX `idx_donation_date` (`donation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- COMMUNITY POSTS TABLE
-- ==========================================
CREATE TABLE `community_posts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `author_name` VARCHAR(255) NOT NULL,
  `author_email` VARCHAR(255) NOT NULL,
  `title` VARCHAR(500) NOT NULL,
  `content` TEXT NOT NULL,
  `post_type` ENUM('story', 'announcement', 'event', 'achievement', 'general') DEFAULT 'general',
  `image_url` VARCHAR(500),
  `likes_count` INT DEFAULT 0,
  `comments_count` INT DEFAULT 0,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `is_published` BOOLEAN DEFAULT TRUE,
  `tags` JSON,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `idx_post_type` (`post_type`),
  INDEX `idx_is_published` (`is_published`),
  INDEX `idx_is_featured` (`is_featured`),
  FULLTEXT INDEX `idx_title_content` (`title`, `content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- NOTIFICATIONS TABLE
-- ==========================================
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('request_match', 'donation_scheduled', 'donation_reminder', 'request_fulfilled', 'system', 'urgent') DEFAULT 'system',
  `related_id` INT,
  `related_type` ENUM('blood_request', 'donor_entry', 'current_order', 'community_post'),
  `is_read` BOOLEAN DEFAULT FALSE,
  `priority` ENUM('low', 'medium', 'high') DEFAULT 'medium',
  `action_url` VARCHAR(500),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `read_at` TIMESTAMP NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- DONOR CERTIFICATES TABLE
-- ==========================================
CREATE TABLE `donor_certificates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `donor_id` INT NOT NULL,
  `order_id` INT,
  `certificate_number` VARCHAR(100) UNIQUE NOT NULL,
  `donor_name` VARCHAR(255) NOT NULL,
  `blood_group` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
  `donation_date` DATE NOT NULL,
  `hospital_name` VARCHAR(255),
  `units_donated` INT DEFAULT 1,
  `certificate_url` VARCHAR(500),
  `issued_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `expires_at` DATE,
  FOREIGN KEY (`donor_id`) REFERENCES `donor_entries`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`order_id`) REFERENCES `current_orders`(`id`) ON DELETE SET NULL,
  INDEX `idx_donor_id` (`donor_id`),
  INDEX `idx_certificate_number` (`certificate_number`),
  INDEX `idx_donation_date` (`donation_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- INITIAL SAMPLE DATA (Optional)
-- ==========================================

-- Insert sample admin user (password: admin123 - hashed with bcrypt)
INSERT INTO `users` (`email`, `password`, `full_name`, `role`, `is_verified`) VALUES
('admin@thelifesaviours.com', '$2b$10$YourHashedPasswordHere', 'Admin User', 'admin', TRUE);

-- ==========================================
-- VIEWS FOR REPORTING
-- ==========================================

-- View: Active Donors by Blood Group
CREATE OR REPLACE VIEW `active_donors_by_blood_group` AS
SELECT 
  blood_group,
  COUNT(*) as total_donors,
  SUM(CASE WHEN is_available = TRUE THEN 1 ELSE 0 END) as available_donors,
  city,
  state
FROM donor_entries
WHERE status = 'approved'
GROUP BY blood_group, city, state;

-- View: Pending Blood Requests
CREATE OR REPLACE VIEW `pending_blood_requests` AS
SELECT 
  br.*,
  DATEDIFF(br.required_date, CURDATE()) as days_until_required,
  (SELECT COUNT(*) FROM donor_messages dm WHERE dm.request_id = br.id) as response_count
FROM blood_requests br
WHERE br.status = 'pending' OR br.status = 'in_progress'
ORDER BY 
  CASE br.urgency
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  br.required_date ASC;

-- View: Donation Statistics
CREATE OR REPLACE VIEW `donation_statistics` AS
SELECT 
  COUNT(DISTINCT de.id) as total_donors,
  SUM(de.total_donations) as total_donations,
  COUNT(DISTINCT br.id) as total_requests,
  SUM(CASE WHEN br.status = 'fulfilled' THEN 1 ELSE 0 END) as fulfilled_requests,
  COUNT(DISTINCT co.id) as total_orders,
  SUM(CASE WHEN co.status = 'completed' THEN 1 ELSE 0 END) as completed_donations
FROM donor_entries de
LEFT JOIN blood_requests br ON 1=1
LEFT JOIN current_orders co ON 1=1;

-- ==========================================
-- STORED PROCEDURES
-- ==========================================

-- Procedure: Match Donors to Request
DELIMITER //
CREATE PROCEDURE `match_donors_to_request`(IN request_id_param INT)
BEGIN
  DECLARE request_blood_group VARCHAR(5);
  DECLARE request_city VARCHAR(100);
  
  SELECT blood_group, city INTO request_blood_group, request_city
  FROM blood_requests
  WHERE id = request_id_param;
  
  SELECT de.*,
    (6371 * acos(
      cos(radians(br.latitude)) * 
      cos(radians(de.latitude)) * 
      cos(radians(de.longitude) - radians(br.longitude)) + 
      sin(radians(br.latitude)) * 
      sin(radians(de.latitude))
    )) AS distance_km
  FROM donor_entries de
  CROSS JOIN blood_requests br
  WHERE br.id = request_id_param
    AND de.blood_group = request_blood_group
    AND de.is_available = TRUE
    AND de.status = 'approved'
    AND (de.last_donation_date IS NULL OR 
         DATEDIFF(CURDATE(), de.last_donation_date) >= 90)
  ORDER BY distance_km ASC
  LIMIT 50;
END //
DELIMITER ;

-- Procedure: Update Donor Statistics
DELIMITER //
CREATE PROCEDURE `update_donor_statistics`(IN donor_id_param INT)
BEGIN
  UPDATE donor_entries
  SET total_donations = (
    SELECT COUNT(*)
    FROM current_orders
    WHERE donor_id = donor_id_param
      AND status = 'completed'
  )
  WHERE id = donor_id_param;
END //
DELIMITER ;

-- ==========================================
-- TRIGGERS
-- ==========================================

-- Trigger: Generate Order Number
DELIMITER //
CREATE TRIGGER `generate_order_number` BEFORE INSERT ON `current_orders`
FOR EACH ROW
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    SET NEW.order_number = CONCAT('ORD', YEAR(NOW()), LPAD(FLOOR(RAND() * 999999), 6, '0'));
  END IF;
END //
DELIMITER ;

-- Trigger: Generate Certificate Number
DELIMITER //
CREATE TRIGGER `generate_certificate_number` BEFORE INSERT ON `donor_certificates`
FOR EACH ROW
BEGIN
  IF NEW.certificate_number IS NULL OR NEW.certificate_number = '' THEN
    SET NEW.certificate_number = CONCAT('CERT', YEAR(NOW()), LPAD(FLOOR(RAND() * 999999), 6, '0'));
  END IF;
END //
DELIMITER ;

-- Trigger: Update Request Status When Fulfilled
DELIMITER //
CREATE TRIGGER `update_request_status` AFTER INSERT ON `current_orders`
FOR EACH ROW
BEGIN
  UPDATE blood_requests
  SET status = 'in_progress'
  WHERE id = NEW.request_id
    AND status = 'pending';
END //
DELIMITER ;

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Additional composite indexes for common queries
CREATE INDEX `idx_donor_blood_city` ON `donor_entries`(`blood_group`, `city`, `is_available`);
CREATE INDEX `idx_request_blood_urgency` ON `blood_requests`(`blood_group`, `urgency`, `status`);
CREATE INDEX `idx_notification_user_unread` ON `notifications`(`user_id`, `is_read`, `created_at`);

-- ==========================================
-- SCHEMA COMPLETE
-- ==========================================
