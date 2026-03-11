# MongoDB Atlas IP Whitelist Fix

## Problem
You're getting this error:
```
Could not connect to any servers in your MongoDB Atlas cluster.
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Solution

### Step 1: Go to MongoDB Atlas
1. Open: https://cloud.mongodb.com/
2. Login with your account
3. Select your project (where you created the cluster)

### Step 2: Add IP Address
1. Click "Network Access" in the left sidebar (under Security section)
2. Click the green "Add IP Address" button
3. You have two options:

   **Option A: Add Current IP (Recommended for production)**
   - Click "Add Current IP Address"
   - It will auto-detect your IP
   - Click "Confirm"

   **Option B: Allow All IPs (Easiest for development/viva)**
   - Click "Allow Access from Anywhere"
   - This adds `0.0.0.0/0` (allows any IP)
   - Click "Confirm"
   - ⚠️ This is less secure but perfect for FYP demo since it works on any computer

### Step 3: Wait
- Wait 1-2 minutes for the changes to propagate
- The status will show "Pending" then "Active"

### Step 4: Test Connection
After the IP is active, run:
```bash
npm run db:reset
```

If it works, you'll see:
```
✅ Database reset complete
✅ Demo data seeded successfully
```

## For Your Friend's Computer

If you used Option B (0.0.0.0/0), your friend's computer will work automatically.

If you used Option A (specific IP), you'll need to:
1. Add your friend's IP address before the viva, OR
2. Temporarily switch to 0.0.0.0/0 for the viva day

## Troubleshooting

**Still can't connect after adding IP?**
- Wait 2-3 minutes (changes take time)
- Check the IP status is "Active" not "Pending"
- Try restarting your terminal
- Check your internet connection

**Wrong cluster?**
- Make sure you're in the correct project in Atlas
- Check the cluster name matches your connection string

**Firewall blocking?**
- Some corporate/school networks block MongoDB Atlas
- Try using mobile hotspot as a test
- Or use a VPN
