import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WanderKashmir",
    short_name: "WanderKashmir",
    description:
      "Explore Kashmir with direct local itineraries, heritage houseboats on Dal Lake, boutique alpine stays, and verified mountain drivers managed directly from Srinagar.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0f172a",
    icons: [
      {
        src: "https://res.cloudinary.com/dcmoseix9/image/upload/v1790940410/web-app-manifest-192x192_jiumbz.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "https://res.cloudinary.com/dcmoseix9/image/upload/v1790940409/web-app-manifest-512x512_ffwdc7.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
