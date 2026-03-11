import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { Award, CheckCircle, TrendingUp } from "lucide-react";

const userNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/profile", label: "Profile" },
  { href: "/tickets", label: "Tickets" },
  { href: "/loyalty", label: "Loyalty" },
];

export default async function DashboardPage() {
  await requireUser();
  const user = await getCurrentUser();

  const cards = [
    {
      title: "Loyalty tier",
      value: user?.loyaltyTier ?? "Bronze",
      note: "Tier upgrades will come from confirmed booking totals.",
      icon: Award,
      gradient: "from-amber-500/10 to-orange-500/10",
    },
    {
      title: "Points balance",
      value: String(user?.loyaltyPoints ?? 0),
      note: "Redeemable during checkout with a capped percentage rule.",
      icon: TrendingUp,
      gradient: "from-primary/10 to-accent/10",
    },
    {
      title: "Account status",
      value: user?.emailVerifiedAt ? "Verified" : "Pending",
      note: "Email verification status is now tracked through the auth flow.",
      icon: CheckCircle,
      gradient: "from-secondary/10 to-primary/10",
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
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="hover-lift opacity-0 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className={`space-y-4 p-6 bg-gradient-to-br ${card.gradient} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 opacity-10">
                  <Icon className="h-32 w-32 text-primary" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">
                      {card.title}
                    </p>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-4xl leading-none font-bold gradient-text mt-3">{card.value}</p>
                  <p className="text-sm leading-7 text-muted-foreground mt-3">{card.note}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
