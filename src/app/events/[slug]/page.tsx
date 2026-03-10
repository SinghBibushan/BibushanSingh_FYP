import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock3, Mail, MapPinned, Users } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getPublicEventBySlug } from "@/server/events/service";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell grid gap-8 py-14 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div
            className={`rounded-[32px] bg-gradient-to-br ${event.posterTone} p-8 text-white md:p-10`}
          >
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-white/16 text-white">{event.category}</Badge>
              <Badge className="bg-white/16 text-white">{event.city}</Badge>
              {event.featured ? (
                <Badge className="bg-white/16 text-white">Featured</Badge>
              ) : null}
            </div>
            <h1 className="mt-6 text-5xl leading-none md:text-6xl">{event.title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/78 md:text-lg">
              {event.summary}
            </p>
          </div>

          <Card>
            <CardContent className="grid gap-5 p-6 md:grid-cols-2">
              <div className="rounded-[24px] bg-muted p-5">
                <CalendarDays className="h-5 w-5 text-primary" />
                <p className="mt-4 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                  Starts
                </p>
                <p className="mt-2 text-lg">{formatDate(event.startsAt)}</p>
              </div>
              <div className="rounded-[24px] bg-muted p-5">
                <Clock3 className="h-5 w-5 text-primary" />
                <p className="mt-4 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                  Ends
                </p>
                <p className="mt-2 text-lg">{formatDate(event.endsAt)}</p>
              </div>
              <div className="rounded-[24px] bg-muted p-5">
                <MapPinned className="h-5 w-5 text-primary" />
                <p className="mt-4 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                  Venue
                </p>
                <p className="mt-2 text-lg">{event.venueName}</p>
                <p className="mt-1 text-sm text-muted-foreground">{event.venueAddress}</p>
              </div>
              <div className="rounded-[24px] bg-muted p-5">
                <Users className="h-5 w-5 text-primary" />
                <p className="mt-4 text-sm uppercase tracking-[0.22em] text-muted-foreground">
                  Organizer
                </p>
                <p className="mt-2 text-lg">{event.organizerName}</p>
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {event.organizerEmail}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-3xl leading-none">About the event</h2>
              <p className="text-sm leading-8 text-muted-foreground">
                {event.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl leading-none">Venue and map</h2>
                {event.mapUrl ? (
                  <Link
                    href={event.mapUrl}
                    target="_blank"
                    className="text-sm font-semibold text-secondary"
                  >
                    Open map link
                  </Link>
                ) : null}
              </div>
              <div className="rounded-[28px] border border-dashed border-border bg-muted/50 p-6">
                <p className="text-sm leading-7 text-muted-foreground">
                  Embedded maps stay optional. If no map API key is configured, the
                  app still presents venue details cleanly and links out to a normal
                  map URL for demonstration.
                </p>
                <p className="mt-4 font-semibold text-foreground">
                  {event.venueName}, {event.venueAddress}
                </p>
              </div>
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
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Ticket selection, discount stacking, and mock payment will plug
                  into this panel during the booking phase.
                </p>
              </div>

              <div className="space-y-4">
                {event.ticketTypes.map((ticket) => (
                  <div key={ticket.id} className="rounded-[24px] border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-foreground">{ticket.name}</p>
                        <p className="mt-1 text-sm leading-7 text-muted-foreground">
                          {ticket.description}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-primary">
                        {formatCurrency(ticket.price, ticket.currency)}
                      </p>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{ticket.quantityRemaining} seats left</span>
                      <span>{ticket.quantitySold} sold</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ticket.benefits.map((benefit) => (
                        <span
                          key={benefit}
                          className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button asChild className="w-full">
                <Link href={`/checkout/${event.slug}`}>Book Tickets</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
