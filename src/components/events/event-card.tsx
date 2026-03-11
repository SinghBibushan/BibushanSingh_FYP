import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Ticket } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { EventListItem } from "@/types/events";

export function EventCard({ event }: { event: EventListItem }) {
  return (
    <Card className="overflow-hidden hover-lift group cursor-pointer transition-all duration-300">
      <div className={`h-52 bg-gradient-to-br ${event.posterTone} p-6 text-white relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 transition-colors">
              {event.category}
            </Badge>
            {event.featured ? (
              <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] border border-white/30">
                Featured
              </span>
            ) : null}
          </div>
          <h2 className="mt-8 text-3xl leading-none group-hover:scale-105 transition-transform duration-300 origin-left">
            {event.title}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/78 line-clamp-2">
            {event.summary}
          </p>
        </div>
      </div>
      <CardContent className="space-y-4 p-6 bg-card group-hover:bg-card/80 transition-colors duration-300">
        <div className="grid gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>{formatDate(event.startsAt)}</span>
          </div>
          <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-75">
            <MapPin className="h-4 w-4 text-primary" />
            <span>
              {event.venueName}, {event.city}
            </span>
          </div>
          <div className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300 delay-100">
            <Ticket className="h-4 w-4 text-primary" />
            <span>{event.ticketCount} ticket type(s) available</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {event.tags.slice(0, 3).map((tag, index) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors duration-300"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <p className="font-semibold text-foreground text-lg">
            From {formatCurrency(event.priceFrom)}
          </p>
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary transition-colors duration-300"
          >
            View details
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
