import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Ticket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { EventListItem } from "@/types/events";

export function EventCard({ event }: { event: EventListItem }) {
  return (
    <Card className="overflow-hidden">
      <div className={`h-52 bg-gradient-to-br ${event.posterTone} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <Badge className="bg-white/16 text-white">{event.category}</Badge>
          {event.featured ? (
            <span className="rounded-full bg-white/16 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
              Featured
            </span>
          ) : null}
        </div>
        <h2 className="mt-8 text-3xl leading-none">{event.title}</h2>
        <p className="mt-4 max-w-md text-sm leading-7 text-white/78">
          {event.summary}
        </p>
      </div>
      <CardContent className="space-y-4 p-6">
        <div className="grid gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>{formatDate(event.startsAt)}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-primary" />
            <span>
              {event.venueName}, {event.city}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Ticket className="h-4 w-4 text-primary" />
            <span>{event.ticketCount} ticket type(s) available</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {event.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="font-semibold text-foreground">
            From {formatCurrency(event.priceFrom)}
          </p>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-secondary"
          >
            View details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
