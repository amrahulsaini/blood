# Blood Donation System - Database Setup

## Database Credentials

```
DB_HOST: localhost
DB_USER: thel_blood
DB_PASS: blood
DB_NAME: thel_blood
DB_PORT: 3306
```

## Setup Instructions

### 1. Create Database User and Database

Run these commands in your MySQL server:

```sql
-- Create database user
CREATE USER 'thel_blood'@'localhost' IDENTIFIED BY 'blood';

-- Create database
CREATE DATABASE thel_blood CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges
GRANT ALL PRIVILEGES ON thel_blood.* TO 'thel_blood'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Import Schema

Execute the schema file to create all tables:

```bash
mysql -u thel_blood -p thel_blood < database/schema.sql
```

Or use your MySQL client to run the `schema.sql` file.

### 3. Verify Installation

Check that all tables were created:

```sql
USE thel_blood;
SHOW TABLES;
```

You should see the following tables:
- `users`
- `donor_entries`
- `blood_requests`
- `donor_messages`
- `current_orders`
- `community_posts`
- `notifications`
- `donor_certificates`

## Database Schema Overview

### Tables

1. **users** - User accounts (donors, recipients, admins, partners)
2. **donor_entries** - Registered blood donors with their details
3. **blood_requests** - Blood donation requests from recipients
4. **donor_messages** - Communication between donors and requesters
5. **current_orders** - Active donation orders/appointments
6. **community_posts** - Community stories and announcements
7. **notifications** - User notifications
8. **donor_certificates** - Digital certificates for donors

### Views

- `active_donors_by_blood_group` - Statistics of active donors
- `pending_blood_requests` - All pending requests with urgency
- `donation_statistics` - Overall platform statistics

### Stored Procedures

- `match_donors_to_request(request_id)` - Find matching donors for a request
- `update_donor_statistics(donor_id)` - Update donor's donation count

### Triggers

- Auto-generate order numbers for current_orders
- Auto-generate certificate numbers for donor_certificates
- Auto-update request status when order is created

## Environment Variables

The database configuration is stored in `.env.local`:

```env
DB_HOST=localhost
DB_USER=thel_blood
DB_PASS=blood
DB_NAME=thel_blood
DB_PORT=3306
```

## Database Connection

The database connection is managed through `lib/db.ts` which provides:

- Connection pooling
- Query helper functions
- TypeScript type definitions
- Connection testing utilities

### Usage Example

```typescript
import { query, testConnection } from '@/lib/db';

// Test connection
await testConnection();

// Execute query
const donors = await query('SELECT * FROM donor_entries WHERE blood_group = ?', ['O+']);

// Insert data
await query(
  'INSERT INTO donor_entries (full_name, email, phone, blood_group) VALUES (?, ?, ?, ?)',
  ['John Doe', 'john@example.com', '1234567890', 'O+']
);
```

## Security Notes

1. Change default passwords in production
2. Use environment variables for sensitive data
3. Enable SSL/TLS for database connections in production
4. Regularly backup your database
5. Implement proper user authentication before going live

## Testing Connection

After setup, test the connection by running:

```bash
npm run dev
```

Then visit: http://localhost:3000/api/test-db (create this endpoint to test)

## Maintenance

### Backup Database

```bash
mysqldump -u thel_blood -p thel_blood > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
mysql -u thel_blood -p thel_blood < backup_file.sql
```

## Support

For issues or questions:
- Check error logs in console
- Verify database credentials
- Ensure MySQL server is running
- Check connection pool settings in `lib/db.ts`
