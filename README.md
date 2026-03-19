# EventEase

EventEase is a Final Year Project web application for localized event discovery, booking, mock payment, QR/PDF ticketing, loyalty rewards, notifications, and admin management for Nepal-based events.

## Current status

Implemented:

- authentication with register, login, logout, forgot/reset password, and email verification
- event discovery and event details
- booking quote engine with promo, student, group, and loyalty discounts
- mock payment flow
- ticket issuance, QR display, PDF generation, and loyalty updates
- admin dashboard, event creation, promo management, booking visibility, verification review, and reports
- health check and seed/reset scripts

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Hook Form + Zod
- MongoDB + Mongoose
- JWT cookie session auth
- Nodemailer mock-safe mode
- QRCode + pdf-lib

## Quick start

1. Copy `.env.example` to `.env`
2. Fill `MONGODB_URI` and `JWT_SECRET`
3. Install packages:

```bash
npm install
```

4. Seed demo data:

```bash
npm run db:reset
```

5. Start development:

```bash
npm run dev
```

6. Open:

```text
http://localhost:3000
```

If `3000` is busy, Next.js may use another port.

## Demo credentials

- Admin: `admin@gmail.com`
- Admin password: `Password123`
- User: `user@gmail.com`
- User password: `Password123`

## Recommended database choice for viva

Recommended: MongoDB Atlas

Why:

- no Windows service setup required on your friend’s PC
- lower risk during viva
- only one connection string is needed in `.env`

Use local MongoDB only if internet access is unreliable or unavailable during the viva.

## MongoDB Atlas setup

1. Create a MongoDB Atlas account.
2. Create a cluster.
3. Create a database user.
4. Allow your IP address or use temporary `0.0.0.0/0` during testing.
5. Copy the connection string.
6. Put it into `.env` as:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster-url/eventease
```

7. Run:

```bash
npm run db:reset
```

## Local MongoDB setup on Windows

1. Download MongoDB Community Server.
2. Install it with the service option enabled.
3. Confirm MongoDB is running.
4. Use this in `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/eventease
```

5. Run:

```bash
npm run db:reset
```

## Environment variables

See [.env.example](.env.example).

Required:

- `MONGODB_URI`
- `JWT_SECRET`

Important optional values:

- `APP_URL`
- `GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `MOCK_PAYMENT_ENABLED`
- `MOCK_EMAIL_ENABLED`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `UPLOAD_DIR`
- `MAP_EMBED_API_KEY`
- `OPENWEATHER_API_KEY`

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm test
npm run db:seed
npm run db:reset
```

## Production-readiness checks

Before deployment, verify:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Current hardening highlights:

- session auth is normalized across email/password and Google sign-in
- Google sign-in is disabled unless both Google client ID env vars are configured
- promo validation, ticket availability, and booking confirmation are enforced server-side
- wishlist and review APIs validate identifiers and return consistent error responses
- full production build succeeds without code changes

## Health check

Use this route to verify the app and database connection:

```text
/api/health
```

If DB is configured correctly, it returns an `ok: true` JSON response.

## Demo flow for viva

### Public side

1. Open the landing page.
2. Go to `/events`.
3. Open an event details page.
4. Show filters and event detail sections.

### Authentication

1. Register a new account or use the seeded user.
2. Show login.
3. Show forgot password.
4. If mock email mode is enabled, show the generated reset or verification link directly in the UI.

### Booking and payment

1. Open an event.
2. Click `Book Tickets`.
3. Change quantity.
4. Apply promo code:
   `FEST10` or `NEPAL500`
5. Optionally apply student discount using the seeded demo user.
6. Optionally redeem loyalty points.
7. Create booking.
8. Open the booking page.
9. Simulate mock payment success.

### Tickets and loyalty

1. Open `/tickets`.
2. Show QR ticket cards.
3. Download a ticket PDF.
4. Open `/loyalty`.
5. Show points and recent reward activity.

### Admin panel

1. Login as admin.
2. Open `/admin`.
3. Go to `/admin/events` and create an event.
4. Go to `/admin/promo-codes` and create a promo code.
5. Go to `/admin/bookings` to review bookings.
6. Go to `/admin/users` to review users.
7. Go to `/admin/verifications` to review student verification requests.
8. Go to `/admin/reports` to show sales summary.

## Seeded demo data

The reset script prepares:

- demo admin account
- demo user account
- multiple Nepal-focused events
- multiple ticket types
- promo codes
- approved student verification for demo user
- one confirmed sample booking with issued tickets
- notification log records

## Mock mode behavior

### Mock payment

`MOCK_PAYMENT_ENABLED=true`

The system uses the built-in payment simulation instead of a real gateway.

### Mock email

`MOCK_EMAIL_ENABLED=true`

The system logs or exposes verification and reset links without requiring SMTP.

## Local file uploads

Student verification file handling is designed to use `UPLOAD_DIR` in development. This keeps local storage portable and avoids machine-specific paths.

## Troubleshooting

### App starts but page is slow

Kill stale Node processes and restart:

```bash
npm run build
npm run start
```

The production server is often more responsive than `npm run dev` on weaker machines.

### Port already in use

Stop the old process or use the port shown by Next.js in the terminal.

### Seed script fails

Check:

- `.env` exists
- `MONGODB_URI` is valid
- MongoDB Atlas IP/network access is allowed or local MongoDB service is running

### Cannot login with demo accounts

Run:

```bash
npm run db:reset
```

## Architecture

See [docs/architecture.md](docs/architecture.md) for the application plan and schema design.
