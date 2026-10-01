import { DestinationBlocks } from "../blocks";
import { SectionRichContent, RichContentNode } from "@/components/destinations/RichContentRenderer";

export interface DestinationCmsDoc {
  id: string;
  slug: string;
  title: string;
  h1Heading: string;
  description?: string;
  
  // Media Gallery (Multiple Media assets for TourBentoGallery)
  gallery?: Array<{
    id?: string;
    url: string;
    alt?: string;
    caption?: string;
  }>;
  
  // Dedicated Structured Rich Content Fields (Structured Blocks & Markdown)
  overview?: SectionRichContent;
  bestTimeToVisit?: SectionRichContent;
  itinerary?: SectionRichContent;
  howToReach?: SectionRichContent;
  food?: SectionRichContent;
  shopping?: SectionRichContent;
  activities?: SectionRichContent;
  nearbyPlacesContent?: SectionRichContent;

  // First-Class Explicit Relationships
  places?: Array<any>;
  featuredProperties?: Array<any>;
  featuredTours?: Array<any>;
  nearbyDestinations?: Array<any>;

  // Structured FAQs
  faqs?: Array<{
    question: string;
    answer: string;
  }>;

  // Future-Proof Dynamic Sections
  dynamicSections?: Array<any>;

  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: any;

  createdAt?: string;
  updatedAt?: string;
}

export const DestinationsCollection = {
  slug: "destinations",
  labels: {
    singular: "Destination",
    plural: "Destinations",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "h1Heading", "updatedAt"],
  },
  fields: [
    // 1. Identity
    {
      name: "title",
      type: "text",
      required: true,
      label: "Destination Title (e.g. Srinagar)",
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      label: "Slug / Route (e.g. srinagar)",
    },
    {
      name: "h1Heading",
      type: "text",
      required: true,
      label: "H1 Main Heading (e.g. Srinagar Travel Guide)",
    },
    {
      name: "description",
      type: "textarea",
      label: "Hero Subtitle / Lead Description",
    },

    // 2. Media Gallery (Bento Gallery)
    {
      name: "gallery",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      label: "Hero Bento Gallery (Upload 1-5 Photos)",
    },

    // 3. Dedicated Structured Content Fields
    {
      type: "tabs",
      tabs: [
        {
          label: "Core Sections",
          fields: [
            {
              name: "overview",
              type: "richText",
              label: "Overview (Displayed immediately below Hero)",
            },
            {
              name: "bestTimeToVisit",
              type: "richText",
              label: "Best Time to Visit",
            },
            {
              name: "itinerary",
              type: "richText",
              label: "Suggested Itinerary",
            },
            {
              name: "howToReach",
              type: "richText",
              label: "How to Reach",
            },
            {
              name: "food",
              type: "richText",
              label: "Local Food & Cuisine",
            },
            {
              name: "shopping",
              type: "richText",
              label: "Local Shopping & Souvenirs",
            },
            {
              name: "activities",
              type: "richText",
              label: "Activities & Top Things to Do",
            },
            {
              name: "nearbyPlacesContent",
              type: "richText",
              label: "Nearby Places Guide / Excursions",
            },
          ],
        },
        {
          label: "Relationships",
          fields: [
            {
              name: "places",
              type: "relationship",
              relationTo: "places",
              hasMany: true,
              label: "Places to Visit (Ordered)",
            },
            {
              name: "featuredProperties",
              type: "relationship",
              relationTo: "properties",
              hasMany: true,
              label: "Featured Where to Stay Accommodations",
            },
            {
              name: "featuredTours",
              type: "relationship",
              relationTo: "tours",
              hasMany: true,
              label: "Featured Tour Packages",
            },
            {
              name: "nearbyDestinations",
              type: "relationship",
              relationTo: "destinations",
              hasMany: true,
              label: "Nearby Destinations (Linked Cards)",
            },
          ],
        },
        {
          label: "FAQs",
          fields: [
            {
              name: "faqs",
              type: "array",
              label: "Frequently Asked Questions",
              fields: [
                {
                  name: "question",
                  type: "text",
                  required: true,
                  label: "Question",
                },
                {
                  name: "answer",
                  type: "textarea",
                  required: true,
                  label: "Answer",
                },
              ],
            },
          ],
        },
        {
          label: "Dynamic Sections",
          fields: [
            {
              name: "dynamicSections",
              type: "blocks",
              blocks: DestinationBlocks,
              label: "Future-Proof Dynamic CMS Sections",
            },
          ],
        },
        {
          label: "SEO & Social",
          fields: [
            {
              name: "metaTitle",
              type: "text",
              label: "Meta Title",
            },
            {
              name: "metaDescription",
              type: "textarea",
              label: "Meta Description",
            },
            {
              name: "canonicalUrl",
              type: "text",
              label: "Canonical URL override (optional)",
            },
            {
              name: "ogImage",
              type: "upload",
              relationTo: "media",
              label: "OpenGraph Social Share Image",
            },
          ],
        },
      ],
    },
  ],
};
