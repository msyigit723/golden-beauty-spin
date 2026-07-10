import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    formats: ['image/avif', 'image/webp'],
  },

  allowedDevOrigins: ['192.168.2.142'],
};

export default nextConfig;