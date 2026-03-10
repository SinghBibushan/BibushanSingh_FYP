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
  navItems: ShellNavItem[];
  currentPath: string;
  children: ReactNode;
}) {
  return (
    <div className="pb-16">
      <SiteHeader />
      <main className="container-shell grid gap-8 py-14 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-4">
          <Badge>{badge}</Badge>
          <div className="space-y-3">
            <h1 className="text-5xl leading-none">{title}</h1>
            <p className="text-sm leading-7 text-muted-foreground">{description}</p>
          </div>
          <nav className="space-y-2 rounded-[28px] border border-border bg-card p-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  currentPath === item.href
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section>{children}</section>
      </main>
    </div>
  );
}
