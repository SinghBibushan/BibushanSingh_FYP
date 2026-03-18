"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface WishlistButtonProps {
  eventId: string;
  initialSaved?: boolean;
  size?: "sm" | "md" | "lg";
}

export function WishlistButton({
  eventId,
  initialSaved = false,
  size = "md",
}: WishlistButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    try {
      if (isSaved) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist?eventId=${eventId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to remove from wishlist");
        }

        setIsSaved(false);
        toast.success("Removed from wishlist");
      } else {
        // Add to wishlist
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ eventId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to add to wishlist");
        }

        setIsSaved(true);
        toast.success("Added to wishlist ❤️");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 ${
        isSaved
          ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white scale-110"
          : "bg-muted/50 backdrop-blur-sm text-muted-foreground hover:bg-muted hover:scale-110"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} border-2 ${
        isSaved ? "border-pink-400" : "border-border"
      }`}
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`${iconSizes[size]} transition-all duration-300 ${
          isSaved ? "fill-current" : ""
        }`}
      />
    </button>
  );
}
