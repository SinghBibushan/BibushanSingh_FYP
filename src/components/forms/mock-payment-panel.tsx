"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { readJson } from "@/lib/api";

export function MockPaymentPanel({
  bookingCode,
  disabled,
}: {
  bookingCode: string;
  disabled: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<"success" | "failed" | null>(null);

  async function confirm(outcome: "success" | "failed") {
    setLoading(outcome);

    try {
      const response = await fetch("/api/payments/mock/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingCode, outcome }),
      });

      const data = await readJson<{ message: string }>(response);
      toast.success(data.message);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Mock payment could not be completed.",
      );
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="grid gap-3">
      <Button
        onClick={() => confirm("success")}
        disabled={disabled || loading !== null}
      >
        {loading === "success" ? "Processing success..." : "Simulate payment success"}
      </Button>
      <Button
        variant="outline"
        onClick={() => confirm("failed")}
        disabled={disabled || loading !== null}
      >
        {loading === "failed" ? "Processing failure..." : "Simulate payment failure"}
      </Button>
    </div>
  );
}
