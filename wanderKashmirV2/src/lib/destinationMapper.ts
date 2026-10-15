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

export interface NearbyPlaceItemConfig {
  id: string;
  type: "database" | "custom";
  placeId?: string;
  name?: string;
  description?: string | null;
  url?: string | null;
}

export interface NearbyPlacesConfig {
  introContent?: string | null;
  items: NearbyPlaceItemConfig[];
}

export interface DestinationNearbyPlaceItem {
  id: string;
  type: "database" | "custom";
  name: string;
  description: string | null;
  imageUrl?: string | null;
  canonicalUrl: string | null;
  destinationContext?: string | null;
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
  nearbyPlaces: DestinationNearbyPlaceItem[];

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

  return mapDestinationDoc(page);
}

export async function mapDestinationDoc(
  page: any,
  customCmsDoc?: any
): Promise<DestinationPageData> {
  // 1. Extract Structured CMS Document (stored in seoStrategy or dedicated CMS payload)
  const cmsDoc: any =
    customCmsDoc ||
    (typeof page.seoStrategy === "object" && page.seoStrategy !== null
      ? page.seoStrategy
      : {});

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
        .map((id: string) => props.find((p: (typeof props)[number]) => p.id === id))
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
        .map((id: string) => tours.find((t: (typeof tours)[number]) => t.id === id))
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
        .map((s: string) => nearbyPages.find((p: (typeof nearbyPages)[number]) => p.slug === s))
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

  const nearbyPlacesPromise = (async (): Promise<DestinationNearbyPlaceItem[]> => {
    const rawConfig = cmsDoc.nearbyPlacesConfig;
    const items: NearbyPlaceItemConfig[] =
      rawConfig && Array.isArray(rawConfig.items) ? rawConfig.items : [];

    if (items.length === 0) {
      return [];
    }

    // Collect all database placeIds to resolve in a single batch query (avoid N+1)
    const dbPlaceIds = items
      .filter((it) => it.type === "database" && it.placeId)
      .map((it) => it.placeId as string);

    const placesMap = new Map<string, any>();
    if (dbPlaceIds.length > 0) {
      const dbPlaces = await prisma.place.findMany({
        where: {
          id: { in: dbPlaceIds },
          status: "ACTIVE",
        },
        include: {
          destinationPlaces: {
            include: {
              destination: {
                select: { id: true, slug: true, title: true, workflowState: true },
              },
            },
          },
        },
      });

      for (const p of dbPlaces) {
        placesMap.set(p.id, p);
      }
    }

    const missingPlaceIds = dbPlaceIds.filter((id) => !placesMap.has(id));
    const destsMap = new Map<string, any>();
    if (missingPlaceIds.length > 0) {
      const dbDests = await prisma.seoLandingPage.findMany({
        where: {
          id: { in: missingPlaceIds },
          type: "DESTINATION",
          workflowState: "PUBLISHED",
        },
        select: { id: true, slug: true, title: true, h1Heading: true, description: true, imageUrl: true },
      });
      for (const d of dbDests) {
        destsMap.set(d.id, d);
      }
    }

    const resolvedItems: DestinationNearbyPlaceItem[] = [];

    for (const item of items) {
      if (item.type === "database" && item.placeId) {
        const place = placesMap.get(item.placeId);
        if (place) {
          // Resolve canonical destination link safely
          const currentLink = place.destinationPlaces?.find(
            (dp: any) =>
              dp.destination?.slug === page.slug && dp.destination?.workflowState === "PUBLISHED"
          );
          const otherPublishedLink = place.destinationPlaces?.find(
            (dp: any) => dp.destination?.workflowState === "PUBLISHED"
          );
          const resolvedDest = currentLink?.destination || otherPublishedLink?.destination;

          const canonicalUrl = resolvedDest
            ? `/destinations/${resolvedDest.slug}/${place.slug}`
            : null;

          const destinationContext = resolvedDest?.title || place.destination || null;

          resolvedItems.push({
            id: item.id || `db-${place.id}`,
            type: "database",
            name: place.name,
            description: place.description || null,
            imageUrl: place.imageUrl || null,
            canonicalUrl,
            destinationContext,
          });
          continue;
        }

        const dest = destsMap.get(item.placeId);
        if (dest) {
          const cleanName =
            dest.title?.split("|")[0]?.replace(/Travel Guide/i, "")?.trim() || dest.h1Heading;
          resolvedItems.push({
            id: item.id || `db-${dest.id}`,
            type: "database",
            name: cleanName,
            description: dest.description?.replace(/^Meta\s*Description:\s*/i, "") || null,
            imageUrl: dest.imageUrl || null,
            canonicalUrl: `/destinations/${dest.slug}`,
            destinationContext: "Major Destination",
          });
          continue;
        }
      } else if (item.type === "custom" && item.name?.trim()) {
        let safeUrl: string | null = null;
        if (item.url && typeof item.url === "string") {
          const trimmed = item.url.trim();
          if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("javascript:")) {
            safeUrl = trimmed;
          } else if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            try {
              const parsed = new URL(trimmed);
              if (parsed.protocol === "http:" || parsed.protocol === "https:") {
                safeUrl = parsed.toString();
              }
            } catch {
              safeUrl = null;
            }
          }
        }

        resolvedItems.push({
          id: item.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: "custom",
          name: item.name.trim(),
          description: item.description?.trim() || null,
          imageUrl: null,
          canonicalUrl: safeUrl,
          destinationContext: null,
        });
      }
    }

    return resolvedItems;
  })();

  const [featuredProperties, featuredTours, nearbyDestinations, nearbyPlaces] = await Promise.all([
    propertiesPromise,
    toursPromise,
    nearbyPromise,
    nearbyPlacesPromise,
  ]);

  // 7. Structured Content Fields (Dedicated CMS fields, no regex parsing!)
  const overview = cmsDoc.overview || page.content || "";
  const bestTimeToVisit = cmsDoc.bestTimeToVisit || null;
  const itinerary = cmsDoc.itinerary || null;
  const howToReach = cmsDoc.howToReach || null;
  const food = cmsDoc.food || null;
  const shopping = cmsDoc.shopping || null;
  const activities = cmsDoc.activities || null;
  const nearbyPlacesContent =
    cmsDoc.nearbyPlacesConfig?.introContent !== undefined
      ? cmsDoc.nearbyPlacesConfig.introContent
      : (cmsDoc.nearbyPlacesContent || null);

  // 8. FAQs (Structured array)
  const faqs: DestinationFaqItem[] = Array.isArray(cmsDoc.faqs) && cmsDoc.faqs.length > 0
    ? cmsDoc.faqs
    : (page.faqs as unknown as DestinationFaqItem[]) || [];

  // 9. Dynamic Sections / Blocks
  const dynamicSections = Array.isArray(cmsDoc.dynamicSections)
    ? cmsDoc.dynamicSections
    : [];

  // 10. SEO Metadata
  let canonicalUrl = `https://www.wanderkashmir.com/destinations/${page.slug}`;
  if (
    cmsDoc.canonicalUrl &&
    typeof cmsDoc.canonicalUrl === "string" &&
    cmsDoc.canonicalUrl.startsWith("https://www.wanderkashmir.com/")
  ) {
    canonicalUrl = cmsDoc.canonicalUrl;
  }
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
    nearbyPlaces,
    places,
    featuredProperties,
    featuredTours,
    nearbyDestinations,
    faqs,
    dynamicSections,
    seo,
  };
}
