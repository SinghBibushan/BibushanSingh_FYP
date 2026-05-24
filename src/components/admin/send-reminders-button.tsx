"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function SendRemindersButton() {
  const [loading, setLoading] = useState(false);

  async function handleSendReminders() {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/send-reminders", {
        method: "POST",
      });
      const data = (await response.json()) as {
        error?: string;
        message?: string;
        remindersSent?: number;
        eventsFound?: number;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not send reminders.");
      }

      toast.success(
        `${data.message ?? "Reminder cycle completed."} ${data.remindersSent ?? 0} reminder(s) sent across ${data.eventsFound ?? 0} event(s).`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send reminders.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={handleSendReminders} disabled={loading}>
      <BellRing className="h-4 w-4" />
      {loading ? "Sending reminders..." : "Trigger 15-day reminders"}
    </Button>
  );
}
