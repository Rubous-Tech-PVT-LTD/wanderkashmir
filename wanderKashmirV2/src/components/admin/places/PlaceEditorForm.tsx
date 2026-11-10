"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Loader2,
  MapPin,
  Image as ImageIcon,
  Sparkles,
  Info,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  Globe,
  Eye,
  Check,
} from "lucide-react";
import { AdminPlaceItem, AvailableDestinationOption } from "@/lib/admin/places";
import { createPlaceAction, updatePlaceAction, PlaceCmsInput } from "@/actions/adminPlaces";
import { GalleryImageItem, validateGalleryData, isValidImageUrl } from "@/lib/places/galleryValidation";

interface PlaceEditorFormProps {
  mode: "create" | "edit";
  initialData?: AdminPlaceItem | null;
  destinations: AvailableDestinationOption[];
}

export default function PlaceEditorForm({
  mode,
  initialData,
  destinations,
}: PlaceEditorFormProps) {
  const router = useRouter();

  // Tab State: "basic" | "visitor" | "gallery" | "seo"
  const [activeTab, setActiveTab] = useState<"basic" | "visitor" | "gallery" | "seo">("basic");

  // Form State: Basic Information
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">(
    (initialData?.status as "ACTIVE" | "INACTIVE") || "ACTIVE"
  );

  // Destination Associations (multi-destination via DestinationPlace join table)
  const initialDestIds = initialData?.destinationPlaces?.map((dp) => dp.destination.id) || [];
  const [selectedDestIds, setSelectedDestIds] = useState<string[]>(initialDestIds);

  // Form State: Visitor Information
  const [timings, setTimings] = useState(initialData?.timings || "");
  const [entryFee, setEntryFee] = useState(initialData?.entryFee || "");
  const [bestTimeToVisit, setBestTimeToVisit] = useState(initialData?.bestTimeToVisit || "");

  // Things to Do (structured array of items)
  const parseJsonArray = (val: unknown): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map((v) => (typeof v === "string" ? v : JSON.stringify(v)));
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

  const [thingsToDoList, setThingsToDoList] = useState<string[]>(
    parseJsonArray(initialData?.thingsToDo).length > 0
      ? parseJsonArray(initialData?.thingsToDo)
      : [
          "Stroll along the historic Mughal terrace gardens",
          "Capture panoramic sunset views across Dal Lake and Zabarwan peaks",
          "Admire Persian architecture and cascading natural water channels",
        ]
  );
  const [newThingToDo, setNewThingToDo] = useState("");

  // Visitor Tips (structured array)
  const [visitorTipsList, setVisitorTipsList] = useState<string[]>(
    parseJsonArray(initialData?.visitorTips).length > 0
      ? parseJsonArray(initialData?.visitorTips)
      : [
          "Wear comfortable walking shoes to navigate multiple garden terraces.",
          "Early mornings and golden hour offer the best natural lighting for photography.",
          "Hire a licensed local heritage guide at the entrance gate for historical commentary.",
        ]
  );
  const [newVisitorTip, setNewVisitorTip] = useState("");

  // Form State: Media & Gallery
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");

  // Initial gallery normalization
  const initialGalleryItems: GalleryImageItem[] = (() => {
    if (!initialData?.gallery) return [];
    const check = validateGalleryData(initialData.gallery);
    return check.valid ? check.data : [];
  })();

  const [galleryItems, setGalleryItems] = useState<GalleryImageItem[]>(initialGalleryItems);
  const [bulkUrlInput, setBulkUrlInput] = useState("");
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  // Form State: SEO & Discovery
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || "");
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(initialData?.isFeatured));

  // Submission Status
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Auto-slug generator
  const handleNameChange = (val: string) => {
    setName(val);
    if (mode === "create" && (!slug || slug.trim() === "")) {
      const generated = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
      setSlug(generated);
    }
  };

  // Toggle Destination Selection
  const toggleDestinationId = (destId: string) => {
    setSelectedDestIds((prev) =>
      prev.includes(destId) ? prev.filter((id) => id !== destId) : [...prev, destId]
    );
  };

  // Gallery Management Helpers
  const addGalleryItem = () => {
    const newItem: GalleryImageItem = {
      url: "",
      alt: `${name || "Attraction"} photo`,
      caption: null,
      order: galleryItems.length,
      isFeatured: galleryItems.length === 0,
    };
    setGalleryItems([...galleryItems, newItem]);
  };

  const updateGalleryItem = (index: number, updates: Partial<GalleryImageItem>) => {
    const updated = [...galleryItems];
    updated[index] = { ...updated[index], ...updates };
    setGalleryItems(updated);
  };

  const removeGalleryItem = (index: number) => {
    const updated = galleryItems.filter((_, idx) => idx !== index);
    // Re-index orders
    const reindexed = updated.map((item, idx) => ({ ...item, order: idx }));
    setGalleryItems(reindexed);
  };

  const moveGalleryItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === galleryItems.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...galleryItems];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Normalize sequential order
    const reindexed = updated.map((item, idx) => ({ ...item, order: idx }));
    setGalleryItems(reindexed);
  };

  const setFeaturedGalleryImage = (index: number) => {
    const updated = galleryItems.map((item, idx) => ({
      ...item,
      isFeatured: idx === index,
    }));
    setGalleryItems(updated);
  };

  const handleBulkAddUrls = () => {
    if (!bulkUrlInput.trim()) return;
    const urls = bulkUrlInput
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    const newItems: GalleryImageItem[] = urls.map((url, idx) => ({
      url,
      alt: `${name || "Attraction"} view ${galleryItems.length + idx + 1}`,
      caption: null,
      order: galleryItems.length + idx,
      isFeatured: galleryItems.length === 0 && idx === 0,
    }));

    setGalleryItems([...galleryItems, ...newItems]);
    setBulkUrlInput("");
    setShowBulkAdd(false);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      // 1. Basic validation
      if (!name.trim()) {
        setFeedback({ text: "Place name is required.", type: "error" });
        setActiveTab("basic");
        setSaving(false);
        return;
      }

      if (!slug.trim()) {
        setFeedback({ text: "Place slug is required.", type: "error" });
        setActiveTab("basic");
        setSaving(false);
        return;
      }

      // 2. Client-side Gallery Validation
      if (galleryItems.length > 0) {
        const galleryCheck = validateGalleryData(galleryItems);
        if (!galleryCheck.valid) {
          setFeedback({
            text: `Gallery validation error: ${galleryCheck.errors.join("; ")}`,
            type: "error",
          });
          setActiveTab("gallery");
          setSaving(false);
          return;
        }
      }

      // Determine primary destination text for legacy fallback
      const primaryDest = destinations.find((d) => selectedDestIds.includes(d.id));

      const payload: PlaceCmsInput = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        destination: primaryDest ? primaryDest.title : null,
        destinationIds: selectedDestIds,
        imageUrl: imageUrl.trim() || null,
        gallery: galleryItems.length > 0 ? galleryItems : null,
        timings: timings.trim() || null,
        entryFee: entryFee.trim() || null,
        bestTimeToVisit: bestTimeToVisit.trim() || null,
        thingsToDo: thingsToDoList.length > 0 ? thingsToDoList : null,
        visitorTips: visitorTipsList.length > 0 ? visitorTipsList : null,
        seoTitle: seoTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        canonicalUrl: canonicalUrl.trim() || null,
        isFeatured,
        status,
      };

      if (mode === "create") {
        const result = await createPlaceAction(payload);
        if (result.success) {
          setFeedback({ text: `Place "${name}" created successfully!`, type: "success" });
          router.push(`/admin/places/${result.data.id}/edit`);
          router.refresh();
        } else {
          setFeedback({ text: result.error || "Failed to create place.", type: "error" });
        }
      } else if (initialData?.id) {
        const result = await updatePlaceAction(initialData.id, payload);
        if (result.success) {
          setFeedback({ text: `Place "${name}" updated successfully!`, type: "success" });
          router.refresh();
        } else {
          setFeedback({ text: result.error || "Failed to update place.", type: "error" });
        }
      }
    } catch {
      setFeedback({ text: "An unexpected error occurred while saving.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <Link
            href="/admin/places"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Places Management</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              {mode === "create" ? "Create New Place" : `Edit Place: ${initialData?.name}`}
            </h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}
            >
              {status === "ACTIVE" ? "Active (Live)" : "Draft (Hidden)"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {mode === "edit" && initialData?.id && (
            <Link
              href={`/admin/places/${initialData.id}/preview`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </Link>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{mode === "create" ? "Create Place" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm border ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Editor Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-1 sm:space-x-3 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("basic")}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === "basic"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>1. Basic Info & Linking</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("visitor")}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === "visitor"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>2. Visitor Guidelines</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === "gallery"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>3. Media & Bento Gallery ({galleryItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === "seo"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>4. SEO & Discovery</span>
        </button>
      </div>

      {/* TAB 1: BASIC INFORMATION & DESTINATIONS */}
      {activeTab === "basic" && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Info className="w-4 h-4 text-emerald-400" />
              General Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Place Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Nishat Bagh"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  URL Slug <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g., nishat-bagh-srinagar"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Overview & Description
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive overview covering history, architecture, natural setting, and visitor experience..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white">Publish Status</div>
                <div className="text-[11px] text-slate-400">
                  Active places are visible in public directories and destination guides.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStatus(status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  status === "ACTIVE" ? "bg-emerald-600" : "bg-slate-800"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    status === "ACTIVE" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Destination Associations (Join Table) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Linked Destination Guides ({selectedDestIds.length} Selected)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Places link directly to parent Destination Landing Pages via the normalized{" "}
                <code className="text-emerald-400">DestinationPlace</code> join table.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
              {destinations.map((dest) => {
                const isSelected = selectedDestIds.includes(dest.id);
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => toggleDestinationId(dest.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <div className="text-white font-medium">{dest.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">/{dest.slug}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISITOR GUIDELINES */}
      {activeTab === "visitor" && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Hours & Practical Admission
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Opening Timings
                </label>
                <input
                  type="text"
                  value={timings}
                  onChange={(e) => setTimings(e.target.value)}
                  placeholder="e.g., 09:00 AM - 07:00 PM (Daily)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Entry / Admission Fee
                </label>
                <input
                  type="text"
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
                  placeholder="e.g., ₹24 Adults, ₹12 Children"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Best Time to Visit
                </label>
                <input
                  type="text"
                  value={bestTimeToVisit}
                  onChange={(e) => setBestTimeToVisit(e.target.value)}
                  placeholder="e.g., April to October (Spring to Autumn)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Things to Do List */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Key Highlights & Things to Do ({thingsToDoList.length})
              </h2>
            </div>

            <div className="space-y-2">
              {thingsToDoList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-200"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{item}</span>
                  <button
                    type="button"
                    onClick={() => setThingsToDoList(thingsToDoList.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Thing to Do Input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newThingToDo}
                onChange={(e) => setNewThingToDo(e.target.value)}
                placeholder="Add a recommended activity or highlight..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newThingToDo.trim()) {
                    setThingsToDoList([...thingsToDoList, newThingToDo.trim()]);
                    setNewThingToDo("");
                  }
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Add Highlight
              </button>
            </div>
          </div>

          {/* Practical Visitor Tips */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-400" />
                Insider Tips for Travelers ({visitorTipsList.length})
              </h2>
            </div>

            <div className="space-y-2">
              {visitorTipsList.map((tip, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-950 border border-slate-800/80 rounded-lg p-2.5 text-xs text-slate-200"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{tip}</span>
                  <button
                    type="button"
                    onClick={() => setVisitorTipsList(visitorTipsList.filter((_, i) => i !== idx))}
                    className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                    title="Remove tip"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Visitor Tip Input */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newVisitorTip}
                onChange={(e) => setNewVisitorTip(e.target.value)}
                placeholder="Add a travel advisory or local insider tip..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newVisitorTip.trim()) {
                    setVisitorTipsList([...visitorTipsList, newVisitorTip.trim()]);
                    setNewVisitorTip("");
                  }
                }}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Add Tip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEDIA & BENTO GALLERY */}
      {activeTab === "gallery" && (
        <div className="space-y-6">
          {/* Main Thumbnail */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              Primary Hero Thumbnail
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-36 h-24 rounded-lg bg-slate-950 border border-slate-800 relative overflow-hidden shrink-0">
                {imageUrl && isValidImageUrl(imageUrl) ? (
                  <Image
                    src={imageUrl}
                    alt={name || "Place thumbnail preview"}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-1 text-[10px]">
                    <ImageIcon className="w-6 h-6" />
                    <span>No Preview</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-1.5 w-full">
                <label className="block text-xs font-medium text-slate-300">
                  Cloudinary Hero Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500">
                  Accepted CDNs: Cloudinary, Unsplash, Google User Content, or local assets.
                </p>
              </div>
            </div>
          </div>

          {/* Bento Gallery Management */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Bento Photo Gallery ({galleryItems.length} Images)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-res images presented in the Bento gallery. Drag/reorder images and assign SEO alt-text.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkAdd(!showBulkAdd)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-lg transition-colors cursor-pointer"
                >
                  {showBulkAdd ? "Close Bulk URLs" : "Bulk Add URLs"}
                </button>
                <button
                  type="button"
                  onClick={addGalleryItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Image</span>
                </button>
              </div>
            </div>

            {/* Bulk Add Textarea */}
            {showBulkAdd && (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2.5">
                <label className="block text-xs font-semibold text-white">
                  Paste Cloudinary Image URLs (one per line)
                </label>
                <textarea
                  rows={4}
                  value={bulkUrlInput}
                  onChange={(e) => setBulkUrlInput(e.target.value)}
                  placeholder="https://res.cloudinary.com/...&#10;https://res.cloudinary.com/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleBulkAddUrls}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white rounded-md transition-colors cursor-pointer"
                >
                  Import URLs
                </button>
              </div>
            )}

            {/* Gallery Image List */}
            {galleryItems.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg">
                <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <div className="text-xs font-semibold text-white">No gallery images added</div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Add high-resolution landscape images to enrich the public Place experience.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {galleryItems.map((item, index) => {
                  const valid = isValidImageUrl(item.url);
                  return (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg group"
                    >
                      {/* Image Thumbnail Preview */}
                      <div className="w-20 h-16 rounded-md bg-slate-900 relative overflow-hidden shrink-0 border border-slate-800">
                        {item.url && valid ? (
                          <Image
                            src={item.url}
                            alt={item.alt || "Gallery image"}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">
                            {item.url ? "Invalid" : "Empty"}
                          </div>
                        )}
                      </div>

                      {/* URL & Alt Text Controls */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                        <div>
                          <input
                            type="url"
                            value={item.url}
                            onChange={(e) => updateGalleryItem(index, { url: e.target.value })}
                            placeholder="Image URL (https://res.cloudinary.com/...)"
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={item.alt}
                            onChange={(e) => updateGalleryItem(index, { alt: e.target.value })}
                            placeholder="Alt text (Required for SEO & A11y)"
                            className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Reordering & Action Controls */}
                      <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                        {/* Featured Star */}
                        <button
                          type="button"
                          onClick={() => setFeaturedGalleryImage(index)}
                          className={`p-1.5 rounded transition-colors cursor-pointer ${
                            item.isFeatured
                              ? "text-amber-400 bg-amber-500/10"
                              : "text-slate-500 hover:text-amber-400"
                          }`}
                          title={item.isFeatured ? "Featured Gallery Cover" : "Make Featured Cover"}
                        >
                          <Star className={`w-3.5 h-3.5 ${item.isFeatured ? "fill-amber-400" : ""}`} />
                        </button>

                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => moveGalleryItem(index, "up")}
                          className="p-1.5 rounded text-slate-500 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={index === galleryItems.length - 1}
                          onClick={() => moveGalleryItem(index, "down")}
                          className="p-1.5 rounded text-slate-500 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => removeGalleryItem(index)}
                          className="p-1.5 rounded text-slate-500 hover:text-red-400 cursor-pointer"
                          title="Remove Image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: SEO & DISCOVERY */}
      {activeTab === "seo" && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Search Engine Optimization Metadata
            </h2>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">SEO Meta Title</label>
                <span
                  className={`text-[10px] font-mono ${
                    seoTitle.length > 60 ? "text-amber-400" : "text-slate-500"
                  }`}
                >
                  {seoTitle.length}/60 chars (Recommended: 50-60)
                </span>
              </div>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="e.g., Nishat Bagh Srinagar — History, Terraces & Dal Lake Views"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">Meta Description</label>
                <span
                  className={`text-[10px] font-mono ${
                    metaDescription.length > 160 ? "text-amber-400" : "text-slate-500"
                  }`}
                >
                  {metaDescription.length}/160 chars (Recommended: 140-160)
                </span>
              </div>
              <textarea
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Brief, keyword-rich summary explaining what visitors can expect at this attraction..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Canonical URL (Optional override)
              </label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://www.wanderkashmir.com/places/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Featured Place Spotlight Toggle */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <div>
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                  Featured Place Spotlight
                </div>
                <div className="text-[11px] text-slate-400">
                  Featured places receive priority ranking on the /places directory and homepage modules.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  isFeatured ? "bg-amber-500" : "bg-slate-800"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isFeatured ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

