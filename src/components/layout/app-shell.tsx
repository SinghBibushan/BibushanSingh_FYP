import Link from "next/link";
import { type ReactNode } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ShellNavItem = {
  href: string;
  label: string;
};

export function AppShell({
  badge,
  title,
  description,
  navItems,
  currentPath,
  children,
}: {
  badge: string;
  title: string;
  description: string;
  navItems: readonly ShellNavItem[];
  currentPath: string;
  children: ReactNode;
}) {
  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell grid gap-8 py-12 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5">
          <Badge>{badge}</Badge>
          <div className="rounded-[30px] border border-border bg-white/68 p-6 shadow-[0_18px_45px_rgba(24,34,53,0.06)]">
            <div className="space-y-3">
              <h1 className="text-4xl leading-tight md:text-5xl">{title}</h1>
              <p className="text-sm leading-7 text-muted-foreground">{description}</p>
            </div>
          </div>
          <nav className="space-y-2 rounded-[30px] border border-border bg-card p-3 shadow-[0_18px_45px_rgba(24,34,53,0.06)]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  currentPath === item.href
                    ? "bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(24,34,53,0.16)]"
                    : "text-muted-foreground hover:bg-white hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section className="rounded-[34px] border border-border bg-white/62 p-1 shadow-[0_18px_45px_rgba(24,34,53,0.06)]">
          <div className="rounded-[30px] bg-card p-6 md:p-8">{children}</div>
        </section>
      </main>
    </div>
  );
}
