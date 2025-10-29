# Donor Entries Database Schema

## Table: `donor_entries`

This table stores all blood donor registrations from the donor registration form.

### SQL Schema

```sql
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
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | INT | Auto | Unique identifier for each donor |
| `full_name` | VARCHAR(255) | Yes | Donor's full name |
| `email` | VARCHAR(255) | Yes | Unique email address |
| `phone` | VARCHAR(20) | Yes | Unique mobile number |
| `age` | INT | Yes | Donor's age |
| `gender` | ENUM | No | Male/Female/Other (default: Male) |
| `blood_group` | ENUM | Yes | Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-, or "I don't know") |
| `donor_type` | ENUM | Yes | Type of donation: 'blood', 'sdp', or 'both' |
| `batch` | VARCHAR(20) | No | Academic batch (e.g., 2025-2029) |
| `address` | TEXT | Yes | Complete address |
| `city` | VARCHAR(100) | No | City name (default: Delhi) |
| `state` | VARCHAR(100) | No | State name (default: Delhi) |
| `pincode` | VARCHAR(10) | No | Postal code (default: 000000) |
| `is_available` | BOOLEAN | No | Availability status (default: TRUE) |
| `status` | ENUM | No | Approval status: pending/approved/rejected/inactive |
| `last_donation_date` | DATE | No | Date of last blood donation |
| `created_at` | TIMESTAMP | Auto | Registration timestamp |
| `updated_at` | TIMESTAMP | Auto | Last update timestamp |

### Donor Type Values

- **`blood`** - Blood Donor (whole blood donation)
- **`sdp`** - SDP Donor (Single Donor Platelet)
- **`both`** - Both SDP & Blood Donor

### Status Values

- **`pending`** - Awaiting admin approval
- **`approved`** - Active and can donate
- **`rejected`** - Registration rejected
- **`inactive`** - Previously active but now inactive

### Sample Data Insert

```sql
INSERT INTO donor_entries 
  (full_name, email, phone, age, gender, blood_group, donor_type, batch, address, city, state, pincode, is_available, status) 
VALUES 
  ('Rahul Saini', 'rahul@example.com', '9876543210', 21, 'Male', 'O+', 'both', '2024-2028', 'Room 101, Hostel A, University Campus', 'Delhi', 'Delhi', '110001', TRUE, 'approved'),
  ('Priya Sharma', 'priya@example.com', '9876543211', 20, 'Female', 'A+', 'blood', '2025-2029', 'Room 205, Hostel B, University Campus', 'Delhi', 'Delhi', '110001', TRUE, 'approved');
```

### Common Queries

#### 1. Get all available donors by blood group
```sql
SELECT * FROM donor_entries 
WHERE blood_group = 'O+' 
  AND is_available = TRUE 
  AND status = 'approved'
ORDER BY created_at DESC;
```

#### 2. Check if email or phone already exists
```sql
SELECT email, phone FROM donor_entries 
WHERE email = 'test@example.com' OR phone = '9876543210';
```

#### 3. Get donors who can donate to a specific blood group (with compatibility)
```sql
-- For blood group compatibility, you'll need to implement logic
-- O- can donate to all
-- O+ can donate to O+, A+, B+, AB+
-- A- can donate to A-, A+, AB-, AB+
-- etc.

-- Example: Get all compatible donors for A+ recipient
SELECT * FROM donor_entries 
WHERE blood_group IN ('O-', 'O+', 'A-', 'A+')
  AND is_available = TRUE 
  AND status = 'approved';
```

#### 4. Update donor availability
```sql
UPDATE donor_entries 
SET is_available = FALSE, 
    last_donation_date = CURDATE() 
WHERE id = 1;
```

#### 5. Get donor statistics
```sql
SELECT 
  blood_group, 
  donor_type,
  COUNT(*) as donor_count,
  SUM(is_available) as available_count
FROM donor_entries 
WHERE status = 'approved'
GROUP BY blood_group, donor_type;
```

### TypeScript Interface

```typescript
export interface DonorEntry {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | "I don't know my blood group";
  donor_type: 'blood' | 'sdp' | 'both';
  batch: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  is_available: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  last_donation_date: string | null;
  created_at: string;
  updated_at: string;
}
```

### Migration Notes

If you're migrating from JSON to database:

1. **Backup JSON file** first
2. **Run the CREATE TABLE** query
3. **Import existing data**:
   ```sql
   -- You can use a migration script to read JSON and insert
   -- Or manually insert important records
   ```
4. **Update API routes** to use database queries instead of file operations
5. **Test all CRUD operations** thoroughly

### Indexes Explained

- **idx_email, idx_phone**: Fast lookup for duplicate checking during registration
- **idx_blood_group**: Quick filtering by blood type
- **idx_donor_type**: Filter by donation type
- **idx_status**: Filter active/inactive donors
- **idx_is_available**: Find available donors quickly
- **idx_created_at**: Sort by registration date

### Future Enhancements

Consider adding:
- **Notification preferences** (email, SMS, WhatsApp)
- **Medical history** (separate table with FK)
- **Donation history** (separate table tracking each donation)
- **Certificate tracking** (link to donor_certificates table)
- **Emergency contact** information
- **Preferred hospital** locations
- **Weight and hemoglobin** levels (for eligibility)

---

**Database**: `thel_blood`  
**Collation**: `utf8mb4_unicode_ci`  
**Engine**: InnoDB  
**Auto Increment**: Yes (id field)
