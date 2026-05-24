"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ReviewEventButtons({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"PUBLISHED" | "REJECTED" | null>(null);

  async function update(nextStatus: "PUBLISHED" | "REJECTED") {
    setLoading(nextStatus);

    try {
      const reviewNotes =
        nextStatus === "REJECTED"
          ? window.prompt("Optional rejection note for the organizer:") ?? ""
          : "";

      const response = await fetch(`/api/admin/events/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
          reviewNotes,
        }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Could not review event.");
      }

      toast.success(data.message ?? "Event updated.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not review event.");
    } finally {
      setLoading(null);
    }
  }

  if (status === "PUBLISHED" || status === "CANCELLED") {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={() => update("PUBLISHED")}
        disabled={loading !== null}
      >
        {loading === "PUBLISHED" ? "Publishing..." : "Approve"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => update("REJECTED")}
        disabled={loading !== null}
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        {loading === "REJECTED" ? "Rejecting..." : "Reject"}
      </Button>
    </div>
  );
}
