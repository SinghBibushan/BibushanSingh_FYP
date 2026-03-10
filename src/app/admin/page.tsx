import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { demoMetrics } from "@/lib/demo-data";

const adminModules = [
  "Events and ticket pricing",
  "Promo code management",
  "Student verification review",
  "Users and booking records",
];

export default function AdminPage() {
  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell space-y-8 py-14">
        <div className="space-y-3">
          <Badge>Admin dashboard</Badge>
          <h1 className="text-5xl leading-none">Operations control center</h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            This admin surface is now scaffolded and ready for role-protected CRUD,
            metrics, reports, and moderation flows in the next implementation phases.
          </p>
        </div>

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
      </main>
    </div>
  );
}
