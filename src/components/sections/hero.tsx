import Link from "next/link";
import { CalendarDays, MapPin, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { demoEvents } from "@/lib/demo-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export function HeroSection() {
  const headlineEvent = demoEvents[0];

  return (
    <section className="surface-grid relative overflow-hidden py-16 md:py-24">
      <div className="hero-orb" />
      <div className="container-shell grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8 opacity-0 animate-slide-in-left">
          <Badge className="bg-white/90 text-secondary hover:bg-white transition-all duration-300">
            Demo-ready booking flow
          </Badge>
          <div className="max-w-3xl space-y-5">
            <h1 className="text-5xl leading-[0.95] tracking-tight md:text-7xl opacity-0 animate-fade-in delay-100">
              Discover Nepal&apos;s most <span className="gradient-text">compelling events</span> in one polished booking platform.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl opacity-0 animate-fade-in delay-200">
              EventEase combines modern event discovery, transparent discounts,
              mock-safe payment, loyalty rewards, and QR tickets in a single
              system built for clear viva demonstration.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row opacity-0 animate-fade-in delay-300">
            <Button asChild size="lg" className="hover-lift group">
              <Link href="/events">
                Browse Events
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="hover-lift">
              <Link href="/admin">Open Admin Preview</Link>
            </Button>
          </div>
        </div>

        <Card className="glass-card relative overflow-hidden border-white/50 opacity-0 animate-slide-in-right delay-200 hover-lift">
          <CardContent className="space-y-6 p-7">
            <div className="flex items-center justify-between">
              <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0">
                Featured event
              </Badge>
              <span className="text-sm font-semibold text-primary">
                From {formatCurrency(headlineEvent.priceFrom)}
              </span>
            </div>
            <div className="rounded-[24px] bg-[linear-gradient(135deg,#1f4e5f_0%,#14213d_58%,#d97706_100%)] p-6 text-white shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <p className="text-xs uppercase tracking-[0.24em] text-white/70">
                Live this season
              </p>
              <h2 className="mt-3 text-4xl leading-none">{headlineEvent.title}</h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/78">
                {headlineEvent.summary}
              </p>
            </div>
            <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="rounded-2xl bg-muted p-4 hover:bg-muted/80 transition-colors duration-300 cursor-pointer">
                <CalendarDays className="mb-3 h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground">Schedule</p>
                <p>{formatDate(headlineEvent.startsAt)}</p>
              </div>
              <div className="rounded-2xl bg-muted p-4 hover:bg-muted/80 transition-colors duration-300 cursor-pointer">
                <MapPin className="mb-3 h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground">Venue</p>
                <p>{headlineEvent.venueName}</p>
              </div>
              <div className="rounded-2xl bg-muted p-4 hover:bg-muted/80 transition-colors duration-300 cursor-pointer">
                <Ticket className="mb-3 h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground">Category</p>
                <p>{headlineEvent.category}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
