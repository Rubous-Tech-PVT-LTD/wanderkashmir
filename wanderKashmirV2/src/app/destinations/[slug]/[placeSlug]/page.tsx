import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  Camera,
  Landmark,
  Sparkles,
  ArrowRight,
  BookOpen,
  Compass,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import prisma from "@/lib/prisma";

// ISR: 1-hour cache for destination place detail. Admin updates trigger on-demand revalidation.
export const revalidate = 3600;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageParams {
  slug: string;
  placeSlug: string;
}

interface ResolvedEntity {
  destination: {
    id: string;
    slug: string;
    name: string;
  };
  place: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    status: string;
  };
  relatedPlaces: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    description: string | null;
  }>;
  relatedGuides: Array<{
    id: string;
    slug: string;
    title: string;
    h1Heading: string;
    description: string | null;
    imageUrl: string | null;
  }>;
  relatedTours: Array<{
    id: string;
    title: string;
    slug: string;
    duration: string;
    price: number;
    images: string[];
    badge: string | null;
  }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseDescriptionSections(descriptionText: string) {
  const rawParagraphs = descriptionText
    .split(/\r?\n\r?\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const sections: Array<{ heading?: string; paragraphs: string[] }> = [];
  let currentHeading: string | undefined = undefined;
  let currentParagraphs: string[] = [];

  for (const block of rawParagraphs) {
    const lines = block
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    // If block is a short title line (under 65 chars, no terminal period), treat as section header
    if (lines.length === 1 && lines[0].length < 65 && !lines[0].endsWith(".")) {
      if (currentParagraphs.length > 0) {
        sections.push({ heading: currentHeading, paragraphs: currentParagraphs });
        currentParagraphs = [];
      }
      currentHeading = lines[0];
    } else {
      currentParagraphs.push(block);
    }
  }

  if (currentParagraphs.length > 0) {
    sections.push({ heading: currentHeading, paragraphs: currentParagraphs });
  }

  return sections;
}

// ─── Data Loader (Strictly Read-Only — Zero GET Mutations) ───────────────────

/**
 * Resolve the entity strictly via:
 *   SeoLandingPage (type=DESTINATION, workflowState=PUBLISHED, slug=destinationSlug)
 *     → DestinationPlace (destinationId = SeoLandingPage.id)
 *       → Place (slug=placeSlug, status=ACTIVE)
 *
 * All database operations are strictly READ-ONLY. No mutation is executed on GET.
 */
const resolveEntity = cache(
  async (destinationSlug: string, placeSlug: string): Promise<ResolvedEntity | null> => {
    // 1. Load the destination page including its joined active places
    const destination = await prisma.seoLandingPage.findUnique({
      where: { slug: destinationSlug },
      select: {
        id: true,
        slug: true,
        type: true,
        workflowState: true,
        title: true,
        h1Heading: true,
        places: {
          orderBy: { displayOrder: "asc" },
          include: {
            place: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                imageUrl: true,
                status: true,
              },
            },
          },
        },
      },
    });

    // Destination must exist, be type DESTINATION, and be PUBLISHED
    if (
      !destination ||
      destination.type !== "DESTINATION" ||
      destination.workflowState !== "PUBLISHED"
    ) {
      return null;
    }

    // 2. Find the specific linked place
    let place: ResolvedEntity["place"] | null = null;
    const linkedEntry = destination.places.find(
      (dp: (typeof destination.places)[number]) => dp.place.slug === placeSlug
    );

    if (linkedEntry) {
      place = linkedEntry.place;
    } else {
      // Graceful read-only fallback: check if Place exists in the Place table without mutating DB
      const dbPlace = await prisma.place.findFirst({
        where: {
          slug: placeSlug,
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          imageUrl: true,
          status: true,
          destination: true,
        },
      });

      if (dbPlace) {
        // Validate destination context matches
        const matchesDestination =
          !dbPlace.destination ||
          dbPlace.destination.toLowerCase() === destinationSlug.toLowerCase() ||
          (destination.title &&
            destination.title.toLowerCase().includes(dbPlace.destination.toLowerCase()));

        if (matchesDestination) {
          place = {
            id: dbPlace.id,
            name: dbPlace.name,
            slug: dbPlace.slug,
            description: dbPlace.description,
            imageUrl: dbPlace.imageUrl,
            status: dbPlace.status,
          };
        }
      }
    }

    if (!place || place.status !== "ACTIVE") {
      return null;
    }

    // 3. Related places: same destination, exclude current, ACTIVE only
    const relatedPlaces = destination.places
      .filter(
        (dp: (typeof destination.places)[number]) =>
          dp.place.slug !== placeSlug && dp.place.status === "ACTIVE"
      )
      .map((dp: (typeof destination.places)[number]) => ({
        id: dp.place.id,
        name: dp.place.name,
        slug: dp.place.slug,
        imageUrl: dp.place.imageUrl,
        description: dp.place.description,
      }));

    // 4. Derive clean destination display name
    const destinationName =
      destination.h1Heading ||
      (destination.title
        ? destination.title
            .split("|")[0]
            .replace(/\s*Travel Guide.*$/i, "")
            .trim()
        : destination.slug.charAt(0).toUpperCase() + destination.slug.slice(1));

    // 5. Related Travel Guides (strictly PUBLISHED BLOGs)
    const relatedGuides = await prisma.seoLandingPage.findMany({
      where: {
        type: "BLOG",
        workflowState: "PUBLISHED",
        OR: [
          { title: { contains: destinationName, mode: "insensitive" } },
          { slug: { contains: destinationSlug, mode: "insensitive" } },
        ],
      },
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        h1Heading: true,
        description: true,
        imageUrl: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // 6. Related Tours covering this destination
    const relatedTours = await prisma.tour.findMany({
      where: {
        isLive: true,
        OR: [
          { destinations: { has: destinationName } },
          { destinations: { has: destinationSlug } },
        ],
      },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        duration: true,
        price: true,
        images: true,
        badge: true,
      },
      orderBy: { isPopular: "desc" },
    });

    return {
      destination: {
        id: destination.id,
        slug: destination.slug,
        name: destinationName,
      },
      place,
      relatedPlaces,
      relatedGuides,
      relatedTours,
    };
  }
);

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug, placeSlug } = await params;
  const entity = await resolveEntity(slug, placeSlug);

  if (!entity) {
    return {
      title: "Place Not Found | WanderKashmir",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `https://www.wanderkashmir.com/destinations/${entity.destination.slug}/${entity.place.slug}`;
  const metaDescription = entity.place.description
    ? entity.place.description.slice(0, 160)
    : undefined;

  return {
    title: `${entity.place.name}, ${entity.destination.name} | WanderKashmir`,
    ...(metaDescription !== undefined && { description: metaDescription }),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${entity.place.name}, ${entity.destination.name} | WanderKashmir`,
      ...(metaDescription !== undefined && { description: metaDescription }),
      url: canonicalUrl,
      ...(entity.place.imageUrl && { images: [entity.place.imageUrl] }),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${entity.place.name}, ${entity.destination.name} | WanderKashmir`,
      ...(metaDescription !== undefined && { description: metaDescription }),
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function PlaceEntityPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug, placeSlug } = await params;
  const entity = await resolveEntity(slug, placeSlug);

  if (!entity) {
    notFound();
  }

  const { destination, place, relatedPlaces, relatedGuides, relatedTours } = entity;

  const canonicalOrigin = "https://www.wanderkashmir.com";
  const canonicalUrl = `${canonicalOrigin}/destinations/${destination.slug}/${place.slug}`;

  // Structured Data: BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: canonicalOrigin },
      {
        "@type": "ListItem",
        position: 2,
        name: "Destinations",
        item: `${canonicalOrigin}/destinations`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: destination.name,
        item: `${canonicalOrigin}/destinations/${destination.slug}`,
      },
      { "@type": "ListItem", position: 4, name: place.name, item: canonicalUrl },
    ],
  };

  // Structured Data: TouristAttraction
  const attractionSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: place.name,
    url: canonicalUrl,
    ...(place.description && { description: place.description }),
    ...(place.imageUrl && { image: place.imageUrl }),
    containedInPlace: {
      "@type": "TouristDestination",
      name: destination.name,
      url: `${canonicalOrigin}/destinations/${destination.slug}`,
    },
  };

  // Parse structured sections from plain description text
  const structuredSections = place.description
    ? parseDescriptionSections(place.description)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={attractionSchema} />

      <Navbar />

      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-8 pt-22 sm:pt-26 pb-20">
        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-slate-500 mb-6 sm:mb-8"
        >
          <Link
            href="/"
            className="hover:text-emerald-700 transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link
            href="/destinations"
            className="hover:text-emerald-700 transition-colors"
          >
            Destinations
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <Link
            href={`/destinations/${destination.slug}`}
            className="hover:text-emerald-700 transition-colors truncate max-w-[140px] sm:max-w-none"
          >
            {destination.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-slate-900 font-medium truncate">
            {place.name}
          </span>
        </nav>

        {/* ── Entity Header ───────────────────────────────────────────────── */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-3">
            <Link
              href={`/destinations/${destination.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 hover:bg-emerald-100 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{destination.name}</span>
            </Link>

            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-200/70 text-slate-700">
              Verified Heritage
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 font-display tracking-tight leading-tight">
            {place.name}
          </h1>
        </div>

        {/* ── Visual Showcase (Prepared for Future Bento Gallery Integration) ─ */}
        <div className="mb-10 sm:mb-12">
          {place.imageUrl ? (
            <div className="relative w-full aspect-[16/8] sm:aspect-[16/7] rounded-3xl overflow-hidden bg-slate-100 shadow-md border border-slate-200">
              <Image
                src={place.imageUrl}
                alt={`${place.name} in ${destination.name}`}
                fill
                priority
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 1120px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-white text-xs">
                <span className="font-semibold drop-shadow-sm flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-300" />
                  <span>{place.name} &bull; Verified Photography</span>
                </span>
                <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider">
                  Featured View
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-[16/7] rounded-3xl bg-slate-100 border border-dashed border-slate-200 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <MapPin className="w-10 h-10 stroke-[1.5]" />
                <span className="text-sm font-medium">Verified photography coming soon</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Key Highlights Strip ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 sm:mb-14">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Region
              </span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">
                {destination.name}, Kashmir
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Attraction Type
              </span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">
                Heritage Mughal Garden
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Heritage Status
              </span>
              <span className="text-sm font-bold text-slate-900 block mt-0.5">
                Verified Sightseeing Asset
              </span>
            </div>
          </div>
        </div>

        {/* ── Editorial Description & Story ───────────────────────────────── */}
        <section className="mb-14 sm:mb-16">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight mb-6 pb-4 border-b border-slate-100 flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-emerald-700" />
              <span>About {place.name}</span>
            </h2>

            {structuredSections.length > 0 ? (
              <div className="space-y-8">
                {structuredSections.map((sec, idx) => (
                  <div key={idx} className="space-y-3">
                    {sec.heading && (
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display tracking-tight text-emerald-900">
                        {sec.heading}
                      </h3>
                    )}
                    <div className="space-y-4">
                      {sec.paragraphs.map((para, pIdx) => (
                        <p
                          key={pIdx}
                          className="font-sans text-sm sm:text-base text-slate-600 leading-relaxed"
                        >
                          {para}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
                <p className="text-slate-500 font-medium font-sans text-sm sm:text-base">
                  Full heritage description and seasonal visitor notes are being prepared.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Related Travel Guides ────────────────────────────────────────── */}
        {relatedGuides.length > 0 && (
          <section id="travel-guides" className="mb-14 sm:mb-16">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
                  Related Travel Guides
                </h2>
              </div>
              <Link
                href="/blog"
                className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1"
              >
                <span>View all articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.id}
                  href={`/blog/${guide.slug}`}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    {guide.imageUrl ? (
                      <Image
                        src={guide.imageUrl}
                        alt={guide.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <BookOpen className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                      {guide.title}
                    </h3>
                    {guide.description && (
                      <p className="text-slate-600 text-xs sm:text-sm mt-2 line-clamp-2 leading-relaxed">
                        {guide.description}
                      </p>
                    )}
                    <span className="mt-auto pt-3 text-xs font-bold text-emerald-700 flex items-center gap-1">
                      Read Guide →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Related Tour Packages ────────────────────────────────────────── */}
        {relatedTours.length > 0 && (
          <section id="related-tours" className="mb-14 sm:mb-16">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
                  Tours Featuring {destination.name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Verified Kashmir tour packages covering this destination.
                </p>
              </div>
              <Link
                href="/tours"
                className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1"
              >
                <span>All tours</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedTours.map((tour) => (
                <Link
                  key={tour.id}
                  href={`/tours/${tour.slug}`}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                    {tour.images && tour.images.length > 0 ? (
                      <Image
                        src={tour.images[0]}
                        alt={tour.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Compass className="w-8 h-8" />
                      </div>
                    )}
                    {tour.badge && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white backdrop-blur-md">
                        {tour.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-xs font-semibold text-emerald-700 mb-1">
                      {tour.duration}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                      {tour.title}
                    </h3>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          From
                        </span>
                        <span className="text-base font-extrabold text-slate-900">
                          ₹{tour.price.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        View Itinerary →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Related Places in Destination ────────────────────────────────── */}
        <section id="related-places" className="mb-14 sm:mb-16">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
              More Places in {destination.name}
            </h2>
            <Link
              href="/places"
              className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1"
            >
              <span>All places in Kashmir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {relatedPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPlaces.map((related) => (
                <Link
                  key={related.id}
                  href={`/destinations/${destination.slug}/${related.slug}`}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md transition-all"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    {related.imageUrl ? (
                      <Image
                        src={related.imageUrl}
                        alt={related.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <MapPin className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-700 transition-colors mb-1.5">
                      {related.name}
                    </h3>
                    {related.description && (
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2">
                        {related.description}
                      </p>
                    )}
                    <span className="mt-auto pt-3 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      Explore Attraction →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-3 min-h-[160px]">
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-2 shadow-2xs">
                <MapPin className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-slate-500 font-medium font-sans text-sm sm:text-base">
                Additional attractions in {destination.name} will be added shortly.
              </p>
            </div>
          )}
        </section>

        {/* ── Back Navigation ─────────────────────────────────────────────── */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4">
          <Link
            href={`/destinations/${destination.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span>Back to {destination.name} Travel Guide</span>
          </Link>

          <Link
            href="/places"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>Explore All Kashmir Places</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
