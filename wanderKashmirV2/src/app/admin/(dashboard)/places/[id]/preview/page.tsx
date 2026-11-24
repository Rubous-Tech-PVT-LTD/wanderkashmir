import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import {
  Edit,
  Clock,
  Ticket,
  Calendar,
  MapPin,
  Star,
  ExternalLink,
  CheckCircle2,
  Camera,
  Images,
} from "lucide-react";
import { getAdminPlaceById } from "@/lib/admin/places";
import { GalleryImageItem, validateGalleryData } from "@/lib/places/galleryValidation";
import { AdminPageHeader, StatusBadge } from "@/components/admin/ui";

export const revalidate = 0;

function parseList(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
      return val.trim() ? [val] : [];
    }
  }
  return [];
}

export default async function AdminPlacePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, headerList] = await Promise.all([params, headers()]);
  const base = headerList.get("x-admin-alias") === "wander-admin" ? "/wander-admin" : "/admin";

  const place = await getAdminPlaceById(id);
  if (!place) {
    notFound();
  }

  const primaryDest = place.destinationPlaces[0]?.destination;
  const isPublished = place.status === "ACTIVE";

  // Mirror exact public Bento Gallery sorting (featured first, then order, prepend cover if missing)
  const galleryCheck = validateGalleryData(place.gallery);
  let galleryImages: GalleryImageItem[] = galleryCheck.valid
    ? [...galleryCheck.data].sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (a.order ?? 0) - (b.order ?? 0);
      })
    : [];

  if (place.imageUrl && !galleryImages.some((img) => img.url === place.imageUrl)) {
    galleryImages = [
      {
        url: place.imageUrl,
        alt: place.name,
        caption: null,
        order: -1,
        isFeatured: true,
      },
      ...galleryImages,
    ];
  }

  const thingsToDo = parseList(place.thingsToDo);
  const visitorTips = parseList(place.visitorTips);
  const effectiveCanonical =
    place.canonicalUrl?.trim() ||
    (primaryDest
      ? `https://www.wanderkashmir.com/destinations/${primaryDest.slug}/${place.slug}`
      : `https://www.wanderkashmir.com/places`);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <AdminPageHeader
        title={`Preview: ${place.name}`}
        subtitle={
          primaryDest
            ? `Public route: /destinations/${primaryDest.slug}/${place.slug}`
            : `Slug: /${place.slug} (link a destination to enable public route)`
        }
        backHref={`${base}/places`}
        backLabel="Back to Places"
        badge={
          <div className="flex items-center gap-1.5">
            <StatusBadge status={isPublished ? "PUBLISHED" : "DRAFT"} />
            {place.isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>Featured</span>
              </span>
            )}
          </div>
        }
        actions={
          <>
            {isPublished && primaryDest && (
              <Link
                href={`/destinations/${primaryDest.slug}/${place.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Open Public Page</span>
              </Link>
            )}
            <Link
              href={`${base}/places/${place.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white bg-emerald-800 hover:bg-emerald-900 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Content</span>
            </Link>
          </>
        }
      />

      {/* Accurate Light-Mode Public Preview Frame */}
      <div className="bg-white border border-slate-200/90 rounded-md p-6 sm:p-8 space-y-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {/* Public Header Preview */}
        <div className="space-y-2.5">
          <div className="flex items-center flex-wrap gap-2">
            {primaryDest && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--season-primary-light)] text-[var(--season-primary-hover)] border border-[var(--season-primary)]/20">
                <MapPin className="w-3.5 h-3.5 text-[var(--season-primary)]" />
                <span>{primaryDest.title}</span>
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{place.name}</h1>
        </div>

        {/* Exact Public Bento Photo Gallery Parity */}
        <div>
          {galleryImages.length >= 4 ? (
            <div className="grid grid-cols-1 sm:grid-cols-4 sm:grid-rows-2 gap-2.5 sm:h-[400px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              <div className="sm:col-span-2 sm:row-span-2 relative aspect-[16/10] sm:aspect-auto">
                <Image
                  src={galleryImages[0].url}
                  alt={galleryImages[0].alt || place.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 560px"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/65 to-transparent text-xs text-white flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  <span className="truncate">{galleryImages[0].caption || place.name}</span>
                </div>
              </div>
              {galleryImages.slice(1, galleryImages.length === 4 ? 4 : 5).map((img, idx) => (
                <div
                  key={idx}
                  className={`relative aspect-[4/3] sm:aspect-auto ${
                    galleryImages.length === 4 && idx === 2 ? "sm:col-span-2" : ""
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt || `${place.name} photo ${idx + 2}`}
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                  {galleryImages.length > 5 && idx === 3 ? (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-xs font-semibold gap-1.5">
                      <Images className="w-4 h-4" />
                      <span>+{galleryImages.length - 5} More</span>
                    </div>
                  ) : (
                    img.caption && (
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent text-[11px] text-white truncate">
                        {img.caption}
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          ) : galleryImages.length === 3 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 sm:grid-rows-2 gap-2.5 sm:h-[360px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              <div className="sm:col-span-2 sm:row-span-2 relative aspect-[16/10] sm:aspect-auto">
                <Image src={galleryImages[0].url} alt={galleryImages[0].alt || place.name} fill className="object-cover" sizes="640px" />
              </div>
              {galleryImages.slice(1, 3).map((img, idx) => (
                <div key={idx} className="relative aspect-[16/10] sm:aspect-auto">
                  <Image src={img.url} alt={img.alt || place.name} fill className="object-cover" sizes="320px" />
                </div>
              ))}
            </div>
          ) : galleryImages.length === 2 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:h-[320px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="relative aspect-[16/10] sm:aspect-auto">
                  <Image src={img.url} alt={img.alt || place.name} fill className="object-cover" sizes="480px" />
                </div>
              ))}
            </div>
          ) : galleryImages.length === 1 ? (
            <div className="relative w-full aspect-[16/8] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              <Image src={galleryImages[0].url} alt={galleryImages[0].alt || place.name} fill className="object-cover" sizes="960px" />
            </div>
          ) : (
            <div className="w-full h-44 rounded-md bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5">
              <Camera className="w-6 h-6" />
              <span>No gallery or cover images uploaded yet.</span>
            </div>
          )}
        </div>

        {/* Visitor Essentials (Only show populated DB values — never fabricate!) */}
        {(place.timings || place.entryFee || place.bestTimeToVisit) ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {place.timings && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Visiting Hours
                  </div>
                  <div className="text-xs font-medium text-slate-900 mt-0.5">{place.timings}</div>
                </div>
              </div>
            )}
            {place.entryFee && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
                <Ticket className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Entry Fee
                  </div>
                  <div className="text-xs font-medium text-slate-900 mt-0.5">{place.entryFee}</div>
                </div>
              </div>
            )}
            {place.bestTimeToVisit && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
                <Calendar className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Best Season
                  </div>
                  <div className="text-xs font-medium text-slate-900 mt-0.5">{place.bestTimeToVisit}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-4 py-3 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500">
            No timings, entry fee, or best season configured yet. Empty visitor fields are hidden on the public page.
          </div>
        )}

        {/* Description */}
        <div className="space-y-2.5">
          <h2 className="text-lg font-semibold text-slate-900">About {place.name}</h2>
          <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {place.description || "No editorial description added yet."}
          </div>
        </div>

        {/* Things to Do */}
        {thingsToDo.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Key Highlights &amp; Things to Do</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {thingsToDo.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 font-semibold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visitor Tips */}
        {visitorTips.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">Practical Visitor Tips</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {visitorTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Metadata Verification Box */}
        <div className="pt-5 border-t border-slate-200 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Rendered SEO Metadata Preview
          </div>
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
            <div className="text-[11px] font-mono text-emerald-800 truncate">{effectiveCanonical}</div>
            <div className="text-sm font-medium text-blue-800">
              {place.seoTitle?.trim() || `${place.name}${primaryDest ? `, ${primaryDest.title}` : ""} | WanderKashmir`}
            </div>
            <div className="text-xs text-slate-600 line-clamp-2">
              {place.metaDescription?.trim() || place.description?.slice(0, 160) || "No meta description set."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
