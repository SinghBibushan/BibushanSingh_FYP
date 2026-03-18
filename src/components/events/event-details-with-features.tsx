"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeatSelector } from "@/components/seats/seat-selector";
import { EventReviews } from "@/components/reviews/event-reviews";
import { ReviewForm } from "@/components/reviews/review-form";
import { EventGallery } from "@/components/gallery/event-gallery";
import { WeatherWidget } from "@/components/weather/weather-widget";
import { LiveChat } from "@/components/chat/live-chat";

interface EventDetailsProps {
  event: {
    _id: string;
    title: string;
    city: string;
    startsAt: string;
    settings: {
      isOutdoor: boolean;
      seatSelectionEnabled: boolean;
    };
  };
  userBooking?: {
    _id: string;
  };
}

export function EventDetailsWithFeatures({ event, userBooking }: EventDetailsProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  return (
    <div className="space-y-8">
      {/* Weather Widget for Outdoor Events */}
      {event.settings.isOutdoor && (
        <WeatherWidget city={event.city} date={event.startsAt} />
      )}

      {/* Seat Selection */}
      {event.settings.seatSelectionEnabled && (
        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Select Your Seats</h2>
          <SeatSelector
            eventId={event._id}
            onSeatsSelected={(seats) => setSelectedSeats(seats)}
          />
        </div>
      )}

      {/* Tabs for Gallery, Reviews, and Chat */}
      <Tabs defaultValue="gallery" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gallery">Photo Gallery</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="chat">Live Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="mt-6">
          <EventGallery eventId={event._id} />
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 space-y-6">
          {userBooking && (
            <ReviewForm
              eventId={event._id}
              bookingId={userBooking._id}
              onSuccess={() => window.location.reload()}
            />
          )}
          <EventReviews eventId={event._id} />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <LiveChat />
        </TabsContent>
      </Tabs>
    </div>
  );
}
