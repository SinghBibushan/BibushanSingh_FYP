"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";

interface Review {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  photos: string[];
  createdAt: string;
  userId: {
    name: string;
    avatarUrl?: string;
  };
}

export function EventReviews({ eventId }: { eventId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews?eventId=${eventId}`);
        const data = (await res.json()) as { reviews?: Review[] };

        if (active) {
          setReviews(data.reviews ?? []);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchReviews();

    return () => {
      active = false;
    };
  }, [eventId]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }

    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  }, [reviews]);

  if (loading) {
    return (
      <div className="rounded-[24px] border border-border bg-white/76 p-8 text-center text-sm text-muted-foreground">
        Loading reviews...
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-[24px] border border-border bg-white/76 p-8 text-center">
        <p className="font-semibold text-foreground">No reviews yet</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Once attendees submit feedback, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-[auto_1fr]">
        <div className="rounded-[24px] border border-border bg-[linear-gradient(145deg,#f8f3ea_0%,#f2e5d6_100%)] px-5 py-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Average rating
          </p>
          <p className="mt-2 text-3xl font-semibold leading-none text-foreground">
            {averageRating.toFixed(1)}
          </p>
        </div>
        <div className="rounded-[24px] border border-border bg-white/82 px-5 py-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Review volume
          </p>
          <p className="mt-2 text-3xl font-semibold leading-none text-foreground">
            {reviews.length}
          </p>
        </div>
      </div>

      {reviews.map((review) => (
        <div key={review._id} className="rounded-[26px] border border-border bg-white/82 p-6">
          <div className="flex items-start gap-4">
            <Image
              src={review.userId.avatarUrl || "/window.svg"}
              alt={review.userId.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full border border-border object-cover bg-white"
            />
            <div className="flex-1 space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">{review.userId.name}</h4>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < review.rating
                          ? "fill-secondary text-secondary"
                          : "text-muted-foreground/35"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <h5 className="text-lg font-semibold text-foreground">{review.title}</h5>
              <p className="text-sm leading-7 text-muted-foreground">{review.comment}</p>
              {review.photos.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {review.photos.map((photo, index) => (
                    <Image
                      key={`${review._id}-${index}`}
                      src={photo}
                      alt="Review photo"
                      width={96}
                      height={96}
                      className="h-24 w-24 rounded-2xl border border-border object-cover"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
