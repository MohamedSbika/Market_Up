import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // YouTube thumbnails
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      // Allow any https hostname for user-provided image URLs
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
