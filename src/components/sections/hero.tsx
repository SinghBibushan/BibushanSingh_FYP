import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  ShieldCheck,
  Ticket,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { demoEvents } from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export function HeroSection() {
  const headlineEvent = demoEvents[0];
  const cityCount = new Set(demoEvents.map((event) => event.city)).size;
  const categoryCount = new Set(demoEvents.map((event) => event.category)).size;

  return (
    <section className="surface-grid relative overflow-hidden py-16 md:py-24">
      <div className="hero-orb" />

      <div className="container-shell grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-8 opacity-0 animate-slide-in-left">
          <Badge className="bg-white/80 text-primary">Professional event booking</Badge>

          <div className="max-w-3xl space-y-6">
            <h1 className="text-5xl leading-[0.92] tracking-tight md:text-7xl opacity-0 animate-fade-in delay-100">
              Find, book, and manage premium event experiences with clarity.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl opacity-0 animate-fade-in delay-200">
              EventEase brings discovery, booking, verification, loyalty, and admin
              control into one composed workflow for venues, organisers, and attendees
              across Nepal.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row opacity-0 animate-fade-in delay-300">
            <Button asChild size="lg" className="group">
              <Link href="/events">
                Explore Events
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/register">Create an account</Link>
            </Button>
          </div>

          <div className="grid gap-4 pt-2 opacity-0 animate-fade-in delay-400 sm:grid-cols-3">
            <div className="rounded-[26px] border border-border bg-white/70 p-5 shadow-[0_14px_36px_rgba(24,34,53,0.05)]">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
                Cities covered
              </p>
              <p className="mt-3 text-3xl font-semibold leading-none text-foreground">
                {cityCount}
              </p>
            </div>
            <div className="rounded-[26px] border border-border bg-white/70 p-5 shadow-[0_14px_36px_rgba(24,34,53,0.05)]">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
                Event formats
              </p>
              <p className="mt-3 text-3xl font-semibold leading-none text-foreground">
                {categoryCount}
              </p>
            </div>
            <div className="rounded-[26px] border border-border bg-white/70 p-5 shadow-[0_14px_36px_rgba(24,34,53,0.05)]">
              <p className="text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
                Booking stack
              </p>
              <p className="mt-3 text-3xl font-semibold leading-none text-foreground">
                Live
              </p>
            </div>
          </div>
        </div>

        <Card className="glass-card relative overflow-hidden opacity-0 animate-slide-in-right delay-200 hover-lift">
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge className="bg-primary text-primary-foreground">Flagship listing</Badge>
              <span className="text-sm font-semibold text-secondary">
                From {formatCurrency(headlineEvent.priceFrom)}
              </span>
            </div>

            <div className="rounded-[28px] bg-[linear-gradient(145deg,#182235_0%,#24314d_62%,#43506b_100%)] p-7 text-white shadow-[0_24px_60px_rgba(24,34,53,0.24)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/62">
                    Featured event
                  </p>
                  <h2 className="mt-4 text-4xl leading-none font-semibold">
                    {headlineEvent.title}
                  </h2>
                </div>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/86">
                  {headlineEvent.category}
                </span>
              </div>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/78">
                {headlineEvent.summary}
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                  <CalendarDays className="h-4 w-4 text-white/86" />
                  <p className="mt-3 text-[0.68rem] uppercase tracking-[0.18em] text-white/54">
                    Schedule
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {formatDate(headlineEvent.startsAt)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/12 bg-white/8 p-4">
                  <MapPin className="h-4 w-4 text-white/86" />
                  <p className="mt-3 text-[0.68rem] uppercase tracking-[0.18em] text-white/54">
                    Venue
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">
                    {headlineEvent.venueName}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="rounded-[22px] border border-border bg-white/66 p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-accent" />
                <p className="font-semibold text-foreground">Trusted checkout</p>
                <p className="mt-1 leading-6">
                  Server-side pricing and availability validation.
                </p>
              </div>
              <div className="rounded-[22px] border border-border bg-white/66 p-4">
                <Ticket className="mb-3 h-5 w-5 text-secondary" />
                <p className="font-semibold text-foreground">Instant tickets</p>
                <p className="mt-1 leading-6">QR and PDF delivery after confirmation.</p>
              </div>
              <div className="rounded-[22px] border border-border bg-white/66 p-4">
                <MapPin className="mb-3 h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground">Local relevance</p>
                <p className="mt-1 leading-6">Flows shaped around Nepal event operations.</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-[24px] border border-border bg-white/74 px-5 py-4">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Current featured rate
                </p>
                <p className="mt-2 text-3xl font-semibold leading-none text-foreground">
                  {formatCurrency(headlineEvent.priceFrom)}
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/events/${headlineEvent.slug}`}>Review listing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
