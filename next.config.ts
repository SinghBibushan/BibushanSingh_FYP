import type { NextConfig } from "next";

const remoteImageHostnames = [
  "lh3.googleusercontent.com",
  "images.unsplash.com",
  "res.cloudinary.com",
  ...(process.env.IMAGE_REMOTE_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean),
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: remoteImageHostnames.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
};

export default nextConfig;
