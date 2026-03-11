import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/events/event-card";
import { EventEmptyState } from "@/components/events/event-empty-state";
import { EventFilters } from "@/components/events/event-filters";
import {
  getEventFilterOptions,
  getPublicEvents,
} from "@/server/events/service";
import { Sparkles } from "lucide-react";

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    city?: string;
    featured?: string;
  }>;
}) {
  const params = await searchParams;
  const filterOptions = getEventFilterOptions();
  const events = await getPublicEvents({
    q: params.q,
    category: params.category,
    city: params.city,
    featured: params.featured === "true",
  });

  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell space-y-10 py-14">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between opacity-0 animate-fade-in">
          <div className="space-y-3">
            <Badge className="bg-gradient-to-r from-primary via-secondary to-accent text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              Discover Events
            </Badge>
            <h1 className="text-5xl leading-none font-bold">
              Upcoming <span className="gradient-text">Events</span> Across Nepal
            </h1>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              From electrifying concerts to cultural festivals, find and book tickets for the most exciting events happening near you.
            </p>
          </div>
          <div className="rounded-[28px] bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 px-6 py-4 border border-primary/30 hover-lift backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Available Events
            </p>
            <p className="mt-2 text-3xl leading-none font-bold gradient-text">{events.length}</p>
          </div>
        </div>

        <div className="opacity-0 animate-fade-in delay-100">
          <EventFilters
            categories={filterOptions.categories}
            cities={filterOptions.cities}
            values={{
              q: params.q ?? "",
              category: params.category ?? "all",
              city: params.city ?? "all",
              featured: params.featured ?? "all",
            }}
          />
        </div>

        {events.length === 0 ? (
          <EventEmptyState />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {events.map((event, index) => (
              <div
                key={event.slug}
                className="opacity-0 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <EventCard event={event} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
