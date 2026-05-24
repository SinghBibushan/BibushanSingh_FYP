# EventEase Viva Guide

## 1. Project in One Line

EventEase is a Nepal-focused event management and ticketing platform that covers discovery, booking, payment, QR/PDF ticketing, loyalty rewards, organizer submissions, admin operations, and venue check-in.

## 2. Problem Statement

Most small and medium event workflows are fragmented:

- users discover events on one platform
- bookings are tracked elsewhere
- organizers depend on manual approval or spreadsheets
- venue staff verify tickets manually
- reminders and post-booking communication are inconsistent

EventEase combines these workflows into one web application.

## 3. Main User Roles

### Guest

- browse events
- open event details
- review venue, schedule, gallery, weather, and reviews
- register or login

### Registered User

- create bookings
- apply promo, student, group, and loyalty discounts
- complete payment
- receive QR/PDF tickets
- manage booking history
- cancel confirmed bookings
- receive notifications and reminders
- save events to wishlist
- review attended events

### Organizer

- create draft events
- define ticket inventory
- submit events for approval
- monitor published events and sales

### Admin

- manage events, promo codes, users, bookings, and verifications
- approve/reject organizer submissions
- monitor reports
- trigger reminder notifications for upcoming events

### Staff

- scan QR or ticket codes
- prevent duplicate entry
- log check-in activity

## 4. Main Modules

### Authentication

- email/password login and register
- forgot/reset password
- email verification
- optional Google sign-in
- JWT session cookie authentication

### Event Discovery

- public event catalogue
- event detail pages
- gallery
- reviews
- weather widget for outdoor events
- wishlist and sharing support

### Booking and Payment

- ticket quantity selection
- promo code validation
- student discount validation
- group discount logic
- loyalty redemption
- mock payment or PayPal-ready flow

### Ticketing

- confirmed bookings issue ticket records
- QR code generated per ticket
- PDF ticket download
- staff-side scan validation

### Post-Booking Lifecycle

- booking history screen
- pending, confirmed, expired, and cancelled booking states
- cancellation with loyalty reversal and payment refund state
- notification center for status updates

### Operations

- admin dashboard
- organizer workflow
- staff check-in console
- reporting and reminder trigger

## 5. Technical Stack and Why

### Next.js App Router

- full-stack app in one project
- pages and API routes stay together
- easier to explain and deploy for FYP

### TypeScript

- safer data handling
- better maintainability
- stronger validation across client and server

### Tailwind CSS

- fast UI building
- consistent design system

### MongoDB + Mongoose

- flexible schema for events, bookings, tickets, notifications, and reviews
- good fit for document-heavy platform data

### JWT Cookie Auth

- simple and reliable session handling
- role-based authorization

### Zod + React Hook Form

- form validation on structured input
- clean server/client validation boundary

### Nodemailer

- email and reminder support
- mock-safe mode for viva

### QRCode + pdf-lib

- ticket QR generation
- downloadable ticket PDFs

## 6. Core Data Flow

1. User interacts with a page in `src/app`.
2. Client form sends request to an API route in `src/app/api`.
3. API route validates input and calls business logic in `src/server`.
4. Business logic reads/writes MongoDB through `src/models`.
5. Result returns to the UI and updates the next step in the flow.

## 7. Important Business Rules

- final booking price is calculated on the server
- promo codes are validated server-side
- student discount only works for approved users
- group discount applies by ticket quantity threshold
- loyalty redemption is capped
- tickets are issued only after successful payment
- ticket check-in blocks reused or cancelled tickets
- cancelling a confirmed booking reverses reward effects
- reminder notifications avoid duplicate sends

## 8. Strong End-to-End Flows to Present

### Flow A: User Booking Lifecycle

1. User opens event
2. selects tickets
3. applies discount logic
4. creates booking
5. completes payment
6. receives QR/PDF tickets
7. sees booking in booking history
8. can cancel confirmed booking if needed

### Flow B: Admin Reminder Flow

1. Admin opens reports
2. triggers 15-day reminder process
3. system finds upcoming published events
4. system finds confirmed attendees
5. system creates in-app notification and email/log reminder

### Flow C: Organizer Approval Flow

1. Organizer creates event draft
2. submits for review
3. admin reviews and approves/rejects
4. approved event becomes public
5. public users can book it

### Flow D: Staff Entry Validation Flow

1. Staff scans QR or enters ticket code
2. system checks booking status and ticket status
3. valid ticket becomes used
4. duplicate or cancelled ticket is denied
5. check-in log is stored

## 9. New Flows Added for Bigger Scope

- booking history and cancellation flow
- notification inbox flow
- admin manual reminder trigger flow

These additions make the project larger because they extend the platform after payment, not just before it.

## 10. Good Demo Order for Pre-Defense

1. Show landing page and explain user roles
2. Open event list and event details
3. Login as user
4. Create booking and show discount engine
5. Confirm payment
6. Open booking history
7. Open ticket vault and QR/PDF
8. Open notification inbox
9. Cancel a confirmed booking to show refund lifecycle
10. Login as organizer and show event submission
11. Login as admin and show approval/report/reminder trigger
12. Login as staff and show check-in

## 11. Likely Questions and Short Answers

### Why Next.js instead of separate frontend and backend?

Because it reduces deployment complexity and keeps UI, API routes, and business logic in one maintainable project, which is practical for an FYP.

### Why MongoDB?

Because the project has flexible entities such as events, ticket selections, notifications, reviews, and metadata-rich bookings that fit document storage well.

### How do you prevent price tampering?

All final pricing is recalculated on the server from database ticket prices and validated discount rules.

### How do you prevent duplicate ticket use?

Staff check-in marks a valid ticket as `USED`, and later scans are denied and logged.

### How is the project scalable?

The code is already separated into routes, services, and models, so new payment providers, notification channels, or analytics features can be added without rewriting the whole app.

### What makes this more than a simple booking app?

It supports multiple actors and full operational workflows: organizers, admins, users, and staff, plus loyalty, reminders, notifications, verification, and post-booking management.
