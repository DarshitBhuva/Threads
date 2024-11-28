import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  typescript: {
    ignoreBuildErrors: true
  },
  serverExternalPackages: ['mongoose'],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: 'img.clerk.com'
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ]
  }
};

export default nextConfig;
