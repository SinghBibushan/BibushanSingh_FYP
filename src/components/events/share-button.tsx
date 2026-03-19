"use client";

import { useState } from "react";
import { Share2, Facebook, Twitter, Link as LinkIcon, MessageCircle, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg";
}

export function ShareButton({ url, title, description, size = "md" }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;

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

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(description ? `${title} - ${description}` : title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} - ${fullUrl}`)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-primary to-secondary text-white hover:scale-110 hover:shadow-lg`}
        aria-label="Share event"
      >
        <Share2 className={iconSizes[size]} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl bg-card/95 backdrop-blur-xl border border-primary/30 shadow-2xl p-4 space-y-3 animate-scale-in">
            <div className="text-sm font-semibold text-foreground mb-3">
              Share this event
            </div>

            <button
              onClick={() => handleShare("facebook")}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition-all duration-300 group"
            >
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Facebook className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-blue-400 transition-colors">
                Share on Facebook
              </span>
            </button>

            <button
              onClick={() => handleShare("twitter")}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 hover:bg-sky-500/20 transition-all duration-300 group"
            >
              <div className="p-2 rounded-lg bg-sky-500/20">
                <Twitter className="h-5 w-5 text-sky-400" />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-sky-400 transition-colors">
                Share on Twitter
              </span>
            </button>

            <button
              onClick={() => handleShare("whatsapp")}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-all duration-300 group"
            >
              <div className="p-2 rounded-lg bg-green-500/20">
                <MessageCircle className="h-5 w-5 text-green-400" />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-green-400 transition-colors">
                Share on WhatsApp
              </span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all duration-300 group"
            >
              <div className="p-2 rounded-lg bg-primary/20">
                {copied ? (
                  <Check className="h-5 w-5 text-green-400" />
                ) : (
                  <LinkIcon className="h-5 w-5 text-primary" />
                )}
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                {copied ? "Link copied!" : "Copy link"}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
