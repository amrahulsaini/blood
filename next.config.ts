import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd1h684srpghjti.cloudfront.net',
        pathname: '/assets/images/**',
      },
    ],
  },
};

export default nextConfig;
