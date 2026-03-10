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
      description="Quick operational reporting for viva demonstration and admin oversight."
      navItems={adminNavItems}
      currentPath="/admin/reports"
    >
      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
              Total revenue
            </p>
            <p className="text-4xl leading-none">{formatCurrency(report.totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
              Confirmed bookings
            </p>
            <p className="text-4xl leading-none">{report.confirmedBookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-3 p-6">
            <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
              Average order value
            </p>
            <p className="text-4xl leading-none">
              {formatCurrency(report.averageOrderValue)}
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
