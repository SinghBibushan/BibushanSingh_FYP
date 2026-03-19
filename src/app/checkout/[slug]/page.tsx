import { notFound, redirect } from "next/navigation";

import { CheckoutBuilder } from "@/components/forms/checkout-builder";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser, getSession } from "@/lib/auth";
import { isMockPaymentEnabled, isPayPalEnabled } from "@/lib/env";
import { formatDate } from "@/lib/utils";
import { getPublicEventBySlug } from "@/server/events/service";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await getCurrentUser();
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  const paymentMode = isMockPaymentEnabled
    ? "MOCK"
    : isPayPalEnabled
      ? "PAYPAL"
      : "NONE";

  if (!event) {
    notFound();
  }

  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell space-y-8 py-14">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge>Checkout</Badge>
            <h1 className="text-5xl leading-none">Book {event.title}</h1>
            <p className="max-w-3xl text-base leading-8 text-muted-foreground">
              This checkout uses server-side pricing for ticket selection, promo
              codes, student discount validation, group discounts, and loyalty
              redemption before creating a pending booking.
            </p>
          </div>
          <Card className="max-w-md">
            <CardContent className="space-y-2 p-5">
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Event timing
              </p>
              <p className="font-semibold text-foreground">{formatDate(event.startsAt)}</p>
              <p className="text-sm text-muted-foreground">{event.venueName}</p>
            </CardContent>
          </Card>
        </div>

        <CheckoutBuilder
          event={event}
          loyaltyPoints={user?.loyaltyPoints ?? 0}
          studentVerified={user?.studentVerificationStatus === "APPROVED"}
          paymentMode={paymentMode}
        />
      </main>
    </div>
  );
}
