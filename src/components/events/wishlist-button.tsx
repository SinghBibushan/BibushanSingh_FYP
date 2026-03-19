"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface WishlistButtonProps {
  eventId: string;
  initialSaved?: boolean;
  size?: "sm" | "md" | "lg";
}

type WishlistResponse = {
  error?: string;
  message?: string;
};

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

  async function readResponse(response: Response) {
    const data = (await response.json()) as WishlistResponse;

    if (!response.ok) {
      throw new Error(data.error ?? "Wishlist request failed.");
    }

    return data;
  }

  const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    try {
      if (isSaved) {
        await readResponse(
          await fetch(`/api/wishlist?eventId=${eventId}`, {
            method: "DELETE",
          }),
        );
        setIsSaved(false);
        toast.success("Removed from wishlist.");
      } else {
        await readResponse(
          await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventId }),
          }),
        );
        setIsSaved(true);
        toast.success("Added to wishlist.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full border transition-all duration-200 ${
        isSaved
          ? "border-secondary bg-secondary text-white shadow-[0_12px_24px_rgba(179,115,63,0.22)]"
          : "border-border bg-white/82 text-muted-foreground shadow-[0_8px_18px_rgba(24,34,53,0.06)] hover:border-primary/20 hover:bg-white hover:text-foreground"
      } ${isLoading ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isSaved}
      type="button"
    >
      <Heart
        className={`${iconSizes[size]} transition-all duration-300 ${
          isSaved ? "fill-current" : ""
        }`}
      />
    </button>
  );
}
