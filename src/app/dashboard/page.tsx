import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarClock,
  CheckCircle2,
  Heart,
  Ticket,
  TrendingUp,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { userNavItems } from "@/lib/user-nav";

export default async function DashboardPage() {
  await requireUser();
  const user = await getCurrentUser();

  const cards = [
    {
      title: "Loyalty tier",
      value: user?.loyaltyTier ?? "Bronze",
      note: "Your status grows with confirmed bookings.",
      icon: Award,
      tone: "amber",
    },
    {
      title: "Points balance",
      value: String(user?.loyaltyPoints ?? 0),
      note: "Redeem points on eligible future bookings.",
      icon: TrendingUp,
      tone: "emerald",
    },
    {
      title: "Account status",
      value: user?.emailVerifiedAt ? "Verified" : "Pending",
      note: "Email verification keeps bookings and recovery secure.",
      icon: CheckCircle2,
      tone: "indigo",
    },
    {
      title: "Next step",
      value: "Browse events",
      note: "Pick an event, review tickets, and complete checkout.",
      icon: CalendarClock,
      tone: "slate",
    },
  ];

  return (
    <AppShell
      badge="User Dashboard"
      title={`Welcome back, ${user?.name?.split(" ")[0] ?? "Guest"}`}
      description="A clearer operational view of your account, rewards, saved events, and ticket activity."
      navItems={userNavItems}
    >
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            return <StatCard key={card.title} label={card.title} value={card.value} note={card.note} icon={card.icon} tone={card.tone as "amber" | "emerald" | "indigo" | "slate"} />;
          })}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="bg-white/90">
            <CardContent className="space-y-5">
              <SectionHeader
                badge="Account Snapshot"
                title="Your current account standing"
                description="Key account details are grouped here so you can review status quickly before taking action."
              />
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
                  <div className="mt-2">
                    <StatusBadge tone={user?.emailVerifiedAt ? "success" : "warning"}>
                      {user?.emailVerifiedAt ? "Email verified" : "Verification pending"}
                    </StatusBadge>
                  </div>
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

          <Card className="bg-white/90">
            <CardContent className="space-y-5">
              <SectionHeader
                badge="Quick Actions"
                title="Move into the next flow"
                description="Shortcuts for the pages you are most likely to revisit."
              />
              <div className="space-y-3">
                {[
                  {
                    href: "/bookings",
                    label: "Open booking history",
                    note: "Track pending, confirmed, cancelled, and refunded orders.",
                    icon: ArrowRight,
                  },
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
                    href: "/notifications",
                    label: "View notifications",
                    note: "Read reminders, booking updates, and verification notices.",
                    icon: CheckCircle2,
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
