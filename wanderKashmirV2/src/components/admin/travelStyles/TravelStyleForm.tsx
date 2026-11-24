"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, Info, Search, Check } from "lucide-react";
import {
  createTravelStyleAction,
  updateTravelStyleAction,
  TravelStyleFormInput,
} from "@/actions/adminTravelStyles";
import {
  AdminPageHeader,
  AdminToastBanner,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

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
  const basePath = useAdminBasePath();

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
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    const prevAutoSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    if (!isEdit && (!slug || slug === prevAutoSlug)) {
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
    setFeedback(null);
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
          setFeedback({ type: "success", text: "Travel style updated successfully." });
          router.refresh();
        } else {
          setFeedback({ type: "error", text: res.error || "Failed to update travel style." });
        }
      } else {
        const res = await createTravelStyleAction(payload);
        if (res.success && res.data?.id) {
          router.push(`${basePath}/travel-styles/${res.data.id}`);
          router.refresh();
        } else {
          setFeedback({ type: "error", text: res.error || "Failed to create travel style." });
        }
      }
    } catch {
      setFeedback({ type: "error", text: "An unexpected network or server error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-16">
      <AdminPageHeader
        title={isEdit ? "Edit Travel Style" : "New Travel Style"}
        subtitle={
          isEdit
            ? "Manage style details, cover media, display order, and linked tour packages."
            : "Create a new travel style and link it to existing tour packages."
        }
        backHref={`${basePath}/travel-styles`}
        backLabel="Back to Travel Styles"
        badge={isEdit ? <StatusBadge status={isActive ? "ACTIVE" : "INACTIVE"} /> : undefined}
        actions={
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] disabled:opacity-60 shadow-xs transition-colors cursor-pointer"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{isEdit ? "Save Changes" : "Create Style"}</span>
          </button>
        }
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      {/* General Settings */}
      <div className="rounded-md border border-slate-200/90 bg-white p-5 sm:p-6 space-y-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Status & Ordering</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active styles appear in public travel style filters and discovery pages.
            </p>
          </div>

          <label className="inline-flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-slate-300 text-[var(--season-primary)] focus:ring-[var(--season-primary)]"
            />
            <span>{isActive ? "Active (Public)" : "Inactive (Hidden)"}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label htmlFor="ts-name" className="block text-xs font-medium text-slate-700 mb-1.5">
              Style Name <span className="text-rose-600">*</span>
            </label>
            <input
              id="ts-name"
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Adventure, Spiritual, Family"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="ts-order" className="block text-xs font-medium text-slate-700 mb-1.5">
              Display Order <span className="text-rose-600">*</span>
            </label>
            <input
              id="ts-order"
              type="number"
              min="0"
              required
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="ts-slug" className="block text-xs font-medium text-slate-700 mb-1.5">
              URL Slug <span className="text-rose-600">*</span>
            </label>
            <input
              id="ts-slug"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. adventure, spiritual, luxury-stays"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
            />
            {isEdit && (
              <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                <Info className="h-3 w-3" />
                <span>Changing this slug updates the public URL (/tours/{slug}).</span>
              </p>
            )}
          </div>

          <div className="md:col-span-3">
            <label htmlFor="ts-desc" className="block text-xs font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              id="ts-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description displayed on travel style cards..."
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="rounded-md border border-slate-200/90 bg-white p-5 sm:p-6 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <h2 className="text-sm font-semibold text-slate-900">Cover Media</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="ts-img" className="block text-xs font-medium text-slate-700 mb-1.5">
              Cover Image URL
            </label>
            <input
              id="ts-img"
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="ts-alt" className="block text-xs font-medium text-slate-700 mb-1.5">
              Image Alt Text
            </label>
            <input
              id="ts-alt"
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="e.g. Adventure and trekking in Kashmir"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
            />
          </div>
        </div>

        {imageUrl.trim() && (
          <div>
            <span className="text-[11px] font-medium text-slate-500 block mb-1.5">Preview</span>
            <div className="relative w-44 h-28 rounded-md overflow-hidden border border-slate-200 bg-slate-100">
              {/* Keyed by imageUrl so correcting an invalid URL remounts cleanly */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={imageUrl}
                src={imageUrl}
                alt={imageAlt || name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Connected Tours */}
      <div className="rounded-md border border-slate-200/90 bg-white p-5 sm:p-6 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Connected Tour Packages ({selectedTourIds.length} selected)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Link or unlink tour packages without modifying the tour records themselves.
            </p>
          </div>

          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={tourSearch}
              onChange={(e) => setTourSearch(e.target.value)}
              placeholder="Filter tours..."
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {availableTours.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-500">No tours found.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
            {filteredTours.map((tour) => {
              const isSelected = selectedTourIds.includes(tour.id);
              return (
                <button
                  key={tour.id}
                  type="button"
                  onClick={() => toggleTour(tour.id)}
                  className={`w-full text-left flex items-center justify-between p-3 rounded-md border transition-colors cursor-pointer ${
                    isSelected
                      ? "border-[var(--season-primary)]/40 bg-[var(--season-primary-light)]"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`h-4 w-4 rounded flex items-center justify-center border shrink-0 ${
                        isSelected
                          ? "bg-[var(--season-primary)] border-[var(--season-primary)] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium text-xs text-slate-900 truncate">
                        {tour.title}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {tour.duration} · {tour.isLive ? "Live" : "Draft"}
                      </div>
                    </div>
                  </div>
                  <span className="shrink-0 font-mono text-[11px] text-slate-400 ml-3">
                    /{tour.slug}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </form>
  );
}
