import { Calendar, DollarSign, Percent, Ticket, Users } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { adminNavItems } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { getAdminOverview } from "@/server/admin/service";

type MetricCardStyle = {
  icon: typeof Calendar;
  tone: string;
  surface: string;
};

const metricStyleMap: Record<string, MetricCardStyle> = {
  "Published Events": {
    icon: Calendar,
    tone: "text-accent",
    surface: "bg-[linear-gradient(145deg,#eef5f3_0%,#e7efec_100%)]",
  },
  "Promo Codes": {
    icon: Percent,
    tone: "text-secondary",
    surface: "bg-[linear-gradient(145deg,#faf3ea_0%,#f4eadf_100%)]",
  },
  Bookings: {
    icon: Ticket,
    tone: "text-primary",
    surface: "bg-[linear-gradient(145deg,#f5f4f0_0%,#ece9e2_100%)]",
  },
  "Gross Sales": {
    icon: DollarSign,
    tone: "text-secondary",
    surface: "bg-[linear-gradient(145deg,#faf3ea_0%,#f1e3d1_100%)]",
  },
};

export default async function AdminPage() {
  const session = await requireAdmin();
  const overview = await getAdminOverview();

  return (
    <AppShell
      badge="Admin Control Center"
      title="Operations dashboard"
      description={`Signed in as ${session.name}. Review platform health, revenue, users, and event inventory from a cleaner admin surface.`}
      navItems={adminNavItems}
    >
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {overview.metrics.map((metric) => {
            const style = metricStyleMap[metric.label] ?? {
              icon: Users,
              tone: "text-primary",
              surface: "bg-[linear-gradient(145deg,#f5f4f0_0%,#ece9e2_100%)]",
            };
            const tone =
              metric.label === "Promo Codes"
                ? "amber"
                : metric.label === "Published Events"
                  ? "emerald"
                  : metric.label === "Gross Sales"
                    ? "indigo"
                    : "slate";

            return (
              <StatCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                note={metric.note}
                icon={style.icon}
                tone={tone}
              />
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="bg-white/90">
            <CardContent className="space-y-4">
              <SectionHeader
                badge="Control Focus"
                title="Where the admin workflow is strongest"
                description="The platform highlights the operational areas that matter most during demo and review."
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-border bg-white/82 p-4">
                  <p className="font-semibold text-foreground">Event management</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Create, review, and remove public listings from a more structured workspace.
                  </p>
                </div>
                <div className="rounded-[22px] border border-border bg-white/82 p-4">
                  <p className="font-semibold text-foreground">Booking oversight</p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    Review user activity, sales totals, and booking states from one dashboard.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90">
            <CardContent className="space-y-4">
              <SectionHeader
                badge="Operational Summary"
                title="Admin posture"
                description="A cleaner overview of system health before moving into detailed admin screens."
              />
              <div className="space-y-3">
                <div className="rounded-[22px] border border-border bg-white/82 p-4 text-sm leading-7 text-muted-foreground">
                  Published event inventory, promo coverage, booking volume, and gross sales
                  are now presented with cleaner hierarchy instead of demo-heavy styling.
                </div>
                <div className="rounded-[22px] border border-border bg-white/82 p-4 text-sm leading-7 text-muted-foreground">
                  The rest of the admin screens share the same shell, spacing, and card language
                  so the workspace feels cohesive rather than assembled piecemeal.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
