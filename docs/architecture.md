# EventEase Phase 1 Architecture

## Product summary

EventEase is a Nepal-focused event discovery and ticket booking platform with two primary surfaces:

- A public customer experience for discovering events, registering, booking tickets, applying discounts, paying through a mock-friendly flow, and managing QR/PDF tickets.
- An admin workspace for managing events, ticket types, promo codes, users, student verification requests, bookings, and sales reporting.

The build is optimized for viva reliability:

- all environment-specific values live in `.env`
- MongoDB works through a single `MONGODB_URI`
- payment and email have mock modes
- optional APIs degrade gracefully
- seed and reset scripts make the demo reproducible

## Recommended stack

- Framework: Next.js App Router with TypeScript
- Styling: Tailwind CSS v4 with shadcn-style component patterns
- Forms and validation: React Hook Form + Zod
- Database: MongoDB with Mongoose
- Auth: custom JWT session in secure `httpOnly` cookies with role checks
- Notifications: Nodemailer with mock log fallback
- Tickets: QR generation with `qrcode`, PDFs with `pdf-lib`

## Architecture decisions

- One full-stack Next.js app. This keeps deployment, local setup, and viva explanation simple.
- Route Handlers for API endpoints. No separate Express server.
- Server-heavy business logic in `src/server`. Pages call reusable services instead of duplicating rules.
- Mongoose models defined per domain object with indexes on lookup-heavy fields.
- A deterministic mock payment adapter will be used first, with a provider interface so real gateways can be added later.
- Local file uploads for student verification in development, using a configurable upload root.

## Data model proposal

### User

- `name`
- `email` unique indexed
- `passwordHash`
- `role` enum: `USER`, `ADMIN`
- `emailVerifiedAt`
- `avatarUrl`
- `phone`
- `loyaltyPoints`
- `loyaltyTier` enum: `BRONZE`, `SILVER`, `GOLD`
- `notificationPreferences`
- `studentVerificationStatus`
- `studentVerificationId`
- `lastLoginAt`

### Event

- `title`
- `slug` unique indexed
- `summary`
- `description`
- `category` indexed
- `posterUrl`
- `status` enum: `DRAFT`, `PUBLISHED`, `CANCELLED`
- `startsAt` indexed
- `endsAt`
- `city`
- `venueName`
- `venueAddress`
- `mapUrl`
- `organizerName`
- `organizerEmail`
- `tags`
- `ticketTypeIds`
- `settings` for featured/demo flags

### TicketType

- `eventId` indexed
- `name`
- `description`
- `price`
- `currency`
- `quantityTotal`
- `quantitySold`
- `saleStartsAt`
- `saleEndsAt`
- `perUserLimit`
- `benefits`

### Booking

- `bookingCode` unique indexed
- `userId` indexed
- `eventId` indexed
- `ticketSelections`
- `status` enum: `PENDING`, `CONFIRMED`, `CANCELLED`, `EXPIRED`
- `pricing` object with subtotal, applied discounts, redeemed points, final amount
- `promoCodeId`
- `studentDiscountApplied`
- `groupDiscountApplied`
- `loyaltyPointsEarned`
- `loyaltyPointsRedeemed`
- `paymentId`
- `confirmedAt`

### Ticket

- `ticketCode` unique indexed
- `bookingId` indexed
- `eventId`
- `userId`
- `ticketTypeId`
- `holderName`
- `qrPayload`
- `pdfPath`
- `status` enum: `ACTIVE`, `USED`, `CANCELLED`
- `issuedAt`

### Payment

- `bookingId` indexed
- `provider` enum: `MOCK`
- `status` enum: `INITIATED`, `SUCCESS`, `FAILED`, `REFUNDED`
- `amount`
- `currency`
- `reference`
- `meta`
- `paidAt`

### PromoCode

- `code` unique indexed
- `description`
- `discountType` enum: `PERCENTAGE`, `FIXED`
- `discountValue`
- `maxDiscountAmount`
- `validFrom`
- `validUntil`
- `usageLimit`
- `usedCount`
- `applicableEventIds`
- `minimumSubtotal`
- `isActive`

### StudentVerification

- `userId` unique indexed
- `documentPath`
- `status` enum: `PENDING`, `APPROVED`, `REJECTED`
- `reviewedBy`
- `reviewedAt`
- `notes`

### NotificationLog

- `userId` indexed
- `channel` enum: `EMAIL`, `IN_APP`, `LOG`
- `type`
- `subject`
- `payload`
- `status`
- `sentAt`

### AuditLog

- `actorUserId`
- `action`
- `entityType`
- `entityId`
- `before`
- `after`
- `createdAt`

## Page map

### Public

- `/`
- `/events`
- `/events/[slug]`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password/[token]`
- `/verify-email/[token]`

### User authenticated

- `/dashboard`
- `/profile`
- `/profile/verification`
- `/tickets`
- `/bookings/[bookingCode]`
- `/checkout/[eventSlug]`
- `/loyalty`

### Admin

- `/admin`
- `/admin/events`
- `/admin/events/new`
- `/admin/events/[id]/edit`
- `/admin/promo-codes`
- `/admin/users`
- `/admin/verifications`
- `/admin/bookings`
- `/admin/reports`

## API route map

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `GET /api/auth/session`
- `GET /api/events`
- `GET /api/events/[slug]`
- `POST /api/bookings/quote`
- `POST /api/bookings/create`
- `POST /api/payments/mock/confirm`
- `GET /api/tickets/[ticketCode]/pdf`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `POST /api/users/me/student-verification`
- `GET /api/admin/metrics`
- `GET /api/admin/events`
- `POST /api/admin/events`
- `PATCH /api/admin/events/[id]`
- `DELETE /api/admin/events/[id]`
- `GET /api/admin/promo-codes`
- `POST /api/admin/promo-codes`
- `PATCH /api/admin/promo-codes/[id]`
- `GET /api/admin/users`
- `PATCH /api/admin/users/[id]`
- `GET /api/admin/bookings`
- `GET /api/admin/reports/sales`
- `GET /api/health`

## Discount rules

- Promo codes are always validated server-side.
- Student discount only applies when the user has an approved verification.
- Group discount activates when the total ticket quantity crosses a configured threshold.
- Loyalty redemption can stack with promo/student/group discounts, but only up to a configured percentage cap.
- Final totals are calculated on the server from the canonical ticket prices, never trusted from the client.

Initial demo-safe rules:

- promo code: percentage or fixed amount
- student discount: 10%
- group discount: 12% for 4 or more tickets
- loyalty redemption: max 20% of subtotal

## Folder structure

```text
src/
  app/
  components/
    layout/
    sections/
    ui/
  lib/
  models/
  server/
    auth/
    bookings/
    notifications/
    payments/
    tickets/
  types/
scripts/
docs/
public/
```

## Demo-safe shortcuts

- Use `bcryptjs` instead of native `bcrypt` to avoid Windows build issues during viva setup.
- Use a mock email provider by default and log verification/reset links locally.
- Use a mock payment provider with deterministic success/failure toggle.
- Keep map support optional: show venue details and a map link when no API key is configured.
- Seed polished Nepal-centric events, users, promo codes, and example bookings.

## Database recommendation for viva

Recommended default: MongoDB Atlas.

Why:

- no Windows service installation on the viva machine
- less risk from local MongoDB startup issues
- only one connection string is needed in `.env`

Fallback support: local MongoDB should still work by changing only `MONGODB_URI`.

Planned README guidance:

- Atlas setup path for fastest demo
- Local MongoDB Community Server path for offline fallback
- `/api/health` endpoint for verifying DB connectivity before the viva
