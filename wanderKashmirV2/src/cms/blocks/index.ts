export interface DynamicSectionBlock {
  blockType: string;
  id?: string;
  sectionTitle?: string;
  sectionSubtitle?: string;
  isVisible?: boolean;
  displayOrder?: number;
  [key: string]: any;
}

export const RichContentBlock = {
  slug: "richContent",
  labels: {
    singular: "Rich Content Block",
    plural: "Rich Content Blocks",
  },
  fields: [
    {
      name: "sectionTitle",
      type: "text",
      label: "Section Title",
      required: true,
    },
    {
      name: "sectionSubtitle",
      type: "text",
      label: "Section Subtitle / Description",
    },
    {
      name: "content",
      type: "richText",
      label: "Content",
      required: true,
    },
    {
      name: "displayOrder",
      type: "number",
      defaultValue: 100,
      label: "Display Order",
    },
    {
      name: "isVisible",
      type: "checkbox",
      defaultValue: true,
      label: "Visible",
    },
  ],
};

export const ImageTextBlock = {
  slug: "imageText",
  labels: {
    singular: "Image + Text Block",
    plural: "Image + Text Blocks",
  },
  fields: [
    {
      name: "sectionTitle",
      type: "text",
      label: "Section Title",
      required: true,
    },
    {
      name: "layout",
      type: "select",
      defaultValue: "imageLeft",
      options: [
        { label: "Image on Left", value: "imageLeft" },
        { label: "Image on Right", value: "imageRight" },
      ],
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      label: "Image",
    },
    {
      name: "content",
      type: "richText",
      label: "Content",
      required: true,
    },
    {
      name: "displayOrder",
      type: "number",
      defaultValue: 100,
      label: "Display Order",
    },
    {
      name: "isVisible",
      type: "checkbox",
      defaultValue: true,
      label: "Visible",
    },
  ],
};

export const LocalCultureBlock = {
  slug: "localCulture",
  labels: {
    singular: "Local Culture & Heritage",
    plural: "Local Culture & Heritage",
  },
  fields: [
    {
      name: "sectionTitle",
      type: "text",
      label: "Section Title",
      defaultValue: "Local Culture & Traditions",
      required: true,
    },
    {
      name: "sectionSubtitle",
      type: "text",
      label: "Section Subtitle",
      defaultValue: "Immerse in the rich traditions, crafts, and heritage of this region.",
    },
    {
      name: "items",
      type: "array",
      label: "Cultural Highlights",
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          label: "Aspect / Tradition Title",
        },
        {
          name: "description",
          type: "textarea",
          required: true,
          label: "Description",
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "Optional Photo",
        },
      ],
    },
    {
      name: "displayOrder",
      type: "number",
      defaultValue: 85,
      label: "Display Order",
    },
    {
      name: "isVisible",
      type: "checkbox",
      defaultValue: true,
      label: "Visible",
    },
  ],
};

export const PhotographySpotsBlock = {
  slug: "photographySpots",
  labels: {
    singular: "Top Photography Spots",
    plural: "Top Photography Spots",
  },
  fields: [
    {
      name: "sectionTitle",
      type: "text",
      label: "Section Title",
      defaultValue: "Top Photography & Sunset Spots",
      required: true,
    },
    {
      name: "sectionSubtitle",
      type: "text",
      label: "Section Subtitle",
      defaultValue: "Scenic vantage points and photogenic frames worth capturing.",
    },
    {
      name: "spots",
      type: "array",
      label: "Photo Spots",
      fields: [
        {
          name: "spotName",
          type: "text",
          required: true,
          label: "Spot Name",
        },
        {
          name: "bestTime",
          type: "text",
          label: "Best Time (e.g. Golden Hour, Sunrise, Sunset)",
        },
        {
          name: "tip",
          type: "textarea",
          label: "Photography Tip",
        },
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          label: "Sample Photo",
        },
      ],
    },
    {
      name: "displayOrder",
      type: "number",
      defaultValue: 86,
      label: "Display Order",
    },
    {
      name: "isVisible",
      type: "checkbox",
      defaultValue: true,
      label: "Visible",
    },
  ],
};

export const TravelTipsBlock = {
  slug: "travelTips",
  labels: {
    singular: "Travel Tips & Practical Info",
    plural: "Travel Tips & Practical Info",
  },
  fields: [
    {
      name: "sectionTitle",
      type: "text",
      label: "Section Title",
      defaultValue: "Essential Travel Tips & Guidelines",
      required: true,
    },
    {
      name: "sectionSubtitle",
      type: "text",
      label: "Section Subtitle",
      defaultValue: "Practical advice for a smooth, hassle-free visit.",
    },
    {
      name: "tips",
      type: "array",
      label: "Tips List",
      fields: [
        {
          name: "category",
          type: "text",
          label: "Category (e.g. Weather, Clothing, Permitting, Transport)",
        },
        {
          name: "tip",
          type: "textarea",
          required: true,
          label: "Tip Detail",
        },
      ],
    },
    {
      name: "displayOrder",
      type: "number",
      defaultValue: 95,
      label: "Display Order",
    },
    {
      name: "isVisible",
      type: "checkbox",
      defaultValue: true,
      label: "Visible",
    },
  ],
};

export const CalloutBlock = {
  slug: "callout",
  labels: {
    singular: "Important Callout",
    plural: "Important Callouts",
  },
  fields: [
    {
      name: "type",
      type: "select",
      defaultValue: "info",
      options: [
        { label: "Information", value: "info" },
        { label: "Warning / Advisory", value: "warning" },
        { label: "Highlight / Insider Tip", value: "tip" },
      ],
    },
    {
      name: "title",
      type: "text",
      label: "Callout Title",
      required: true,
    },
    {
      name: "message",
      type: "textarea",
      label: "Message Content",
      required: true,
    },
    {
      name: "displayOrder",
      type: "number",
      defaultValue: 50,
      label: "Display Order",
    },
    {
      name: "isVisible",
      type: "checkbox",
      defaultValue: true,
      label: "Visible",
    },
  ],
};

export const DestinationBlocks = [
  RichContentBlock,
  ImageTextBlock,
  LocalCultureBlock,
  PhotographySpotsBlock,
  TravelTipsBlock,
  CalloutBlock,
];
