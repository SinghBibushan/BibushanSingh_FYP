# EventEase Notification System

## Overview

The EventEase notification system provides comprehensive user notifications across multiple channels (email and in-app) for all major events in the application lifecycle.

## Features

### ✅ Implemented Notifications

1. **Booking Confirmed** - User receives notification when payment succeeds
2. **Booking Cancelled** - User notified when booking is cancelled
3. **Payment Failed** - User alerted if payment fails
4. **Student Verification** - User notified when admin reviews verification
5. **New Event** - All users notified when admin creates new event
6. **Event Reminder** - Users reminded 15 days before their booked events
7. **Email Verification** - Verification link sent on registration

### 🔔 Notification Channels

- **Email**: Sent via SMTP (or mocked in development)
- **In-App**: Displayed in notification bell dropdown
- **Real-time**: Notification bell polls every 30 seconds

## Architecture

### Database Models

**Notification** (In-app notifications)
```typescript
{
  userId: ObjectId
  type: enum (BOOKING_CONFIRMED, EVENT_REMINDER, etc.)
  title: string
  message: string
  link: string
  read: boolean
  metadata: object
  timestamps: true
}
```

**NotificationLog** (Email tracking)
```typescript
{
  userId: ObjectId
  channel: enum (EMAIL, IN_APP, LOG)
  type: string
  subject: string
  payload: object
  status: string
  sentAt: Date
  timestamps: true
}
```

### Service Layer

**`src/server/notifications/service.ts`**
- `createInAppNotification()` - Creates in-app notification
- `logNotification()` - Logs and sends email notification

**`src/server/notifications/mailer.ts`**
- `sendEmail()` - Sends email via SMTP or mock

### Notification Triggers

| Trigger | Location | Function |
|---------|----------|----------|
| Booking confirmed | `bookings/service.ts` | `confirmMockPayment()` |
| Booking cancelled | `bookings/service.ts` | `cancelBooking()` |
| Payment failed | `bookings/service.ts` | `confirmMockPayment()` |
| Student verified | `admin/service.ts` | `reviewStudentVerification()` |
| New event | `admin/service.ts` | `createAdminEvent()` |
| Event reminder | `admin/send-reminders/route.ts` | `POST handler` |
| Email verification | `auth/service.ts` | `registerUser()` |

## Usage

### Creating In-App Notifications

```typescript
import { createInAppNotification } from "@/server/notifications/service";

await createInAppNotification({
  userId: "user-id",
  type: "BOOKING_CONFIRMED",
  title: "Booking Confirmed!",
  message: "Your booking ABC-123 is confirmed",
  link: "/tickets",
  metadata: {
    bookingCode: "ABC-123"
  }
});
```

### Sending Email Notifications

```typescript
import { logNotification } from "@/server/notifications/service";

await logNotification({
  userId: "user-id",
  email: "user@example.com",
  channel: "EMAIL",
  type: "BOOKING_CONFIRMED",
  subject: "Booking Confirmed",
  message: "Your booking is confirmed...",
  payload: {
    bookingCode: "ABC-123"
  }
});
```

### Sending Event Reminders

**Manual Trigger (Admin)**
```bash
POST /api/admin/send-reminders
```

**Automated (Cron)**
```bash
npm run reminders:send
```

**Cron Job Setup**
```bash
# Run daily at 9 AM
0 9 * * * cd /path/to/app && npm run reminders:send
```

## Frontend Integration

### Notification Bell Component

```tsx
import { NotificationBell } from "@/components/notifications/notification-bell";

// In your layout/header
<NotificationBell />
```

**Features:**
- Shows unread count badge
- Dropdown with notification list
- Auto-refreshes every 30 seconds
- Click to mark as read and navigate
- Highlights unread notifications

### API Endpoints

**Get Notifications**
```
GET /api/notifications
Response: { notifications: [], unreadCount: number }
```

**Mark as Read**
```
PATCH /api/notifications
Body: { notificationId: string }
```

## Configuration

### Environment Variables

```env
# Required
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret-key

# Optional
MOCK_EMAIL_ENABLED=true
MOCK_PAYMENT_ENABLED=true
APP_URL=http://localhost:3000

# SMTP (if MOCK_EMAIL_ENABLED=false)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@eventease.com
```

### Mock Mode

In development, set `MOCK_EMAIL_ENABLED=true` to log emails to console instead of sending:

```
[mock-email] {
  to: 'user@example.com',
  subject: 'Booking confirmed',
  text: 'Your booking is confirmed...'
}
```

## Testing

### Quick Test
```bash
npm run test:notifications
```

### Manual Testing
See `TESTING_GUIDE.md` for detailed testing instructions.

### Database Queries
```javascript
// View all notifications
db.notifications.find().pretty()

// Count unread
db.notifications.countDocuments({ read: false })

// View by type
db.notifications.aggregate([
  {$group: {_id: "$type", count: {$sum: 1}}}
])
```

## Notification Types

```typescript
enum NotificationType {
  BOOKING_CONFIRMED = "BOOKING_CONFIRMED",
  BOOKING_CANCELLED = "BOOKING_CANCELLED",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  EVENT_REMINDER = "EVENT_REMINDER",
  STUDENT_VERIFIED = "STUDENT_VERIFIED",
  NEW_EVENT = "NEW_EVENT",
  REVIEW_REQUEST = "REVIEW_REQUEST",
  CHAT_MESSAGE = "CHAT_MESSAGE",
  EVENT_UPDATE = "EVENT_UPDATE"
}
```

## Best Practices

### 1. Always Create Both Email and In-App
```typescript
// Send email
await logNotification({...});

// Create in-app notification
await createInAppNotification({...});
```

### 2. Prevent Duplicates
```typescript
// Check before sending
const existing = await Notification.findOne({
  userId,
  type: "EVENT_REMINDER",
  "metadata.eventId": eventId
});

if (existing) return;
```

### 3. Include Metadata
```typescript
metadata: {
  eventId: "123",
  bookingCode: "ABC-123",
  // Any data needed for debugging
}
```

### 4. Use Descriptive Links
```typescript
link: `/events/${slug}`,  // Good
link: "/",                 // Bad
```

## Performance Considerations

- Notification bell polls every 30 seconds (configurable)
- Event reminders run once daily via cron
- New event notifications sent asynchronously
- Database indexes on `userId` and `read` fields

## Troubleshooting

### Notifications Not Appearing
1. Check MongoDB connection
2. Verify user is logged in
3. Check browser console for errors
4. Query database directly

### Email Not Sending
1. Check `MOCK_EMAIL_ENABLED` setting
2. Verify SMTP credentials
3. Check console logs
4. Test SMTP connection

### Event Reminders Not Working
1. Verify event date is 15 days away
2. Check booking status is CONFIRMED
3. Ensure no duplicate reminder exists
4. Check cron job is running

## Future Enhancements

- [ ] Push notifications (web push API)
- [ ] SMS notifications
- [ ] Notification preferences per user
- [ ] Notification grouping/batching
- [ ] Real-time notifications (WebSocket)
- [ ] Notification templates
- [ ] A/B testing for notification content

## Documentation

- `TESTING_GUIDE.md` - Comprehensive testing guide
- `NOTIFICATION_SUMMARY.md` - Implementation details
- `QUICK_TEST_CHECKLIST.md` - Quick testing checklist

## Support

For issues or questions:
1. Check the documentation files
2. Review console logs
3. Query database directly
4. Check MongoDB connection

---

**Version**: 1.0.0
**Last Updated**: 2026-03-12
**Status**: ✅ Production Ready
