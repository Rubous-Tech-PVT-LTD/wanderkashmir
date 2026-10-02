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
  Plus,
  Trash2,
  ExternalLink,
  Info,
} from "lucide-react";
import { createTourAction, updateTourAction, TourFormInput } from "@/actions/adminTours";

interface TourCategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface TravelStyleOption {
  id: string;
  name: string;
  slug: string;
}

interface TourFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    duration: string;
    price: number;
    originalPrice: number | null;
    category: string;
    categoryId: string | null;
    maxPersons: number;
    badge: string | null;
    overview: string | null;
    destinations: string[];
    images: string[];
    highlights: string[];
    inclusions: string[];
    exclusions: string[];
    itinerary: any;
    travelStyleIds: string[];
    isLive: boolean;
  };
  categories: TourCategoryOption[];
  travelStyles: TravelStyleOption[];
  isEdit?: boolean;
}

export default function TourForm({
  initialData,
  categories,
  travelStyles,
  isEdit = false,
}: TourFormProps) {
  const router = useRouter();

  // Normalize initial itinerary
  const initialItinerary = Array.isArray(initialData?.itinerary)
    ? initialData.itinerary.map((item: any, idx: number) => ({
        day: item.day || `Day ${idx + 1}`,
        title: item.title || "",
        description: item.desc || item.description || "",
      }))
    : [];

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [duration, setDuration] = useState(initialData?.duration || "");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [originalPrice, setOriginalPrice] = useState(initialData?.originalPrice ? String(initialData.originalPrice) : "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || (categories[0]?.id || ""));
  const [categoryName, setCategoryName] = useState(initialData?.category || (categories[0]?.name || "General"));
  const [maxPersons, setMaxPersons] = useState(initialData?.maxPersons ? String(initialData.maxPersons) : "15");
  const [badge, setBadge] = useState(initialData?.badge || "");
  const [overview, setOverview] = useState(initialData?.overview || "");
  const [destinationsStr, setDestinationsStr] = useState(initialData?.destinations?.join(", ") || "");
  const [imagesStr, setImagesStr] = useState(initialData?.images?.join(", ") || "");
  const [highlightsStr, setHighlightsStr] = useState(initialData?.highlights?.join(", ") || "");
  const [inclusionsStr, setInclusionsStr] = useState(initialData?.inclusions?.join(", ") || "Hotel, Meals, Taxi, Shikara Ride");
  const [exclusionsStr, setExclusionsStr] = useState(initialData?.exclusions?.join(", ") || "Flights, Personal Expenses");
  const [itinerary, setItinerary] = useState<{ day: string; title: string; description: string }[]>(initialItinerary);
  const [selectedStyleIds, setSelectedStyleIds] = useState<string[]>(initialData?.travelStyleIds || []);
  const [isLive, setIsLive] = useState<boolean>(initialData?.isLive ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-slug generator on create if user hasn't typed a custom slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""))) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleCategorySelect = (selectedId: string) => {
    setCategoryId(selectedId);
    const cat = categories.find((c) => c.id === selectedId);
    if (cat) {
      setCategoryName(cat.name);
    }
  };

  const toggleStyle = (styleId: string) => {
    setSelectedStyleIds((prev) =>
      prev.includes(styleId) ? prev.filter((id) => id !== styleId) : [...prev, styleId]
    );
  };

  // Itinerary handlers
  const addItineraryDay = () => {
    const nextDayNum = itinerary.length + 1;
    setItinerary([
      ...itinerary,
      { day: `Day ${nextDayNum}`, title: "", description: "" },
    ]);
  };

  const updateItineraryItem = (index: number, field: "day" | "title" | "description", val: string) => {
    const updated = [...itinerary];
    updated[index][field] = val;
    setItinerary(updated);
  };

  const removeItineraryDay = (index: number) => {
    setItinerary(itinerary.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const payload: TourFormInput = {
        title,
        slug,
        duration,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        category: categoryName,
        categoryId: categoryId || null,
        maxPersons: parseInt(maxPersons, 10) || 1,
        badge: badge.trim() || null,
        overview: overview.trim() || null,
        destinations: destinationsStr.split(",").map((s) => s.trim()).filter(Boolean),
        images: imagesStr.split(",").map((s) => s.trim()).filter(Boolean),
        highlights: highlightsStr.split(",").map((s) => s.trim()).filter(Boolean),
        inclusions: inclusionsStr.split(",").map((s) => s.trim()).filter(Boolean),
        exclusions: exclusionsStr.split(",").map((s) => s.trim()).filter(Boolean),
        itinerary,
        travelStyleIds: selectedStyleIds,
        isLive,
      };

      if (isEdit && initialData?.id) {
        const res = await updateTourAction(initialData.id, payload);
        if (res.success) {
          setSuccessMsg("Tour updated successfully in production database!");
          router.refresh();
        } else {
          setError(res.error || "Failed to update tour.");
        }
      } else {
        const res = await createTourAction(payload);
        if (res.success && res.data?.id) {
          setSuccessMsg("Tour created successfully!");
          router.push(`/admin/tours/${res.data.id}`);
          router.refresh();
        } else {
          setError(res.error || "Failed to create tour.");
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
            href="/admin/tours"
            className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tours Listing
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isEdit ? "Edit Tour Package" : "Create New Tour Package"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isEdit
              ? "Modify production tour details with strict mass-assignment safeguards"
              : "Register a new tour directly to the shared production database"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/tours"
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
            {isEdit ? "Save Changes" : "Create Tour"}
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

      {/* Publishing Status & General info */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Publishing Status</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Controls visibility on the V2 public website and XML sitemap
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isLive}
              onChange={(e) => setIsLive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            <span className="ml-3 text-xs font-semibold text-slate-300">
              {isLive ? "Live (Publicly Visible)" : "Draft (Hidden)"}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Tour Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. 5 Days Complete Kashmir Experience"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. 5-days-complete-kashmir-experience"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
            />
            {isEdit && (
              <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3" /> Changing an existing slug alters public canonical URLs.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Duration *
            </label>
            <input
              type="text"
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 5D/4N or 5 Days • 4 Nights"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Price (INR) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="12999"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Original Price (Optional)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="15999"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Max Persons
            </label>
            <input
              type="number"
              min="1"
              value={maxPersons}
              onChange={(e) => setMaxPersons(e.target.value)}
              placeholder="15"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Badge / Ribbon Label
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. Best Seller, Most Popular, Winter Special"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Travel Styles */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Travel Styles</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select one or more active travel styles to link this tour to style category pages
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {travelStyles.map((style) => {
            const isSelected = selectedStyleIds.includes(style.id);
            return (
              <label
                key={style.id}
                className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                  isSelected
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleStyle(style.id)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-800"
                />
                <span>{style.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Overview, Highlights, Destinations */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white">Content & Overview</h2>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Overview / Description
          </label>
          <textarea
            rows={4}
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            placeholder="Detailed description of the tour experience..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Destinations (Comma-separated)
          </label>
          <input
            type="text"
            value={destinationsStr}
            onChange={(e) => setDestinationsStr(e.target.value)}
            placeholder="Srinagar, Gulmarg, Pahalgam, Sonamarg"
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Key Highlights (Comma-separated)
          </label>
          <input
            type="text"
            value={highlightsStr}
            onChange={(e) => setHighlightsStr(e.target.value)}
            placeholder="Dal Lake Shikara Ride, Gulmarg Gondola Phase 2, Betaab Valley Excursion"
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Images (Comma-separated URLs)
          </label>
          <textarea
            rows={2}
            value={imagesStr}
            onChange={(e) => setImagesStr(e.target.value)}
            placeholder="https://images.unsplash.com/..., https://res.cloudinary.com/..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Inclusions (Comma-separated)
            </label>
            <input
              type="text"
              value={inclusionsStr}
              onChange={(e) => setInclusionsStr(e.target.value)}
              placeholder="Hotel, Daily Breakfast, Private Cab, Shikara Ride"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Exclusions (Comma-separated)
            </label>
            <input
              type="text"
              value={exclusionsStr}
              onChange={(e) => setExclusionsStr(e.target.value)}
              placeholder="Airfare, Gondola Tickets, Personal Expenses"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Day-by-Day Itinerary Builder */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Day-by-Day Itinerary</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add structured itinerary milestones for each day of the journey
            </p>
          </div>

          <button
            type="button"
            onClick={addItineraryDay}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Day
          </button>
        </div>

        {itinerary.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-xs text-slate-400">
            No itinerary items added yet. Click &quot;Add Day&quot; to begin building the day-by-day plan.
          </div>
        ) : (
          <div className="space-y-4">
            {itinerary.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="w-28 shrink-0">
                    <input
                      type="text"
                      value={item.day}
                      onChange={(e) => updateItineraryItem(idx, "day", e.target.value)}
                      placeholder={`Day ${idx + 1}`}
                      className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-white"
                    />
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItineraryItem(idx, "title", e.target.value)}
                      placeholder="Day Title (e.g. Arrival in Srinagar & Dal Lake Shikara)"
                      className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItineraryDay(idx)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Remove day"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(e) => updateItineraryItem(idx, "description", e.target.value)}
                    placeholder="Day activities, transfers, sightseeing details..."
                    className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs text-slate-300 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Relation Preservation Notice */}
      {isEdit && (
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400">
          <p className="font-semibold text-slate-300">Phase 6A Relation Preservation Guarantee:</p>
          <p className="mt-0.5 leading-relaxed">
            Existing accommodation stays, transports, experiences, and travel guide associations for this tour are
            strictly preserved in the database during title, pricing, itinerary, and travel style updates.
          </p>
        </div>
      )}

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <Link
          href="/admin/tours"
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
          {isEdit ? "Save Tour Changes" : "Create Tour"}
        </button>
      </div>
    </form>
  );
}
