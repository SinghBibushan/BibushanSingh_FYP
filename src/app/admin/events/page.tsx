import Link from "next/link";

import { CreateEventForm } from "@/components/admin/create-event-form";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { ReviewEventButtons } from "@/components/admin/review-event-buttons";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { adminNavItems } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { listAdminEvents } from "@/server/admin/service";
import { CalendarClock, Sparkles, TimerReset } from "lucide-react";

export default async function AdminEventsPage() {
  await requireAdmin();
  const events = await listAdminEvents();
  const featuredCount = events.filter((event) => event.featured).length;
  const pendingCount = events.filter((event) => event.status === "PENDING_APPROVAL").length;

  return (
    <AppShell
      badge="Admin events"
      title="Manage events"
      description="Create, review, and remove public listings from a cleaner operational view."
      navItems={adminNavItems}
    >
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-3">
          <StatCard label="Total events" value={String(events.length)} icon={CalendarClock} tone="slate" />
          <StatCard label="Featured listings" value={String(featuredCount)} icon={Sparkles} tone="indigo" />
          <StatCard label="Pending approval" value={String(pendingCount)} icon={TimerReset} tone="amber" />
        </div>

        <CreateEventForm />

        <Card className="bg-white/90">
          <CardContent className="space-y-4">
            <SectionHeader
              badge="Current Events"
              title="Event inventory"
              description="Review the publishing state, pricing, ticket setup, and organizer ownership for each listing."
            />
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="grid gap-4 rounded-[24px] border border-border bg-white/82 p-4 md:grid-cols-[1.45fr_0.95fr_0.8fr_0.7fr_auto_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-foreground">{event.title}</p>
                      <StatusBadge
                        tone={
                          event.status === "PUBLISHED"
                            ? "success"
                            : event.status === "PENDING_APPROVAL"
                              ? "warning"
                              : event.status === "REJECTED"
                                ? "danger"
                                : "neutral"
                        }
                      >
                        {event.status}
                      </StatusBadge>
                      {event.featured ? <StatusBadge tone="info">Featured</StatusBadge> : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.category} in {event.city}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Organizer: {event.organizerName}
                    </p>
                    {event.reviewNotes ? (
                      <p className="mt-2 rounded-2xl bg-muted px-3 py-2 text-xs leading-6 text-muted-foreground">
                        Review note: {event.reviewNotes}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{formatDate(event.startsAt)}</p>
                  </div>
                  <div className="text-sm font-semibold text-foreground">
                    {formatCurrency(event.priceFrom)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {event.ticketTypes} type(s)
                  </div>
                  <Link
                    href={`/events/${event.slug}`}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground"
                  >
                    View
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    <ReviewEventButtons id={event.id} status={event.status} />
                    <DeleteEventButton id={event.id} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
