import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { adminNavItems } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { getAdminOverview } from "@/server/admin/service";

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
      <div className="grid gap-5 md:grid-cols-4">
        {overview.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="space-y-3 p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                {metric.label}
              </p>
              <p className="text-3xl leading-none">{metric.value}</p>
              <p className="text-sm leading-7 text-muted-foreground">{metric.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
