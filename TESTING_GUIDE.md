# EventEase Notification System - Testing Guide

## Overview
This guide covers testing all notification features including:
- ✅ Booking confirmed notifications
- ✅ Booking cancelled notifications
- ✅ Payment success/failure notifications
- ✅ Student verification notifications
- ✅ New event notifications (to all users)
- ✅ Event reminders (15 days before event)
- ✅ Email verification

## Prerequisites

### 1. Environment Setup
Ensure your `.env` file has the following configured:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/eventease
JWT_SECRET=your-secret-key-here
APP_URL=http://localhost:3000
MOCK_EMAIL_ENABLED=true
MOCK_PAYMENT_ENABLED=true
```

### 2. Start the Application
```bash
npm run dev
```

The app will run on http://localhost:3000

---

## Test Scenarios

### 1. Email Verification Testing

**Steps:**
1. Register a new user account at `/register`
2. Check the console logs for the verification email (mock mode)
3. Copy the verification URL from the logs
4. Visit the verification URL
5. Verify the user's email is marked as verified

**Expected Results:**
- Email verification link sent (logged in console)
- User can verify email successfully
- User's `emailVerifiedAt` field is populated

---

### 2. Booking Confirmed Notification

**Steps:**
1. Login as a regular user
2. Browse events and select an event
3. Add tickets to cart and proceed to checkout
4. Complete the mock payment (select "Success")
5. Check the notification bell icon (top right)
6. Check console logs for email notification

**Expected Results:**
- In-app notification appears with "Booking Confirmed!" title
- Notification shows booking code and event title
- Clicking notification redirects to `/tickets`
- Email logged in console with booking details
- Notification bell shows unread count badge

---

### 3. Booking Cancelled Notification

**Steps:**
1. Login as a user with confirmed bookings
2. Go to `/bookings` or `/tickets`
3. Cancel a confirmed booking
4. Check the notification bell
5. Check console logs for email

**Expected Results:**
- In-app notification: "Booking Cancelled"
- Shows booking code and event title
- Email logged in console
- Loyalty points refunded
- Notification appears in notification dropdown

---

### 4. Payment Failed Notification

**Steps:**
1. Login as a regular user
2. Create a booking and proceed to payment
3. Select "Failed" in the mock payment screen
4. Check notifications

**Expected Results:**
- In-app notification: "Payment Failed"
- Message explains payment failed
- Email logged in console
- Booking status changed to "EXPIRED"

---

### 5. Student Verification Notification

**Steps:**
1. Login as a regular user
2. Go to profile and submit student verification
3. Login as admin (create admin user if needed)
4. Go to admin panel → Verifications
5. Approve or reject the verification
6. Logout and login as the student user
7. Check notifications

**Expected Results:**
- In-app notification: "Student Verification Approved/Rejected"
- Email logged in console
- User's `studentVerificationStatus` updated
- Notification links to `/profile`

**Creating Admin User:**
```bash
# Connect to MongoDB
mongosh eventease

# Update a user to admin
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "ADMIN" } }
)
```

---

### 6. New Event Notification (All Users)

**Steps:**
1. Login as admin
2. Go to admin panel → Events
3. Create a new event with all required fields
4. Submit the event
5. Logout and login as different regular users
6. Check notifications for each user

**Expected Results:**
- All registered users receive in-app notification
- Notification title: "New Event Available!"
- Message shows event title and date
- Clicking notification redirects to event page
- Notification appears for ALL users in the system

---

### 7. Event Reminder (15 Days Before)

This feature has two testing methods:

#### Method A: Manual API Trigger (Recommended for Testing)

**Steps:**
1. Create an event that starts exactly 15 days from today
   - Today is: 2026-03-12
   - Event should start: 2026-03-27
2. Create a confirmed booking for that event
3. Login as admin
4. Trigger reminders via API:
   ```bash
   curl -X POST http://localhost:3000/api/admin/send-reminders \
     -H "Content-Type: application/json" \
     -H "Cookie: your-session-cookie"
   ```
   Or visit the endpoint in browser while logged in as admin
5. Check notifications for the user who booked

**Expected Results:**
- In-app notification: "Event Reminder"
- Message: "{Event Title} is coming up in 15 days! {Date} at {Time}"
- Email logged in console
- Notification links to event page
- Duplicate reminders prevented (won't send twice)

#### Method B: Scheduled Script (Production Use)

**Steps:**
1. Create an event 15 days in the future
2. Create confirmed bookings for that event
3. Run the reminder script:
   ```bash
   npm run reminders:send
   ```

**Expected Results:**
- Script finds events starting in 15 days
- Sends reminders to all users with confirmed bookings
- Logs output showing reminders sent
- Prevents duplicate reminders

**Setting up Cron Job (Production):**
```bash
# Run daily at 9 AM
0 9 * * * cd /path/to/app && npm run reminders:send
```

---

### 8. Loyalty Tier Notification

**Steps:**
1. Login as a user
2. Make multiple bookings to earn loyalty points
3. Check if loyalty tier changes (Bronze → Silver → Gold)
4. Verify points are displayed correctly

**Loyalty Thresholds:**
- Bronze: 0-499 points
- Silver: 500-999 points
- Gold: 1000+ points

**Expected Results:**
- Loyalty points updated after booking
- Tier changes when threshold reached
- Points redeemed correctly during checkout

---

## Notification Bell Component Testing

### Visual Tests:
1. **Unread Badge**: Shows count when unread notifications exist
2. **Dropdown**: Opens when bell icon clicked
3. **Notification List**: Displays all notifications sorted by date
4. **Read Status**: Unread notifications have highlighted background
5. **Click Action**: Clicking notification marks as read and redirects
6. **Auto-refresh**: Polls for new notifications every 30 seconds
7. **Empty State**: Shows "No notifications yet" when empty

---

## Database Verification

### Check Notifications in MongoDB:
```bash
mongosh eventease

# View all notifications
db.notifications.find().pretty()

# View notifications for specific user
db.notifications.find({ userId: ObjectId("user-id-here") }).pretty()

# Count unread notifications
db.notifications.countDocuments({ read: false })

# View notification logs (emails sent)
db.notificationlogs.find().pretty()
```

---

## Common Issues & Troubleshooting

### Issue: Notifications not appearing
**Solution:**
- Check MongoDB connection
- Verify user is logged in
- Check browser console for errors
- Ensure notification bell component is rendered

### Issue: Email not logged
**Solution:**
- Verify `MOCK_EMAIL_ENABLED=true` in .env
- Check console output
- Ensure `logNotification` function is called

### Issue: Duplicate notifications
**Solution:**
- Check for duplicate API calls
- Verify notification deduplication logic
- Clear old test notifications from database

### Issue: Event reminders not working
**Solution:**
- Verify event date is exactly 15 days in future
- Ensure booking status is "CONFIRMED"
- Check if reminder already sent (prevents duplicates)
- Verify user has confirmed booking for the event

---

## Test Data Setup

### Quick Test Data Script:
```javascript
// Create test event 15 days from now
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 15);

// Use admin panel to create event with this date
// Or use seed script
```

### Reset Test Data:
```bash
npm run db:reset
```

---

## Notification Types Reference

| Type | Trigger | Channel | User Type |
|------|---------|---------|-----------|
| BOOKING_CONFIRMED | Payment success | Email + In-App | Booking owner |
| BOOKING_CANCELLED | Booking cancelled | Email + In-App | Booking owner |
| PAYMENT_SUCCESS | Payment confirmed | Email + In-App | Booking owner |
| EVENT_REMINDER | 15 days before event | Email + In-App | All attendees |
| STUDENT_VERIFIED | Admin reviews verification | Email + In-App | Student |
| NEW_EVENT | Admin creates event | In-App | All users |
| REVIEW_REQUEST | After event ends | In-App | Attendees |
| EVENT_UPDATE | Event details changed | In-App | Attendees |

---

## Production Checklist

Before deploying to production:

- [ ] Configure real SMTP settings in .env
- [ ] Set `MOCK_EMAIL_ENABLED=false`
- [ ] Set `MOCK_PAYMENT_ENABLED=false`
- [ ] Set up cron job for event reminders
- [ ] Test email delivery with real SMTP
- [ ] Verify notification preferences work
- [ ] Test notification performance with many users
- [ ] Set up monitoring for failed notifications
- [ ] Configure email templates for production
- [ ] Test notification delivery on mobile devices

---

## API Endpoints Reference

### Get Notifications
```
GET /api/notifications
Returns: { notifications: [], unreadCount: number }
```

### Mark Notification as Read
```
PATCH /api/notifications
Body: { notificationId: string }
```

### Send Event Reminders (Admin Only)
```
POST /api/admin/send-reminders
Returns: { remindersSent: number, eventsFound: number }
```

---

## Testing Completion Checklist

- [ ] Email verification works
- [ ] Booking confirmed notification appears
- [ ] Booking cancelled notification appears
- [ ] Payment failed notification appears
- [ ] Student verification notification works
- [ ] New event notification sent to all users
- [ ] Event reminder sent 15 days before
- [ ] Notification bell shows unread count
- [ ] Clicking notification marks as read
- [ ] Notification links redirect correctly
- [ ] Email logs appear in console (mock mode)
- [ ] No duplicate notifications sent
- [ ] Loyalty points update correctly

---

## Notes

- All notifications are stored in the `notifications` collection
- Email logs are stored in the `notificationlogs` collection
- Notification preferences can be managed in user profile
- The system prevents duplicate event reminders
- Notifications auto-refresh every 30 seconds
- Mock mode logs emails to console instead of sending

---

## Support

If you encounter issues during testing:
1. Check the console logs for errors
2. Verify MongoDB connection
3. Ensure all environment variables are set
4. Check the notification models in `/src/models/`
5. Review service files in `/src/server/notifications/`

Last Updated: 2026-03-12
