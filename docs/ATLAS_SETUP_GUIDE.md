# MongoDB Atlas Setup Guide for EventEase
# This database will work on ANY computer - yours and your friend's

## Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email (use your or your friend's email)
3. Choose "Free" tier (M0 Sandbox - completely free forever)

## Step 2: Create a Cluster

1. After login, click "Build a Database"
2. Choose "M0 FREE" tier
3. Choose a cloud provider and region (choose closest to Nepal):
   - Provider: AWS
   - Region: Mumbai (ap-south-1) - closest to Nepal
4. Cluster Name: Keep default or name it "EventEase"
5. Click "Create"

Wait 3-5 minutes for cluster creation.

## Step 3: Create Database User

1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `eventease_admin`
5. Password: Click "Autogenerate Secure Password" and SAVE IT!
   (Or create your own: e.g., `EventEase2026!`)
6. Database User Privileges: Select "Atlas admin"
7. Click "Add User"

**IMPORTANT: Save the username and password - you'll need them!**

## Step 4: Configure Network Access

1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere"
4. This adds `0.0.0.0/0` (allows any computer to connect)
5. Click "Confirm"

**Why 0.0.0.0/0?** So both your computer AND your friend's computer can connect during viva.

## Step 5: Get Connection String

1. Click "Database" in left sidebar
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Driver: Node.js
5. Version: 5.5 or later
6. Copy the connection string - it looks like:

```
mongodb+srv://eventease_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

## Step 6: Create Your Connection String

Replace `<password>` with your actual password and add `/eventease` database name:

**Example:**
If your password is `EventEase2026!`, the final string is:
```
mongodb+srv://eventease_admin:EventEase2026!@cluster0.xxxxx.mongodb.net/eventease?retryWrites=true&w=majority
```

**IMPORTANT NOTES:**
- If password has special characters like `@`, `#`, `!`, you need to URL-encode them:
  - `!` becomes `%21`
  - `@` becomes `%40`
  - `#` becomes `%23`
- Or just use a simple password like `EventEase2026` (no special chars)

## Step 7: Update .env File

Open `.env` file and paste your connection string:

```env
MONGODB_URI=mongodb+srv://eventease_admin:YourPassword@cluster0.xxxxx.mongodb.net/eventease?retryWrites=true&w=majority
JWT_SECRET=your-generated-secret-here
MOCK_PAYMENT_ENABLED=true
MOCK_EMAIL_ENABLED=true
```

## Step 8: Test on Your Computer

```bash
# Install dependencies (if not done)
npm install

# Seed the database with demo data
npm run db:reset

# Start the app
npm run dev
```

Open http://localhost:3000 and test login with:
- Email: `admin@eventease.demo`
- Password: `Password123`

## Step 9: For Your Friend's Computer (During Viva)

Your friend only needs to:

1. Clone the GitHub repo
2. Run `npm install`
3. Create `.env` file with THE SAME `MONGODB_URI` (copy from your .env)
4. Generate a new `JWT_SECRET` or use the same one
5. Run `npm run dev`

**The database is already seeded and ready!** No need to run `db:reset` again on friend's computer unless you want fresh data.

## Benefits of This Approach

✅ Database is in the cloud - accessible from anywhere
✅ No MongoDB installation needed on friend's computer
✅ Same data on both computers
✅ Perfect for viva demonstration
✅ Free forever (M0 tier)
✅ Reliable and fast

## Troubleshooting

**If connection fails:**
1. Check Network Access allows `0.0.0.0/0`
2. Check username/password are correct
3. Check special characters are URL-encoded
4. Check internet connection
5. Test with: `npm run db:reset` - if it works, connection is good!

## Security Note for Production

For a real production app, you would:
- Use specific IP addresses instead of 0.0.0.0/0
- Use environment-specific credentials
- Enable additional security features

But for FYP viva demonstration, this setup is perfect!
