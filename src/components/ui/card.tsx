import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[30px] border border-border bg-card text-card-foreground shadow-[0_20px_60px_rgba(24,34,53,0.08)] backdrop-blur-sm transition-all duration-200",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 md:p-7", className)} {...props} />;
}
