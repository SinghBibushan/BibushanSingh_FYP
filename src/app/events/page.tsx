import Link from "next/link";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { demoEvents } from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function EventsPage() {
  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell space-y-10 py-14">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Badge>Event discovery</Badge>
            <h1 className="text-5xl leading-none">Upcoming events across Nepal</h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              This scaffold already exposes the public event browsing surface.
              Search, filtering, and live DB-backed listings will land in the next
              build phases on top of this structure.
            </p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {demoEvents.map((event) => (
            <Card key={event.slug}>
              <CardContent className="space-y-4 p-6">
                <Badge>{event.category}</Badge>
                <div className="space-y-2">
                  <h2 className="text-3xl leading-none">{event.title}</h2>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {event.summary}
                  </p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>{formatDate(event.startsAt)}</p>
                  <p>
                    {event.venueName}, {event.city}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">
                    From {formatCurrency(event.priceFrom)}
                  </p>
                  <Link
                    href={`/events/${event.slug}`}
                    className="text-sm font-semibold text-secondary"
                  >
                    Open event
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
