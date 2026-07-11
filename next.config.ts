import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com', // Zmień to, jeśli użyjesz np. res.cloudinary.com
      },
    ],
  },
};

export default nextConfig;
