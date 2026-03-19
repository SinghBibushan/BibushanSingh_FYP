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
    <div className="space-y-3 rounded-[22px] border border-border bg-[linear-gradient(145deg,#f8f3ea_0%,#f2e5d6_100%)] p-4">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-secondary">
        Review action
      </p>
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
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          {loading === "REJECTED" ? "Saving..." : "Reject"}
        </Button>
      </div>
    </div>
  );
}
