import { notFound, redirect } from "next/navigation";

import { CheckoutBuilder } from "@/components/forms/checkout-builder";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { getCurrentUser, getSession } from "@/lib/auth";
import { isDemoMockPaymentAvailable, isPayPalEnabled } from "@/lib/env";
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
  const availablePaymentProviders = [
    ...(isDemoMockPaymentAvailable ? (["MOCK"] as const) : []),
    ...(isPayPalEnabled ? (["PAYPAL"] as const) : []),
  ];

  if (!event) {
    notFound();
  }

  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell space-y-8 py-10 md:py-14">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeader
            badge="Checkout"
            title={`Book ${event.title}`}
            description="Review ticket quantities, promo discounts, student pricing, and payment method before creating the booking."
          />
          <Card className="max-w-md bg-white/90">
            <CardContent className="space-y-2 p-5">
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Event details
              </p>
              <p className="font-semibold text-foreground">{formatDate(event.startsAt)}</p>
              <p className="text-sm text-muted-foreground">
                {event.venueName}, {event.city}
              </p>
            </CardContent>
          </Card>
        </div>

        <CheckoutBuilder
          event={event}
          loyaltyPoints={user?.loyaltyPoints ?? 0}
          studentVerified={user?.studentVerificationStatus === "APPROVED"}
          availablePaymentProviders={availablePaymentProviders}
        />
      </main>
    </div>
  );
}
