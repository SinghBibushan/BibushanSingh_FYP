import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { DISCOUNT_RULES, LOYALTY_TIER_THRESHOLDS } from "@/lib/constants";
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
        <Card className="bg-white/78">
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <p className="text-[0.72rem] uppercase tracking-[0.22em] text-secondary">
                Reward math
              </p>
              <h2 className="text-3xl leading-none">How points and tiers are calculated</h2>
              <p className="text-sm leading-7 text-muted-foreground">
                Rewards are calculated automatically after a booking payment succeeds, so
                the same rules apply to every user and every order.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div className="rounded-[24px] border border-border bg-white/82 p-5">
                <p className="text-sm font-semibold text-foreground">Earning points</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Earn <span className="font-semibold text-foreground">1 point for every NPR 10</span>
                  {" "}in the final paid amount after discounts.
                </p>
                <p className="mt-3 rounded-2xl bg-muted px-4 py-3 text-sm font-semibold text-foreground">
                  Points earned = floor(final paid amount x {DISCOUNT_RULES.pointsPerCurrencyUnit})
                </p>
              </div>

              <div className="rounded-[24px] border border-border bg-white/82 p-5">
                <p className="text-sm font-semibold text-foreground">Redeeming points</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  <span className="font-semibold text-foreground">1 point = NPR {DISCOUNT_RULES.loyaltyRedemptionValuePerPoint}</span>
                  {" "}off your next booking, but redemption is capped at{" "}
                  <span className="font-semibold text-foreground">
                    {DISCOUNT_RULES.maxLoyaltyRedemptionPercentage}% of the subtotal
                  </span>.
                </p>
                <p className="mt-3 rounded-2xl bg-muted px-4 py-3 text-sm font-semibold text-foreground">
                  New balance = old points - redeemed + newly earned
                </p>
              </div>

              <div className="rounded-[24px] border border-border bg-white/82 p-5">
                <p className="text-sm font-semibold text-foreground">Tier thresholds</p>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
                    <span>Bronze</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(LOYALTY_TIER_THRESHOLDS.BRONZE).replace(".00", "")}+
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
                    <span>Silver</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(LOYALTY_TIER_THRESHOLDS.SILVER).replace(".00", "")}+
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
                    <span>Gold</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(LOYALTY_TIER_THRESHOLDS.GOLD).replace(".00", "")}+
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-border bg-[linear-gradient(145deg,#eef5f3_0%,#e7efec_100%)] p-5 text-sm leading-7 text-muted-foreground">
              If a confirmed booking is cancelled, the app reverses that booking&apos;s reward
              effect by returning redeemed points and removing the points earned from that
              payment.
            </div>
          </CardContent>
        </Card>

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
