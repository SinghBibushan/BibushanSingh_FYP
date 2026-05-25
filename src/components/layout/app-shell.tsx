import { type ReactNode } from "react";

import { NavLink } from "@/components/layout/nav-link";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";

type ShellNavItem = {
  href: string;
  label: string;
};

export function AppShell({
  badge,
  title,
  description,
  navItems,
  children,
}: {
  badge: string;
  title: string;
  description: string;
  navItems: readonly ShellNavItem[];
  children: ReactNode;
}) {
  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell grid gap-6 py-6 lg:grid-cols-[280px_1fr] lg:gap-8 lg:py-10">
        <aside className="min-w-0 space-y-4 lg:sticky lg:top-28 lg:self-start lg:space-y-5">
          <Badge>{badge}</Badge>
          <div className="rounded-3xl border border-border bg-white/88 p-5 shadow-[0_18px_45px_rgba(24,32,51,0.06)] lg:p-6">
            <div className="space-y-3">
              <h1 className="text-2xl leading-tight md:text-4xl">{title}</h1>
              <p className="text-sm leading-6 text-muted-foreground md:leading-7">{description}</p>
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-2 rounded-3xl border border-border bg-card p-2 shadow-[0_18px_45px_rgba(24,32,51,0.06)] sm:grid-cols-3 lg:block lg:space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                exact
                className="block min-w-0 rounded-2xl px-3 py-3 text-center text-sm font-semibold text-muted-foreground transition hover:bg-white hover:text-foreground lg:px-4 lg:text-left"
                activeClassName="bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(24,32,51,0.16)]"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <section className="min-w-0 rounded-[34px] border border-border bg-white/70 p-1 shadow-[0_18px_45px_rgba(24,32,51,0.06)]">
          <div className="min-w-0 rounded-[30px] bg-card p-4 md:p-6 lg:p-8">{children}</div>
        </section>
      </main>
    </div>
  );
}
