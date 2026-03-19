"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Camera } from "lucide-react";

interface Photo {
  _id: string;
  imageUrl: string;
  caption: string;
  userId: {
    name: string;
  };
  createdAt: string;
}

export function EventGallery({ eventId }: { eventId: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchPhotos() {
      try {
        const res = await fetch(`/api/gallery?eventId=${eventId}`);
        if (!res.ok) {
          return;
        }

        const data = (await res.json()) as { photos?: Photo[] };
        if (active) {
          setPhotos(data.photos ?? []);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchPhotos();

    return () => {
      active = false;
    };
  }, [eventId]);

  if (loading) {
    return <div className="py-8 text-center">Loading gallery...</div>;
  }

  if (photos.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <Camera className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p>No photos yet. Be the first to share.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {photos.map((photo) => (
        <div key={photo._id} className="group relative">
          <Image
            src={photo.imageUrl}
            alt={photo.caption || "Event gallery photo"}
            width={320}
            height={192}
            className="h-48 w-full rounded-lg object-cover"
          />
          <div className="absolute inset-0 flex items-end rounded-lg bg-black/0 p-4 transition-all group-hover:bg-black/60">
            <div className="text-white opacity-0 transition-opacity group-hover:opacity-100">
              <p className="text-sm font-medium">{photo.caption}</p>
              <p className="text-xs">by {photo.userId.name}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
