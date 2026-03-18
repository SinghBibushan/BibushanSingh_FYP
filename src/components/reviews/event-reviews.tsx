"use client";

import { useState, useEffect } from "react";
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
    avatarUrl: string;
  };
}

export function EventReviews({ eventId }: { eventId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [eventId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?eventId=${eventId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return <div className="text-center py-8 text-gray-500">No reviews yet</div>;
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review._id} className="border rounded-lg p-6">
          <div className="flex items-start gap-4">
            <img
              src={review.userId.avatarUrl || "/default-avatar.png"}
              alt={review.userId.name}
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">{review.userId.name}</h4>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <h5 className="font-medium mb-2">{review.title}</h5>
              <p className="text-gray-700 mb-3">{review.comment}</p>
              {review.photos && review.photos.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {review.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt="Review photo"
                      className="w-24 h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-3">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
