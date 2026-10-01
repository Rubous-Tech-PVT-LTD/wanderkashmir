export interface PlaceDoc {
  id: string;
  name: string;
  slug: string;
  destination?: string | any;
  description?: string;
  image?: any;
  status: "ACTIVE" | "INACTIVE";
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const PlacesCollection = {
  slug: "places",
  labels: {
    singular: "Place to Visit",
    plural: "Places to Visit",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "destination", "status"],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Place / Attraction Name",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "URL Slug",
    },
    {
      name: "destination",
      type: "relationship",
      relationTo: "destinations",
      label: "Destination",
      required: false,
    },
    {
      name: "description",
      type: "textarea",
      label: "Short Description (shown on card)",
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Featured Image",
    },
    {
      name: "status",
      type: "select",
      defaultValue: "ACTIVE",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
      ],
      required: true,
    },
    {
      name: "displayOrder",
      type: "number",
      defaultValue: 0,
      label: "Display Order",
    },
  ],
};
