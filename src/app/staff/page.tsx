import { Activity, ScanLine, ShieldAlert, TicketCheck } from "lucide-react";

import { CheckInConsole } from "@/components/staff/check-in-console";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { requireStaffAccess } from "@/lib/auth";
import { staffNavItems } from "@/lib/staff-nav";
import { formatDate } from "@/lib/utils";
import { getStaffCheckInDashboard } from "@/server/staff/service";

const metricIconMap: Record<string, typeof Activity> = {
  "Active tickets": Activity,
  "Checked in": TicketCheck,
  "Today success": ScanLine,
  "Today denied": ShieldAlert,
};

export default async function StaffPage() {
  const session = await requireStaffAccess();
  const dashboard = await getStaffCheckInDashboard();

  return (
    <AppShell
      badge="Venue check-in"
      title="Staff check-in console"
      description={`Signed in as ${session.name}. Validate QR payloads or ticket codes, stop duplicate entry, and monitor venue-entry activity in real time.`}
      navItems={staffNavItems}
    >
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {dashboard.metrics.map((metric) => {
            const Icon = metricIconMap[metric.label] ?? Activity;
            const tone =
              metric.label === "Today denied"
                ? "amber"
                : metric.label === "Checked in" || metric.label === "Today success"
                  ? "emerald"
                  : "indigo";

            return (
              <StatCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                note={metric.note}
                icon={Icon}
                tone={tone}
              />
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="bg-white/90">
            <CardContent className="space-y-5">
              <SectionHeader
                badge="Entry Workflow"
                title="Scan or paste ticket data"
                description="Staff can scan the QR payload or enter the visible ticket code manually."
              />
              <p className="text-sm leading-7 text-muted-foreground">
                Paste the QR payload produced by the ticket vault or enter the visible ticket code
                manually. Successful scans mark the ticket as used, while duplicate or invalid
                attempts are denied and logged.
              </p>
              <CheckInConsole />
            </CardContent>
          </Card>

          <Card className="bg-white/90">
            <CardContent className="space-y-4">
              <SectionHeader
                badge="Recent Venue Activity"
                title="Latest scans"
                description="Recent ticket scans are listed here for quick venue-side review."
              />
              <div className="space-y-3">
                {dashboard.recentLogs.length === 0 ? (
                  <div className="rounded-[22px] border border-border bg-white/82 p-4 text-sm text-muted-foreground">
                    No check-in activity recorded yet.
                  </div>
                ) : (
                  dashboard.recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-[22px] border border-border bg-white/82 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge
                          className={
                            log.outcome === "SUCCESS"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-red-200 bg-red-50 text-red-700"
                          }
                        >
                          {log.outcome}
                        </Badge>
                        <p className="font-mono text-xs text-muted-foreground">{log.scannedCode}</p>
                      </div>
                      <p className="mt-3 font-semibold text-foreground">{log.eventTitle}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {log.attendeeName} checked by {log.staffName}
                        {log.gate ? ` at ${log.gate}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(log.checkedInAt)}
                      </p>
                      {log.reason ? (
                        <p className="mt-3 rounded-2xl bg-muted px-3 py-2 text-xs leading-6 text-muted-foreground">
                          {log.reason}
                        </p>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
