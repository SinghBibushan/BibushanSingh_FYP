import { Compass } from "lucide-react";

import { EventCard } from "@/components/events/event-card";
import { EventEmptyState } from "@/components/events/event-empty-state";
import { EventFilters } from "@/components/events/event-filters";
import { SiteHeader } from "@/components/layout/site-header";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
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
      <main className="container-shell space-y-8 py-10 md:py-14">
        <div className="grid gap-5 opacity-0 animate-fade-in lg:grid-cols-[1fr_220px] lg:items-end">
          <SectionHeader
            badge={
              <>
                <Compass className="mr-2 h-3 w-3" />
                Event Catalogue
              </>
            }
            title="Discover curated events across Nepal"
            description="Compare dates, cities, ticket options, and featured listings without digging through long descriptions."
            className="min-w-0"
          />
          <StatCard
            label="Available events"
            value={String(events.length)}
            note="Live matches for your current filters"
            icon={Compass}
            tone="indigo"
          />
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
