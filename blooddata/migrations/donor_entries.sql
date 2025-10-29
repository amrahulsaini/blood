-- Donor Entries Table Migration
-- Database: thel_blood
-- Run this to create or update the donor_entries table

-- Drop existing table if you want a fresh start (BE CAREFUL - THIS DELETES DATA!)
-- DROP TABLE IF EXISTS donor_entries;

-- Create donor_entries table
CREATE TABLE IF NOT EXISTS donor_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Personal Information
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  age INT NOT NULL,
  gender ENUM('Male', 'Female', 'Other') DEFAULT 'Male',
  
  -- Blood Information
  blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', "I don't know my blood group") NOT NULL,
  donor_type ENUM('blood', 'sdp', 'both') NOT NULL COMMENT 'blood = Blood Donor, sdp = SDP Donor, both = Both',
  
  -- Academic Information (for student donors)
  batch VARCHAR(20) NULL COMMENT 'e.g., 2025-2029, 2024-2028',
  
  -- Location Information
  address TEXT NOT NULL,
  city VARCHAR(100) DEFAULT 'Delhi',
  state VARCHAR(100) DEFAULT 'Delhi',
  pincode VARCHAR(10) DEFAULT '000000',
  
  -- Availability & Status
  is_available BOOLEAN DEFAULT TRUE COMMENT 'Whether donor is currently available to donate',
  status ENUM('pending', 'approved', 'rejected', 'inactive') DEFAULT 'approved',
  
  -- Last Donation Tracking
  last_donation_date DATE NULL COMMENT 'Track when they last donated',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for faster queries
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_blood_group (blood_group),
  INDEX idx_donor_type (donor_type),
  INDEX idx_status (status),
  INDEX idx_is_available (is_available),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- If table already exists and you need to add missing columns, use ALTER TABLE:

-- Add donor_type column if it doesn't exist
ALTER TABLE donor_entries 
ADD COLUMN IF NOT EXISTS donor_type ENUM('blood', 'sdp', 'both') NOT NULL DEFAULT 'blood' 
COMMENT 'blood = Blood Donor, sdp = SDP Donor, both = Both' 
AFTER blood_group;

-- Add batch column if it doesn't exist
ALTER TABLE donor_entries 
ADD COLUMN IF NOT EXISTS batch VARCHAR(20) NULL 
COMMENT 'e.g., 2025-2029, 2024-2028' 
AFTER donor_type;

-- Add last_donation_date if it doesn't exist
ALTER TABLE donor_entries 
ADD COLUMN IF NOT EXISTS last_donation_date DATE NULL 
COMMENT 'Track when they last donated' 
AFTER status;

-- Verify the table structure
DESCRIBE donor_entries;

-- Sample test data (optional - remove or modify as needed)
-- INSERT INTO donor_entries 
--   (full_name, email, phone, age, gender, blood_group, donor_type, batch, address, city, state, pincode, is_available, status) 
-- VALUES 
--   ('Test Donor', 'test@example.com', '9999999999', 21, 'Male', 'O+', 'both', '2024-2028', 'Test Address, Delhi', 'Delhi', 'Delhi', '110001', TRUE, 'approved');

-- Check if data was inserted
-- SELECT * FROM donor_entries ORDER BY created_at DESC LIMIT 5;
