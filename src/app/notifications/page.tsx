import { NotificationsCenter } from "@/components/notifications/notifications-center";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { userNavItems } from "@/lib/user-nav";

export default async function NotificationsPage() {
  await requireUser();

  return (
    <AppShell
      badge="Notifications"
      title="Notification inbox"
      description="Review booking confirmations, reminders, verification updates, and venue-entry messages from one place."
      navItems={userNavItems}
    >
      <NotificationsCenter />
    </AppShell>
  );
}
