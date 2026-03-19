"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readJson } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { BookingQuote } from "@/types/booking";
import type { EventDetail } from "@/types/events";

export function CheckoutBuilder({
  event,
  loyaltyPoints,
  studentVerified,
  paymentMode,
}: {
  event: EventDetail;
  loyaltyPoints: number;
  studentVerified: boolean;
  paymentMode: "MOCK" | "PAYPAL" | "NONE";
}) {
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(event.ticketTypes.map((ticket) => [ticket.id, 0])),
  );
  const [promoCode, setPromoCode] = useState("");
  const [useStudentDiscount, setUseStudentDiscount] = useState(false);
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0);
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const selections = useMemo(
    () =>
      event.ticketTypes.map((ticket) => ({
        ticketTypeId: ticket.id,
        quantity: Number(quantities[ticket.id] ?? 0),
      })),
    [event.ticketTypes, quantities],
  );

  const totalSelected = useMemo(
    () => selections.reduce((sum, selection) => sum + selection.quantity, 0),
    [selections],
  );

  function setQuantity(ticketId: string, value: number, max: number) {
    setQuantities((current) => ({
      ...current,
      [ticketId]: Math.max(0, Math.min(value, max)),
    }));
  }

  async function handleQuote() {
    setIsQuoting(true);

    try {
      const response = await fetch("/api/bookings/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventSlug: event.slug,
          selections,
          promoCode,
          useStudentDiscount,
          loyaltyPointsToRedeem,
        }),
      });

      const data = await readJson<{ quote: BookingQuote }>(response);
      setQuote(data.quote);
      toast.success("Pricing updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update pricing.");
      setQuote(null);
    } finally {
      setIsQuoting(false);
    }
  }

  async function handleCreateBooking() {
    setIsCreating(true);

    try {
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventSlug: event.slug,
          selections,
          promoCode,
          useStudentDiscount,
          loyaltyPointsToRedeem,
        }),
      });

      const data = await readJson<{ message: string; bookingCode: string }>(response);
      toast.success(data.message);
      router.push(`/bookings/${data.bookingCode}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create booking.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <Card className="bg-white/78">
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
              Ticket selection
            </p>
            <h2 className="text-3xl leading-none">Configure your order</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Select quantities, apply promo or student pricing where eligible, and
              request a verified server-side quote before creating the booking.
            </p>
          </div>

          <div className="space-y-4">
            {event.ticketTypes.map((ticket) => {
              const maxQuantity = Math.min(ticket.quantityRemaining, ticket.perUserLimit);
              const quantity = quantities[ticket.id] ?? 0;

              return (
                <div
                  key={ticket.id}
                  className="grid gap-4 rounded-[24px] border border-border bg-white/82 p-4 md:grid-cols-[1fr_170px]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-foreground">{ticket.name}</p>
                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                      </div>
                      <p className="font-semibold text-secondary">
                        {formatCurrency(ticket.price, ticket.currency)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground">
                        {ticket.quantityRemaining} seats remaining
                      </span>
                      <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground">
                        Limit {ticket.perUserLimit} per booking
                      </span>
                      {ticket.benefits.slice(0, 2).map((benefit) => (
                        <span
                          key={benefit}
                          className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold text-muted-foreground"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`qty-${ticket.id}`}>Quantity</Label>
                    <div className="flex items-center gap-2 rounded-2xl border border-border bg-white p-2">
                      <button
                        type="button"
                        onClick={() => setQuantity(ticket.id, quantity - 1, maxQuantity)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-foreground"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <Input
                        id={`qty-${ticket.id}`}
                        type="number"
                        min={0}
                        max={maxQuantity}
                        value={quantity}
                        onChange={(eventValue) =>
                          setQuantity(ticket.id, Number(eventValue.target.value), maxQuantity)
                        }
                        className="border-0 bg-transparent text-center shadow-none"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(ticket.id, quantity + 1, maxQuantity)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-foreground"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="promoCode">Promo code</Label>
              <Input
                id="promoCode"
                placeholder="FEST10"
                value={promoCode}
                onChange={(eventValue) => setPromoCode(eventValue.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loyaltyRedeem">Redeem loyalty points</Label>
              <Input
                id="loyaltyRedeem"
                type="number"
                min={0}
                max={loyaltyPoints}
                value={loyaltyPointsToRedeem}
                onChange={(eventValue) =>
                  setLoyaltyPointsToRedeem(
                    Math.max(0, Math.min(Number(eventValue.target.value), loyaltyPoints)),
                  )
                }
              />
              <p className="text-xs text-muted-foreground">
                Available: {loyaltyPoints} points. Max 20% of subtotal can be redeemed.
              </p>
            </div>
          </div>

          <label
            className={`flex items-start gap-3 rounded-[24px] border p-4 text-sm ${
              studentVerified
                ? "border-border bg-[linear-gradient(145deg,#eef5f3_0%,#e7efec_100%)]"
                : "border-border bg-white/82"
            }`}
          >
            <input
              type="checkbox"
              checked={useStudentDiscount}
              onChange={(eventValue) => setUseStudentDiscount(eventValue.target.checked)}
              className="mt-1 h-4 w-4"
              disabled={!studentVerified}
            />
            <span className="leading-7 text-muted-foreground">
              Apply student discount
              <span className="block text-xs">
                {studentVerified
                  ? "Your account is approved for student pricing."
                  : "Student pricing is unavailable until verification is approved."}
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      <Card className="h-fit bg-white/78 lg:sticky lg:top-28">
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
              Order summary
            </p>
            <h2 className="text-3xl leading-none">Review before booking</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Quote first to inspect the final price breakdown, then create a booking and
              {paymentMode === "PAYPAL"
                ? " complete the PayPal payment on the next screen."
                : paymentMode === "MOCK"
                  ? " complete mock payment on the next screen."
                  : " finish payment after a provider is configured."}
            </p>
          </div>

          <div className="rounded-[24px] border border-border bg-white/82 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Tickets selected
            </p>
            <p className="mt-2 text-3xl font-semibold leading-none text-foreground">
              {totalSelected}
            </p>
          </div>

          {quote ? (
            <div className="space-y-4 rounded-[24px] border border-border bg-[linear-gradient(145deg,#f8f3ea_0%,#f2e5d6_100%)] p-5">
              <div className="space-y-2">
                {quote.selections.map((selection) => (
                  <div
                    key={selection.ticketTypeId}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {selection.name} x {selection.quantity}
                    </span>
                    <span>{formatCurrency(selection.lineTotal, quote.currency)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Subtotal</span>
                <span>{formatCurrency(quote.subtotal, quote.currency)}</span>
              </div>

              {quote.discounts.map((discount) => (
                <div
                  key={discount.label}
                  className="flex items-center justify-between text-sm text-emerald-700"
                >
                  <span>{discount.label}</span>
                  <span>-{formatCurrency(discount.amount, quote.currency)}</span>
                </div>
              ))}

              <div className="flex items-center justify-between text-base font-semibold text-foreground">
                <span>Total</span>
                <span>{formatCurrency(quote.finalAmount, quote.currency)}</span>
              </div>

              <p className="text-xs text-muted-foreground">
                Booking reward after successful payment: {quote.loyaltyPointsEarned} points
              </p>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border p-5 text-sm leading-7 text-muted-foreground">
              No quote yet. Use the selections on the left, then click
              <span className="font-semibold text-foreground"> Update total</span>.
            </div>
          )}

          <div className="grid gap-3">
            <Button onClick={handleQuote} disabled={isQuoting}>
              {isQuoting ? "Updating..." : "Update total"}
            </Button>
            <Button
              variant="secondary"
              onClick={handleCreateBooking}
              disabled={isCreating || totalSelected === 0 || paymentMode === "NONE"}
            >
              {isCreating
                ? "Creating booking..."
                : paymentMode === "PAYPAL"
                  ? "Proceed to PayPal checkout"
                  : paymentMode === "MOCK"
                    ? "Proceed to mock payment"
                    : "Payment unavailable"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
