import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { Award, CheckCircle, TrendingUp, Sparkles } from "lucide-react";

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
      note: "Upgrade your tier by booking more events",
      icon: Award,
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
      borderColor: "border-amber-500/30",
    },
    {
      title: "Points balance",
      value: String(user?.loyaltyPoints ?? 0),
      note: "Redeem points on your next booking",
      icon: TrendingUp,
      gradient: "from-primary/20 to-secondary/20",
      iconColor: "text-primary",
      borderColor: "border-primary/30",
    },
    {
      title: "Account status",
      value: user?.emailVerifiedAt ? "Verified" : "Pending",
      note: "Your account is secure and ready",
      icon: CheckCircle,
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-400",
      borderColor: "border-green-500/30",
    },
  ];

  return (
    <AppShell
      badge="User Dashboard"
      title={`Welcome back, ${user?.name?.split(" ")[0] ?? "Guest"} ✨`}
      description="Manage your bookings, track loyalty rewards, and discover new events tailored just for you."
      navItems={userNavItems}
      currentPath="/dashboard"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className={`hover-lift opacity-0 animate-scale-in border-2 ${card.borderColor}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className={`space-y-4 p-6 bg-gradient-to-br ${card.gradient} relative overflow-hidden`}>
                <div className="absolute -right-4 -top-4 opacity-5">
                  <Icon className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs uppercase tracking-[0.24em] font-semibold text-muted-foreground">
                      {card.title}
                    </p>
                    <div className={`p-2.5 rounded-xl bg-background/60 border-2 ${card.borderColor} shadow-sm`}>
                      <Icon className={`h-5 w-5 ${card.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-4xl leading-none font-bold gradient-text mb-3">{card.value}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{card.note}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
