import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const toneMap = {
  indigo: {
    surface: "bg-[linear-gradient(180deg,rgba(243,246,255,0.96),rgba(235,240,252,0.98))]",
    iconWrap: "bg-indigo-50 text-indigo-700",
  },
  emerald: {
    surface: "bg-[linear-gradient(180deg,rgba(239,250,246,0.96),rgba(230,246,239,0.98))]",
    iconWrap: "bg-emerald-50 text-emerald-700",
  },
  amber: {
    surface: "bg-[linear-gradient(180deg,rgba(255,248,237,0.96),rgba(252,241,223,0.98))]",
    iconWrap: "bg-amber-50 text-amber-700",
  },
  slate: {
    surface: "bg-[linear-gradient(180deg,rgba(248,250,252,0.96),rgba(241,245,249,0.98))]",
    iconWrap: "bg-slate-100 text-slate-700",
  },
} as const;

export function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "slate",
  className,
}: {
  label: string;
  value: string;
  note?: string;
  icon: LucideIcon;
  tone?: keyof typeof toneMap;
  className?: string;
}) {
  const style = toneMap[tone];

  return (
    <Card className={cn("overflow-hidden border-border/70", className)}>
      <CardContent className={cn("space-y-4", style.surface)}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {label}
            </p>
            <p className="mt-3 text-3xl font-semibold leading-none text-foreground">
              {value}
            </p>
          </div>
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 shadow-sm",
              style.iconWrap,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {note ? <p className="text-sm leading-6 text-muted-foreground">{note}</p> : null}
      </CardContent>
    </Card>
  );
}
