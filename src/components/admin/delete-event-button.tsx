"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { readJson } from "@/lib/api";

export function DeleteEventButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm("Delete this event and its ticket types?");
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
      });
      const data = await readJson<{ message: string }>(response);
      toast.success(data.message);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete event.");
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete}>
      Delete
    </Button>
  );
}
