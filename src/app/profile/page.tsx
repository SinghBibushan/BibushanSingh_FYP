import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser, requireUser } from "@/lib/auth";

const userNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/profile", label: "Profile" },
  { href: "/tickets", label: "Tickets" },
  { href: "/loyalty", label: "Loyalty" },
  { href: "/wishlist", label: "Wishlist" },
];

export default async function ProfilePage() {
  await requireUser();
  const user = await getCurrentUser();

  return (
    <AppShell
      badge="Profile"
      title="Account profile"
      description="Identity, verification, and loyalty state presented in a cleaner account-management layout."
      navItems={userNavItems}
      currentPath="/profile"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_0.7fr]">
        <Card className="bg-white/78">
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
                Account details
              </p>
              <h2 className="text-3xl leading-none">{user?.name}</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                This profile reflects authenticated account data and readiness for booking,
                ticket access, and loyalty accumulation.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-border bg-white/82 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Email
                </p>
                <p className="mt-2 font-semibold text-foreground">{user?.email}</p>
              </div>
              <div className="rounded-[24px] border border-border bg-white/82 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Phone
                </p>
                <p className="mt-2 font-semibold text-foreground">
                  {user?.phone || "Not added yet"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/78">
          <CardContent className="space-y-4">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
              Trust and rewards
            </p>
            <div className="flex items-center justify-between rounded-[22px] border border-border bg-white/82 p-4">
              <span className="text-sm font-semibold">Email verification</span>
              <Badge
                className={user?.emailVerifiedAt ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}
              >
                {user?.emailVerifiedAt ? "Verified" : "Pending"}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-border bg-white/82 p-4">
              <span className="text-sm font-semibold">Student verification</span>
              <Badge>{user?.studentVerificationStatus ?? "PENDING"}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-[22px] border border-border bg-white/82 p-4">
              <span className="text-sm font-semibold">Loyalty tier</span>
              <Badge>{user?.loyaltyTier ?? "BRONZE"}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
