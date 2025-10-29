# Session & Notification System Documentation

## Overview
This system manages user sessions for blood requests and provides real-time notifications using browser localStorage.

## Features

### 1. Session Management (30-Day Persistence)
- ✅ Stores user blood requests for 30 days
- ✅ Automatic expiration cleanup
- ✅ Multiple request tracking per user
- ✅ Secure client-side storage

### 2. Notification System
- ✅ Real-time notification bell
- ✅ Unread count badge
- ✅ Multiple notification types (success, pending, urgent, info)
- ✅ Mark as read functionality
- ✅ Auto-cleanup (keeps last 50)

## Session Storage Structure

### User Blood Requests
**Location:** `localStorage.userBloodRequests`

```json
[
  {
    "requestId": "REQ-1730123456-xyz789",
    "patientName": "Jane Smith",
    "bloodGroup": "A+",
    "emergencyState": "urgent",
    "submittedAt": "2025-10-29T10:00:00.000Z",
    "expiresAt": "2025-11-28T10:00:00.000Z"
  }
]
```

**Expiration:** 30 days from submission
**Cleanup:** Automatic on app load and session access

## Notification Storage Structure

### Notifications
**Location:** `localStorage.bloodNotifications`

```json
[
  {
    "id": "NOTIF-1730123456-abc123",
    "type": "pending",
    "title": "Blood Request Submitted",
    "message": "Your request for A+ blood at City Hospital is now pending.",
    "timestamp": "2025-10-29T10:00:00.000Z",
    "read": false,
    "requestId": "REQ-1730123456-xyz789"
  }
]
```

**Types:**
- `success` - Green checkmark (fulfilled requests, donor matched)
- `pending` - Orange clock (waiting for donors)
- `urgent` - Red alert (critical emergencies, urgent reminders)
- `info` - Blue droplet (general information)

**Limits:** Keeps last 50 notifications

## Usage

### Adding Notifications When Request is Submitted

```typescript
import { NotificationTemplates } from '@/app/utils/sessionManager';

// In your form submit handler
const data = await fetch('/api/blood-requests', { ... });

// Add notification
NotificationTemplates.requestSubmitted(
  data.requestId,
  formData.bloodGroup,
  formData.hospitalName,
  formData.emergencyState
);
```

### Accessing User Sessions

```typescript
import { SessionManager } from '@/app/utils/sessionManager';

// Get all active sessions
const sessions = SessionManager.getSessions();

// Get specific session
const session = SessionManager.getSessionByRequestId('REQ-123');

// Check if user has active requests
const hasRequest = SessionManager.hasActiveRequest();
```

### Managing Notifications

```typescript
import { NotificationManager } from '@/app/utils/sessionManager';

// Get all notifications
const notifications = NotificationManager.getNotifications();

// Get unread count
const unread = NotificationManager.getUnreadCount();

// Mark as read
NotificationManager.markAsRead('NOTIF-123');

// Mark all as read
NotificationManager.markAllAsRead();

// Delete notification
NotificationManager.deleteNotification('NOTIF-123');

// Clear all
NotificationManager.clearAll();
```

## Notification Templates

Pre-built notification templates for common scenarios:

### 1. Request Submitted
```typescript
NotificationTemplates.requestSubmitted(requestId, bloodGroup, hospital, emergencyState);
```

### 2. Donor Matched
```typescript
NotificationTemplates.donorMatched(requestId, donorName, bloodGroup);
```

### 3. Request Fulfilled
```typescript
NotificationTemplates.requestFulfilled(requestId);
```

### 4. Urgent Reminder
```typescript
NotificationTemplates.urgentReminder(requestId, bloodGroup);
```

### 5. General Info
```typescript
NotificationTemplates.generalInfo('Title', 'Message');
```

## Component Integration

### NotificationBell Component
Already integrated in the main header:

```tsx
import NotificationBell from '@/app/components/NotificationBell';

<NotificationBell />
```

**Features:**
- Animated bell icon
- Pulsing badge for unread count
- Dropdown with all notifications
- Mark as read on click
- Delete individual notifications
- Mark all read / Clear all buttons
- Auto-refresh on new notifications

## Event System

The system uses custom events for real-time updates:

### Events
- `newNotification` - Fired when new notification is added
- `notificationUpdate` - Fired when notifications are modified

### Listening to Events
```typescript
window.addEventListener('newNotification', (event) => {
  console.log('New notification:', event.detail);
});

window.addEventListener('notificationUpdate', () => {
  // Refresh notification list
});
```

## Workflow Example

### When User Submits Blood Request:

1. **API Call** - Submit to `/api/blood-requests`
2. **Session Storage** - Save request with 30-day expiry
3. **Notification** - Create "Request Submitted" notification
4. **Event Dispatch** - Trigger `newNotification` event
5. **UI Update** - Bell icon shows badge, dropdown updates

### When Donor is Found (Future):

1. **Backend Update** - Match donor to request
2. **Notification** - Create "Donor Found" notification
3. **Session Update** - Update request status
4. **Event Dispatch** - Trigger notification update
5. **User Alert** - User sees notification in bell

## Data Persistence

### Storage Locations
- **Sessions:** `localStorage.userBloodRequests`
- **Notifications:** `localStorage.bloodNotifications`

### Expiration
- **Sessions:** 30 days
- **Notifications:** No expiration (limited to last 50)

### Cleanup
- Expired sessions removed on app load
- Old notifications removed when limit exceeded

## Security Considerations

1. **Client-Side Only** - Data stored in browser localStorage
2. **No Sensitive Info** - Avoid storing passwords or tokens
3. **User Privacy** - Data stays on user's device
4. **30-Day Limit** - Automatic cleanup prevents indefinite storage

## Future Enhancements

- [ ] Push notifications (service workers)
- [ ] Email notifications
- [ ] SMS alerts for critical requests
- [ ] Admin dashboard for managing requests
- [ ] Donor matching algorithm
- [ ] Request status updates from backend
- [ ] Real-time updates via WebSocket

## Troubleshooting

### Notifications not appearing?
- Check browser console for errors
- Verify localStorage is enabled
- Check if events are being dispatched

### Sessions expiring early?
- Check system date/time
- Verify expiration calculation
- Check for manual localStorage clearing

### Badge count not updating?
- Refresh the page
- Check event listeners
- Verify notification storage format
