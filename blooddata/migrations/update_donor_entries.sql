-- Update Donor Entries Table
-- This will modify the existing table structure to match our app requirements

USE thel_blood;

-- Step 1: Modify blood_group to include "I don't know my blood group"
ALTER TABLE `donor_entries` 
MODIFY COLUMN `blood_group` ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-',"I don't know my blood group") NOT NULL;

-- Step 2: Make email and phone UNIQUE if not already
ALTER TABLE `donor_entries` 
ADD UNIQUE KEY `unique_email` (`email`);

ALTER TABLE `donor_entries` 
ADD UNIQUE KEY `unique_phone` (`phone`);

-- Step 3: Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email ON donor_entries(email);
CREATE INDEX IF NOT EXISTS idx_phone ON donor_entries(phone);
CREATE INDEX IF NOT EXISTS idx_donor_type ON donor_entries(donor_type);
CREATE INDEX IF NOT EXISTS idx_created_at ON donor_entries(created_at);

-- Verify the changes
DESCRIBE donor_entries;

-- Show sample of data
SELECT * FROM donor_entries ORDER BY created_at DESC LIMIT 5;
