export const ToursCollection = {
  slug: "tours",
  labels: {
    singular: "Tour Package",
    plural: "Tour Packages",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "duration", "price", "isLive"],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Tour Title",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "Slug",
    },
    {
      name: "duration",
      type: "text",
      required: true,
      label: "Duration (e.g. 7D/6N)",
    },
    {
      name: "price",
      type: "number",
      required: true,
      label: "Starting Price (₹)",
    },
    {
      name: "isLive",
      type: "checkbox",
      defaultValue: true,
      label: "Published & Active",
    },
    {
      name: "images",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      label: "Gallery / Hero Images",
    },
  ],
};
