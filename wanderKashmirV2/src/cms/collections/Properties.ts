export const PropertiesCollection = {
  slug: "properties",
  labels: {
    singular: "Property / Stay",
    plural: "Properties & Stays",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "location", "pricePerNight", "type"],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Property Name",
    },
    {
      name: "location",
      type: "text",
      required: true,
      label: "Location Address",
    },
    {
      name: "pricePerNight",
      type: "number",
      required: true,
      label: "Starting Price / Night (₹)",
    },
    {
      name: "type",
      type: "select",
      defaultValue: "HOTEL",
      options: [
        { label: "Hotel / Resort", value: "HOTEL" },
        { label: "Homestay / Houseboat", value: "HOMESTAY" },
      ],
      label: "Property Category",
    },
    {
      name: "editorialRating",
      type: "number",
      label: "Editorial Rating (e.g. 4.8)",
      min: 1,
      max: 5,
    },
    {
      name: "images",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      label: "Property Images",
    },
  ],
};
