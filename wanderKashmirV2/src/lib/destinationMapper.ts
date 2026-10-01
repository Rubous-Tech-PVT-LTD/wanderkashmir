import prisma from "./prisma";
import { getValidImageUrl } from "./imageUtils";

export interface DestinationPlaceItem {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  destination?: string | null;
  description?: string | null;
}

export interface DestinationPropertyItem {
  id: string;
  name: string;
  location: string;
  pricePerNight: number;
  images: string[];
  type?: string; // 'HOTEL' | 'HOMESTAY'
  rating?: number | null;
}

export interface DestinationTourItem {
  id: string;
  title: string;
  slug: string;
  duration: string;
  price: number;
  images?: string[];
  heroImage?: string | null;
}

export interface DestinationNearbyItem {
  id: string;
  title: string;
  slug: string;
  imageUrl?: string | null;
  description?: string | null;
}

export interface DestinationFaqItem {
  question: string;
  answer: string;
}

export type RichContentNode =
  | { type: "heading"; level?: 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "image"; url: string; alt?: string; caption?: string; layout?: "full" | "inline-left" | "inline-right" }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "list"; style?: "bullet" | "numbered"; items: string[] }
  | { type: "callout"; variant?: "info" | "tip" | "warning" | "quote"; title?: string; text: string }
  | { type: "link"; text: string; url: string; openInNewTab?: boolean; style?: "button" | "inline" }
  | { type: "video"; url: string; title?: string; caption?: string };

export type SectionRichContent = 
  | string 
  | { text?: string; blocks?: RichContentNode[] } 
  | RichContentNode[] 
  | null 
  | undefined;

export interface DestinationPageData {
  id: string;
  slug: string;
  title: string;
  cleanName: string;
  h1Heading: string;
  description: string;

  // Media Gallery (replaces hardcoded Unsplash fallbacks)
  gallery: Array<{
    url: string;
    alt?: string;
    caption?: string;
  }>;

  // Dedicated Structured Rich Content Sections
  overview: SectionRichContent;
  bestTimeToVisit: SectionRichContent;
  itinerary: SectionRichContent;
  howToReach: SectionRichContent;
  food: SectionRichContent;
  shopping: SectionRichContent;
  activities: SectionRichContent;
  nearbyPlacesContent: SectionRichContent;

  // First-Class Explicit Relationships
  places: DestinationPlaceItem[];
  featuredProperties: DestinationPropertyItem[];
  featuredTours: DestinationTourItem[];
  nearbyDestinations: DestinationNearbyItem[];

  // FAQs
  faqs: DestinationFaqItem[];

  // Future-Proof Dynamic CMS Sections (Ordered)
  dynamicSections: any[];

  // SEO & Meta
  seo: {
    title: string;
    description: string;
    canonicalUrl: string;
    ogImage?: string;
  };
}

/**
 * Destination Data Mapper
 * Fetches structured CMS / database destination data and transforms it into
 * clean, predictable DestinationPageData for the locked template.
 */
export async function getDestinationData(slug: string): Promise<DestinationPageData | null> {
  const page = await prisma.seoLandingPage.findUnique({
    where: { slug },
    include: {
      places: {
        orderBy: { displayOrder: "asc" },
        include: { place: true },
      },
    },
  });

  if (
    !page ||
    page.type !== "DESTINATION" ||
    page.workflowState !== "PUBLISHED"
  ) {
    return null;
  }

  // 1. Extract Structured CMS Document (stored in seoStrategy or dedicated CMS payload)
  const cmsDoc: any = (typeof page.seoStrategy === "object" && page.seoStrategy !== null)
    ? page.seoStrategy
    : {};

  // 2. Resolve Canonical Destination Clean Name
  const cleanName = cmsDoc.cleanName || (page.title ? page.title.split("|")[0].replace(/\s*Travel Guide.*$/i, "").trim() : "") || (page.slug.charAt(0).toUpperCase() + page.slug.slice(1));

  // 3. Map Media Gallery (replaces hardcoded Unsplash fallbacks)
  const gallery: Array<{ url: string; alt?: string; caption?: string }> = [];
  if (Array.isArray(cmsDoc.gallery) && cmsDoc.gallery.length > 0) {
    cmsDoc.gallery.forEach((img: any) => {
      if (typeof img === "string") {
        gallery.push({ url: img, alt: page.h1Heading });
      } else if (img && img.url) {
        gallery.push({
          url: img.url,
          alt: img.alt || page.h1Heading,
          caption: img.caption,
        });
      }
    });
  } else if (page.imageUrl) {
    gallery.push({ url: page.imageUrl, alt: page.h1Heading });
  }

  // 4. Map Places (from cmsDoc or page)
  const places: DestinationPlaceItem[] = (
    Array.isArray(cmsDoc.places)
      ? cmsDoc.places
      : ((page as any).places || [])
  )
    .map((dp: any) => dp.place || dp)
    .filter((p: any) => p && p.status !== "INACTIVE")
    .map((p: any) => ({
      id: p.id || p.slug || p.name,
      name: p.name,
      slug: p.slug,
      imageUrl: p.imageUrl,
      destination: p.destination || page.h1Heading,
      description: p.description,
    }));

  // 5, 6, 7. Map Featured Properties, Featured Tours, and Nearby Destinations in parallel
  const propertiesPromise = (async (): Promise<DestinationPropertyItem[]> => {
    if (Array.isArray(cmsDoc.featuredPropertyIds) && cmsDoc.featuredPropertyIds.length > 0) {
      const props = await prisma.property.findMany({
        where: {
          id: { in: cmsDoc.featuredPropertyIds },
          isApproved: true,
        },
        include: { vendorProfile: true },
      });
      // Maintain explicit admin ordering
      return cmsDoc.featuredPropertyIds
        .map((id: string) => props.find((p) => p.id === id))
        .filter(Boolean)
        .map((prop: any) => ({
          id: prop.id,
          name: prop.name,
          location: prop.location,
          pricePerNight: prop.pricePerNight,
          images: prop.images || [],
          type: prop.vendorProfile?.type || "HOTEL",
          rating: cmsDoc.propertyRatings?.[prop.id] ?? null,
        }));
    } else {
      // If not explicitly selected, query properties located at this destination without heuristic word-splitting
      const props = await prisma.property.findMany({
        where: {
          isApproved: true,
          status: "APPROVED",
          location: { contains: page.slug, mode: "insensitive" },
        },
        include: { vendorProfile: true },
        take: 6,
      });
      return props.map((prop: any) => ({
        id: prop.id,
        name: prop.name,
        location: prop.location,
        pricePerNight: prop.pricePerNight,
        images: prop.images || [],
        type: prop.vendorProfile?.type || "HOTEL",
        rating: null,
      }));
    }
  })();

  const toursPromise = (async (): Promise<DestinationTourItem[]> => {
    if (Array.isArray(cmsDoc.featuredTourIds) && cmsDoc.featuredTourIds.length > 0) {
      const tours = await prisma.tour.findMany({
        where: {
          id: { in: cmsDoc.featuredTourIds },
          isLive: true,
        },
      });
      // Maintain explicit admin ordering
      return cmsDoc.featuredTourIds
        .map((id: string) => tours.find((t) => t.id === id))
        .filter(Boolean)
        .map((t: any) => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          duration: t.duration,
          price: t.price,
          images: t.images || [],
          heroImage: t.images && t.images.length > 0 ? t.images[0] : null,
        }));
    } else {
      // Exact destination match fallback using canonical destination name
      const matchTargets = Array.from(new Set([cleanName, page.h1Heading].filter(Boolean)));
      const tours = await prisma.tour.findMany({
        where: {
          isLive: true,
          OR: matchTargets.map(name => ({
            destinations: { has: name }
          }))
        },
        take: 4,
      });
      return tours.map((t: any) => ({
        id: t.id,
        title: t.title,
        slug: t.slug,
        duration: t.duration,
        price: t.price,
        images: t.images || [],
        heroImage: t.images && t.images.length > 0 ? t.images[0] : null,
      }));
    }
  })();

  const nearbyPromise = (async (): Promise<DestinationNearbyItem[]> => {
    if (Array.isArray(cmsDoc.nearbyDestinationSlugs) && cmsDoc.nearbyDestinationSlugs.length > 0) {
      const nearbyPages = await prisma.seoLandingPage.findMany({
        where: {
          slug: { in: cmsDoc.nearbyDestinationSlugs },
          type: "DESTINATION",
          workflowState: "PUBLISHED",
        },
        select: { id: true, title: true, slug: true, imageUrl: true, description: true },
      });
      return cmsDoc.nearbyDestinationSlugs
        .map((s: string) => nearbyPages.find((p) => p.slug === s))
        .filter(Boolean)
        .map((p: any) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          imageUrl: p.imageUrl,
          description: p.description?.replace(/^Meta\s*Description:\s*/i, ""),
        }));
    }
    return [];
  })();

  const [featuredProperties, featuredTours, nearbyDestinations] = await Promise.all([
    propertiesPromise,
    toursPromise,
    nearbyPromise,
  ]);

  // 7. Structured Content Fields (Dedicated CMS fields, no regex parsing!)
  const overview = cmsDoc.overview || page.content || "";
  const bestTimeToVisit = cmsDoc.bestTimeToVisit || null;
  const itinerary = cmsDoc.itinerary || null;
  const howToReach = cmsDoc.howToReach || null;
  const food = cmsDoc.food || null;
  const shopping = cmsDoc.shopping || null;
  const activities = cmsDoc.activities || null;
  const nearbyPlacesContent = cmsDoc.nearbyPlacesContent || null;

  // 8. FAQs (Structured array)
  const faqs: DestinationFaqItem[] = Array.isArray(cmsDoc.faqs) && cmsDoc.faqs.length > 0
    ? cmsDoc.faqs
    : (page.faqs as unknown as DestinationFaqItem[]) || [];

  // 9. Dynamic Sections / Blocks
  const dynamicSections = Array.isArray(cmsDoc.dynamicSections)
    ? cmsDoc.dynamicSections
    : [];

  // 10. SEO Metadata
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.wanderkashmir.com";
  const canonicalUrl = cmsDoc.canonicalUrl || `${baseUrl}/destinations/${page.slug}`;
  const seo = {
    title: cmsDoc.metaTitle || page.title,
    description: (cmsDoc.metaDescription || page.description || "").replace(/^Meta\s*Description:\s*/i, ""),
    canonicalUrl,
    ogImage: cmsDoc.ogImage?.url || page.imageUrl || undefined,
  };

  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    cleanName,
    h1Heading: page.h1Heading,
    description: (page.description || "").replace(/^Meta\s*Description:\s*/i, ""),
    gallery,
    overview,
    bestTimeToVisit,
    itinerary,
    howToReach,
    food,
    shopping,
    activities,
    nearbyPlacesContent,
    places,
    featuredProperties,
    featuredTours,
    nearbyDestinations,
    faqs,
    dynamicSections,
    seo,
  };
}
