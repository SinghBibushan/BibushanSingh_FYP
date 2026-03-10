import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { adminNavItems } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { listAdminUsers } from "@/server/admin/service";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await listAdminUsers();

  return (
    <AppShell
      badge="Admin users"
      title="User management"
      description="Basic user administration with roles, loyalty state, and verification visibility."
      navItems={adminNavItems}
      currentPath="/admin/users"
    >
      <Card>
        <CardContent className="space-y-4 p-6">
          <h2 className="text-3xl leading-none">Users</h2>
          {users.length === 0 ? (
            <div className="rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
              No users available yet.
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="grid gap-3 rounded-2xl bg-muted p-4 md:grid-cols-[1fr_0.6fr_0.7fr_0.7fr_0.8fr]"
                >
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div>
                    <Badge>{user.role}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.loyaltyTier} / {user.loyaltyPoints} pts
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.studentVerificationStatus}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
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
