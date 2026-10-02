"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Search,
  Check,
  Compass,
} from "lucide-react";
import {
  createTravelStyleAction,
  updateTravelStyleAction,
  TravelStyleFormInput,
} from "@/actions/adminTravelStyles";

interface TourOption {
  id: string;
  title: string;
  slug: string;
  isLive: boolean;
  duration: string;
}

interface TravelStyleFormProps {
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    imageAlt: string | null;
    isActive: boolean;
    displayOrder: number;
    assignedTourIds: string[];
  };
  availableTours: TourOption[];
  isEdit?: boolean;
}

export default function TravelStyleForm({
  initialData,
  availableTours,
  isEdit = false,
}: TravelStyleFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [imageAlt, setImageAlt] = useState(initialData?.imageAlt || "");
  const [displayOrder, setDisplayOrder] = useState(
    initialData?.displayOrder !== undefined ? String(initialData.displayOrder) : "1"
  );
  const [isActive, setIsActive] = useState<boolean>(initialData?.isActive ?? true);
  const [selectedTourIds, setSelectedTourIds] = useState<string[]>(
    initialData?.assignedTourIds || []
  );

  const [tourSearch, setTourSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit && (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""))) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const toggleTour = (tourId: string) => {
    setSelectedTourIds((prev) =>
      prev.includes(tourId) ? prev.filter((id) => id !== tourId) : [...prev, tourId]
    );
  };

  const filteredTours = availableTours.filter((t) => {
    if (!tourSearch.trim()) return true;
    const term = tourSearch.toLowerCase();
    return t.title.toLowerCase().includes(term) || t.slug.toLowerCase().includes(term);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const payload: TravelStyleFormInput = {
        name,
        slug,
        description: description.trim() || null,
        imageUrl: imageUrl.trim() || null,
        imageAlt: imageAlt.trim() || null,
        displayOrder: parseInt(displayOrder, 10) || 0,
        isActive,
        assignedTourIds: selectedTourIds,
      };

      if (isEdit && initialData?.id) {
        const res = await updateTravelStyleAction(initialData.id, payload);
        if (res.success) {
          setSuccessMsg("Travel style updated successfully in production database!");
          router.refresh();
        } else {
          setError(res.error || "Failed to update travel style.");
        }
      } else {
        const res = await createTravelStyleAction(payload);
        if (res.success && res.data?.id) {
          setSuccessMsg("Travel style created successfully!");
          router.push(`/admin/travel-styles/${res.data.id}`);
          router.refresh();
        } else {
          setError(res.error || "Failed to create travel style.");
        }
      }
    } catch {
      setError("An unexpected network or server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <Link
            href="/admin/travel-styles"
            className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Travel Styles
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isEdit ? "Edit Travel Style" : "Create New Travel Style"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isEdit
              ? "Modify travel style categorization, SEO metadata, and tour associations"
              : "Register a new travel style category into the production database"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/travel-styles"
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEdit ? "Save Changes" : "Create Style"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{successMsg}</div>
        </div>
      )}

      {/* General Settings */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Status & Ordering</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Only active styles appear publicly in Help Me Choose and on style listing pages
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            <span className="ml-3 text-xs font-semibold text-slate-300">
              {isActive ? "Active (Public)" : "Inactive (Hidden)"}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Style Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Adventure, Spiritual, Family"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Display Order *
            </label>
            <input
              type="number"
              min="0"
              required
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              placeholder="1"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. adventure, spiritual, luxury-stays"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
            />
            {isEdit && (
              <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" /> Changing this slug alters the public URL (/tours/{slug}).
              </p>
            )}
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description for category cards and SEO snippets..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Media & Images */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white">Media & Visuals</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Cover Image URL
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Image Alt Text
            </label>
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="e.g. Adventure and trekking in Kashmir"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {imageUrl && (
          <div className="mt-3">
            <span className="text-[11px] text-slate-400 block mb-1.5">Image Preview:</span>
            <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-slate-800 bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={imageAlt || name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Connected Tours Manager */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Connected Tour Packages ({selectedTourIds.length} Selected)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Assign or unassign existing production tours to this travel style category
            </p>
          </div>

          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={tourSearch}
              onChange={(e) => setTourSearch(e.target.value)}
              placeholder="Filter tours..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">Phase 6B Relation Safety Guarantee:</p>
          <p className="mt-0.5 leading-relaxed">
            Selecting or removing tours here strictly updates the <code>TourTravelStyle</code> mapping.
            Tours themselves are <strong>never</strong> deleted or altered in title, pricing, or publishing status.
          </p>
        </div>

        {availableTours.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No production tours found in database.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
            {filteredTours.map((tour) => {
              const isSelected = selectedTourIds.includes(tour.id);
              return (
                <div
                  key={tour.id}
                  onClick={() => toggleTour(tour.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "border-emerald-500/40 bg-emerald-500/10 text-white"
                      : "border-slate-800/80 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border text-xs shrink-0 ${
                        isSelected
                          ? "bg-emerald-500 border-emerald-400 text-white"
                          : "border-slate-700 bg-slate-800"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <div className="font-medium text-xs sm:text-sm truncate">
                        {tour.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                        <span>{tour.duration}</span>
                        <span>•</span>
                        <span className={tour.isLive ? "text-emerald-400" : "text-slate-500"}>
                          {tour.isLive ? "Live" : "Draft"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right text-xs font-mono text-slate-400">
                    /{tour.slug}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <Link
          href="/admin/travel-styles"
          className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isEdit ? "Save Style Changes" : "Create Travel Style"}
        </button>
      </div>
    </form>
  );
}
