"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readJson } from "@/lib/api";

export function ReviewVerificationForm({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<"APPROVED" | "REJECTED" | null>(null);

  async function submit(status: "APPROVED" | "REJECTED") {
    setLoading(status);

    try {
      const response = await fetch(`/api/admin/verifications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, notes }),
      });
      const data = await readJson<{ message: string }>(response);
      toast.success(data.message);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update verification.",
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder={
          currentStatus === "PENDING" ? "Add review note" : "Update review note"
        }
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => submit("APPROVED")}
          disabled={loading !== null}
        >
          {loading === "APPROVED" ? "Saving..." : "Approve"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => submit("REJECTED")}
          disabled={loading !== null}
        >
          {loading === "REJECTED" ? "Saving..." : "Reject"}
        </Button>
      </div>
    </div>
  );
}
