# Quick Local MongoDB Setup for Testing

## Option 1: MongoDB Community Server (Recommended)

1. Download MongoDB Community Server:
   https://www.mongodb.com/try/download/community

2. Install with default settings

3. MongoDB will run on: mongodb://localhost:27017

## Option 2: Docker (If you have Docker installed)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Option 3: MongoDB Atlas Shared Cluster (Alternative)

If you have a different email address:
1. Create new MongoDB Atlas account with different email
2. Create free cluster
3. Set up Network Access: 0.0.0.0/0
4. Create database user
5. Get connection string

## After Installing Local MongoDB

Update your .env file:

```env
MONGODB_URI=mongodb://localhost:27017/eventease
```

Then restart your dev server and test!

---

## Quick Test Commands

After installing MongoDB locally:

```bash
# Test if MongoDB is running
mongosh

# If that works, test your app
cd C:\Users\dl009\OneDrive\Desktop\FInal_FYP_Bibushan\BibushanSingh_FYP
npx tsx scripts/test-mongodb-connection.ts
```

---

## Time: 18:13 UTC (2026-03-12)

You still have time to:
1. Install local MongoDB (10 minutes)
2. Seed database (2 minutes)
3. Test all notifications (15 minutes)

Total: ~30 minutes to have everything working!
