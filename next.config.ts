import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Use a custom loader for Cloudinary so Next.js doesn't double-process
    // images that Cloudinary has already optimized with q_auto,f_auto
    loader: "custom",
    loaderFile: "./src/lib/cloudinaryLoader.ts",
    // Mobile-optimized breakpoints — matches real device widths (×2 DPR)
    // so the srcset has entries at 640w (iPhone SE), 750w (iPhone 14),
    // 828w (iPhone 14 Pro Max), then tablet/desktop sizes.
    deviceSizes: [320, 375, 390, 414, 640, 750, 828, 1080, 1200, 1920],
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

  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/partner/hotel',
        permanent: true,
      },
      {
        source: '/tours/winter-kashmir-trip',
        destination: '/tours',
        permanent: true,
      },
      {
        source: '/privacy',
        destination: '/privacy-policy',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
