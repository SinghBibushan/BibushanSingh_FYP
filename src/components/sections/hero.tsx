import Link from "next/link";
import { CalendarDays, MapPin, Ticket, Sparkles } from "lucide-react";

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
      {/* Additional floating orbs */}
      <div className="absolute top-20 right-20 h-40 w-40 rounded-full bg-secondary/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-40 left-1/3 h-60 w-60 rounded-full bg-accent/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container-shell grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-8 opacity-0 animate-slide-in-left">
          <Badge className="bg-gradient-to-r from-primary via-secondary to-accent text-white border-0 neon-glow">
            <Sparkles className="h-3 w-3 mr-1" />
            Live Event Platform
          </Badge>
          <div className="max-w-3xl space-y-5">
            <h1 className="text-5xl leading-[0.95] tracking-tight md:text-7xl opacity-0 animate-fade-in delay-100">
              Discover <span className="gradient-text">Epic Events</span> Across Nepal
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl opacity-0 animate-fade-in delay-200">
              Your ultimate platform for discovering concerts, festivals, workshops, and cultural events.
              Book tickets instantly, earn rewards, and never miss out on the experiences that matter.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row opacity-0 animate-fade-in delay-300">
            <Button asChild size="lg" className="hover-lift group bg-gradient-to-r from-primary to-secondary">
              <Link href="/events">
                Explore Events
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="hover-lift border-primary/50 hover:border-primary">
              <Link href="/register">Get Started Free</Link>
            </Button>
          </div>
        </div>

        <Card className="glass-card relative overflow-hidden border-primary/30 opacity-0 animate-slide-in-right delay-200 hover-lift neon-glow">
          <CardContent className="space-y-6 p-7">
            <div className="flex items-center justify-between">
              <Badge className="bg-gradient-to-r from-secondary to-accent text-white border-0">
                🔥 Trending Now
              </Badge>
              <span className="text-sm font-semibold text-primary">
                From {formatCurrency(headlineEvent.priceFrom)}
              </span>
            </div>
            <div className="rounded-[24px] bg-gradient-to-br from-primary via-secondary to-accent p-6 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <p className="text-xs uppercase tracking-[0.24em] text-white/70">
                  Featured Event
                </p>
                <h2 className="mt-3 text-4xl leading-none font-bold">{headlineEvent.title}</h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/90">
                  {headlineEvent.summary}
                </p>
              </div>
            </div>
            <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
              <div className="rounded-2xl bg-muted/50 p-4 hover:bg-muted transition-all duration-300 cursor-pointer border border-primary/10 hover:border-primary/30">
                <CalendarDays className="mb-3 h-5 w-5 text-primary" />
                <p className="font-semibold text-foreground">Date</p>
                <p className="text-xs mt-1">{formatDate(headlineEvent.startsAt)}</p>
              </div>
              <div className="rounded-2xl bg-muted/50 p-4 hover:bg-muted transition-all duration-300 cursor-pointer border border-secondary/10 hover:border-secondary/30">
                <MapPin className="mb-3 h-5 w-5 text-secondary" />
                <p className="font-semibold text-foreground">Venue</p>
                <p className="text-xs mt-1">{headlineEvent.venueName}</p>
              </div>
              <div className="rounded-2xl bg-muted/50 p-4 hover:bg-muted transition-all duration-300 cursor-pointer border border-accent/10 hover:border-accent/30">
                <Ticket className="mb-3 h-5 w-5 text-accent" />
                <p className="font-semibold text-foreground">Type</p>
                <p className="text-xs mt-1">{headlineEvent.category}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
