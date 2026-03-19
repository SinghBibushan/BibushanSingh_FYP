"use client";

import { useEffect, useState } from "react";
import { Star, ThumbsUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface Review {
  _id: string;
  rating: number;
  title: string;
  comment: string;
  helpfulCount: number;
  createdAt: string;
  userId: {
    name: string;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

interface ReviewsDisplayProps {
  eventId: string;
}

export function ReviewsDisplay({ eventId }: ReviewsDisplayProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchReviews() {
      try {
        const response = await fetch(`/api/reviews?eventId=${eventId}`);
        const data = (await response.json()) as {
          reviews?: Review[];
          stats?: ReviewStats | null;
        };

        if (!active) {
          return;
        }

        setReviews(data.reviews ?? []);
        setStats(data.stats ?? null);
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

  const renderStars = (rating: number, size: "sm" | "md" = "md") => {
    const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 animate-pulse rounded-2xl bg-muted/50" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted/50" />
      </div>
    );
  }

  if (!stats || stats.totalReviews === 0) {
    return (
      <Card className="border-2 border-dashed border-primary/30">
        <CardContent className="py-12 text-center">
          <Star className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No reviews yet</h3>
          <p className="text-sm text-muted-foreground">
            Be the first to review this event after attending.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/30">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-2 text-5xl font-bold gradient-text">
                {stats.averageRating.toFixed(1)}
              </div>
              {renderStars(Math.round(stats.averageRating))}
              <p className="mt-2 text-sm text-muted-foreground">
                Based on {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
              </p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.distribution[rating as keyof typeof stats.distribution];
                const percentage =
                  stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="w-8 text-sm font-medium">{rating}★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm text-muted-foreground">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {reviews.map((review, index) => (
          <Card
            key={review._id}
            className="hover-lift border-primary/20 opacity-0 animate-fade-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary font-bold text-white">
                      {review.userId.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold">{review.userId.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                {renderStars(review.rating, "sm")}
              </div>

              <div>
                <h4 className="mb-2 font-semibold">{review.title}</h4>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {review.comment}
                </p>
              </div>

              <div className="flex items-center gap-2 border-t border-border/50 pt-2">
                <button className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
                  <ThumbsUp className="h-4 w-4" />
                  <span>Helpful ({review.helpfulCount})</span>
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
