-- Donor Entries Table Migration
-- Database: thel_blood
-- Run this to create or update the donor_entries table

-- Step 1: Create table if it doesn't exist (with basic structure)
CREATE TABLE IF NOT EXISTS donor_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  age INT NOT NULL,
  gender ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
  blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', "I don't know my blood group") NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) DEFAULT 'Delhi',
  state VARCHAR(100) DEFAULT 'Delhi',
  pincode VARCHAR(10) DEFAULT '000000',
  is_available BOOLEAN DEFAULT TRUE,
  status ENUM('pending', 'approved', 'rejected', 'inactive') DEFAULT 'approved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Add new columns if they don't exist
-- Add donor_type column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'thel_blood' 
                   AND TABLE_NAME = 'donor_entries' 
                   AND COLUMN_NAME = 'donor_type');

SET @sql = IF(@col_exists = 0, 
              'ALTER TABLE donor_entries ADD COLUMN donor_type ENUM(\'blood\', \'sdp\', \'both\') NOT NULL DEFAULT \'blood\' COMMENT \'blood = Blood Donor, sdp = SDP Donor, both = Both\' AFTER blood_group',
              'SELECT "Column donor_type already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add batch column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'thel_blood' 
                   AND TABLE_NAME = 'donor_entries' 
                   AND COLUMN_NAME = 'batch');

SET @sql = IF(@col_exists = 0, 
              'ALTER TABLE donor_entries ADD COLUMN batch VARCHAR(20) NULL COMMENT \'e.g., 2025-2029, 2024-2028\' AFTER donor_type',
              'SELECT "Column batch already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add last_donation_date column
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'thel_blood' 
                   AND TABLE_NAME = 'donor_entries' 
                   AND COLUMN_NAME = 'last_donation_date');

SET @sql = IF(@col_exists = 0, 
              'ALTER TABLE donor_entries ADD COLUMN last_donation_date DATE NULL COMMENT \'Track when they last donated\' AFTER status',
              'SELECT "Column last_donation_date already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_email ON donor_entries(email);
CREATE INDEX IF NOT EXISTS idx_phone ON donor_entries(phone);
CREATE INDEX IF NOT EXISTS idx_blood_group ON donor_entries(blood_group);
CREATE INDEX IF NOT EXISTS idx_donor_type ON donor_entries(donor_type);
CREATE INDEX IF NOT EXISTS idx_status ON donor_entries(status);
CREATE INDEX IF NOT EXISTS idx_is_available ON donor_entries(is_available);
CREATE INDEX IF NOT EXISTS idx_created_at ON donor_entries(created_at);

-- Step 4: Verify the table structure
DESCRIBE donor_entries;

-- Sample test data (optional - remove or modify as needed)
-- INSERT INTO donor_entries 
--   (full_name, email, phone, age, gender, blood_group, donor_type, batch, address, city, state, pincode, is_available, status) 
-- VALUES 
--   ('Test Donor', 'test@example.com', '9999999999', 21, 'Male', 'O+', 'both', '2024-2028', 'Test Address, Delhi', 'Delhi', 'Delhi', '110001', TRUE, 'approved');

-- Check if data was inserted
-- SELECT * FROM donor_entries ORDER BY created_at DESC LIMIT 5;
