import { getSession } from "@/lib/auth";
import Link from "next/link";

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
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="container-shell flex h-20 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-sm font-bold text-secondary-foreground">
            EE
          </div>
          <div>
            <p className="font-heading text-2xl leading-none">EventEase</p>
            <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">
              Nepal Event Platform
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <NotificationBell />
              <div className="hidden rounded-full bg-muted px-4 py-2 text-sm font-semibold text-foreground sm:block">
                {session.name}
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
    </header>
  );
}
