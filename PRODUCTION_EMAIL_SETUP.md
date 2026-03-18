# 📧 PRODUCTION EMAIL SETUP GUIDE

## 🎯 Making Your System Industry-Ready with Real Emails

Your EventEase system is already built for production! Let's configure real email sending.

---

## 🚀 OPTION 1: Gmail SMTP (Recommended - FREE)

### Step 1: Create Gmail App Password

1. **Go to your Google Account:**
   - Visit: https://myaccount.google.com/
   - Sign in with your Gmail account

2. **Enable 2-Step Verification (if not already enabled):**
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

3. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter name: "EventEase"
   - Click "Generate"
   - **COPY THE 16-CHARACTER PASSWORD** (you'll need this)

### Step 2: Update Your .env File

Open `.env` and update these lines:

```env
# Change this from true to false
MOCK_EMAIL_ENABLED=false

# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SMTP_FROM=EventEase <your-email@gmail.com>
```

**Example:**
```env
MOCK_EMAIL_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=bibushan.eventease@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=EventEase <bibushan.eventease@gmail.com>
```

### Step 3: Restart Your Application

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test It!

1. Go to http://localhost:3000/register
2. Register with a real email address
3. Check your email inbox
4. You'll receive a professional verification email!

---

## 🚀 OPTION 2: SendGrid (Professional - FREE Tier Available)

SendGrid offers 100 emails/day for free - perfect for production!

### Step 1: Create SendGrid Account

1. Go to: https://signup.sendgrid.com/
2. Sign up for free account
3. Verify your email
4. Complete sender verification

### Step 2: Create API Key

1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name: "EventEase Production"
4. Permissions: "Full Access"
5. Copy the API key

### Step 3: Update .env

```env
MOCK_EMAIL_ENABLED=false
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=EventEase <noreply@yourdomain.com>
```

---

## 🚀 OPTION 3: Outlook/Hotmail SMTP (FREE)

### Configuration:

```env
MOCK_EMAIL_ENABLED=false
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=EventEase <your-email@outlook.com>
```

---

## 🚀 OPTION 4: Custom Domain Email (Professional)

If you have a custom domain (e.g., eventease.com):

### Using cPanel/Hosting Email:

```env
MOCK_EMAIL_ENABLED=false
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-email-password
SMTP_FROM=EventEase <noreply@yourdomain.com>
```

---

## ✅ QUICK SETUP (5 Minutes)

### For Gmail (Easiest):

1. **Get App Password:**
   ```
   https://myaccount.google.com/apppasswords
   ```

2. **Update .env:**
   ```env
   MOCK_EMAIL_ENABLED=false
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=EventEase <your-email@gmail.com>
   ```

3. **Restart:**
   ```bash
   npm run dev
   ```

4. **Test:**
   - Register new user
   - Check email inbox
   - Click verification link

---

## 📧 What Your Users Will Receive

### Professional Email Template:

```
From: EventEase <your-email@gmail.com>
Subject: Verify your EventEase account

┌─────────────────────────────────────┐
│         EVENTEASE                   │
│                                     │
│  Verify your email                  │
│                                     │
│  Complete your EventEase            │
│  registration by verifying your     │
│  email address.                     │
│                                     │
│  [Verify Email Button]              │
│                                     │
│  http://localhost:3000/verify-...   │
└─────────────────────────────────────┘
```

**Features:**
- ✅ Professional HTML design
- ✅ Branded with EventEase logo
- ✅ Clear call-to-action button
- ✅ Fallback text link
- ✅ Mobile responsive

---

## 🔒 Security Best Practices

### ✅ Already Implemented:

1. **App Passwords** - Never use main Gmail password
2. **Environment Variables** - Credentials in .env (not in code)
3. **JWT Tokens** - Secure verification tokens
4. **24-Hour Expiry** - Tokens expire after 24 hours
5. **HTTPS Ready** - Works with SSL/TLS

### ⚠️ Important:

- **Never commit .env to Git** (already in .gitignore)
- **Use App Passwords** for Gmail (not main password)
- **Rotate credentials** periodically
- **Monitor email quota** (Gmail: 500/day, SendGrid: 100/day free)

---

## 🧪 Testing Real Emails

### Test Checklist:

```bash
# 1. Register new user
✓ Go to /register
✓ Enter real email address
✓ Submit form

# 2. Check email
✓ Open email inbox
✓ Look for "Verify your EventEase account"
✓ Email should arrive within 1-2 minutes

# 3. Verify email
✓ Click "Verify Email" button
✓ Should redirect to success page
✓ User should be logged in

# 4. Test other emails
✓ Forgot password
✓ Password reset
✓ Booking confirmations (if implemented)
```

---

## 🎯 For Your Viva

### What to Say:

"The system uses industry-standard SMTP for email delivery. We support multiple providers including Gmail, SendGrid, and custom SMTP servers. Emails are sent asynchronously with proper error handling. The system uses JWT tokens for secure email verification with 24-hour expiration."

### What to Show:

1. Show .env configuration (hide credentials)
2. Register a new user with real email
3. Show email received in inbox
4. Click verification link
5. Show successful verification

---

## 📊 Email Limits (Free Tiers)

| Provider   | Free Limit      | Best For           |
|------------|-----------------|-------------------|
| Gmail      | 500/day         | Development/Small |
| SendGrid   | 100/day         | Production        |
| Outlook    | 300/day         | Development       |
| Mailgun    | 5,000/month     | Production        |
| AWS SES    | 62,000/month    | Large Scale       |

---

## 🚨 Troubleshooting

### Email Not Sending?

1. **Check .env file:**
   ```bash
   # Make sure MOCK_EMAIL_ENABLED=false
   # Verify SMTP credentials are correct
   ```

2. **Check Gmail App Password:**
   - Must be 16 characters
   - No spaces in password
   - 2-Step Verification must be enabled

3. **Check Console Logs:**
   ```bash
   # Look for errors in terminal
   # Should NOT see "[mock-email]"
   ```

4. **Test SMTP Connection:**
   ```bash
   # Your system will show errors if SMTP fails
   ```

### Email Goes to Spam?

1. **Add sender to contacts**
2. **Mark as "Not Spam"**
3. **For production:** Set up SPF/DKIM records

---

## 🎉 PRODUCTION READY CHECKLIST

- [ ] MOCK_EMAIL_ENABLED=false
- [ ] SMTP credentials configured
- [ ] Test email sending works
- [ ] Verification emails received
- [ ] Password reset emails work
- [ ] Email template looks professional
- [ ] Emails don't go to spam
- [ ] Error handling works
- [ ] Credentials secured in .env
- [ ] .env not committed to Git

---

## 💡 Recommended Setup for Viva

### Use Gmail SMTP:

```env
MOCK_EMAIL_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=EventEase <your-email@gmail.com>
```

**Why?**
- ✅ Free and reliable
- ✅ Easy to set up (5 minutes)
- ✅ Professional appearance
- ✅ 500 emails/day (plenty for demo)
- ✅ Works immediately

---

## 🚀 NEXT STEPS

1. **Choose Provider:** Gmail (recommended)
2. **Get Credentials:** Create App Password
3. **Update .env:** Add SMTP settings
4. **Restart App:** `npm run dev`
5. **Test:** Register with real email
6. **Verify:** Check inbox and click link

---

## 📞 Quick Reference

### Gmail App Password URL:
```
https://myaccount.google.com/apppasswords
```

### .env Template:
```env
MOCK_EMAIL_ENABLED=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
SMTP_FROM=EventEase <your-email@gmail.com>
```

### Test Command:
```bash
npm run dev
```

---

## ✨ Your System is Already Production-Ready!

The code is already built for real emails. You just need to:
1. Get Gmail App Password (2 minutes)
2. Update .env file (1 minute)
3. Restart application (30 seconds)
4. Test! (1 minute)

**Total Time: 5 minutes to go from mock to production!** 🚀

---

**Status:** ✅ PRODUCTION-READY CODE
**Setup Time:** 5 minutes
**Cost:** FREE (Gmail)
**Industry Standard:** YES
