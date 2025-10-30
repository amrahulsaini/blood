-- Check if age column exists
DESCRIBE blood_requests;

-- Check current age values
SELECT id, patient_name, blood_group, age, created_at 
FROM blood_requests 
ORDER BY created_at DESC 
LIMIT 10;

-- Update all records with age = 0 to a default value of 25
UPDATE blood_requests 
SET age = 25 
WHERE age = 0 OR age IS NULL;

-- Verify the update
SELECT id, patient_name, blood_group, age, created_at 
FROM blood_requests 
ORDER BY created_at DESC 
LIMIT 10;
