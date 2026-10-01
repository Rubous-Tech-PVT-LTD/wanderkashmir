export interface MediaDoc {
  id: string;
  url: string;
  filename?: string;
  alt?: string;
  caption?: string;
  mimeType?: string;
  filesize?: number;
  width?: number;
  height?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const MediaCollection = {
  slug: "media",
  labels: {
    singular: "Media Asset",
    plural: "Media Library",
  },
  upload: {
    staticDir: "public/media",
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 512,
        position: "centre",
      },
      {
        name: "hero",
        width: 1600,
        height: 900,
        position: "centre",
      },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*", "video/mp4", "video/webm"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alt Text (for accessibility & SEO)",
    },
    {
      name: "caption",
      type: "text",
      label: "Caption / Credit",
    },
  ],
};
