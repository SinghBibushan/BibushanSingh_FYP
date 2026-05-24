import Link from "next/link";
import { ArrowRight, ReceiptText, Ticket } from "lucide-react";

import { CancelBookingButton } from "@/components/bookings/cancel-booking-button";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
      currentPath="/bookings"
    >
      {bookings.length === 0 ? (
        <Card className="bg-white/78">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-white">
              <ReceiptText className="h-10 w-10 text-secondary" />
            </div>
            <h2 className="text-3xl font-semibold leading-none text-foreground">
              No bookings yet
            </h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
              Create a booking from the event catalogue to start the payment, ticketing, and
              loyalty lifecycle.
            </p>
            <Link
              href="/events"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-[0_14px_30px_rgba(24,34,53,0.16)]"
            >
              Browse events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <div className="rounded-[28px] border border-border bg-white/72 px-6 py-4">
            <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
              Booking lifecycle
            </p>
            <p className="mt-2 text-3xl font-semibold leading-none text-foreground">
              {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}
            </p>
          </div>

          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="bg-white/78">
                <CardContent className="space-y-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-2xl font-semibold leading-none text-foreground">
                          {booking.bookingCode}
                        </p>
                        <Badge
                          className={
                            booking.status === "CONFIRMED"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : booking.status === "CANCELLED"
                                ? "border-red-200 bg-red-50 text-red-700"
                                : ""
                          }
                        >
                          {booking.status}
                        </Badge>
                        {booking.payment ? (
                          <Badge
                            className={
                              booking.payment.status === "SUCCESS"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : booking.payment.status === "REFUNDED"
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : ""
                            }
                          >
                            Payment: {booking.payment.status}
                          </Badge>
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
