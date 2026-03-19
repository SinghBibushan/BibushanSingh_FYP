# Quick Start Guide for New Features

## 🚀 Installation

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## 📋 Environment Setup

Your `.env` file has been updated with:

```env
# Google OAuth (for Google Sign-In)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE

# Weather API (OpenWeatherMap) - use "demo" for mock data
OPENWEATHER_API_KEY=demo
```

### Setting up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized JavaScript origins: `http://localhost:3000`
6. Copy the Client ID and update `.env`:
   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_client_id_here
   ```

### Setting up Weather API (Optional)

1. Go to [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for free account
3. Get your API key
4. Update `.env`:
   ```env
   OPENWEATHER_API_KEY=your_actual_api_key_here
   ```

**Note:** Both features work with demo/mock data if you don't set up the APIs!

## 🎯 Running the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ✅ Features Overview

### 1. Seat Selection 💺
- **Location:** Event booking page
- **How to enable:** Admin creates seat layout for event
- **Demo:** Select seats visually before booking

### 2. Notifications 🔔
- **Location:** Header (bell icon)
- **Auto-enabled:** Shows booking confirmations, reminders
- **Demo:** Make a booking to see notification

### 3. Reviews & Ratings ⭐
- **Location:** Event details page
- **How to use:** Book a ticket, then write review
- **Demo:** Login → Book event → Submit review

### 4. Live Chat 💬
- **Location:** Event details page (Chat tab)
- **How to use:** Click chat tab, send message
- **Demo:** Messages appear in real-time

### 5. Photo Gallery 📸
- **Location:** Event details page (Gallery tab)
- **How to use:** Upload photos from event
- **Demo:** View event photos in grid

### 6. Weather Forecast 🌤️
- **Location:** Event details page (outdoor events)
- **Auto-enabled:** Shows for outdoor events
- **Demo:** View weather for event date

### 7. Google Sign-In 🔐
- **Location:** Register/Login pages
- **How to use:** Click "Sign in with Google"
- **Demo:** One-click registration

## 📁 New Files Created

### Models
- `src/models/SeatLayout.ts`
- `src/models/Notification.ts`
- `src/models/ChatMessage.ts`
- `src/models/EventGallery.ts`
- `src/models/Review.ts` (updated)

### API Routes
- `src/app/api/seats/route.ts`
- `src/app/api/notifications/route.ts`
- `src/app/api/chat/route.ts`
- `src/app/api/gallery/route.ts`
- `src/app/api/weather/route.ts`
- `src/app/api/auth/google/route.ts`
- `src/app/api/reviews/route.ts` (already existed)

### Components
- `src/components/seats/seat-selector.tsx`
- `src/components/notifications/notification-bell.tsx`
- `src/components/reviews/review-form.tsx`
- `src/components/reviews/event-reviews.tsx`
- `src/components/chat/live-chat.tsx`
- `src/components/gallery/event-gallery.tsx`
- `src/components/weather/weather-widget.tsx`
- `src/components/auth/google-signin-button.tsx`
- `src/components/events/event-details-with-features.tsx`
- `src/components/ui/tabs.tsx`

### Services
- `src/lib/weather.ts`

## 🧪 Testing the Features

### Test Seat Selection
1. Login as admin: `admin@gmail.com` / `Password123`
2. Create seat layout via API or admin panel
3. Go to event booking page
4. See interactive seat map

### Test Notifications
1. Login as user
2. Make a booking
3. Click bell icon in header
4. See booking confirmation notification

### Test Reviews
1. Login and book an event
2. Go to event details page
3. Scroll to reviews section
4. Submit a review with rating

### Test Live Chat
1. Login as user
2. Go to any event page
3. Click "Live Chat" tab
4. Send a message

### Test Photo Gallery
1. Go to event details page
2. Click "Photo Gallery" tab
3. View uploaded photos

### Test Weather
1. Create an outdoor event (set `isOutdoor: true`)
2. Go to event details page
3. See weather widget at top

### Test Google Sign-In
1. Go to register page
2. Click "Sign in with Google" button
3. Select Google account
4. Auto-creates account and logs in

## 🔧 Admin Tasks

### Create Seat Layout for Event

```bash
curl -X POST http://localhost:3000/api/seats \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=ADMIN_TOKEN" \
  -d '{
    "eventId": "EVENT_ID",
    "rows": 10,
    "seatsPerRow": 12
  }'
```

### Enable Seat Selection for Event

Update event in database:
```javascript
{
  settings: {
    seatSelectionEnabled: true
  }
}
```

### Mark Event as Outdoor

Update event in database:
```javascript
{
  settings: {
    isOutdoor: true
  }
}
```

## 📊 Database Updates

Run this to update existing events:

```bash
npm run db:reset
```

This will:
- Add new fields to Event model
- Add new fields to User model
- Create sample data for new features

## 🎨 UI Integration Example

See `src/components/events/event-details-with-features.tsx` for a complete example of integrating all features.

## 📱 Mobile Responsive

All new components are mobile-responsive and work on:
- Desktop (1920px+)
- Tablet (768px - 1919px)
- Mobile (320px - 767px)

## 🐛 Troubleshooting

### Google Sign-In not working
- Check `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set
- Verify authorized origins in Google Console
- Check browser console for errors

### Weather not showing
- Verify `OPENWEATHER_API_KEY` is set
- Use `demo` for mock data
- Check API quota limits

### Notifications not appearing
- Verify user is logged in
- Check authentication token
- Look for API errors in console

### Seat selection not visible
- Verify seat layout exists for event
- Check `seatSelectionEnabled` is true
- Ensure admin created seat layout

## 📚 Documentation

- Full feature documentation: `NEW_FEATURES.md`
- API documentation: See individual route files
- Component documentation: See component files

## 🎉 You're Ready!

All features are implemented and ready to use. Start the dev server and explore!

```bash
npm run dev
```

Visit: http://localhost:3000

---

**Need Help?** Check the detailed documentation in `NEW_FEATURES.md`
