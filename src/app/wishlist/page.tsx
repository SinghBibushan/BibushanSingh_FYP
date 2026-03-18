import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Wishlist } from "@/models/Wishlist";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Heart, Calendar, MapPin, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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

  const wishlistItems = await Wishlist.find({ userId: user.sub })
    .populate({
      path: "eventId",
      select: "title slug summary category city venueName startsAt tags",
    })
    .sort({ createdAt: -1 })
    .lean();

  const events = wishlistItems
    .filter((item: any) => item.eventId)
    .map((item: any) => ({
      ...item.eventId,
      savedAt: item.createdAt,
    }));

  return (
    <AppShell
      badge="My Wishlist"
      title="Saved Events ❤️"
      description="Events you've saved for later. Book tickets before they sell out!"
      navItems={userNavItems}
      currentPath="/wishlist"
    >
      {events.length === 0 ? (
        <Card className="border-2 border-dashed border-primary/30">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 p-6 mb-6">
              <Heart className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No saved events yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start exploring events and save your favorites by clicking the heart icon.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:scale-105 transition-transform duration-300"
            >
              Browse Events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {events.length} {events.length === 1 ? "event" : "events"} saved
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event: any, index: number) => (
              <Card
                key={event._id.toString()}
                className="hover-lift opacity-0 animate-scale-in border-primary/20 hover:border-primary/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0">
                      {event.category}
                    </Badge>
                    <div className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 p-2">
                      <Heart className="h-4 w-4 text-white fill-current" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.summary}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{formatDate(event.startsAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-secondary" />
                      <span>{event.venueName}, {event.city}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {event.tags?.slice(0, 2).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-muted/50 text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/events/${event.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary transition-colors"
                  >
                    View Event
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
