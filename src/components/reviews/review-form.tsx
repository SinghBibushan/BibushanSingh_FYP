"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ReviewFormProps {
  eventId: string;
  bookingId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ eventId, bookingId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          bookingId,
          rating,
          title,
          comment,
        }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to submit review.");
      }

      toast.success("Review submitted successfully.");
      setRating(0);
      setTitle("");
      setComment("");
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[26px] border border-border bg-white/82 p-6">
      <div className="space-y-2">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-secondary">
          Write a review
        </p>
        <h3 className="text-2xl font-semibold leading-none text-foreground">
          Share your experience
        </h3>
      </div>

      <div className="space-y-2">
        <Label>Rating</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="rounded-full border border-border bg-white p-2 transition hover:border-secondary/40"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= rating ? "fill-secondary text-secondary" : "text-muted-foreground/35"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-title">Title</Label>
        <Input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          required
          placeholder="Summarize your experience"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-comment">Review</Label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          required
          rows={5}
          className="min-h-32 w-full rounded-2xl border border-border bg-white/70 px-4 py-3 text-sm text-foreground outline-none shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
          placeholder="Share your thoughts about the event"
        />
        <p className="text-xs text-muted-foreground">{comment.length}/1000 characters</p>
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  );
}
