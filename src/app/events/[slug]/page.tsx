import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  Mail,
  MapPinned,
  Ticket,
  Users,
} from "lucide-react";

import { EventGallery } from "@/components/gallery/event-gallery";
import { SiteHeader } from "@/components/layout/site-header";
import { EventReviews } from "@/components/reviews/event-reviews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { WeatherWidget } from "@/components/weather/weather-widget";
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
      <main className="container-shell space-y-8 py-14">
        <section
          className={`overflow-hidden rounded-[36px] bg-gradient-to-br ${event.posterTone} p-8 text-white shadow-[0_28px_70px_rgba(24,34,53,0.18)] md:p-10`}
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-3">
                <Badge className="border-white/16 bg-white/14 text-white">{event.category}</Badge>
                <Badge className="border-white/16 bg-white/14 text-white">{event.city}</Badge>
                {event.featured ? (
                  <Badge className="border-white/16 bg-white/14 text-white">Featured</Badge>
                ) : null}
              </div>
              <div className="space-y-4">
                <h1 className="text-5xl leading-[0.95] md:text-6xl">{event.title}</h1>
                <p className="max-w-3xl text-base leading-8 text-white/80 md:text-lg">
                  {event.summary}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[26px] border border-white/12 bg-white/10 p-5">
                <CalendarDays className="h-5 w-5 text-white" />
                <p className="mt-4 text-sm uppercase tracking-[0.22em] text-white/60">
                  Starts
                </p>
                <p className="mt-2 text-lg font-semibold">{formatDate(event.startsAt)}</p>
              </div>
              <div className="rounded-[26px] border border-white/12 bg-white/10 p-5">
                <Clock3 className="h-5 w-5 text-white" />
                <p className="mt-4 text-sm uppercase tracking-[0.22em] text-white/60">
                  Ends
                </p>
                <p className="mt-2 text-lg font-semibold">{formatDate(event.endsAt)}</p>
              </div>
              <div className="rounded-[26px] border border-white/12 bg-white/10 p-5">
                <MapPinned className="h-5 w-5 text-white" />
                <p className="mt-4 text-sm uppercase tracking-[0.22em] text-white/60">
                  Venue
                </p>
                <p className="mt-2 text-lg font-semibold">{event.venueName}</p>
                <p className="mt-1 text-sm text-white/72">{event.venueAddress}</p>
              </div>
              <div className="rounded-[26px] border border-white/12 bg-white/10 p-5">
                <Users className="h-5 w-5 text-white" />
                <p className="mt-4 text-sm uppercase tracking-[0.22em] text-white/60">
                  Organizer
                </p>
                <p className="mt-2 text-lg font-semibold">{event.organizerName}</p>
                <p className="mt-1 inline-flex items-center gap-2 text-sm text-white/72">
                  <Mail className="h-4 w-4" />
                  {event.organizerEmail}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            <Card className="bg-white/78">
              <CardContent className="space-y-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
                  About the event
                </p>
                <h2 className="text-3xl leading-none">Event overview</h2>
                <p className="text-sm leading-8 text-muted-foreground">{event.description}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {event.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {event.category === "Outdoor" ? (
              <Card className="bg-white/78">
                <CardContent className="space-y-4">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
                    Conditions
                  </p>
                  <WeatherWidget city={event.city} date={new Date(event.startsAt).toISOString()} />
                </CardContent>
              </Card>
            ) : null}

            <Card className="bg-white/78">
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
                      Venue
                    </p>
                    <h2 className="mt-2 text-3xl leading-none">Location and map access</h2>
                  </div>
                  {event.mapUrl ? (
                    <Link href={event.mapUrl} target="_blank" className="text-sm font-semibold text-primary">
                      Open map link
                    </Link>
                  ) : null}
                </div>
                <div className="rounded-[28px] border border-border bg-white/82 p-6">
                  <p className="text-sm leading-7 text-muted-foreground">
                    Embedded maps remain optional. The event still presents venue details cleanly
                    and can link out to a standard map destination when available.
                  </p>
                  <p className="mt-4 font-semibold text-foreground">
                    {event.venueName}, {event.venueAddress}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/78">
              <CardContent className="space-y-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
                  Gallery
                </p>
                <h2 className="text-3xl leading-none">Event visuals</h2>
                <EventGallery eventId={event.id} />
              </CardContent>
            </Card>

            <Card className="bg-white/78">
              <CardContent className="space-y-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
                  Reviews
                </p>
                <h2 className="text-3xl leading-none">Audience feedback</h2>
                <EventReviews eventId={event.id} />
              </CardContent>
            </Card>
          </section>

          <aside>
            <Card className="sticky top-28 bg-white/78">
              <CardContent className="space-y-6">
                <div className="rounded-[28px] border border-border bg-white/82 p-5">
                  <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
                    Booking preview
                  </p>
                  <p className="mt-3 text-4xl font-semibold leading-none text-foreground">
                    {formatCurrency(event.priceFrom)}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Review ticket inventory and move directly into checkout when ready.
                  </p>
                </div>

                <div className="space-y-4">
                  {event.ticketTypes.map((ticket) => (
                    <div key={ticket.id} className="rounded-[24px] border border-border bg-white/82 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-foreground">{ticket.name}</p>
                          <p className="mt-1 text-sm leading-7 text-muted-foreground">
                            {ticket.description}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-secondary">
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
                            className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[24px] border border-border bg-[linear-gradient(145deg,#f8f3ea_0%,#f2e5d6_100%)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
                      <Ticket className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Checkout-ready flow</p>
                      <p className="text-sm text-muted-foreground">
                        Pricing, capacity, and booking creation stay server-validated.
                      </p>
                    </div>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/checkout/${event.slug}`}>Book tickets</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
