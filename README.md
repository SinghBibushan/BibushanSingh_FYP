# EventEase

EventEase is a professional Final Year Project web application for localized event discovery and ticket booking in Nepal.

Current status:

- Phase 1 architecture completed
- base Next.js project scaffolded
- domain models and core utilities scaffolded
- public, auth, user, admin, and health-check routes initialized

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style component structure
- MongoDB + Mongoose

## Available now

- landing page scaffold
- event listing scaffold
- event details scaffold
- auth page scaffolds
- user dashboard scaffold
- admin dashboard scaffold
- `GET /api/health` for database connectivity checks

## Quick start

1. Copy `.env.example` to `.env`
2. Fill `MONGODB_URI` and `JWT_SECRET`
3. Install dependencies with `npm install`
4. Run the app with `npm run dev`

## Architecture

See [docs/architecture.md](docs/architecture.md) for the Phase 1 product summary, schema design, route plan, folder structure, discount rules, and viva strategy.

## Next phases

- Phase 3: authentication and shared app shell
- Phase 4: event discovery and filters
- Phase 5: booking, discounts, and mock payment
- Phase 6: tickets, loyalty, and notifications
- Phase 7: admin CRUD and reporting
- Phase 8: seed data, demo guide, and viva setup docs
- Phase 9: production-quality review and refinements
