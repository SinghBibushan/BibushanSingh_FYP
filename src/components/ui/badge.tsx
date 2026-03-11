import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground transition-all duration-300 hover:scale-105",
        className,
      )}
      {...props}
    />
  );
}
