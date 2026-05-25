import Link from "next/link";
import { ArrowRight, ReceiptText, Ticket } from "lucide-react";

import { CancelBookingButton } from "@/components/bookings/cancel-booking-button";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth";
import { userNavItems } from "@/lib/user-nav";
import { formatCurrency, formatDate } from "@/lib/utils";
import { listCurrentUserBookings } from "@/server/bookings/service";

export default async function BookingsPage() {
  await requireUser();
  const bookings = await listCurrentUserBookings();

  return (
    <AppShell
      badge="My bookings"
      title="Booking history"
      description="Track booking state changes from order creation through payment, confirmation, and cancellation."
      navItems={userNavItems}
    >
      {bookings.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="No bookings yet"
          description="Create a booking from the event catalogue to start the payment, ticketing, and loyalty flow."
          action={
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-[0_14px_30px_rgba(24,32,51,0.16)]"
            >
              Browse Events
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      ) : (
        <div className="space-y-5">
          <SectionHeader
            badge="Booking Lifecycle"
            title={`${bookings.length} ${bookings.length === 1 ? "booking" : "bookings"}`}
            description="Track booking progress from creation to payment and ticket delivery."
          />

          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="bg-white/90">
                <CardContent className="space-y-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-2xl font-semibold leading-none text-foreground">
                          {booking.bookingCode}
                        </p>
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
                        {booking.payment ? (
                          <StatusBadge
                            tone={
                              booking.payment.status === "SUCCESS"
                                ? "success"
                                : booking.payment.status === "REFUNDED"
                                  ? "warning"
                                  : "info"
                            }
                          >
                            Payment: {booking.payment.status}
                          </StatusBadge>
                        ) : null}
                      </div>

                      <div>
                        <p className="font-semibold text-foreground">
                          {booking.event?.title ?? "Event"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {booking.event
                            ? `${booking.event.venueName}, ${booking.event.city}`
                            : "Event details unavailable"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {booking.event?.startsAt ? formatDate(booking.event.startsAt) : "Schedule unavailable"}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[20rem]">
                      <div className="rounded-[22px] border border-border bg-white/82 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Amount
                        </p>
                        <p className="mt-2 font-semibold text-foreground">
                          {formatCurrency(booking.totalAmount, booking.currency)}
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-border bg-white/82 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Tickets
                        </p>
                        <p className="mt-2 font-semibold text-foreground">
                          {booking.totalTickets}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[22px] border border-border bg-white/82 p-4 text-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Created
                      </p>
                      <p className="mt-2 font-semibold text-foreground">
                        {formatDate(booking.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-[22px] border border-border bg-white/82 p-4 text-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Loyalty effect
                      </p>
                      <p className="mt-2 font-semibold text-foreground">
                        +{booking.loyaltyPointsEarned} earned / -{booking.loyaltyPointsRedeemed} used
                      </p>
                    </div>
                    <div className="rounded-[22px] border border-border bg-white/82 p-4 text-sm">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Payment reference
                      </p>
                      <p className="mt-2 font-mono text-xs font-semibold text-foreground">
                        {booking.payment?.reference ?? "Pending"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/bookings/${booking.bookingCode}`}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_14px_30px_rgba(24,34,53,0.16)]"
                    >
                      View booking
                    </Link>
                    {booking.status === "CONFIRMED" ? (
                      <Link
                        href="/tickets"
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground"
                      >
                        <Ticket className="h-4 w-4" />
                        Open tickets
                      </Link>
                    ) : null}
                    {booking.canCancel ? (
                      <CancelBookingButton
                        bookingCode={booking.bookingCode}
                        className="border-red-200 text-red-700 hover:border-red-300 hover:bg-red-50"
                      />
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
