import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { adminNavItems } from "@/lib/admin-nav";
import { requireAdmin } from "@/lib/auth";
import { listAdminUsers } from "@/server/admin/service";
import { UserManagementTable } from "./user-management-table";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await listAdminUsers();

  return (
    <AppShell
      badge="Admin users"
      title="User management"
      description="Manage user accounts, roles, and permissions. Promote users to admin or remove accounts."
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
            <UserManagementTable initialUsers={users} />
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
