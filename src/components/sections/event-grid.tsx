import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { demoEvents } from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export function EventGridSection() {
  return (
    <section className="py-20">
      <div className="container-shell space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              Featured listings
            </p>
            <h2 className="text-4xl leading-tight md:text-5xl">
              Seed-ready Nepal events that make the demo look alive.
            </h2>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-secondary"
          >
            Explore all events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {demoEvents.map((event) => (
            <Card key={event.slug} className="overflow-hidden">
              <div className="h-52 bg-[linear-gradient(135deg,#14213d_0%,#1f4e5f_52%,#d97706_100%)] p-6 text-white">
                <Badge className="bg-white/14 text-white">{event.category}</Badge>
                <h3 className="mt-6 text-3xl leading-none">{event.title}</h3>
                <p className="mt-4 text-sm leading-7 text-white/75">{event.summary}</p>
              </div>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm text-muted-foreground">
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
          ))}
        </div>
      </div>
    </section>
  );
}
