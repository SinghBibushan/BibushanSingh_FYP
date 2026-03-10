import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { demoEvents } from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = demoEvents.find((item) => item.slug === slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell grid gap-8 py-14 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <Badge>{event.category}</Badge>
          <div className="space-y-4">
            <h1 className="text-5xl leading-none">{event.title}</h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              {event.summary}
            </p>
          </div>
          <Card>
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                  Schedule
                </p>
                <p className="mt-2 text-lg">{formatDate(event.startsAt)}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                  Venue
                </p>
                <p className="mt-2 text-lg">
                  {event.venueName}, {event.city}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-3xl">Map fallback strategy</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                The final implementation will render an embedded map when the API
                key is configured. If it is missing, the page still works by
                showing venue details and a direct map link.
              </p>
            </CardContent>
          </Card>
        </section>

        <aside>
          <Card className="sticky top-28">
            <CardContent className="space-y-6 p-6">
              <div className="rounded-[24px] bg-muted p-5">
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                  Booking preview
                </p>
                <p className="mt-3 text-4xl leading-none">
                  {formatCurrency(event.priceFrom)}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Starting price. Dynamic ticket types, discounts, and mock payment
                  will connect here in the booking phase.
                </p>
              </div>
              <Button className="w-full">Book Tickets</Button>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
