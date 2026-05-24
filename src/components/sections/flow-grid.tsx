import { BellRing, CalendarCheck2, ClipboardCheck, Sparkles, UserRoundCog } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const flows = [
  {
    title: "Discovery to checkout",
    description:
      "Users move from public event discovery into server-validated booking and payment without leaving the platform.",
    icon: Sparkles,
  },
  {
    title: "Post-booking management",
    description:
      "Booking history, status tracking, cancellation, refund state, and loyalty reversal extend the lifecycle after purchase.",
    icon: CalendarCheck2,
  },
  {
    title: "Notification and reminder loop",
    description:
      "The app generates confirmations, reminders, and operational updates through in-app records and email-safe logs.",
    icon: BellRing,
  },
  {
    title: "Organizer approval workflow",
    description:
      "Organizers create and submit events while admins review them before publication, making the platform multi-role.",
    icon: UserRoundCog,
  },
  {
    title: "Venue check-in control",
    description:
      "Staff validate QR tickets, stop duplicate entry, and keep an auditable record of venue access attempts.",
    icon: ClipboardCheck,
  },
];

export function FlowGrid() {
  return (
    <section className="py-20">
      <div className="container-shell space-y-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-secondary">
              Expanded flows
            </p>
            <h2 className="text-4xl leading-tight md:text-5xl">
              The platform now covers the full event lifecycle.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-muted-foreground lg:justify-self-end">
            Instead of stopping at ticket purchase, EventEase now shows stronger before-booking,
            after-booking, admin, organizer, and venue-side workflows.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          {flows.map((flow) => (
            <Card key={flow.title} className="h-full bg-white/72 hover-lift">
              <CardContent className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-white">
                  <flow.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-[1.55rem] leading-tight">{flow.title}</h3>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {flow.description}
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
