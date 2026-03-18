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
  "Total events": "from-blue-500/20 to-cyan-500/20",
  "Total users": "from-purple-500/20 to-pink-500/20",
  "Total bookings": "from-green-500/20 to-emerald-500/20",
  "Revenue": "from-amber-500/20 to-orange-500/20",
};

const borderMap: Record<string, string> = {
  "Total events": "border-blue-500/30",
  "Total users": "border-purple-500/30",
  "Total bookings": "border-green-500/30",
  "Revenue": "border-amber-500/30",
};

const iconColorMap: Record<string, string> = {
  "Total events": "text-blue-400",
  "Total users": "text-purple-400",
  "Total bookings": "text-green-400",
  "Revenue": "text-amber-400",
};

export default async function AdminPage() {
  const session = await requireAdmin();
  const overview = await getAdminOverview();

  return (
    <AppShell
      badge="Admin Control Center"
      title="Operations Dashboard 🚀"
      description={`Signed in as ${session.name}. Monitor metrics, manage events, and control your platform.`}
      navItems={adminNavItems}
      currentPath="/admin"
    >
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {overview.metrics.map((metric, index) => {
          const Icon = iconMap[metric.label] || Calendar;
          const gradient = gradientMap[metric.label] || "from-primary/20 to-accent/20";
          const border = borderMap[metric.label] || "border-primary/30";
          const iconColor = iconColorMap[metric.label] || "text-primary";

          return (
            <Card
              key={metric.label}
              className={`hover-lift opacity-0 animate-scale-in border-2 ${border}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className={`space-y-3 p-6 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                <div className="absolute -right-3 -top-3 opacity-5">
                  <Icon className="h-24 w-24" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-[0.24em] font-semibold text-muted-foreground">
                      {metric.label}
                    </p>
                    <div className={`p-2.5 rounded-xl bg-background/60 border-2 ${border} shadow-sm`}>
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                  </div>
                  <p className="text-3xl leading-none font-bold gradient-text mb-3">{metric.value}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{metric.note}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
