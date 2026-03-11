import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { adminNavItems } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { getAdminOverview } from "@/server/admin/service";
import { Calendar, Users, Ticket, DollarSign } from "lucide-react";

const iconMap: Record<string, any> = {
  "Total events": Calendar,
  "Total users": Users,
  "Total bookings": Ticket,
  "Revenue": DollarSign,
};

const gradientMap: Record<string, string> = {
  "Total events": "from-blue-500/10 to-cyan-500/10",
  "Total users": "from-purple-500/10 to-pink-500/10",
  "Total bookings": "from-green-500/10 to-emerald-500/10",
  "Revenue": "from-amber-500/10 to-orange-500/10",
};

export default async function AdminPage() {
  const session = await requireAdmin();
  const overview = await getAdminOverview();

  return (
    <AppShell
      badge="Admin dashboard"
      title="Operations control center"
      description={`Signed in as ${session.name}. Metrics and management modules are now wired into the real admin layer.`}
      navItems={adminNavItems}
      currentPath="/admin"
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {overview.metrics.map((metric, index) => {
          const Icon = iconMap[metric.label] || Calendar;
          const gradient = gradientMap[metric.label] || "from-primary/10 to-accent/10";

          return (
            <Card
              key={metric.label}
              className="hover-lift opacity-0 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className={`space-y-3 p-6 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 opacity-10">
                  <Icon className="h-24 w-24 text-primary" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                      {metric.label}
                    </p>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-3xl leading-none font-bold gradient-text mt-3">{metric.value}</p>
                  <p className="text-sm leading-7 text-muted-foreground mt-3">{metric.note}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
