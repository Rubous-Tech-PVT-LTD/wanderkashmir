import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Use a custom loader for Cloudinary so Next.js doesn't double-process
    // images that Cloudinary has already optimized with q_auto,f_auto
    loader: "custom",
    loaderFile: "./src/lib/cloudinaryLoader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "imgd.aeplcdn.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
