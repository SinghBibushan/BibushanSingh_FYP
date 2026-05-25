# EventEase

EventEase is a curated event discovery and ticketing platform built for Nepal. The system combines public event browsing, account-based booking, discount-aware checkout, QR and PDF ticket delivery, loyalty rewards, and role-based operational dashboards for organizers, staff, and administrators.

## Highlights

- curated event catalogue with filters, featured listings, and detailed event pages
- account registration, login, password recovery, email verification, and optional Google sign-in
- booking workflow with promo codes, student pricing, group discounts, and loyalty redemption
- ticket issuance with QR codes, downloadable PDFs, and booking history
- role-based dashboards for attendees, organizers, staff, and administrators
- reporting, notifications, verification review, and event management tools

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Hook Form and Zod
- MongoDB with Mongoose
- JWT cookie authentication
- Nodemailer
- `qrcode` and `pdf-lib`

## Getting started

1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` and `JWT_SECRET`.
3. Install dependencies:

```bash
npm install
```

4. Seed the database with sample project data:

```bash
npm run db:reset
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See [.env.example](.env.example) for the full template.

Required:

- `MONGODB_URI`
- `JWT_SECRET`

Common optional values:

- `APP_URL`
- `GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `MOCK_PAYMENT_ENABLED`
- `MOCK_EMAIL_ENABLED`
- `SMTP_SERVICE`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `UPLOAD_DIR`
- `MAP_EMBED_API_KEY`
- `OPENWEATHER_API_KEY`

## Available scripts

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

## Sample data

Running `npm run db:reset` prepares seeded accounts, Nepal-focused events, ticket inventory, promo codes, verification records, notifications, and example bookings for local testing.

## Deployment notes

- Use MongoDB Atlas or another hosted MongoDB instance for deployed environments.
- Set `APP_URL` to the production domain.
- Add the production callback URL to Google Cloud Console when Google sign-in is enabled.
- Run the following checks before deployment:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Project structure

```text
src/
  app/            Next.js routes and API handlers
  components/     reusable UI and feature components
  lib/            shared utilities, config, and client helpers
  models/         Mongoose models
  server/         domain services and server-side business logic
  types/          shared TypeScript types
scripts/          seed, maintenance, and verification scripts
docs/             technical project documentation
public/           static assets
tests/            automated test coverage
```

## Technical documentation

- [System architecture](docs/technical/architecture.md)

## Health endpoint

The application exposes `/api/health` for basic application and database health checks.
