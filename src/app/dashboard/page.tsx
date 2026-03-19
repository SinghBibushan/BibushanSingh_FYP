import Link from "next/link";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Heart,
  Ticket,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser, requireUser } from "@/lib/auth";

const userNavItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/profile", label: "Profile" },
  { href: "/tickets", label: "Tickets" },
  { href: "/loyalty", label: "Loyalty" },
  { href: "/wishlist", label: "Wishlist" },
];

export default async function DashboardPage() {
  await requireUser();
  const user = await getCurrentUser();

  const cards = [
    {
      title: "Loyalty tier",
      value: user?.loyaltyTier ?? "Bronze",
      note: "Your status grows with consistent confirmed bookings.",
      icon: Award,
      tone: "text-secondary",
      surface: "bg-[linear-gradient(145deg,#faf3ea_0%,#f4eadf_100%)]",
    },
    {
      title: "Points balance",
      value: String(user?.loyaltyPoints ?? 0),
      note: "Redeem points on upcoming bookings when available.",
      icon: TrendingUp,
      tone: "text-accent",
      surface: "bg-[linear-gradient(145deg,#eef5f3_0%,#e7efec_100%)]",
    },
    {
      title: "Account status",
      value: user?.emailVerifiedAt ? "Verified" : "Pending",
      note: "Email verification keeps booking and account recovery flows safer.",
      icon: CheckCircle2,
      tone: "text-primary",
      surface: "bg-[linear-gradient(145deg,#f5f4f0_0%,#ece9e2_100%)]",
    },
  ];

  return (
    <AppShell
      badge="User Dashboard"
      title={`Welcome back, ${user?.name?.split(" ")[0] ?? "Guest"}`}
      description="A clearer operational view of your account, rewards, saved events, and ticket activity."
      navItems={userNavItems}
      currentPath="/dashboard"
    >
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <Card key={card.title} className="hover-lift overflow-hidden bg-white/78">
                <CardContent className={`space-y-4 ${card.surface}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {card.title}
                      </p>
                      <p className="mt-3 text-3xl font-semibold leading-none text-foreground">
                        {card.value}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-white/82">
                      <Icon className={`h-5 w-5 ${card.tone}`} />
                    </div>
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">{card.note}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="bg-white/78">
            <CardContent className="space-y-5">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-secondary">
                  Account snapshot
                </p>
                <h2 className="mt-3 text-3xl leading-none">Your current account standing</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-border bg-white/82 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Email
                  </p>
                  <p className="mt-2 font-semibold text-foreground">{user?.email}</p>
                </div>
                <div className="rounded-[24px] border border-border bg-white/82 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Verification
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    {user?.emailVerifiedAt ? "Email verified" : "Verification pending"}
                  </p>
                </div>
                <div className="rounded-[24px] border border-border bg-white/82 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Loyalty tier
                  </p>
                  <p className="mt-2 font-semibold text-foreground">{user?.loyaltyTier ?? "BRONZE"}</p>
                </div>
                <div className="rounded-[24px] border border-border bg-white/82 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Saved planning
                  </p>
                  <p className="mt-2 font-semibold text-foreground">
                    Wishlist and tickets remain one click away.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/78">
            <CardContent className="space-y-5">
              <div>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-secondary">
                  Quick actions
                </p>
                <h2 className="mt-3 text-3xl leading-none">Move into the next flow</h2>
              </div>
              <div className="space-y-3">
                {[
                  {
                    href: "/tickets",
                    label: "Review ticket vault",
                    note: "Access QR and PDF tickets from confirmed bookings.",
                    icon: Ticket,
                  },
                  {
                    href: "/wishlist",
                    label: "Open wishlist",
                    note: "Track events you intend to revisit or book later.",
                    icon: Heart,
                  },
                  {
                    href: "/profile",
                    label: "Check account profile",
                    note: "Review account data, verification, and rewards status.",
                    icon: CheckCircle2,
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between rounded-[24px] border border-border bg-white/82 px-4 py-4 hover:border-primary/20 hover:bg-white"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-white">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{item.label}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {item.note}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
