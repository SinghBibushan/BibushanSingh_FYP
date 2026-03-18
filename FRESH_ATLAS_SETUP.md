# Fresh MongoDB Atlas Setup Guide

## Step-by-Step: Create New Atlas Account

### 1. Sign Up (5 minutes)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Use a DIFFERENT email than your current account
3. Sign up with email or Google
4. Verify email

### 2. Create Free Cluster (3 minutes)
1. Choose **"Create a deployment"**
2. Select **"M0 Free"** tier
3. Provider: **AWS**
4. Region: **Mumbai (ap-south-1)** (closest to you)
5. Cluster Name: **Cluster0**
6. Click **"Create Deployment"**
7. Wait 1-3 minutes for cluster to be created

### 3. Create Database User (1 minute)
1. You'll see "Security Quickstart"
2. Authentication Method: **Username and Password**
3. Username: `eventease_admin`
4. Password: `EventEase2026`
5. Click **"Create Database User"**

### 4. Add Network Access (1 minute)
1. Still in Security Quickstart
2. Click **"Add My Current IP Address"**
3. OR click **"Allow Access from Anywhere"** (adds 0.0.0.0/0)
4. Click **"Finish and Close"**

### 5. Get Connection String (1 minute)
1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Driver: **Node.js**
4. Version: **5.5 or later**
5. Copy the connection string
6. It looks like:
   ```
   mongodb+srv://eventease_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Update .env File
Replace `<password>` with `EventEase2026`:
```env
MONGODB_URI=mongodb+srv://eventease_admin:EventEase2026@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 7. Test Connection
```bash
cd C:\Users\dl009\OneDrive\Desktop\FInal_FYP_Bibushan\BibushanSingh_FYP
npx tsx scripts/test-mongodb-connection.ts
```

### 8. Seed Database
```bash
npm run db:seed
```

### 9. Start Server
```bash
npm run dev
```

---

## Total Time: ~15 minutes

After this, you'll have a working MongoDB Atlas connection and can test all notifications!

---

## Alternative: Use Friend's Database

If your friend already has a working MongoDB Atlas:
1. Ask for their connection string
2. Update your .env file
3. Make sure they add your IP: 169.150.218.129
4. Test immediately!

---

**Which option do you want to try?**
- Option A: Create new Atlas account with different email
- Option B: Use your friend's Atlas credentials
- Option C: Ask friend to add your IP to their Network Access
