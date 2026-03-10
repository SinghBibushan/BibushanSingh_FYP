"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readJson } from "@/lib/api";

export function CreateEventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    tags: "demo,new",
    featured: false,
    ticketName: "Standard",
    ticketDescription: "General entry",
    ticketPrice: "999",
    ticketQuantity: "100",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/events", {
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
          featured: form.featured,
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
      toast.error(error instanceof Error ? error.message : "Could not create event.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <h2 className="text-3xl leading-none">Create event</h2>
            <p className="text-sm text-muted-foreground">
              Minimal admin creation flow for viva. It creates the event and its first ticket type.
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
                className="min-h-28 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm"
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
              <Label>Organizer</Label>
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

          <div className="grid gap-4 rounded-2xl bg-muted p-4 md:grid-cols-3">
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

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update("featured", e.target.checked)}
            />
            Mark as featured
          </label>

          <Button disabled={loading}>{loading ? "Creating..." : "Create event"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
