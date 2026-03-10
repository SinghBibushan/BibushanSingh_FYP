import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser, requireUser } from "@/lib/auth";

const userNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/profile", label: "Profile" },
  { href: "/tickets", label: "Tickets" },
  { href: "/loyalty", label: "Loyalty" },
];

export default async function ProfilePage() {
  await requireUser();
  const user = await getCurrentUser();

  return (
    <AppShell
      badge="Profile"
      title="Account profile"
      description="This profile area reflects authenticated MongoDB user data and now connects directly to verification and loyalty state."
      navItems={userNavItems}
      currentPath="/profile"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
                Account details
              </p>
              <h2 className="text-3xl leading-none">{user?.name}</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Email
                </p>
                <p className="mt-2 font-semibold">{user?.email}</p>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Phone
                </p>
                <p className="mt-2 font-semibold">{user?.phone || "Not added yet"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">
              Verification and rewards
            </p>
            <div className="flex items-center justify-between rounded-2xl bg-muted p-4">
              <span className="text-sm font-semibold">Email verification</span>
              <Badge className={user?.emailVerifiedAt ? "bg-emerald-100 text-emerald-700" : ""}>
                {user?.emailVerifiedAt ? "Verified" : "Pending"}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-muted p-4">
              <span className="text-sm font-semibold">Student verification</span>
              <Badge>{user?.studentVerificationStatus ?? "PENDING"}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-muted p-4">
              <span className="text-sm font-semibold">Loyalty tier</span>
              <Badge>{user?.loyaltyTier ?? "BRONZE"}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
