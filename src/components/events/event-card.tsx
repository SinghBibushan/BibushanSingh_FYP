import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Ticket, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { EventListItem } from "@/types/events";
import { WishlistButton } from "./wishlist-button";

const gradientMap: Record<string, string> = {
  "Music": "from-purple-600 via-pink-600 to-purple-600",
  "Festival": "from-pink-600 via-rose-600 to-pink-600",
  "Workshop": "from-cyan-600 via-blue-600 to-cyan-600",
  "Sports": "from-orange-600 via-red-600 to-orange-600",
  "Cultural": "from-green-600 via-emerald-600 to-green-600",
  "default": "from-primary via-secondary to-primary",
};

export function EventCard({ event }: { event: EventListItem }) {
  const gradient = gradientMap[event.category] || gradientMap.default;

  return (
    <Card className="overflow-hidden hover-lift group cursor-pointer transition-all duration-300 border-primary/20 hover:border-primary/50 bg-card/50 backdrop-blur-sm">
      <div className={`h-52 bg-gradient-to-br ${gradient} p-6 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 transition-colors">
              {event.category}
            </Badge>
            <div className="flex items-center gap-2">
              {event.featured ? (
                <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] border border-white/30 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Hot
                </span>
              ) : null}
              <WishlistButton eventId={event._id} size="sm" />
            </div>
          </div>
          <h2 className="mt-8 text-3xl leading-none group-hover:scale-105 transition-transform duration-300 origin-left font-bold">
            {event.title}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/90 line-clamp-2">
            {event.summary}
          </p>
        </div>
      </div>
      <CardContent className="space-y-4 p-6 bg-card/80 group-hover:bg-card transition-colors duration-300">
        <div className="grid gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <CalendarDays className="h-4 w-4 text-primary" />
            </div>
            <span className="text-foreground/80">{formatDate(event.startsAt)}</span>
          </div>
          <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-75">
            <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
              <MapPin className="h-4 w-4 text-secondary" />
            </div>
            <span className="text-foreground/80">
              {event.venueName}, {event.city}
            </span>
          </div>
          <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-100">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
              <Ticket className="h-4 w-4 text-accent" />
            </div>
            <span className="text-foreground/80">{event.ticketCount} ticket type(s)</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {event.tags.slice(0, 3).map((tag, index) => (
            <span
              key={tag}
              className="rounded-full bg-muted/50 border border-primary/10 px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div>
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="font-bold text-foreground text-xl gradient-text">
              {formatCurrency(event.priceFrom)}
            </p>
          </div>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold hover:scale-105 transition-transform duration-300"
          >
            View Event
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
