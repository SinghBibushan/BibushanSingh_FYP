import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Ticket, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
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
  const canSaveToWishlist = /^[a-f0-9]{24}$/i.test(event._id);
  const availabilityTone =
    event.ticketsRemaining === 0
      ? "danger"
      : event.ticketsRemaining <= 20
        ? "warning"
        : "success";
  const availabilityLabel =
    event.ticketsRemaining === 0
      ? "Sold out"
      : event.ticketsRemaining <= 20
        ? `${event.ticketsRemaining} left`
        : "Available";

  return (
    <Card className="group overflow-hidden border-border/70 bg-white/90 hover-lift">
      <div className={`relative min-h-52 overflow-hidden border-b border-border/70 p-4 text-white sm:p-6 ${accentClass}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <Badge className="border-white/16 bg-white/12 text-white">{event.category}</Badge>
              <div className="inline-flex rounded-xl border border-white/16 bg-white/10 px-3 py-2 text-left">
                <div>
                  <p className="text-[0.62rem] uppercase tracking-[0.16em] text-white/70">
                    Date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {new Intl.DateTimeFormat("en-NP", {
                      month: "short",
                      day: "numeric",
                    }).format(new Date(event.startsAt))}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {event.featured ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/16 bg-white/12 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white">
                  <TrendingUp className="h-3 w-3" />
                  Featured
                </span>
              ) : null}
              {canSaveToWishlist ? <WishlistButton eventId={event._id} size="sm" /> : null}
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/12 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/85">
                {event.city}
              </span>
            </div>
            <h2 className="max-w-md text-2xl leading-tight font-semibold sm:text-3xl sm:leading-none">
              {event.title}
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/80 line-clamp-2">
              {event.summary}
            </p>
          </div>
        </div>
      </div>

      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={availabilityTone}>{availabilityLabel}</StatusBadge>
          <Badge className="bg-slate-50 text-slate-700">{event.ticketCount} ticket types</Badge>
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-slate-50">
              <CalendarDays className="h-4 w-4 text-secondary" />
            </div>
            <span className="text-foreground/86">{formatDate(event.startsAt)}</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-slate-50">
              <MapPin className="h-4 w-4 text-accent" />
            </div>
            <span className="min-w-0 text-foreground/86">
              {event.venueName}, {event.city}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-slate-50">
              <Ticket className="h-4 w-4 text-primary" />
            </div>
            <span className="text-foreground/86">{event.ticketsRemaining} seats remaining</span>
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

        <div className="flex flex-col gap-4 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_12px_24px_rgba(24,32,51,0.16)] sm:w-auto"
          >
            View Event
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
