import { Calendar, Clock3, DollarSign, Ticket } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { requireOrganizer } from "@/lib/auth";
import { organizerNavItems } from "@/lib/organizer-nav";
import { getOrganizerOverview } from "@/server/organizer/service";

const metricStyleMap: Record<
  string,
  { icon: typeof Calendar; tone: string; surface: string }
> = {
  "My Events": {
    icon: Calendar,
    tone: "text-primary",
    surface: "bg-[linear-gradient(145deg,#f5f4f0_0%,#ece9e2_100%)]",
  },
  "Pending Review": {
    icon: Clock3,
    tone: "text-secondary",
    surface: "bg-[linear-gradient(145deg,#faf3ea_0%,#f4eadf_100%)]",
  },
  Published: {
    icon: Ticket,
    tone: "text-accent",
    surface: "bg-[linear-gradient(145deg,#eef5f3_0%,#e7efec_100%)]",
  },
  "Confirmed Sales": {
    icon: DollarSign,
    tone: "text-secondary",
    surface: "bg-[linear-gradient(145deg,#faf3ea_0%,#f1e3d1_100%)]",
  },
};

export default async function OrganizerPage() {
  const session = await requireOrganizer();
  const overview = await getOrganizerOverview();

  return (
    <AppShell
      badge="Organizer Studio"
      title="Organizer dashboard"
      description={`Signed in as ${session.name}. Create events, submit them for admin approval, and track how your published listings are performing.`}
      navItems={organizerNavItems}
      currentPath="/organizer"
    >
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {overview.metrics.map((metric) => {
            const style = metricStyleMap[metric.label] ?? metricStyleMap["My Events"];
            const Icon = style.icon;

            return (
              <Card key={metric.label} className="hover-lift overflow-hidden bg-white/78">
                <CardContent className={`space-y-4 ${style.surface}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {metric.label}
                      </p>
                      <p className="mt-3 text-3xl font-semibold leading-none text-foreground">
                        {metric.value}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white/82">
                      <Icon className={`h-5 w-5 ${style.tone}`} />
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{metric.note}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="bg-white/78">
            <CardContent className="space-y-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
                Workflow
              </p>
              <h2 className="text-3xl leading-none">How organizer approval works</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  "Create a draft with event details and ticket setup.",
                  "Submit the draft when ready so it enters admin review.",
                  "Once approved, the event becomes public and starts accumulating sales.",
                ].map((step) => (
                  <div
                    key={step}
                    className="rounded-[22px] border border-border bg-white/82 p-4 text-sm leading-7 text-muted-foreground"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/78">
            <CardContent className="space-y-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
                Why this matters
              </p>
              <h2 className="text-3xl leading-none">A fuller platform workflow</h2>
              <div className="space-y-3">
                <div className="rounded-[22px] border border-border bg-white/82 p-4 text-sm leading-7 text-muted-foreground">
                  Admin no longer owns the full event lifecycle alone. Organizers now have
                  their own operational flow, which makes the platform multi-role and more
                  realistic for event businesses.
                </div>
                <div className="rounded-[22px] border border-border bg-white/82 p-4 text-sm leading-7 text-muted-foreground">
                  Published events can still use the existing booking, payment, ticket, and
                  notification systems without changing the customer-facing flow.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
