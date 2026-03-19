import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPublicEvents } from "@/server/events/service";

export async function EventGridSection() {
  const featuredEvents = (await getPublicEvents({ featured: true })).slice(0, 3);

  return (
    <section className="py-20">
      <div className="container-shell space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-secondary">
              Featured listings
            </p>
            <h2 className="max-w-3xl text-4xl leading-tight md:text-5xl">
              High-visibility events presented with stronger hierarchy and clearer
              decision points.
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
          >
            Explore all events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {featuredEvents.map((event) => (
            <Card key={event.slug} className="overflow-hidden hover-lift bg-white/74">
              <div className="border-b border-border bg-[linear-gradient(145deg,#f8f3ea_0%,#f4efe7_65%,#ece1d1_100%)] p-6">
                <Badge>{event.category}</Badge>
                <h3 className="mt-6 text-3xl leading-none text-foreground">{event.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{event.summary}</p>
              </div>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-secondary" />
                    <span>{formatDate(event.startsAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span>
                      {event.venueName}, {event.city}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">
                    From {formatCurrency(event.priceFrom)}
                  </p>
                  <Link
                    href={`/events/${event.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  >
                    View details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
