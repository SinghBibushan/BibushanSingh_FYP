import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { demoMetrics } from "@/lib/demo-data";

const adminNavItems = [
  { href: "/admin", label: "Overview" },
  { href: "/events", label: "Public events" },
];

const adminModules = [
  "Events and ticket pricing",
  "Promo code management",
  "Student verification review",
  "Users and booking records",
];

export default async function AdminPage() {
  const session = await requireAdmin();

  return (
    <AppShell
      badge="Admin dashboard"
      title={`Operations control center`}
      description={`Signed in as ${session.name}. This route is now protected by role checks and will host admin CRUD, reports, and moderation flows in the next phases.`}
      navItems={adminNavItems}
      currentPath="/admin"
    >
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-4">
          {demoMetrics.map((metric) => (
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

        <Card>
          <CardContent className="p-6">
            <h2 className="text-3xl leading-none">Planned modules</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {adminModules.map((module) => (
                <div key={module} className="rounded-2xl bg-muted p-4 text-sm font-medium">
                  {module}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
