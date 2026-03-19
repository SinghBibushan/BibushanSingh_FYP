import Link from "next/link";
import { ArrowRight, Calendar, Heart, MapPin } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Wishlist } from "@/models/Wishlist";

type WishlistEvent = {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  category: string;
  city: string;
  venueName: string;
  startsAt: string | Date;
  tags?: string[];
};

type WishlistRecord = {
  createdAt: Date;
  eventId: WishlistEvent | null;
};

const userNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/profile", label: "Profile" },
  { href: "/tickets", label: "Tickets" },
  { href: "/loyalty", label: "Loyalty" },
  { href: "/wishlist", label: "Wishlist" },
];

export default async function WishlistPage() {
  const user = await requireUser();

  await connectDB();

  const wishlistItems = (await Wishlist.find({ userId: user.sub })
    .populate({
      path: "eventId",
      select: "title slug summary category city venueName startsAt tags",
    })
    .sort({ createdAt: -1 })
    .lean()) as WishlistRecord[];

  const events = wishlistItems
    .filter((item) => item.eventId)
    .map((item) => ({
      ...(item.eventId as WishlistEvent),
      savedAt: item.createdAt.toISOString(),
    }));

  return (
    <AppShell
      badge="My Wishlist"
      title="Saved events"
      description="A calmer planning space for events you want to revisit before committing to checkout."
      navItems={userNavItems}
      currentPath="/wishlist"
    >
      {events.length === 0 ? (
        <Card className="bg-white/78">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-white">
              <Heart className="h-10 w-10 text-secondary" />
            </div>
            <h3 className="mb-2 text-3xl font-semibold leading-none text-foreground">
              No saved events yet
            </h3>
            <p className="mb-6 max-w-md text-sm leading-7 text-muted-foreground">
              Save events from the catalogue to build a shortlist before booking.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-[0_14px_30px_rgba(24,34,53,0.16)]"
            >
              Browse events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-[28px] border border-border bg-white/72 px-6 py-4">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Saved collection
              </p>
              <p className="mt-2 text-3xl font-semibold leading-none text-foreground">
                {events.length} {events.length === 1 ? "event" : "events"}
              </p>
            </div>
            <p className="max-w-sm text-right text-sm leading-6 text-muted-foreground">
              Keep track of strong candidates before moving into ticket selection.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event, index) => (
              <Card
                key={event._id}
                className="hover-lift overflow-hidden bg-white/78 opacity-0 animate-scale-in"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <CardContent className="space-y-5">
                  <div className="flex items-start justify-between">
                    <Badge>{event.category}</Badge>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-secondary">
                      <Heart className="h-4 w-4 fill-current" />
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 line-clamp-2 text-2xl font-semibold leading-tight">
                      {event.title}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-7 text-muted-foreground">
                      {event.summary}
                    </p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-secondary" />
                      <span>{formatDate(event.startsAt)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-accent" />
                      <span>
                        {event.venueName}, {event.city}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {event.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/events/${event.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  >
                    View event
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
