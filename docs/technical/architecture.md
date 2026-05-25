# EventEase Architecture

## Product summary

EventEase is a Nepal-focused event discovery and ticketing platform with two primary surfaces:

- A public customer experience for browsing events, reviewing event details, booking tickets, applying discounts, making payments, and managing QR or PDF tickets.
- A role-based operational workspace for organizers, staff, and administrators to manage events, approvals, bookings, reports, and venue operations.

The platform is designed to be straightforward to run locally and easy to review:

- environment-specific values are isolated in `.env`
- MongoDB uses a single `MONGODB_URI`
- payment and email support local-friendly mock modes
- optional third-party integrations degrade gracefully
- seed and reset scripts prepare consistent sample data

## Core stack

- Framework: Next.js App Router with TypeScript
- Styling: Tailwind CSS with reusable UI primitives
- Forms and validation: React Hook Form with Zod
- Database: MongoDB with Mongoose
- Authentication: JWT session cookies with role checks
- Notifications: Nodemailer with mock fallback support
- Ticket delivery: QR generation with `qrcode`, PDFs with `pdf-lib`

## Architecture decisions

- One full-stack Next.js application keeps the codebase easier to deploy and maintain.
- Route Handlers are used for API endpoints instead of a separate Express server.
- Business rules live in `src/server` so routes and pages can reuse the same logic.
- Mongoose models are organized by domain entity with indexes on lookup-heavy fields.
- Payment flows are abstracted so mock and PayPal-based flows can share the same booking pipeline.
- Student verification uploads use a configurable local upload path in development.

## Data model overview

### User

- `name`
- `email`
- `passwordHash`
- `role`
- `emailVerifiedAt`
- `avatarUrl`
- `phone`
- `loyaltyPoints`
- `loyaltyTier`
- `notificationPreferences`
- `studentVerificationStatus`
- `studentVerificationId`
- `lastLoginAt`

### Event

- `title`
- `slug`
- `summary`
- `description`
- `category`
- `posterUrl`
- `status`
- `startsAt`
- `endsAt`
- `city`
- `venueName`
- `venueAddress`
- `mapUrl`
- `organizerName`
- `organizerEmail`
- `tags`
- `ticketTypeIds`
- `settings`

### TicketType

- `eventId`
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

- `bookingCode`
- `userId`
- `eventId`
- `ticketSelections`
- `status`
- `pricing`
- `promoCodeId`
- `studentDiscountApplied`
- `groupDiscountApplied`
- `loyaltyPointsEarned`
- `loyaltyPointsRedeemed`
- `paymentId`
- `confirmedAt`

### Ticket

- `ticketCode`
- `bookingId`
- `eventId`
- `userId`
- `ticketTypeId`
- `holderName`
- `qrPayload`
- `pdfPath`
- `status`
- `issuedAt`

### Payment

- `bookingId`
- `provider`
- `status`
- `amount`
- `currency`
- `reference`
- `meta`
- `paidAt`

### PromoCode

- `code`
- `description`
- `discountType`
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

- `userId`
- `documentPath`
- `status`
- `reviewedBy`
- `reviewedAt`
- `notes`

### NotificationLog

- `userId`
- `channel`
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

## Route map

### Public routes

- `/`
- `/events`
- `/events/[slug]`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password/[token]`
- `/verify-email/[token]`

### Authenticated user routes

- `/dashboard`
- `/profile`
- `/profile/verification`
- `/tickets`
- `/bookings/[bookingCode]`
- `/checkout/[eventSlug]`
- `/loyalty`

### Operations routes

- `/organizer`
- `/organizer/events`
- `/staff`
- `/admin`
- `/admin/events`
- `/admin/promo-codes`
- `/admin/users`
- `/admin/verifications`
- `/admin/bookings`
- `/admin/reports`

## API map

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `POST /api/auth/google`
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

## Pricing and booking rules

- Final booking totals are calculated on the server.
- Promo codes are always validated server-side.
- Student discounts are only applied to approved accounts.
- Group discounts are based on selected ticket quantity thresholds.
- Loyalty redemption is capped to prevent over-discounting.
- Tickets are issued only after successful payment confirmation.

Default rules:

- promo code: percentage or fixed amount
- student discount: 10%
- group discount: 12% for 4 or more tickets
- loyalty redemption: maximum 20% of subtotal

## Folder structure

```text
src/
  app/
  components/
    admin/
    bookings/
    events/
    forms/
    layout/
    notifications/
    sections/
    ui/
  lib/
  models/
  server/
    admin/
    auth/
    bookings/
    notifications/
    payments/
    tickets/
  types/
scripts/
docs/
  technical/
public/
tests/
```

## Operational defaults

- `bcryptjs` is used instead of native `bcrypt` for simpler setup across environments.
- Mock email can expose verification and reset links locally when SMTP is not configured.
- Mock payment supports predictable success and failure testing paths.
- Venue map support remains optional when no map API key is configured.
- Sample Nepal-focused content is available through the seed scripts for development and review.
