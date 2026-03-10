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
];

export default async function LoyaltyPage() {
  await requireUser();
  const loyalty = await getLoyaltySnapshot();

  return (
    <AppShell
      badge="Loyalty"
      title="Rewards dashboard"
      description="Bronze, Silver, and Gold loyalty progress is now connected to confirmed bookings and points earned through the mock payment flow."
      navItems={userNavItems}
      currentPath="/loyalty"
    >
      <div className="space-y-5">
        <div className="grid gap-5 md:grid-cols-3">
          <Card>
            <CardContent className="space-y-3 p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Current tier
              </p>
              <p className="text-4xl leading-none">{loyalty.tier}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Available points
              </p>
              <p className="text-4xl leading-none">{loyalty.points}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3 p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                Total confirmed spend
              </p>
              <p className="text-4xl leading-none">{formatCurrency(loyalty.totalSpent)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl leading-none">Recent reward activity</h2>
              <Badge>{loyalty.totalConfirmedBookings} confirmed bookings</Badge>
            </div>
            {loyalty.recentRewards.length === 0 ? (
              <div className="rounded-2xl bg-muted p-5 text-sm text-muted-foreground">
                No confirmed bookings yet. Complete a booking payment to start earning points.
              </div>
            ) : (
              <div className="space-y-3">
                {loyalty.recentRewards.map((reward) => (
                  <div
                    key={reward.bookingCode}
                    className="flex flex-col gap-2 rounded-2xl bg-muted p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{reward.bookingCode}</p>
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
