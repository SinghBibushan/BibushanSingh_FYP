import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getLoyaltySnapshot } from "@/server/tickets/service";

const userNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/profile", label: "Profile" },
  { href: "/tickets", label: "Tickets" },
  { href: "/loyalty", label: "Loyalty" },
  { href: "/wishlist", label: "Wishlist" },
];

export default async function LoyaltyPage() {
  await requireUser();
  const loyalty = await getLoyaltySnapshot();

  return (
    <AppShell
      badge="Loyalty"
      title="Rewards dashboard"
      description="A cleaner view of points, spend, and recent reward activity from confirmed bookings."
      navItems={userNavItems}
      currentPath="/loyalty"
    >
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Current tier
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">{loyalty.tier}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Available points
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">{loyalty.points}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/78">
            <CardContent className="space-y-3">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
                Total confirmed spend
              </p>
              <p className="text-4xl font-semibold leading-none text-foreground">
                {formatCurrency(loyalty.totalSpent)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/78">
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl leading-none">Recent reward activity</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Reward changes tied directly to confirmed bookings.
                </p>
              </div>
              <Badge>{loyalty.totalConfirmedBookings} confirmed bookings</Badge>
            </div>
            {loyalty.recentRewards.length === 0 ? (
              <div className="rounded-[22px] border border-border bg-white/82 p-5 text-sm text-muted-foreground">
                No confirmed bookings yet. Complete a booking payment to begin earning points.
              </div>
            ) : (
              <div className="space-y-3">
                {loyalty.recentRewards.map((reward) => (
                  <div
                    key={reward.bookingCode}
                    className="flex flex-col gap-3 rounded-[22px] border border-border bg-white/82 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{reward.bookingCode}</p>
                      <p className="text-sm text-muted-foreground">
                        {reward.confirmedAt ? formatDate(reward.confirmedAt) : "Pending"}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="font-semibold text-emerald-700">
                        +{reward.pointsEarned} earned
                      </span>
                      <span className="font-semibold text-amber-700">
                        -{reward.pointsRedeemed} redeemed
                      </span>
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
