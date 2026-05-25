import { getSession } from "@/lib/auth";
import Link from "next/link";
import { Compass, LayoutGrid, ScanLine, Ticket } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { NavLink } from "@/components/layout/nav-link";
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
    ...(session?.role === "STAFF" || session?.role === "ADMIN"
      ? [{ href: "/staff", label: "Check-In" }]
      : []),
    ...(session?.role === "ORGANIZER" ? [{ href: "/organizer", label: "Organizer" }] : []),
    ...(session?.role === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="container-shell flex min-h-18 items-center justify-between gap-3 py-3 sm:h-20 sm:py-0">
        <Link href="/" className="flex min-w-0 shrink items-center gap-3">
          <div className="min-w-0">
            <p className="truncate font-heading text-lg leading-none sm:text-[1.7rem]">EventEase</p>
            <p className="hidden text-[0.7rem] uppercase tracking-[0.28em] text-muted-foreground sm:block">
              Curated Ticketing For Nepal
            </p>
          </div>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center md:flex">
          <div className="flex items-center gap-1 rounded-2xl border border-border bg-white/88 p-1.5 shadow-[0_10px_30px_rgba(24,32,51,0.06)]">
            <NavLink
              href="/events"
              activeClassName="bg-primary text-primary-foreground shadow-sm"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Events
            </NavLink>
            {session ? (
              <NavLink
                href="/tickets"
                activeClassName="bg-primary text-primary-foreground shadow-sm"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                My Tickets
              </NavLink>
            ) : null}
            {session ? (
              <NavLink
                href="/loyalty"
                activeClassName="bg-primary text-primary-foreground shadow-sm"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Loyalty
              </NavLink>
            ) : null}
            {session ? (
              <NavLink
                href="/dashboard"
                activeClassName="bg-primary text-primary-foreground shadow-sm"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Dashboard
              </NavLink>
            ) : null}
            {session?.role === "STAFF" || session?.role === "ADMIN" ? (
              <NavLink
                href="/staff"
                activeClassName="bg-primary text-primary-foreground shadow-sm"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Check-In
              </NavLink>
            ) : null}
            {session?.role === "ORGANIZER" ? (
              <NavLink
                href="/organizer"
                activeClassName="bg-primary text-primary-foreground shadow-sm"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Organizer
              </NavLink>
            ) : null}
            {session?.role === "ADMIN" ? (
              <NavLink
                href="/admin"
                activeClassName="bg-primary text-primary-foreground shadow-sm"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Admin
              </NavLink>
            ) : null}
          </div>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {session ? (
            <>
              <NotificationBell />
              <div className="hidden rounded-2xl border border-border bg-white/88 px-4 py-2 text-sm shadow-[0_8px_24px_rgba(24,32,51,0.05)] sm:block">
                <p className="max-w-[11rem] truncate font-semibold text-foreground">
                  {session.name}
                </p>
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
                  {session.role === "ADMIN"
                    ? "Admin access"
                    : session.role === "STAFF"
                      ? "Venue check-in"
                    : session.role === "ORGANIZER"
                      ? "Organizer studio"
                      : "Active member"}
                </p>
              </div>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm" className="sm:h-11 sm:px-5 sm:text-sm">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="container-shell pb-3 md:hidden">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-white/88 p-2 shadow-[0_10px_30px_rgba(24,32,51,0.06)] sm:grid-cols-3">
          {navItems.map((item) => {
            const Icon =
              item.href === "/events"
                ? Compass
                : item.href === "/tickets"
                  ? Ticket
                  : item.href === "/staff"
                    ? ScanLine
                    : LayoutGrid;

            return (
              <NavLink
                key={item.href}
                href={item.href}
                activeClassName="bg-primary text-primary-foreground shadow-sm"
                className="inline-flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-2 text-center text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </div>
    </header>
  );
}
