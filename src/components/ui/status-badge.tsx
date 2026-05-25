import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
  info: "border-indigo-200 bg-indigo-50 text-indigo-700",
  neutral: "border-border bg-white text-foreground",
};

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof styles;
  className?: string;
}) {
  return <Badge className={cn(styles[tone], className)}>{children}</Badge>;
}
