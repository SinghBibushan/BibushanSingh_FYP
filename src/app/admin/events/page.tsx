import Link from "next/link";

import { CreateEventForm } from "@/components/admin/create-event-form";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
import { ReviewEventButtons } from "@/components/admin/review-event-buttons";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { adminNavItems } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { listAdminEvents } from "@/server/admin/service";

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
      currentPath="/admin/events"
    >
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Total events
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">{events.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Featured listings
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">{featuredCount}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Pending approval
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">{pendingCount}</p>
            </CardContent>
          </Card>
        </div>

        <CreateEventForm />

        <Card className="bg-white/78">
          <CardContent className="space-y-4">
            <h2 className="text-3xl leading-none">Current events</h2>
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="grid gap-4 rounded-[24px] border border-border bg-white/82 p-4 md:grid-cols-[1.45fr_0.95fr_0.8fr_0.7fr_auto_auto]"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="font-semibold text-foreground">{event.title}</p>
                      <Badge>{event.status}</Badge>
                      {event.featured ? <Badge>Featured</Badge> : null}
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
