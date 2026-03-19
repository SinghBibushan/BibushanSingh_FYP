import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { adminNavItems } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { getSalesReport } from "@/server/admin/service";

export default async function AdminReportsPage() {
  await requireAdmin();
  const report = await getSalesReport();

  return (
    <AppShell
      badge="Admin reports"
      title="Sales summary"
      description="Operational reporting presented in a more polished, decision-oriented layout."
      navItems={adminNavItems}
      currentPath="/admin/reports"
    >
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Total revenue
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">
                {formatCurrency(report.totalRevenue)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Confirmed bookings
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">
                {report.confirmedBookings}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Average order value
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">
                {formatCurrency(report.averageOrderValue)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/78">
          <CardContent className="space-y-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
              Reporting notes
            </p>
            <h2 className="text-3xl leading-none">How to read this view</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[22px] border border-border bg-white/82 p-4 text-sm leading-7 text-muted-foreground">
                Revenue reflects confirmed booking totals.
              </div>
              <div className="rounded-[22px] border border-border bg-white/82 p-4 text-sm leading-7 text-muted-foreground">
                Confirmed bookings indicate real conversion, not just initiated attempts.
              </div>
              <div className="rounded-[22px] border border-border bg-white/82 p-4 text-sm leading-7 text-muted-foreground">
                Average order value helps compare pricing and promotion performance.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
