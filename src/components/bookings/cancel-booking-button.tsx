"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { readJson } from "@/lib/api";

export function CancelBookingButton({
  bookingCode,
  variant = "outline",
  className,
}: {
  bookingCode: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleCancel() {
    const confirmed = window.confirm(
      "Cancel this confirmed booking and refund the associated loyalty/ticket allocation?",
    );

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/bookings/cancel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingCode }),
        });

        const data = await readJson<{ message: string }>(response);
        toast.success(data.message);
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not cancel booking.");
      }
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      onClick={handleCancel}
      disabled={isPending}
      className={className}
    >
      {isPending ? "Cancelling..." : "Cancel booking"}
    </Button>
  );
}
