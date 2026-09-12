import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com", // Zmień to, jeśli użyjesz np. res.cloudinary.com
      },
    ],
  },
};

export default nextConfig;
