import { Compass } from "lucide-react";

import { EventCard } from "@/components/events/event-card";
import { EventEmptyState } from "@/components/events/event-empty-state";
import { EventFilters } from "@/components/events/event-filters";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { getEventFilterOptions, getPublicEvents } from "@/server/events/service";

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
        <div className="grid gap-5 opacity-0 animate-fade-in lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="space-y-4">
            <Badge className="bg-white/80 text-primary">
              <Compass className="mr-2 h-3 w-3" />
              Browse catalogue
            </Badge>
            <h1 className="max-w-4xl text-5xl leading-[0.95] md:text-6xl">
              Discover professionally presented events across Nepal.
            </h1>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              Browse by city, category, or featured status and move from discovery into
              booking with a cleaner, more focused event selection flow.
            </p>
          </div>
          <div className="rounded-[28px] border border-border bg-white/72 px-6 py-4 shadow-[0_16px_40px_rgba(24,34,53,0.07)]">
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
              Available events
            </p>
            <p className="mt-2 text-3xl font-semibold leading-none text-foreground">
              {events.length}
            </p>
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
                style={{ animationDelay: `${index * 0.08}s` }}
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
