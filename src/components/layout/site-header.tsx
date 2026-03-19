import { getSession } from "@/lib/auth";
import Link from "next/link";
import { Compass, LayoutGrid, Ticket } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await getSession();
  const navItems = [
    { href: "/events", label: "Events" },
    ...(session
      ? [
          { href: "/tickets", label: "My Tickets" },
          { href: "/loyalty", label: "Loyalty" },
          { href: "/dashboard", label: "Dashboard" },
        ]
      : []),
    ...(session?.role === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/88 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="min-w-0">
            <p className="font-heading text-xl leading-none sm:text-[1.7rem]">EventEase</p>
            <p className="hidden text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground sm:block">
              Curated Ticketing Platform
            </p>
          </div>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <div className="flex items-center gap-2 rounded-full border border-border bg-white/72 p-2 shadow-[0_10px_30px_rgba(24,34,53,0.06)]">
            <Link
              href="/events"
              className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Events
            </Link>
            {session ? (
              <Link
                href="/tickets"
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                My Tickets
              </Link>
            ) : null}
            {session ? (
              <Link
                href="/loyalty"
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Loyalty
              </Link>
            ) : null}
            {session ? (
              <Link
                href="/dashboard"
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Dashboard
              </Link>
            ) : null}
            {session?.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Admin
              </Link>
            ) : null}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          {session ? (
            <>
              <NotificationBell />
              <div className="hidden rounded-full border border-border bg-white/72 px-4 py-2 text-sm shadow-[0_8px_24px_rgba(24,34,53,0.05)] sm:block">
                <p className="max-w-[11rem] truncate font-semibold text-foreground">
                  {session.name}
                </p>
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {session.role === "ADMIN" ? "Admin access" : "Active member"}
                </p>
              </div>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="container-shell pb-3 md:hidden">
        <div className="flex items-center gap-2 overflow-x-auto rounded-full border border-border bg-white/72 p-2 shadow-[0_10px_30px_rgba(24,34,53,0.06)]">
          {navItems.map((item) => {
            const Icon = item.href === "/events" ? Compass : item.href === "/tickets" ? Ticket : LayoutGrid;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
