"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function SubmitOrganizerEventButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);

    try {
      const response = await fetch(`/api/organizer/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "SUBMIT_FOR_REVIEW" }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Could not submit event.");
      }

      toast.success(data.message ?? "Event submitted for approval.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit event.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleSubmit} disabled={loading}>
      {loading ? "Submitting..." : "Submit"}
    </Button>
  );
}
