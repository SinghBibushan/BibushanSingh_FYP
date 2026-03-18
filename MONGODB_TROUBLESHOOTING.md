# MongoDB Connection Troubleshooting Guide

## Current Issue
Cannot connect to MongoDB Atlas cluster even with 0.0.0.0/0 whitelisted.

## Diagnostic Results
- Cluster: cluster0.9ygulok.mongodb.net
- DNS Resolution: ✅ Working
- Connection: ❌ Failing (ServerSelectionError)
- IP Whitelist: 0.0.0.0/0 (reported as active)

## Most Likely Causes (in order):

### 1. ⚠️ Cluster is PAUSED (90% probability)
**Symptoms:**
- DNS resolves but connection times out
- Error: "Could not connect to any servers"
- Free tier cluster inactive for 60+ days

**Fix:**
1. Go to: https://cloud.mongodb.com
2. Select your project
3. Look for "PAUSED" status on Cluster0
4. Click "Resume" button
5. Wait 1-2 minutes for cluster to start
6. Refresh your app

### 2. 🔐 Database User Credentials Issue
**Check:**
1. Go to Database Access in Atlas
2. Verify user: `eventease_admin` exists
3. Password is: `EventEase2026`
4. User has "Read and write to any database" role

**Fix if needed:**
1. Edit user
2. Reset password to: `EventEase2026`
3. Update .env file
4. Restart dev server

### 3. 🌐 Network Access Not Active
**Check:**
1. Go to Network Access in Atlas
2. Verify `0.0.0.0/0` shows "ACTIVE" (not "PENDING")
3. If pending, wait 1-2 minutes

**Fix if needed:**
1. Delete existing entry
2. Add new entry: `0.0.0.0/0`
3. Wait for "ACTIVE" status

### 4. 🔥 Firewall Blocking Port 27017
**Check:**
- Corporate/School network may block MongoDB ports
- VPN may interfere

**Fix:**
- Try from different network (mobile hotspot)
- Disable VPN temporarily
- Check Windows Firewall settings

### 5. 🗄️ Cluster Deleted or Moved
**Check:**
- Verify cluster still exists in Atlas
- Check if moved to different project

**Fix:**
- Create new cluster if deleted
- Get new connection string

## Quick Test Steps

### Step 1: Check Cluster Status
1. Open: https://cloud.mongodb.com
2. Login to your account
3. Select your project
4. Look at Cluster0 status
5. **If it says "PAUSED" → Click "Resume"**

### Step 2: Wait for Resume
- Cluster takes 1-2 minutes to resume
- Status will change from "PAUSED" to "ACTIVE"

### Step 3: Test Connection
```bash
cd C:\Users\dl009\OneDrive\Desktop\FInal_FYP_Bibushan\BibushanSingh_FYP
npx tsx scripts/test-mongodb-connection.ts
```

### Step 4: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## Alternative: Get Fresh Connection String

If cluster is active but still failing:

1. In Atlas, click "Connect" on Cluster0
2. Choose "Connect your application"
3. Copy the connection string
4. Update .env:
```env
MONGODB_URI=<paste-new-connection-string>
```
5. Replace `<password>` with: EventEase2026
6. Restart server

## Temporary Workaround: Use Demo Mode

If you need to test notifications immediately while fixing MongoDB:

The app has demo/fallback data that works without database for:
- Viewing events
- Browsing catalog

But you NEED MongoDB for:
- User registration/login
- Creating bookings
- **Testing notifications** ❌

## Next Steps

1. **Check if cluster is paused** (most likely issue)
2. Resume cluster if paused
3. Wait 1-2 minutes
4. Test connection again
5. If still failing, get fresh connection string

## Contact Info

If none of these work:
- Check MongoDB Atlas status: https://status.mongodb.com
- Verify your Atlas account is active
- Check if free tier quota exceeded

---

**Current Time**: 2026-03-12 18:00 UTC
**Status**: Waiting for cluster resume
