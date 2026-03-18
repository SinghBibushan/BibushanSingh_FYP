"use client";

import { useState, useEffect } from "react";
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
    fetchPhotos();
  }, [eventId]);

  const fetchPhotos = async () => {
    try {
      const res = await fetch(`/api/gallery?eventId=${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error("Failed to fetch photos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading gallery...</div>;
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No photos yet. Be the first to share!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <div key={photo._id} className="relative group">
          <img
            src={photo.imageUrl}
            alt={photo.caption}
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all rounded-lg flex items-end p-4">
            <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-sm font-medium">{photo.caption}</p>
              <p className="text-xs">by {photo.userId.name}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
