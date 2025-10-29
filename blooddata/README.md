# Blood Data Storage

This directory contains JSON files that store all application data.

## File Structure

### 1. `blood_donors.json`
Stores all blood donor registrations.

**Structure:**
```json
{
  "id": "DONOR-1234567890-abc123",
  "fullName": "John Doe",
  "batch": "2025-2029",
  "age": "21",
  "bloodGroup": "O+",
  "donorType": "both",
  "address": "123 Main St, City",
  "email": "john@example.com",
  "mobile": "9876543210",
  "timestamp": "2025-10-29T10:30:00.000Z",
  "status": "active"
}
```

### 2. `blood_requests.json`
Stores all blood request submissions.

**Structure:**
```json
{
  "id": "REQ-1234567890-xyz789",
  "patientName": "Jane Smith",
  "age": "35",
  "contact": "9876543210",
  "hospitalName": "City Hospital",
  "locality": "Downtown",
  "bloodGroup": "A+",
  "email": "jane@example.com",
  "emergencyContact": "9123456789",
  "emergencyState": "urgent",
  "additionalInfo": "Surgery scheduled tomorrow",
  "submittedAt": "2025-10-29T11:00:00.000Z",
  "status": "pending"
}
```

### 3. `current_orders.json`
Stores active blood orders/donations in progress.

**Structure:**
```json
{
  "id": "ORDER-1234567890-def456",
  "requestId": "REQ-1234567890-xyz789",
  "donorId": "DONOR-1234567890-abc123",
  "bloodGroup": "A+",
  "status": "in-progress",
  "createdAt": "2025-10-29T12:00:00.000Z",
  "completedAt": null
}
```

### 4. `community_posts.json`
Stores community posts and success stories.

**Structure:**
```json
{
  "id": "POST-1234567890-ghi789",
  "userId": "DONOR-1234567890-abc123",
  "userName": "John Doe",
  "content": "Proud to donate blood today!",
  "imageUrl": "/uploads/post-image.jpg",
  "likes": 42,
  "comments": [],
  "createdAt": "2025-10-29T13:00:00.000Z"
}
```

## API Endpoints

### Blood Donors
- `POST /api/donor-entries` - Create new donor
- `GET /api/donor-entries` - Get all donors

### Blood Requests
- `POST /api/blood-requests` - Create new blood request
- `GET /api/blood-requests` - Get all requests
  - Query params: `bloodGroup`, `status`, `locality`

## Status Values

### Donor Status
- `active` - Active donor
- `inactive` - Inactive donor

### Request Status
- `pending` - Awaiting donor
- `fulfilled` - Blood received
- `cancelled` - Request cancelled

### Order Status
- `in-progress` - Donation in process
- `completed` - Successfully completed
- `cancelled` - Order cancelled

## Migration to Database

When migrating to a database:
1. Import JSON data
2. Create appropriate schemas
3. Update API routes to use database
4. Keep JSON as backup

## Notes

- All files use 2-space indentation for readability
- IDs are auto-generated with timestamp + random string
- Timestamps are in ISO 8601 format
- Files are created automatically if they don't exist
