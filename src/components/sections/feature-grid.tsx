import { BellRing, Percent, QrCode, ShieldCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Booking-first architecture",
    description:
      "Ticket availability, pricing, and booking status are validated on the server before confirmation.",
    icon: ShieldCheck,
  },
  {
    title: "Flexible discount engine",
    description:
      "Promo codes, student benefits, group thresholds, and loyalty redemption stack under controlled rules.",
    icon: Percent,
  },
  {
    title: "Instant QR and PDF tickets",
    description:
      "Each confirmed booking issues unique, scannable ticket records with downloadable PDF support.",
    icon: QrCode,
  },
  {
    title: "Demo-safe notifications",
    description:
      "Email verification, booking updates, and reminders can use SMTP or local mock delivery logs.",
    icon: BellRing,
  },
];

export function FeatureGrid() {
  return (
    <section className="py-20">
      <div className="container-shell space-y-8">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
            Core capabilities
          </p>
          <h2 className="text-4xl leading-tight md:text-5xl">
            Professional architecture without viva-unfriendly complexity.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="h-full">
              <CardContent className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl leading-tight">{feature.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
