import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./src/lib/cloudinaryLoader.ts",
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
      {
        source: "/tours/7-days-complete-kashmir",
        destination: "/tours/7-days-kashmir-tour-package",
        permanent: true,
      },
      {
        source: "/tours/6-days-tour-kashmir-explorer-package",
        destination: "/tours/6-days-kashmir-tour-package",
        permanent: true,
      },
      {
        source: "/tours/5-days-family-special",
        destination: "/tours/5-days-kashmir-tour-package",
        permanent: true,
      },
      {
        source: "/tours/4-days-srinagar-gulmarg-pahalgam",
        destination: "/tours/4-days-3-nights-kashmir-tour-package",
        permanent: true,
      },
      {
        source: "/tours/2-days-quick-srinagar",
        destination: "/tours/2-days-1-night-srinagar-tour-package",
        permanent: true,
      },
      {
        source: "/tours/3-days-srinagar-gulmarg",
        destination: "/tours/3-days-2-nights-srinagar-gulmarg-tour-package",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
      {
        source: "/admin",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
        ],
      },
      {
        source: "/wander-admin",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
        ],
      },
      {
        source: "/wander-admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
