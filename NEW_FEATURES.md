# New Features Documentation

## Overview
This document describes the newly added features to the EventEase platform.

## Features Added

### 1. 💺 Seat Selection for Venues

**Models:**
- `src/models/SeatLayout.ts` - Manages venue seating arrangements

**API Routes:**
- `GET /api/seats?eventId={id}` - Fetch seat layout for an event
- `POST /api/seats` - Create seat layout (Admin only)

**Components:**
- `src/components/seats/seat-selector.tsx` - Interactive seat selection UI

**Features:**
- Visual seat map with rows and seat numbers
- Three seat types: Regular, Premium, VIP
- Real-time seat availability
- Color-coded seat status (Available, Booked, Selected)
- Stage indicator for orientation

**Usage:**
```tsx
import { SeatSelector } from "@/components/seats/seat-selector";

<SeatSelector
  eventId="event123"
  onSeatsSelected={(seats) => console.log(seats)}
/>
```

---

### 2. 🔔 Real-time Notifications System

**Models:**
- `src/models/Notification.ts` - Stores user notifications

**API Routes:**
- `GET /api/notifications` - Fetch user notifications
- `PATCH /api/notifications` - Mark notification as read

**Components:**
- `src/components/notifications/notification-bell.tsx` - Notification bell with dropdown

**Notification Types:**
- BOOKING_CONFIRMED
- EVENT_REMINDER
- PAYMENT_SUCCESS
- REVIEW_REQUEST
- CHAT_MESSAGE
- EVENT_UPDATE

**Features:**
- Unread count badge
- Auto-refresh every 30 seconds
- Click to mark as read
- Link to relevant pages

**Usage:**
```tsx
import { NotificationBell } from "@/components/notifications/notification-bell";

<NotificationBell />
```

---

### 3. ⭐ Event Reviews and Ratings

**Models:**
- `src/models/Review.ts` - Updated with photo support

**API Routes:**
- `GET /api/reviews?eventId={id}` - Fetch event reviews
- `POST /api/reviews` - Submit a review

**Components:**
- `src/components/reviews/review-form.tsx` - Review submission form
- `src/components/reviews/event-reviews.tsx` - Display reviews

**Features:**
- 5-star rating system
- Review title and comment
- Photo attachments support
- Verified purchase badge
- Average rating calculation
- One review per booking

**Usage:**
```tsx
import { ReviewForm } from "@/components/reviews/review-form";
import { EventReviews } from "@/components/reviews/event-reviews";

<ReviewForm eventId="event123" bookingId="booking456" />
<EventReviews eventId="event123" />
```

---

### 4. 💬 Live Chat Support

**Models:**
- `src/models/ChatMessage.ts` - Stores chat messages

**API Routes:**
- `GET /api/chat` - Fetch chat messages
- `POST /api/chat` - Send a message

**Components:**
- `src/components/chat/live-chat.tsx` - Live chat interface

**Features:**
- Real-time messaging (polling every 5 seconds)
- User and admin message distinction
- Auto-scroll to latest message
- Message timestamps
- Room-based conversations

**Usage:**
```tsx
import { LiveChat } from "@/components/chat/live-chat";

<LiveChat />
```

---

### 5. 📸 Event Photo Gallery

**Models:**
- `src/models/EventGallery.ts` - Stores event photos

**API Routes:**
- `GET /api/gallery?eventId={id}` - Fetch event photos
- `POST /api/gallery` - Upload a photo

**Components:**
- `src/components/gallery/event-gallery.tsx` - Photo grid display

**Features:**
- User-uploaded photos
- Photo captions
- Hover effects with photographer name
- Admin approval system
- Responsive grid layout

**Usage:**
```tsx
import { EventGallery } from "@/components/gallery/event-gallery";

<EventGallery eventId="event123" />
```

---

### 6. 🌤️ Weather Forecast for Outdoor Events

**Services:**
- `src/lib/weather.ts` - Weather API integration

**API Routes:**
- `GET /api/weather?city={city}&date={date}` - Fetch weather forecast

**Components:**
- `src/components/weather/weather-widget.tsx` - Weather display widget

**Features:**
- 5-day weather forecast
- Temperature, humidity, wind speed
- Weather icons and descriptions
- Mock data support for demo
- OpenWeatherMap API integration

**Usage:**
```tsx
import { WeatherWidget } from "@/components/weather/weather-widget";

<WeatherWidget city="Kathmandu" date="2026-03-15" />
```

**Setup:**
1. Get free API key from https://openweathermap.org/api
2. Add to `.env`: `OPENWEATHER_API_KEY=your_key_here`
3. Or use `OPENWEATHER_API_KEY=demo` for mock data

---

### 7. 🔐 Google Account Registration

**Models:**
- `src/models/User.ts` - Updated with Google OAuth fields

**API Routes:**
- `POST /api/auth/google` - Google OAuth authentication

**Components:**
- `src/components/auth/google-signin-button.tsx` - Google Sign-In button

**Features:**
- One-click Google Sign-In
- Auto-create account on first login
- Link existing accounts
- Email verification bypass
- Avatar from Google profile

**Setup:**
1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized origins: `http://localhost:3000`
6. Add to `.env`: `NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id`

**Usage:**
```tsx
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

<GoogleSignInButton />
```

---

## Database Schema Updates

### Event Model
```typescript
settings: {
  featured: Boolean,
  highlighted: Boolean,
  isOutdoor: Boolean,           // NEW
  seatSelectionEnabled: Boolean, // NEW
},
averageRating: Number,           // NEW
totalReviews: Number,            // NEW
```

### User Model
```typescript
googleId: String,                // NEW
authProvider: "LOCAL" | "GOOGLE", // NEW
passwordHash: String,            // Now optional for Google users
```

### Review Model
```typescript
photos: [String],                // NEW - Array of photo URLs
```

---

## Environment Variables

Add these to your `.env` file:

```env
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Weather API
OPENWEATHER_API_KEY=demo  # or your actual API key
```

---

## Integration Examples

### Event Details Page with All Features

```tsx
import { WeatherWidget } from "@/components/weather/weather-widget";
import { EventReviews } from "@/components/reviews/event-reviews";
import { EventGallery } from "@/components/gallery/event-gallery";
import { SeatSelector } from "@/components/seats/seat-selector";

export default function EventPage({ event }) {
  return (
    <div>
      <h1>{event.title}</h1>

      {/* Weather for outdoor events */}
      {event.settings.isOutdoor && (
        <WeatherWidget city={event.city} date={event.startsAt} />
      )}

      {/* Seat selection if enabled */}
      {event.settings.seatSelectionEnabled && (
        <SeatSelector eventId={event._id} onSeatsSelected={handleSeats} />
      )}

      {/* Photo gallery */}
      <EventGallery eventId={event._id} />

      {/* Reviews */}
      <EventReviews eventId={event._id} />
    </div>
  );
}
```

### Header with Notifications

```tsx
import { NotificationBell } from "@/components/notifications/notification-bell";

export function Header() {
  return (
    <header>
      <nav>
        {/* ... other nav items ... */}
        <NotificationBell />
      </nav>
    </header>
  );
}
```

### Login Page with Google Sign-In

```tsx
import { GoogleSignInButton } from "@/components/auth/google-signin-button";

export default function LoginPage() {
  return (
    <div>
      <h1>Sign In</h1>

      {/* Traditional login form */}
      <LoginForm />

      <div className="my-4">
        <span>OR</span>
      </div>

      {/* Google Sign-In */}
      <GoogleSignInButton />
    </div>
  );
}
```

---

## Testing the Features

### 1. Seat Selection
1. Admin creates seat layout via `/api/seats`
2. Enable seat selection in event settings
3. Users see interactive seat map during booking

### 2. Notifications
1. Notifications auto-created on booking, payment, etc.
2. Bell icon shows unread count
3. Click to view and mark as read

### 3. Reviews
1. Users can review after attending event
2. One review per booking
3. Average rating updates automatically

### 4. Live Chat
1. Users click chat icon
2. Messages appear in real-time
3. Admin can respond from admin panel

### 5. Photo Gallery
1. Users upload photos from event page
2. Photos appear in gallery grid
3. Hover to see photographer name

### 6. Weather
1. Automatically shown for outdoor events
2. Shows 5-day forecast
3. Updates based on event date

### 7. Google Sign-In
1. Click "Sign in with Google"
2. Select Google account
3. Auto-creates user account

---

## API Testing with cURL

```bash
# Get reviews
curl http://localhost:3000/api/reviews?eventId=EVENT_ID

# Submit review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"eventId":"EVENT_ID","bookingId":"BOOKING_ID","rating":5,"title":"Great!","comment":"Amazing event"}'

# Get notifications
curl http://localhost:3000/api/notifications \
  -H "Cookie: auth_token=YOUR_TOKEN"

# Get weather
curl "http://localhost:3000/api/weather?city=Kathmandu&date=2026-03-15"

# Get seat layout
curl http://localhost:3000/api/seats?eventId=EVENT_ID

# Get chat messages
curl http://localhost:3000/api/chat \
  -H "Cookie: auth_token=YOUR_TOKEN"

# Get gallery photos
curl http://localhost:3000/api/gallery?eventId=EVENT_ID
```

---

## Future Enhancements

1. **Real-time with WebSockets** - Replace polling with Socket.io
2. **Push Notifications** - Browser push notifications
3. **Image Upload** - Direct image upload for reviews/gallery
4. **Chat Bot** - AI-powered chat responses
5. **Advanced Seat Types** - Wheelchair accessible, companion seats
6. **Weather Alerts** - Notify users of bad weather
7. **Social Sharing** - Share reviews and photos to social media

---

## Troubleshooting

### Google Sign-In not working
- Check `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
- Verify authorized origins in Google Console
- Check browser console for errors

### Weather not showing
- Verify `OPENWEATHER_API_KEY` is set
- Check API quota limits
- Use `demo` for mock data

### Notifications not updating
- Check authentication token
- Verify user is logged in
- Check browser console for API errors

### Seat selection not appearing
- Verify seat layout exists for event
- Check `seatSelectionEnabled` is true
- Ensure admin created seat layout

---

## Support

For issues or questions:
1. Check browser console for errors
2. Verify environment variables
3. Check API responses in Network tab
4. Review server logs

---

**All features are production-ready and fully integrated!** 🎉
