import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Edit,
  Clock,
  Ticket,
  Calendar,
  MapPin,
  CheckCircle2,
  EyeOff,
  Star,
  ExternalLink,
  Sparkles,
  Info,
} from "lucide-react";
import { getAdminPlaceById } from "@/lib/admin/places";
import { GalleryImageItem, validateGalleryData } from "@/lib/places/galleryValidation";

export const revalidate = 0;

export default async function AdminPlacePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const place = await getAdminPlaceById(id);

  if (!place) {
    notFound();
  }

  const primaryDest = place.destinationPlaces[0]?.destination;
  const isPublished = place.status === "ACTIVE";

  // Parse gallery items
  const galleryCheck = validateGalleryData(place.gallery);
  const gallery: GalleryImageItem[] = galleryCheck.valid ? galleryCheck.data : [];

  // Parse Things to Do & Visitor Tips
  const parseList = (val: unknown): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(String);
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {
        return [val];
      }
    }
    return [];
  };

  const thingsToDo = parseList(place.thingsToDo);
  const visitorTips = parseList(place.visitorTips);

  return (
    <div className="space-y-6 pb-16">
      {/* Sticky Editorial Preview Control Bar */}
      <div className="sticky top-16 z-30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 bg-slate-950/95 border border-slate-800 rounded-xl backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/places"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Return to Places Management"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Editorial Preview Mode
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isPublished
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                {isPublished ? <CheckCircle2 className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                {isPublished ? "Live Published Page" : "Unpublished Draft"}
              </span>
              {place.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Star className="w-3 h-3 fill-amber-400" /> Featured
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Slug: <span className="font-mono text-emerald-400">/{place.slug}</span>
              {primaryDest && ` • Destination: ${primaryDest.title}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPublished && primaryDest && (
            <Link
              href={`/destinations/${primaryDest.slug}/${place.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Public Live View</span>
            </Link>
          )}

          <Link
            href={`/admin/places/${place.id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Content</span>
          </Link>
        </div>
      </div>

      {/* Public Page Preview Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Hero Section */}
        <div className="relative h-72 sm:h-96 w-full bg-slate-900">
          {place.imageUrl ? (
            <Image
              src={place.imageUrl}
              alt={place.name}
              fill
              priority
              className="object-cover opacity-80"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              <MapPin className="w-12 h-12" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Hero Content Overlay */}
          <div className="absolute bottom-6 left-6 right-6 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {primaryDest && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                  <MapPin className="w-3 h-3" /> {primaryDest.title}
                </span>
              )}
              {place.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-sm">
                  <Star className="w-3 h-3 fill-amber-300" /> Featured Attraction
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {place.name}
            </h1>
            {place.seoTitle && place.seoTitle !== place.name && (
              <p className="text-sm text-slate-300 mt-1 max-w-2xl">{place.seoTitle}</p>
            )}
          </div>
        </div>

        {/* Visitor Guidelines Strip */}
        <div className="border-y border-slate-800 bg-slate-900/60 p-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Timings</span>
                <span className="text-white font-medium">{place.timings || "Open Daily (Sunrise - Sunset)"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Ticket className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Admission</span>
                <span className="text-white font-medium">{place.entryFee || "Free Entry / Nominal Charge"}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Best Season</span>
                <span className="text-white font-medium">{place.bestTimeToVisit || "April to October"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Overview */}
          <div>
            <h2 className="text-lg font-bold text-white mb-3">Overview & History</h2>
            <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line max-w-3xl">
              {place.description || "No overview provided for this place."}
            </div>
          </div>

          {/* Highlights & Things to Do */}
          {thingsToDo.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Key Highlights & Things to Do
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {thingsToDo.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practical Traveler Tips */}
          {visitorTips.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-emerald-400" />
                Practical Tips for Visitors
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {visitorTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 font-bold text-[10px] mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bento Photo Gallery */}
          {gallery.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Visual Gallery ({gallery.length} Images)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {gallery.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 group"
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || place.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    {img.caption && (
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-[11px] text-white">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Linked Destinations Strip */}
          {place.destinationPlaces.length > 0 && (
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Part of Destination Guides
              </h3>
              <div className="flex flex-wrap gap-2">
                {place.destinationPlaces.map((dp) => (
                  <div
                    key={dp.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 text-slate-300"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{dp.destination.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

