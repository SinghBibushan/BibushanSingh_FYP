import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EventEmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
        <div className="rounded-full bg-muted px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          No exact matches
        </div>
        <h2 className="text-3xl leading-none">No events match your current filters.</h2>
        <p className="max-w-xl text-sm leading-7 text-muted-foreground">
          Try a broader search or reset category and city filters. The database-backed
          flow and seeded demo flow both use the same discovery interface.
        </p>
        <Button asChild variant="outline">
          <Link href="/events">Reset filters</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
