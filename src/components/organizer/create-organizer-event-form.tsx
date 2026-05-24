"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readJson } from "@/lib/api";

export function CreateOrganizerEventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState<"draft" | "submit" | null>(null);
  const [form, setForm] = useState({
    title: "",
    summary: "",
    description: "",
    category: "Concert",
    city: "Kathmandu",
    venueName: "",
    venueAddress: "",
    organizerName: "",
    organizerEmail: "",
    startsAt: "",
    endsAt: "",
    tags: "community,organizer",
    ticketName: "Standard",
    ticketDescription: "General entry",
    ticketPrice: "999",
    ticketQuantity: "100",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(submissionMode: "DRAFT" | "PENDING_APPROVAL") {
    setLoading(submissionMode === "DRAFT" ? "draft" : "submit");

    try {
      const response = await fetch("/api/organizer/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          summary: form.summary,
          description: form.description,
          category: form.category,
          city: form.city,
          venueName: form.venueName,
          venueAddress: form.venueAddress,
          organizerName: form.organizerName,
          organizerEmail: form.organizerEmail,
          startsAt: form.startsAt,
          endsAt: form.endsAt,
          tags: form.tags,
          submissionMode,
          ticketTypes: [
            {
              name: form.ticketName,
              description: form.ticketDescription,
              price: Number(form.ticketPrice),
              quantityTotal: Number(form.ticketQuantity),
              perUserLimit: 6,
            },
          ],
        }),
      });

      const data = await readJson<{ message: string }>(response);
      toast.success(data.message);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save event.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card className="bg-white/78">
      <CardContent>
        <form
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            void submit("PENDING_APPROVAL");
          }}
        >
          <div className="space-y-3">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
              Organizer submission
            </p>
            <h2 className="text-3xl leading-none">Create an event draft or send for review</h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Organizers can prepare listings privately, then submit them into the admin
              approval queue when ready.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Summary</Label>
              <Input value={form.summary} onChange={(e) => update("summary", e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <textarea
                className="min-h-32 w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-foreground outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input value={form.category} onChange={(e) => update("category", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Venue</Label>
              <Input value={form.venueName} onChange={(e) => update("venueName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Venue address</Label>
              <Input value={form.venueAddress} onChange={(e) => update("venueAddress", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Organizer name</Label>
              <Input value={form.organizerName} onChange={(e) => update("organizerName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Organizer email</Label>
              <Input value={form.organizerEmail} onChange={(e) => update("organizerEmail", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Starts at</Label>
              <Input type="datetime-local" value={form.startsAt} onChange={(e) => update("startsAt", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Ends at</Label>
              <Input type="datetime-local" value={form.endsAt} onChange={(e) => update("endsAt", e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Tags</Label>
              <Input value={form.tags} onChange={(e) => update("tags", e.target.value)} />
            </div>
          </div>

          <div className="rounded-[26px] border border-border bg-[linear-gradient(145deg,#f8f3ea_0%,#f2e5d6_100%)] p-5">
            <div className="mb-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
                Primary ticket type
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Ticket name</Label>
                <Input value={form.ticketName} onChange={(e) => update("ticketName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ticket price</Label>
                <Input type="number" value={form.ticketPrice} onChange={(e) => update("ticketPrice", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input type="number" value={form.ticketQuantity} onChange={(e) => update("ticketQuantity", e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label>Ticket description</Label>
                <Input value={form.ticketDescription} onChange={(e) => update("ticketDescription", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={loading !== null}
              onClick={() => void submit("DRAFT")}
            >
              {loading === "draft" ? "Saving draft..." : "Save draft"}
            </Button>
            <Button disabled={loading !== null}>
              {loading === "submit" ? "Submitting..." : "Submit for approval"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
