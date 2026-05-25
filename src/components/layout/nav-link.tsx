"use client";

import Link, { type LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function NavLink({
  href,
  className,
  activeClassName,
  exact = false,
  children,
}: LinkProps & {
  className?: string;
  activeClassName?: string;
  exact?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const hrefValue = typeof href === "string" ? href : href.pathname ?? "";
  const isActive = exact ? pathname === hrefValue : pathname === hrefValue || pathname?.startsWith(`${hrefValue}/`);

  return (
    <Link
      href={href}
      className={cn(className, isActive && activeClassName)}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
