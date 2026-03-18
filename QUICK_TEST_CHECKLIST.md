# Quick Testing Checklist

## 🚀 Before You Start

### 1. Fix MongoDB Connection
Your MongoDB Atlas cluster needs your IP whitelisted:
1. Go to: https://cloud.mongodb.com
2. Select your cluster
3. Click "Network Access" in left sidebar
4. Click "Add IP Address"
5. Either add your current IP or use `0.0.0.0/0` for testing

### 2. Start the Application
```bash
cd "C:\Users\dl009\OneDrive\Desktop\FInal_FYP_Bibushan\BibushanSingh_FYP"
npm run dev
```
Open: http://localhost:3000

---

## ✅ Quick Test Checklist

### Test 1: Email Verification (2 min)
- [ ] Register new account
- [ ] Check console for verification email
- [ ] Click verification link
- [ ] Confirm email verified

### Test 2: Booking Confirmed (3 min)
- [ ] Login as user
- [ ] Book event tickets
- [ ] Complete payment (select "Success")
- [ ] Check notification bell (top right)
- [ ] See "Booking Confirmed!" notification
- [ ] Click notification → redirects to /tickets

### Test 3: Booking Cancelled (2 min)
- [ ] Go to /bookings
- [ ] Cancel a booking
- [ ] Check notification bell
- [ ] See "Booking Cancelled" notification

### Test 4: Payment Failed (2 min)
- [ ] Create booking
- [ ] Select "Failed" in payment
- [ ] Check notification bell
- [ ] See "Payment Failed" notification

### Test 5: Student Verification (3 min)
- [ ] Submit student verification as user
- [ ] Login as admin
- [ ] Go to admin panel → Verifications
- [ ] Approve verification
- [ ] Login as student
- [ ] Check notification bell
- [ ] See "Student Verification Approved"

### Test 6: New Event Notification (3 min)
- [ ] Login as admin
- [ ] Create new event
- [ ] Logout
- [ ] Login as different user
- [ ] Check notification bell
- [ ] See "New Event Available!" notification
- [ ] Verify ALL users got notification

### Test 7: Event Reminder (5 min)
**Setup:**
- [ ] Create event starting on: **2026-03-27** (15 days from today)
- [ ] Create confirmed booking for that event

**Test:**
- [ ] Login as admin
- [ ] Visit: http://localhost:3000/api/admin/send-reminders
- [ ] Check response shows reminders sent
- [ ] Login as booking user
- [ ] Check notification bell
- [ ] See "Event Reminder" notification

**Alternative:**
```bash
npm run reminders:send
```

---

## 🔍 Verification Commands

### Check Notifications in Database
```bash
mongosh "your-mongodb-uri"

# Count notifications
db.notifications.countDocuments()

# View recent notifications
db.notifications.find().sort({createdAt: -1}).limit(10).pretty()

# Check unread count
db.notifications.countDocuments({read: false})

# View by type
db.notifications.aggregate([
  {$group: {_id: "$type", count: {$sum: 1}}},
  {$sort: {count: -1}}
])
```

### Check Email Logs (Mock Mode)
Look in console output for:
```
[mock-email] {
  to: 'user@example.com',
  subject: 'Booking confirmed',
  text: '...'
}
```

---

## 🎯 Expected Results Summary

| Feature | Email | In-App | Link |
|---------|-------|--------|------|
| Email Verification | ✅ | ❌ | /verify-email/token |
| Booking Confirmed | ✅ | ✅ | /tickets |
| Booking Cancelled | ✅ | ✅ | /bookings |
| Payment Failed | ✅ | ✅ | /bookings |
| Student Verified | ✅ | ✅ | /profile |
| New Event | ❌ | ✅ | /events/slug |
| Event Reminder | ✅ | ✅ | /events/slug |

---

## 🐛 Common Issues

### Notification Bell Not Showing Count
- Refresh page
- Check browser console for errors
- Verify user is logged in
- Check MongoDB connection

### No Notifications Appearing
- Verify action completed (booking confirmed, etc.)
- Check console for errors
- Query database directly to verify notification created
- Check notification bell component is rendered

### Event Reminder Not Working
- Verify event date is exactly 15 days from today (2026-03-27)
- Ensure booking status is "CONFIRMED"
- Check if reminder already sent (prevents duplicates)
- Verify user has confirmed booking for that event

### MongoDB Connection Error
- Whitelist your IP in MongoDB Atlas
- Check MONGODB_URI in .env file
- Test connection: `mongosh "your-uri"`

---

## 📝 Test Data Setup

### Create Admin User
```javascript
// In mongosh
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "ADMIN" } }
)
```

### Create Test Event (15 days from now)
1. Login as admin
2. Go to: http://localhost:3000/admin/events
3. Click "Create Event"
4. Set start date: **2026-03-27**
5. Fill other required fields
6. Submit

### Reset All Notifications
```javascript
// In mongosh
db.notifications.deleteMany({})
db.notificationlogs.deleteMany({})
```

---

## 📊 Success Criteria

✅ All 7 notification types working
✅ Notification bell shows unread count
✅ Clicking notification marks as read
✅ Notifications link to correct pages
✅ Email logs appear in console (mock mode)
✅ No duplicate event reminders
✅ All users receive new event notifications

---

## 🎉 When All Tests Pass

You have successfully verified:
- ✅ User notifications for bookings
- ✅ Admin notifications for verifications
- ✅ System-wide notifications for new events
- ✅ Automated event reminders
- ✅ Email verification flow
- ✅ Notification UI component
- ✅ Database persistence

**System is ready for production deployment!**

---

## 📚 Documentation Files

- `TESTING_GUIDE.md` - Detailed testing instructions
- `NOTIFICATION_SUMMARY.md` - Implementation details
- `README.md` - Project overview
- `.env.example` - Environment configuration template

---

## 🆘 Need Help?

1. Check console logs for errors
2. Verify MongoDB connection
3. Review `TESTING_GUIDE.md` for detailed steps
4. Check `NOTIFICATION_SUMMARY.md` for implementation details
5. Query database directly to debug

---

**Current Date**: 2026-03-12
**Event Reminder Test Date**: 2026-03-27 (15 days from now)

Good luck with testing! 🚀
