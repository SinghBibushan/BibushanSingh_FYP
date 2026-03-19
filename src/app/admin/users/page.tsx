import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { adminNavItems } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { listAdminUsers } from "@/server/admin/service";
import { UserManagementTable } from "./user-management-table";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await listAdminUsers();
  const adminCount = users.filter((user) => user.role === "ADMIN").length;

  return (
    <AppShell
      badge="Admin users"
      title="User management"
      description="Promote, review, and remove accounts from a more structured administration surface."
      navItems={adminNavItems}
      currentPath="/admin/users"
    >
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Registered users
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">{users.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Admin accounts
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">{adminCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/78">
          <CardContent className="space-y-4">
            <h2 className="text-3xl leading-none">Users</h2>
            {users.length === 0 ? (
              <div className="rounded-[22px] border border-border bg-white/82 p-5 text-sm text-muted-foreground">
                No users available yet.
              </div>
            ) : (
              <UserManagementTable initialUsers={users} />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
