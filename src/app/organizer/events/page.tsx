import Link from "next/link";

import { CreateOrganizerEventForm } from "@/components/organizer/create-organizer-event-form";
import { SubmitOrganizerEventButton } from "@/components/organizer/submit-organizer-event-button";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireOrganizer } from "@/lib/auth";
import { organizerNavItems } from "@/lib/organizer-nav";
import { formatCurrency, formatDate } from "@/lib/utils";
import { listOrganizerEvents } from "@/server/organizer/service";

export default async function OrganizerEventsPage() {
  await requireOrganizer();
  const events = await listOrganizerEvents();
  const pendingCount = events.filter((event) => event.status === "PENDING_APPROVAL").length;

  return (
    <AppShell
      badge="Organizer events"
      title="Create and submit events"
      description="Manage drafts, re-submit rejected listings, and monitor how approved events are performing."
      navItems={organizerNavItems}
    >
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                My event records
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">{events.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Pending review
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">{pendingCount}</p>
            </CardContent>
          </Card>
        </div>

        <CreateOrganizerEventForm />

        <Card className="bg-white/78">
          <CardContent className="space-y-4">
            <h2 className="text-3xl leading-none">My submissions</h2>
            {events.length === 0 ? (
              <div className="rounded-[22px] border border-border bg-white/82 p-5 text-sm text-muted-foreground">
                No organizer events yet. Start with a draft above.
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="grid gap-4 rounded-[24px] border border-border bg-white/82 p-4 md:grid-cols-[1.35fr_0.9fr_0.8fr_1fr_auto]"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-semibold text-foreground">{event.title}</p>
                        <Badge>{event.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {event.category} in {event.city}
                      </p>
                      {event.reviewNotes ? (
                        <p className="rounded-2xl bg-muted px-3 py-2 text-xs leading-6 text-muted-foreground">
                          Review note: {event.reviewNotes}
                        </p>
                      ) : null}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>{formatDate(event.startsAt)}</p>
                      <p className="mt-1">{event.ticketTypes} ticket type(s)</p>
                    </div>
                    <div className="text-sm text-foreground">
                      <p className="font-semibold">{formatCurrency(event.priceFrom)}</p>
                      <p className="mt-1 text-muted-foreground">{event.confirmedBookings} confirmed</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Revenue</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {formatCurrency(event.revenue)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {event.status === "PUBLISHED" ? (
                        <Link
                          href={`/events/${event.slug}`}
                          className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground"
                        >
                          View
                        </Link>
                      ) : (
                        <span className="inline-flex items-center justify-center rounded-full border border-border bg-muted px-4 py-2 text-sm font-semibold text-muted-foreground">
                          Not public yet
                        </span>
                      )}
                      {event.status === "DRAFT" || event.status === "REJECTED" ? (
                        <SubmitOrganizerEventButton id={event.id} />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
