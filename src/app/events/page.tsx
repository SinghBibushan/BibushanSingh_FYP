import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/events/event-card";
import { EventEmptyState } from "@/components/events/event-empty-state";
import { EventFilters } from "@/components/events/event-filters";
import {
  getEventFilterOptions,
  getPublicEvents,
} from "@/server/events/service";

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge>Event discovery</Badge>
            <h1 className="text-5xl leading-none">Upcoming events across Nepal</h1>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              Browse polished public listings with keyword search, category and city
              filters, featured highlights, and DB fallback support when demo data
              needs to carry the viva.
            </p>
          </div>
          <div className="rounded-[28px] bg-muted px-6 py-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Results
            </p>
            <p className="mt-2 text-3xl leading-none">{events.length}</p>
          </div>
        </div>

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

        {events.length === 0 ? (
          <EventEmptyState />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
