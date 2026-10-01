import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import prisma from "@/lib/prisma";

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
}

// ─── Data Loader ──────────────────────────────────────────────────────────────

/**
 * Resolve the entity strictly via:
 *   SeoLandingPage (type=DESTINATION, workflowState=PUBLISHED, slug=destinationSlug)
 *     → DestinationPlace (destinationId = SeoLandingPage.id)
 *       → Place (slug=placeSlug, status=ACTIVE)
 *
 * Returns null for any broken link, triggering notFound().
 */
async function resolveEntity(
  destinationSlug: string,
  placeSlug: string
): Promise<ResolvedEntity | null> {
  // Load the destination page including all its linked places
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

  // Find the specific DestinationPlace link for this placeSlug
  const linkedEntry = destination.places.find(
    (dp) => dp.place.slug === placeSlug
  );

  if (!linkedEntry) {
    return null;
  }

  const place = linkedEntry.place;

  // Place must be ACTIVE
  if (place.status !== "ACTIVE") {
    return null;
  }

  // Related places: same destination, exclude current, ACTIVE only
  const relatedPlaces = destination.places
    .filter(
      (dp) =>
        dp.place.slug !== placeSlug && dp.place.status === "ACTIVE"
    )
    .map((dp) => ({
      id: dp.place.id,
      name: dp.place.name,
      slug: dp.place.slug,
      imageUrl: dp.place.imageUrl,
      description: dp.place.description,
    }));

  // Derive clean destination display name from DB — no hardcoding
  const destinationName =
    destination.h1Heading ||
    (destination.title
      ? destination.title
          .split("|")[0]
          .replace(/\s*Travel Guide.*$/i, "")
          .trim()
      : destination.slug.charAt(0).toUpperCase() +
        destination.slug.slice(1));

  return {
    destination: {
      id: destination.id,
      slug: destination.slug,
      name: destinationName,
    },
    place,
    relatedPlaces,
  };
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug, placeSlug } = await params;
  const entity = await resolveEntity(slug, placeSlug);

  if (!entity) {
    return { title: "Place not found" };
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.wanderkashmir.com";
  const canonicalUrl = `${baseUrl}/destinations/${entity.destination.slug}/${entity.place.slug}`;

  // Only use real description — never invented
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
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  const { destination, place, relatedPlaces } = entity;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.wanderkashmir.com";
  const canonicalUrl = `${baseUrl}/destinations/${destination.slug}/${place.slug}`;

  // ─── Structured Data ──────────────────────────────────────────────────────
  // Only include properties for which real data exists — never invent.

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Destinations",
        item: `${baseUrl}/destinations`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: destination.name,
        item: `${baseUrl}/destinations/${destination.slug}`,
      },
      { "@type": "ListItem", position: 4, name: place.name, item: canonicalUrl },
    ],
  };

  // TouristAttraction — omit any field where real data is absent
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
      url: `${baseUrl}/destinations/${destination.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={attractionSchema} />

      <Navbar />

      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-5 md:px-6 pt-20 sm:pt-24 pb-20">

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center flex-wrap gap-1.5 text-xs sm:text-sm text-slate-500 font-sans"
        >
          <Link
            href="/"
            className="hover:text-[var(--season-primary,#065F46)] transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <Link
            href="/destinations"
            className="hover:text-[var(--season-primary,#065F46)] transition-colors"
          >
            Destinations
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <Link
            href={`/destinations/${destination.slug}`}
            className="hover:text-[var(--season-primary,#065F46)] transition-colors truncate max-w-[120px] sm:max-w-none"
          >
            {destination.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-slate-900 font-medium truncate">
            {place.name}
          </span>
        </nav>

        {/* ── Hero Image ──────────────────────────────────────────────────── */}
        <div className="mt-5 sm:mt-6">
          {place.imageUrl ? (
            <div className="relative w-full aspect-[16/7] rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
              <Image
                src={place.imageUrl}
                alt={place.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1120px"
              />
            </div>
          ) : (
            /* Missing image → clean empty state. No external URL invented. */
            <div className="w-full aspect-[16/7] rounded-2xl bg-slate-100 border border-dashed border-slate-200 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <MapPin className="w-10 h-10 stroke-[1.5]" />
                <span className="text-sm font-medium">No image available</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Entity Header ───────────────────────────────────────────────── */}
        <div className="mt-6 sm:mt-8">
          {/* Parent destination context — from DB, not hardcoded */}
          <Link
            href={`/destinations/${destination.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--season-primary,#065F46)] hover:underline mb-3"
          >
            <MapPin className="w-3.5 h-3.5" />
            {destination.name}
          </Link>

          <h1 className="text-3xl sm:text-4xl md:text-[40px] font-bold text-slate-900 font-display tracking-tight leading-tight">
            {place.name}
          </h1>
        </div>

        {/* ── Description ─────────────────────────────────────────────────── */}
        <div className="mt-6 sm:mt-8 mb-12 sm:mb-14">
          {place.description ? (
            <p className="font-sans text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
              {place.description}
            </p>
          ) : (
            /* Missing description → clean empty state. No generated copy. */
            <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 max-w-3xl">
              <p className="text-slate-500 font-medium font-sans text-sm sm:text-base text-center">
                Description coming soon.
              </p>
            </div>
          )}
        </div>

        {/* ── Related Places ───────────────────────────────────────────────── */}
        <div id="related-places" className="mb-14 sm:mb-16">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">
              More Places in {destination.name}
            </h2>
          </div>

          {relatedPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPlaces.map((related) => (
                <Link
                  key={related.id}
                  href={`/destinations/${destination.slug}/${related.slug}`}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    {related.imageUrl ? (
                      <Image
                        src={related.imageUrl}
                        alt={related.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <MapPin className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#f97316] transition-colors mb-2">
                      {related.name}
                    </h3>
                    {related.description && (
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">
                        {related.description}
                      </p>
                    )}
                    <span className="mt-auto pt-3 text-xs font-semibold text-[var(--season-primary,#065F46)] flex items-center gap-1">
                      Explore →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* No related places in DB → clean empty state. None invented. */
            <div className="p-8 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-3 min-h-[160px]">
              <div className="w-12 h-12 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 mb-2 shadow-sm">
                <MapPin className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-slate-500 font-medium font-sans text-sm sm:text-base">
                No related places available yet.
              </p>
            </div>
          )}
        </div>

        {/* ── Back link ───────────────────────────────────────────────────── */}
        <div className="pt-4 border-t border-slate-200">
          <Link
            href={`/destinations/${destination.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Back to {destination.name}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}