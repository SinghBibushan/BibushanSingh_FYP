import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser, requireUser } from "@/lib/auth";

const userNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/profile", label: "Profile" },
  { href: "/tickets", label: "Tickets" },
];

export default async function DashboardPage() {
  await requireUser();
  const user = await getCurrentUser();

  const cards = [
    {
      title: "Loyalty tier",
      value: user?.loyaltyTier ?? "Bronze",
      note: "Tier upgrades will come from confirmed booking totals.",
    },
    {
      title: "Points balance",
      value: String(user?.loyaltyPoints ?? 0),
      note: "Redeemable during checkout with a capped percentage rule.",
    },
    {
      title: "Account status",
      value: user?.emailVerifiedAt ? "Verified" : "Pending",
      note: "Email verification status is now tracked through the auth flow.",
    },
  ];

  return (
    <AppShell
      badge="User workspace"
      title={`Welcome back, ${user?.name?.split(" ")[0] ?? "Guest"}`}
      description="This dashboard is now protected by real session auth and acts as the entry point for bookings, tickets, loyalty, and profile management."
      navItems={userNavItems}
      currentPath="/dashboard"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardContent className="space-y-4 p-6">
              <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                {card.title}
              </p>
              <p className="text-4xl leading-none">{card.value}</p>
              <p className="text-sm leading-7 text-muted-foreground">{card.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
