"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
}: {
  event: EventDetail;
  loyaltyPoints: number;
  studentVerified: boolean;
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
      <Card>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <h2 className="text-3xl leading-none">Select tickets</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Configure quantities and discount options. Final validation still
              happens on the server before a booking is created.
            </p>
          </div>

          <div className="space-y-4">
            {event.ticketTypes.map((ticket) => (
              <div
                key={ticket.id}
                className="grid gap-4 rounded-[24px] border border-border bg-card p-4 md:grid-cols-[1fr_110px]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold">{ticket.name}</p>
                    <p className="font-semibold text-primary">
                      {formatCurrency(ticket.price, ticket.currency)}
                    </p>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {ticket.description}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {ticket.quantityRemaining} seats remaining
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`qty-${ticket.id}`}>Quantity</Label>
                  <Input
                    id={`qty-${ticket.id}`}
                    type="number"
                    min={0}
                    max={Math.min(ticket.quantityRemaining, 10)}
                    value={quantities[ticket.id] ?? 0}
                    onChange={(eventValue) =>
                      setQuantities((current) => ({
                        ...current,
                        [ticket.id]: Number(eventValue.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            ))}
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
                  setLoyaltyPointsToRedeem(Number(eventValue.target.value))
                }
              />
              <p className="text-xs text-muted-foreground">
                Available: {loyaltyPoints} points. Max 20% of subtotal can be redeemed.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-2xl bg-muted p-4 text-sm">
            <input
              type="checkbox"
              checked={useStudentDiscount}
              onChange={(eventValue) => setUseStudentDiscount(eventValue.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <span className="leading-7 text-muted-foreground">
              Apply student discount
              <span className="block text-xs">
                {studentVerified
                  ? "Your account is approved for student pricing."
                  : "Your account needs approved student verification before this can apply."}
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      <Card className="h-fit lg:sticky lg:top-28">
        <CardContent className="space-y-6 p-6">
          <div className="space-y-2">
            <h2 className="text-3xl leading-none">Order summary</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Quote first to inspect the final price breakdown, then create a booking
              and complete the mock payment on the next screen.
            </p>
          </div>

          {quote ? (
            <div className="space-y-4 rounded-[24px] bg-muted p-5">
              <div className="space-y-2">
                {quote.selections.map((selection) => (
                  <div key={selection.ticketTypeId} className="flex items-center justify-between text-sm">
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
                <div key={discount.label} className="flex items-center justify-between text-sm text-emerald-700">
                  <span>{discount.label}</span>
                  <span>-{formatCurrency(discount.amount, quote.currency)}</span>
                </div>
              ))}

              <div className="flex items-center justify-between text-base font-semibold">
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
              disabled={isCreating}
            >
              {isCreating ? "Creating booking..." : "Proceed to mock payment"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
