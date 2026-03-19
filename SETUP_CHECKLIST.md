# EventEase - Quick Setup Checklist

## ✅ Setup Checklist (Do this NOW on your computer)

### 1. MongoDB Atlas Setup (10 minutes)
- [ ] Go to https://www.mongodb.com/cloud/atlas/register
- [ ] Create free account
- [ ] Create M0 FREE cluster (choose Mumbai region - closest to Nepal)
- [ ] Create database user:
  - Username: `eventease_admin`
  - Password: (save this!) e.g., `EventEase2026`
- [ ] Add Network Access: `0.0.0.0/0` (allows any computer)
- [ ] Get connection string from "Connect" button
- [ ] Replace `<password>` with your actual password
- [ ] Add `/eventease` before the `?` in the connection string

**Your final connection string should look like:**
```
mongodb+srv://eventease_admin:EventEase2026@cluster0.xxxxx.mongodb.net/eventease?retryWrites=true&w=majority
```
mongodb+srv://eventease_admin:EventEase2026@cluster0.9ygulok.mongodb.net/?appName=Cluster0

### 2. Generate JWT Secret
Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output (it will be a long random string).

b43e15c5f1284d2e045f77345711e9d8b4b96595e814fb6d3b69156089bfb354

### 3. Update .env File
Open `.env` file in the project root and update:
```env
MONGODB_URI=mongodb+srv://eventease_admin:YourPassword@cluster0.xxxxx.mongodb.net/eventease?retryWrites=true&w=majority
JWT_SECRET=paste-the-generated-secret-here
MOCK_PAYMENT_ENABLED=true
MOCK_EMAIL_ENABLED=true
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Seed Database with Demo Data
```bash
npm run db:reset
```

This creates:
- Admin account: `admin@gmail.com` / `Password123`
- User account: `user@gmail.com` / `Password123`
- Sample events
- Sample promo codes
- Sample bookings

### 6. Start the Application
```bash
npm run dev
```

### 7. Test the Application
Open: http://localhost:3000

Try logging in with:
- Email: `admin@gmail.com`
- Password: `Password123`

---

## 📋 For Your Friend's Computer (During Viva)

### Prerequisites on Friend's Computer
- [ ] Node.js installed (v18 or higher)
- [ ] Git installed
- [ ] Internet connection

### Setup Steps (5 minutes)
1. Clone the repository:
```bash
git clone https://github.com/SinghBibushan/BibushanSingh_FYP.git
cd BibushanSingh_FYP
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file and copy these values from your computer:
```env
MONGODB_URI=<same-connection-string-from-your-env>
JWT_SECRET=<same-or-new-jwt-secret>
MOCK_PAYMENT_ENABLED=true
MOCK_EMAIL_ENABLED=true
```

4. Start the application:
```bash
npm run dev
```

5. Open: http://localhost:3000

**That's it!** The database is already populated with demo data from your setup.

---

## 🎯 Viva Demonstration Flow

### 1. Public Pages
- [ ] Show landing page
- [ ] Browse events at `/events`
- [ ] Show event details page
- [ ] Show filters and search

### 2. User Registration & Login
- [ ] Register a new user (or use demo user)
- [ ] Login with: `user@gmail.com` / `Password123`
- [ ] Show user dashboard

### 3. Booking Flow
- [ ] Select an event
- [ ] Click "Book Tickets"
- [ ] Select ticket quantity
- [ ] Apply promo code: `FEST10` or `NEPAL500`
- [ ] Show discount calculation
- [ ] Proceed to payment
- [ ] Complete mock payment
- [ ] Show booking confirmation

### 4. Tickets & Loyalty
- [ ] Go to "My Tickets" page
- [ ] Show QR code ticket
- [ ] Download PDF ticket
- [ ] Go to "Loyalty" page
- [ ] Show points and tier

### 5. Admin Panel
- [ ] Logout and login as admin: `admin@gmail.com` / `Password123`
- [ ] Go to `/admin`
- [ ] Show dashboard metrics
- [ ] Create a new event at `/admin/events`
- [ ] Create a promo code at `/admin/promo-codes`
- [ ] View bookings at `/admin/bookings`
- [ ] View users at `/admin/users`
- [ ] Show sales report at `/admin/reports`

---

## 🚨 Troubleshooting

### "ECONNREFUSED 127.0.0.1:27017"
- This means you're trying to connect to local MongoDB
- Check your `.env` file has the Atlas connection string (starts with `mongodb+srv://`)
- NOT `mongodb://127.0.0.1:27017`

### "Authentication failed"
- Check username and password in connection string are correct
- Check special characters are URL-encoded

### "Network timeout"
- Check internet connection
- Check Network Access in Atlas allows `0.0.0.0/0`

### "Port 3000 already in use"
- Kill the process: `npx kill-port 3000`
- Or Next.js will automatically use another port (check terminal output)

### Seed script fails
- Check `.env` file exists and has correct values
- Check `MONGODB_URI` is valid
- Run: `npm run db:reset` again

---

## 📝 Important Notes

1. **Save your MongoDB Atlas credentials** - you'll need them for friend's computer
2. **The same `.env` values work on both computers** - just copy them
3. **Database is already seeded** - no need to run `db:reset` on friend's computer
4. **Mock modes are enabled** - perfect for viva demonstration
5. **No real payment gateway needed** - mock payment works perfectly

---

## ✅ Project Status

**FULLY COMPLETE AND READY FOR VIVA!**

- ✅ 21 pages implemented
- ✅ 26 API routes implemented
- ✅ 10 database models
- ✅ Authentication system
- ✅ Booking and payment flow
- ✅ Admin dashboard
- ✅ Loyalty system
- ✅ QR and PDF tickets
- ✅ Mock payment and email
- ✅ Seed data and demo accounts
- ✅ Professional UI/UX
- ✅ Complete documentation

**You're ready to go!** Just follow the checklist above.


