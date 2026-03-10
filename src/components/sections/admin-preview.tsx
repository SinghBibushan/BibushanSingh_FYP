import { demoMetrics } from "@/lib/demo-data";

import { Card, CardContent } from "@/components/ui/card";

export function AdminPreviewSection() {
  return (
    <section className="pb-20">
      <div className="container-shell">
        <Card className="overflow-hidden bg-secondary text-secondary-foreground">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[0.9fr_1.1fr] lg:p-10">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/60">
                Admin cockpit
              </p>
              <h2 className="text-4xl leading-tight md:text-5xl">
                Clean dashboards for events, bookings, discounts, and verifications.
              </h2>
              <p className="max-w-xl text-sm leading-7 text-white/72">
                The admin side will expose CRUD flows, summary cards, sales tables,
                student review queues, and demo-friendly metrics seeded for viva.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {demoMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[24px] border border-white/10 bg-white/8 p-5"
                >
                  <p className="text-sm uppercase tracking-[0.18em] text-white/60">
                    {metric.label}
                  </p>
                  <p className="mt-4 text-3xl">{metric.value}</p>
                  <p className="mt-2 text-sm text-white/65">{metric.note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
