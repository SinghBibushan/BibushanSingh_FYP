import { notFound, redirect } from "next/navigation";

import { MockPaymentPanel } from "@/components/forms/mock-payment-panel";
import { PayPalPaymentPanel } from "@/components/forms/paypal-payment-panel";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getBookingDetails } from "@/server/bookings/service";

export default async function BookingDetailsPage({
  params,
}: {
  params: Promise<{ bookingCode: string }>;
}) {
  const { bookingCode } = await params;

  let booking;

  try {
    booking = await getBookingDetails(bookingCode);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Booking not found.";

    if (message === "Unauthorized.") {
      redirect("/login");
    }

    notFound();
  }

  const event = booking.eventId as {
    title: string;
    venueName: string;
    startsAt: Date | string;
  };
  const payment = booking.paymentId as {
    provider: string;
    reference: string;
    status: string;
    meta?: {
      payableCurrency?: string;
      payableAmount?: string;
    };
  };

  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell grid gap-8 py-14 lg:grid-cols-[1fr_0.9fr]">
        <section className="space-y-6">
          <div className="space-y-3">
            <Badge>Booking details</Badge>
            <h1 className="text-5xl leading-none">{booking.bookingCode}</h1>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              This page separates booking creation from payment confirmation so the
              viva can clearly demonstrate pending and confirmed states.
            </p>
          </div>

          <Card>
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={booking.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" : ""}>
                  {booking.status}
                </Badge>
                <Badge className={payment.status === "SUCCESS" ? "bg-emerald-100 text-emerald-700" : ""}>
                  Payment: {payment.status}
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-muted p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Event
                  </p>
                  <p className="mt-2 font-semibold">{event.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{event.venueName}</p>
                </div>
                <div className="rounded-[24px] bg-muted p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Schedule
                  </p>
                  <p className="mt-2 font-semibold">{formatDate(event.startsAt)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Payment ref: {payment.reference}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-3xl leading-none">Ticket selections</h2>
              {booking.ticketSelections.map(
                (selection: {
                  ticketTypeId: string;
                  name: string;
                  unitPrice: number;
                  quantity: number;
                }) => (
                  <div
                    key={`${selection.ticketTypeId}-${selection.name}`}
                    className="flex items-center justify-between rounded-2xl bg-muted p-4 text-sm"
                  >
                    <span>
                      {selection.name} x {selection.quantity}
                    </span>
                    <span>
                      {formatCurrency(
                        selection.unitPrice * selection.quantity,
                        booking.pricing.currency,
                      )}
                    </span>
                  </div>
                ),
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-3xl leading-none">Pricing</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(booking.pricing.subtotal, booking.pricing.currency)}</span>
                </div>
                {booking.pricing.discounts.map(
                  (discount: { label: string; amount: number }) => (
                    <div
                      key={discount.label}
                      className="flex items-center justify-between text-emerald-700"
                    >
                      <span>{discount.label}</span>
                      <span>-{formatCurrency(discount.amount, booking.pricing.currency)}</span>
                    </div>
                  ),
                )}
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>
                    {formatCurrency(booking.pricing.finalAmount, booking.pricing.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-3xl leading-none">
                {payment.provider === "PAYPAL" ? "PayPal payment" : "Mock payment"}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {payment.provider === "PAYPAL"
                  ? `Complete checkout with PayPal to confirm this booking${payment.meta?.payableAmount && payment.meta?.payableCurrency ? ` for ${payment.meta.payableCurrency} ${payment.meta.payableAmount}` : ""}.`
                  : "Use the buttons below to simulate a successful or failed payment. On success, booking status becomes confirmed and loyalty points are updated."}
              </p>
              {payment.provider === "PAYPAL" ? (
                <PayPalPaymentPanel
                  bookingCode={booking.bookingCode}
                  currency={payment.meta?.payableCurrency ?? "USD"}
                  disabled={booking.status === "CONFIRMED"}
                />
              ) : (
                <MockPaymentPanel
                  bookingCode={booking.bookingCode}
                  disabled={booking.status === "CONFIRMED"}
                />
              )}
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
