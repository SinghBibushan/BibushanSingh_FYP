import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { adminNavItems } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { listAdminBookings } from "@/server/admin/service";

export default async function AdminBookingsPage() {
  await requireAdmin();
  const bookings = await listAdminBookings();

  return (
    <AppShell
      badge="Admin bookings"
      title="Booking activity"
      description="Review pending, expired, and confirmed bookings with totals and event associations."
      navItems={adminNavItems}
      currentPath="/admin/bookings"
    >
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-3xl leading-none">Bookings</h2>
          {bookings.length === 0 ? (
            <div className="rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
              No bookings available yet. Create and confirm a booking to populate this table.
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="grid gap-3 rounded-2xl bg-muted p-4 md:grid-cols-[0.8fr_1fr_1fr_0.6fr_0.8fr]"
                >
                  <div>
                    <p className="font-semibold">{booking.bookingCode}</p>
                    <Badge>{booking.status}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{booking.userName}</div>
                  <div className="text-sm text-muted-foreground">{booking.eventTitle}</div>
                  <div className="text-sm font-semibold">{formatCurrency(booking.total)}</div>
                  <div className="text-sm text-muted-foreground">{formatDate(booking.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
