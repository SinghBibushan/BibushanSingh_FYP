import { CreateEventForm } from "@/components/admin/create-event-form";
import { DeleteEventButton } from "@/components/admin/delete-event-button";
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

  return (
    <AppShell
      badge="Admin events"
      title="Manage events"
      description="List, create, and remove public events from the admin workspace."
      navItems={adminNavItems}
      currentPath="/admin/events"
    >
      <div className="space-y-5">
        <CreateEventForm />
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-3xl leading-none">Current events</h2>
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="grid gap-3 rounded-2xl bg-muted p-4 md:grid-cols-[1.4fr_0.8fr_0.7fr_0.5fr_auto]"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{event.title}</p>
                      <Badge>{event.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.category} in {event.city}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{formatDate(event.startsAt)}</p>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatCurrency(event.priceFrom)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {event.ticketTypes} type(s)
                  </div>
                  <DeleteEventButton id={event.id} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
