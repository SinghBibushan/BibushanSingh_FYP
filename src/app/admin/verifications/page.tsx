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

  return (
    <AppShell
      badge="Admin verifications"
      title="Student verification review"
      description="Approve or reject student discount eligibility from the admin panel."
      navItems={adminNavItems}
      currentPath="/admin/verifications"
    >
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-3xl leading-none">Verification queue</h2>
          {verifications.length === 0 ? (
            <div className="rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
              No verification requests available yet.
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((verification) => (
                <div key={verification.id} className="rounded-2xl bg-muted p-4">
                  <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold">{verification.userName}</p>
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
    </AppShell>
  );
}
