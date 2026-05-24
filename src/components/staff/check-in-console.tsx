"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CheckInFeedback = {
  message: string;
  tone: "success" | "error";
  ticket?: {
    ticketCode: string;
    eventTitle: string;
    attendeeName: string;
    bookingCode: string;
    gate: string;
    checkedInAt: string;
    scannedBy: string;
  };
};

export function CheckInConsole() {
  const router = useRouter();
  const [scanInput, setScanInput] = useState("");
  const [gate, setGate] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<CheckInFeedback | null>(null);

  async function handleSubmit() {
    setLoading(true);

    try {
      const response = await fetch("/api/staff/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scanInput,
          gate,
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        ticket?: CheckInFeedback["ticket"];
      };

      if (!response.ok) {
        throw new Error(data.message ?? "Could not check in ticket.");
      }

      setFeedback({
        message: data.message ?? "Ticket check-in completed.",
        tone: "success",
        ticket: data.ticket,
      });
      setScanInput("");
      toast.success(data.message ?? "Ticket checked in.");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not check in ticket.";
      setFeedback({
        message,
        tone: "error",
      });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="scan-input">QR payload or ticket code</Label>
          <Textarea
            id="scan-input"
            value={scanInput}
            onChange={(event) => setScanInput(event.target.value)}
            placeholder='Paste the raw QR JSON payload or a code like TIX-ABC123.'
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scan-gate">Gate or desk</Label>
          <Input
            id="scan-gate"
            value={gate}
            onChange={(event) => setGate(event.target.value)}
            placeholder="Main Gate"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSubmit} disabled={loading || !scanInput.trim()}>
            {loading ? "Checking in..." : "Validate and Check In"}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setScanInput("");
              setGate("");
              setFeedback(null);
            }}
            disabled={loading}
          >
            Clear
          </Button>
        </div>
      </div>

      {feedback ? (
        <div
          className={
            feedback.tone === "success"
              ? "rounded-[24px] border border-emerald-200 bg-emerald-50 p-5"
              : "rounded-[24px] border border-red-200 bg-red-50 p-5"
          }
        >
          <p
            className={
              feedback.tone === "success"
                ? "font-semibold text-emerald-800"
                : "font-semibold text-red-700"
            }
          >
            {feedback.message}
          </p>
          {feedback.ticket ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[20px] border border-white/70 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Ticket
                </p>
                <p className="mt-2 font-mono text-sm font-semibold text-foreground">
                  {feedback.ticket.ticketCode}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{feedback.ticket.eventTitle}</p>
              </div>
              <div className="rounded-[20px] border border-white/70 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Attendee
                </p>
                <p className="mt-2 font-semibold text-foreground">
                  {feedback.ticket.attendeeName}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Booking {feedback.ticket.bookingCode}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
