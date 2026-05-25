import Link from "next/link";
import { CalendarX2 } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export function EventEmptyState() {
  return (
    <EmptyState
      icon={CalendarX2}
      title="No events match these filters"
      description="Try a broader search, change the city or category, or clear the featured-only option."
      action={
        <Button asChild variant="outline">
          <Link href="/events">Reset filters</Link>
        </Button>
      }
    />
  );
}
