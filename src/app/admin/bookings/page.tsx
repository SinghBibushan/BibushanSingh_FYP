import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { adminNavItems } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { listAdminBookings } from "@/server/admin/service";
import { ReceiptText } from "lucide-react";

export default async function AdminBookingsPage() {
  await requireAdmin();
  const bookings = await listAdminBookings();

  return (
    <AppShell
      badge="Admin bookings"
      title="Booking activity"
      description="Review booking flow output with cleaner hierarchy for status, user, event, and total."
      navItems={adminNavItems}
    >
      <Card className="bg-white/90">
        <CardContent className="space-y-4">
          <SectionHeader
            badge="Bookings"
            title="Platform booking activity"
            description="Review booking volume, user ownership, event associations, and order totals."
          />
          {bookings.length === 0 ? (
            <EmptyState
              icon={ReceiptText}
              title="No bookings available yet"
              description="Create and confirm a booking to populate this list."
            />
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="grid gap-4 rounded-[24px] border border-border bg-white/82 p-4 md:grid-cols-[0.9fr_1fr_1fr_0.7fr_0.8fr]"
                >
                  <div>
                    <p className="font-semibold text-foreground">{booking.bookingCode}</p>
                    <div className="mt-2">
                      <StatusBadge
                        tone={
                          booking.status === "CONFIRMED"
                            ? "success"
                            : booking.status === "CANCELLED"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {booking.status}
                      </StatusBadge>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{booking.userName}</div>
                  <div className="text-sm text-muted-foreground">{booking.eventTitle}</div>
                  <div className="text-sm font-semibold text-foreground">
                    {formatCurrency(booking.total)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(booking.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
