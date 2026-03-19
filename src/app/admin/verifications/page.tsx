import { ReviewVerificationForm } from "@/components/admin/review-verification-form";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { adminNavItems } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { listStudentVerifications } from "@/server/admin/service";

export default async function AdminVerificationsPage() {
  await requireAdmin();
  const verifications = await listStudentVerifications();
  const pendingCount = verifications.filter((item) => item.status === "PENDING").length;

  return (
    <AppShell
      badge="Admin verifications"
      title="Student verification review"
      description="Approve or reject student discount eligibility from a clearer review queue."
      navItems={adminNavItems}
      currentPath="/admin/verifications"
    >
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Total requests
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">
                {verifications.length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Pending review
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">
                {pendingCount}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/78">
          <CardContent className="space-y-4">
            <h2 className="text-3xl leading-none">Verification queue</h2>
            {verifications.length === 0 ? (
              <div className="rounded-[22px] border border-border bg-white/82 p-5 text-sm text-muted-foreground">
                No verification requests available yet.
              </div>
            ) : (
              <div className="space-y-4">
                {verifications.map((verification) => (
                  <div
                    key={verification.id}
                    className="rounded-[24px] border border-border bg-white/82 p-4"
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="font-semibold text-foreground">{verification.userName}</p>
                          <Badge>{verification.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{verification.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted {formatDate(verification.createdAt)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          File: {verification.documentPath}
                        </p>
                        {verification.notes ? (
                          <p className="text-sm text-muted-foreground">
                            Notes: {verification.notes}
                          </p>
                        ) : null}
                      </div>
                      <ReviewVerificationForm
                        id={verification.id}
                        currentStatus={verification.status}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
