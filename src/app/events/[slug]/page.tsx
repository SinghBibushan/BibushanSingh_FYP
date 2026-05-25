import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Clock3,
  MapPin,
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
import { SectionHeader } from "@/components/ui/section-header";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/ui/status-badge";
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
      <main className="container-shell space-y-8 py-10 md:py-14">
        <section
          className={`overflow-hidden rounded-[36px] bg-gradient-to-br ${event.posterTone} p-6 text-white shadow-[0_28px_70px_rgba(24,32,51,0.18)] md:p-10`}
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-3">
                <Badge className="border-white/16 bg-white/14 text-white">{event.category}</Badge>
                <Badge className="border-white/16 bg-white/14 text-white">{event.city}</Badge>
                {event.featured ? (
                  <Badge className="border-white/16 bg-white/14 text-white">Featured</Badge>
                ) : null}
                <Badge className="border-white/16 bg-white/14 text-white">
                  {event.ticketsRemaining} seats left
                </Badge>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl leading-[0.95] md:text-6xl">{event.title}</h1>
                <p className="max-w-3xl text-base leading-7 text-white/82 md:text-lg">
                  {event.summary}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/12 bg-white/10 p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/62">
                    Starting price
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatCurrency(event.priceFrom)}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/12 bg-white/10 p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/62">
                    Ticket types
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">{event.ticketCount}</p>
                </div>
                <div className="rounded-[24px] border border-white/12 bg-white/10 p-4">
                  <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/62">
                    Availability
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {event.ticketsRemaining === 0 ? "Sold out" : "Open"}
                  </p>
                </div>
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
            <Card className="bg-white/90">
              <CardContent className="space-y-4">
                <SectionHeader
                  badge="Event Overview"
                  title="Why attendees book this event"
                  description={event.description}
                />
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
              <Card className="bg-white/90">
                <CardContent className="space-y-4">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
                    Outdoor conditions
                  </p>
                  <WeatherWidget city={event.city} date={new Date(event.startsAt).toISOString()} />
                </CardContent>
              </Card>
            ) : null}

            <Card className="bg-white/90">
              <CardContent className="space-y-4">
                <SectionHeader
                  badge="Venue"
                  title="Location details"
                  description="Venue details are shown clearly even when an embedded map is not available."
                  actions={
                    event.mapUrl ? (
                      <Link href={event.mapUrl} target="_blank" className="text-sm font-semibold text-primary">
                        Open Map
                      </Link>
                    ) : null
                  }
                />
                <div className="rounded-[28px] border border-border bg-white/82 p-6">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50">
                      <MapPin className="h-4 w-4 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{event.venueName}</p>
                      <p className="mt-1 text-sm leading-7 text-muted-foreground">
                        {event.venueAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardContent className="space-y-4">
                <SectionHeader badge="Gallery" title="Event visuals" />
                <EventGallery eventId={event.id} />
              </CardContent>
            </Card>

            <Card className="bg-white/90">
              <CardContent className="space-y-4">
                <SectionHeader badge="Reviews" title="Audience feedback" />
                <EventReviews eventId={event.id} />
              </CardContent>
            </Card>
          </section>

          <aside>
            <Card className="sticky top-28 bg-white/92">
              <CardContent className="space-y-6">
                <SectionHeader
                  badge="Book Tickets"
                  title="Choose a ticket and continue"
                  description="See pricing, remaining seats, and ticket benefits before checkout."
                />

                <div className="rounded-[28px] border border-border bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
                        Starting from
                      </p>
                      <p className="mt-3 text-4xl font-semibold leading-none text-foreground">
                        {formatCurrency(event.priceFrom)}
                      </p>
                    </div>
                    <StatusBadge
                      tone={
                        event.ticketsRemaining === 0
                          ? "danger"
                          : event.ticketsRemaining <= 20
                            ? "warning"
                            : "success"
                      }
                    >
                      {event.ticketsRemaining === 0
                        ? "Sold out"
                        : `${event.ticketsRemaining} seats left`}
                    </StatusBadge>
                  </div>
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
                        <StatusBadge
                          tone={
                            ticket.quantityRemaining === 0
                              ? "danger"
                              : ticket.quantityRemaining <= 10
                                ? "warning"
                                : "success"
                          }
                        >
                          {ticket.quantityRemaining === 0
                            ? "Sold out"
                            : `${ticket.quantityRemaining} left`}
                        </StatusBadge>
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

                <div className="rounded-[24px] border border-border bg-[linear-gradient(145deg,#f8fbff_0%,#eef4ff_100%)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
                      <Ticket className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Secure booking flow</p>
                      <p className="text-sm text-muted-foreground">
                        Pricing, availability, and booking creation stay server-validated.
                      </p>
                    </div>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/checkout/${event.slug}`}>Book Now</Link>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
