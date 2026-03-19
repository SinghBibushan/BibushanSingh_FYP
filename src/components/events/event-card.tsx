import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Ticket, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { EventListItem } from "@/types/events";
import { WishlistButton } from "./wishlist-button";

const accentMap: Record<string, string> = {
  Music: "bg-[linear-gradient(145deg,#182235_0%,#263752_100%)]",
  Festival: "bg-[linear-gradient(145deg,#6d4a31_0%,#b3733f_100%)]",
  Workshop: "bg-[linear-gradient(145deg,#24484d_0%,#2f6668_100%)]",
  Sports: "bg-[linear-gradient(145deg,#3f3125_0%,#8c5f39_100%)]",
  Cultural: "bg-[linear-gradient(145deg,#33463e_0%,#50695d_100%)]",
  default: "bg-[linear-gradient(145deg,#182235_0%,#43506b_100%)]",
};

export function EventCard({ event }: { event: EventListItem }) {
  const accentClass = accentMap[event.category] || accentMap.default;

  return (
    <Card className="group overflow-hidden hover-lift bg-white/78">
      <div className={`relative h-52 overflow-hidden border-b border-border p-6 text-white ${accentClass}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-center justify-between gap-3">
            <Badge className="border-white/16 bg-white/12 text-white">{event.category}</Badge>
            <div className="flex items-center gap-2">
              {event.featured ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/16 bg-white/12 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white">
                  <TrendingUp className="h-3 w-3" />
                  Featured
                </span>
              ) : null}
              <WishlistButton eventId={event._id} size="sm" />
            </div>
          </div>

          <div>
            <h2 className="max-w-md text-3xl leading-none font-semibold">{event.title}</h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/80 line-clamp-2">
              {event.summary}
            </p>
          </div>
        </div>
      </div>

      <CardContent className="space-y-5">
        <div className="grid gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white">
              <CalendarDays className="h-4 w-4 text-secondary" />
            </div>
            <span className="text-foreground/86">{formatDate(event.startsAt)}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white">
              <MapPin className="h-4 w-4 text-accent" />
            </div>
            <span className="text-foreground/86">
              {event.venueName}, {event.city}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white">
              <Ticket className="h-4 w-4 text-primary" />
            </div>
            <span className="text-foreground/86">{event.ticketCount} ticket type(s)</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {event.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
              Starting from
            </p>
            <p className="mt-2 text-2xl font-semibold leading-none text-foreground">
              {formatCurrency(event.priceFrom)}
            </p>
          </div>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_12px_24px_rgba(24,34,53,0.16)]"
          >
            View Event
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
