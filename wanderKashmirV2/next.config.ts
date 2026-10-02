import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "imgd.aeplcdn.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/destinations/dal-lake",
        destination: "/destinations/srinagar/dal-lake",
        permanent: true,
      },
      {
        source: "/destinations/betaab-valley",
        destination: "/destinations/pahalgam/betaab-valley",
        permanent: true,
      },
      {
        source: "/destinations/aru-valley",
        destination: "/destinations/pahalgam/aru-valley",
        permanent: true,
      },
      {
        source: "/kashmir-tour-packages",
        destination: "/tours",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/tours/winter-kashmir-trip",
        destination: "/tours",
        permanent: true,
      },
      {
        source: "/homestays",
        destination: "/stays",
        permanent: true,
      },
      {
        source: "/homestays/:slug*",
        destination: "/stays",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
