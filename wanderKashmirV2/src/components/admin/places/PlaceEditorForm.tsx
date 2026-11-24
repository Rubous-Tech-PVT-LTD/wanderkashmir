"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Save,
  Loader2,
  MapPin,
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  Eye,
  Check,
  ExternalLink,
} from "lucide-react";
import { AdminPlaceItem, AvailableDestinationOption } from "@/lib/admin/places";
import { createPlaceAction, updatePlaceAction, PlaceCmsInput } from "@/actions/adminPlaces";
import { GalleryImageItem, validateGalleryData, isValidImageUrl } from "@/lib/places/galleryValidation";
import {
  AdminPageHeader,
  AdminToastBanner,
  AdminMediaGalleryField,
  AdminSeoSection,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface PlaceEditorFormProps {
  mode: "create" | "edit";
  initialData?: AdminPlaceItem | null;
  destinations: AvailableDestinationOption[];
}

function parseJsonArray(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map((v) => (typeof v === "string" ? v : JSON.stringify(v)));
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

export default function PlaceEditorForm({
  mode,
  initialData,
  destinations,
}: PlaceEditorFormProps) {
  const router = useRouter();
  const { adminHref } = useAdminBasePath();

  const [activeTab, setActiveTab] = useState<"basic" | "visitor" | "gallery" | "seo">("basic");

  // Basic Information
  const [name, setName] = useState(initialData?.name || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">(
    (initialData?.status as "ACTIVE" | "INACTIVE") || "INACTIVE"
  );

  const initialDestIds = initialData?.destinationPlaces?.map((dp) => dp.destination.id) || [];
  const [selectedDestIds, setSelectedDestIds] = useState<string[]>(initialDestIds);

  // Visitor Information (never pre-populate fabricated defaults!)
  const [timings, setTimings] = useState(initialData?.timings || "");
  const [entryFee, setEntryFee] = useState(initialData?.entryFee || "");
  const [bestTimeToVisit, setBestTimeToVisit] = useState(initialData?.bestTimeToVisit || "");

  const [thingsToDoList, setThingsToDoList] = useState<string[]>(() =>
    parseJsonArray(initialData?.thingsToDo)
  );
  const [newThingToDo, setNewThingToDo] = useState("");

  const [visitorTipsList, setVisitorTipsList] = useState<string[]>(() =>
    parseJsonArray(initialData?.visitorTips)
  );
  const [newVisitorTip, setNewVisitorTip] = useState("");

  // Media & Gallery
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [galleryItems, setGalleryItems] = useState<GalleryImageItem[]>(() => {
    if (!initialData?.gallery) return [];
    const check = validateGalleryData(initialData.gallery);
    return check.valid ? check.data : [];
  });

  // SEO & Discovery
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || "");
  const [isFeatured, setIsFeatured] = useState<boolean>(Boolean(initialData?.isFeatured));

  // Submission State
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

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

  const toggleDestinationId = (destId: string) => {
    setSelectedDestIds((prev) =>
      prev.includes(destId) ? prev.filter((id) => id !== destId) : [...prev, destId]
    );
  };

  const primaryDest = destinations.find((d) => selectedDestIds.includes(d.id));
  const publicRoutePreview = primaryDest
    ? `https://www.wanderkashmir.com/destinations/${primaryDest.slug}/${slug || "place-slug"}`
    : `https://www.wanderkashmir.com/destinations/[destination]/${slug || "place-slug"}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      if (!name.trim()) {
        setFeedback({ text: "Place name is required.", type: "error" });
        setActiveTab("basic");
        setSaving(false);
        return;
      }

      if (!slug.trim()) {
        setFeedback({ text: "URL slug is required.", type: "error" });
        setActiveTab("basic");
        setSaving(false);
        return;
      }

      const nonEmptyGallery = galleryItems.filter((item) => item.url.trim().length > 0);
      if (nonEmptyGallery.length > 0) {
        const galleryCheck = validateGalleryData(nonEmptyGallery);
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

      const payload: PlaceCmsInput = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim() || null,
        destination: primaryDest ? primaryDest.title : null,
        destinationIds: selectedDestIds,
        imageUrl: imageUrl.trim() || null,
        gallery: nonEmptyGallery.length > 0 ? nonEmptyGallery : null,
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
          setFeedback({ text: `Place "${name}" created.`, type: "success" });
          router.push(adminHref(`/admin/places/${result.data.id}/edit`));
          router.refresh();
        } else {
          setFeedback({ text: result.error || "Failed to create place.", type: "error" });
        }
      } else if (initialData?.id) {
        const result = await updatePlaceAction(initialData.id, payload);
        if (result.success) {
          setFeedback({ text: `Saved changes to "${name}".`, type: "success" });
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

  const tabs: Array<{ key: "basic" | "visitor" | "gallery" | "seo"; label: string; count?: number }> = [
    { key: "basic", label: "Basics & Destinations" },
    { key: "visitor", label: "Visitor Guide" },
    { key: "gallery", label: "Bento Gallery", count: galleryItems.length },
    { key: "seo", label: "SEO & Visibility" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-16">
      <AdminPageHeader
        title={mode === "create" ? "New Place" : initialData?.name || "Edit Place"}
        subtitle={
          mode === "create"
            ? "Create a new attraction page. Defaults to Draft until you choose to publish."
            : `Slug: /${slug}`
        }
        backHref={adminHref("/admin/places")}
        backLabel="Back to Places"
        badge={<StatusBadge status={status === "ACTIVE" ? "PUBLISHED" : "DRAFT"} />}
        actions={
          <>
            {mode === "edit" && initialData?.id && (
              <Link
                href={adminHref(`/admin/places/${initialData.id}/preview`)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Preview</span>
              </Link>
            )}
            {mode === "edit" && status === "ACTIVE" && primaryDest && (
              <Link
                href={`/destinations/${primaryDest.slug}/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>View Live</span>
              </Link>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{mode === "create" ? "Create Place" : "Save Changes"}</span>
            </button>
          </>
        }
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      {/* Section Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? "border-[var(--season-primary)] text-[var(--season-primary-hover)] font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 tabular-nums">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: BASICS & DESTINATIONS */}
      {activeTab === "basic" && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 pb-2.5 border-b border-slate-100">
              Place Identity &amp; Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="place-name" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Place Name <span className="text-rose-600">*</span>
                </label>
                <input
                  id="place-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Chashme Shahi"
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-2 focus:ring-[var(--season-primary)]/15"
                />
              </div>

              <div>
                <label htmlFor="place-slug" className="block text-xs font-medium text-slate-700 mb-1.5">
                  URL Slug <span className="text-rose-600">*</span>
                </label>
                <input
                  id="place-slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g., chashme-shahi-srinagar-guide"
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-2 focus:ring-[var(--season-primary)]/15"
                />
              </div>
            </div>

            <div>
              <label htmlFor="place-description" className="block text-xs font-medium text-slate-700 mb-1.5">
                Editorial Description &amp; History
              </label>
              <textarea
                id="place-description"
                rows={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write clear sections separated by blank lines. Short heading lines without a period become subheadings automatically."
                className="w-full bg-white border border-slate-200 rounded-md p-3 text-xs text-slate-900 placeholder:text-slate-400 leading-relaxed focus:outline-none focus:border-[var(--season-primary)] focus:ring-2 focus:ring-[var(--season-primary)]/15"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs font-medium text-slate-900">Publication Status</div>
                <p className="text-[11px] text-slate-500">
                  Draft places stay hidden from public listings and sitemaps while remaining previewable here.
                </p>
              </div>
              <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50 self-start">
                <button
                  type="button"
                  onClick={() => setStatus("INACTIVE")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    status === "INACTIVE"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/80"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Draft (Inactive)
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("ACTIVE")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    status === "ACTIVE"
                      ? "bg-[var(--season-primary)] text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Published (Active)
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
            <div className="pb-2.5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">
                Linked Destinations ({selectedDestIds.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign this place to one or more published Kashmir destination hubs.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {destinations.map((dest) => {
                const selected = selectedDestIds.includes(dest.id);
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => toggleDestinationId(dest.id)}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-md border text-left text-xs transition-colors cursor-pointer ${
                      selected
                        ? "bg-[var(--season-primary-light)] border-[var(--season-primary)]/40 text-slate-900 font-medium"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${selected ? "text-[var(--season-primary)]" : "text-slate-400"}`} />
                      <span className="truncate">{dest.title}</span>
                    </span>
                    {selected && <Check className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISITOR GUIDE */}
      {activeTab === "visitor" && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <div className="pb-2.5 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Visitor Essentials</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Leave any field blank if unverified — empty fields are omitted on the public page rather than fabricated.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="place-timings" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Visiting Hours
                </label>
                <input
                  id="place-timings"
                  type="text"
                  value={timings}
                  onChange={(e) => setTimings(e.target.value)}
                  placeholder="e.g., Summer: 9:00 AM – 7:00 PM"
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                />
              </div>

              <div>
                <label htmlFor="place-fee" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Entry Fee
                </label>
                <input
                  id="place-fee"
                  type="text"
                  value={entryFee}
                  onChange={(e) => setEntryFee(e.target.value)}
                  placeholder="e.g., Verify at ticket counter"
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                />
              </div>

              <div>
                <label htmlFor="place-season" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Best Time to Visit
                </label>
                <input
                  id="place-season"
                  type="text"
                  value={bestTimeToVisit}
                  onChange={(e) => setBestTimeToVisit(e.target.value)}
                  placeholder="e.g., April to October"
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                />
              </div>
            </div>
          </div>

          {/* Things to Do */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 pb-2.5 border-b border-slate-100">
              Key Highlights &amp; Things to Do ({thingsToDoList.length})
            </h2>

            {thingsToDoList.length === 0 ? (
              <p className="text-xs text-slate-500">No highlights added yet.</p>
            ) : (
              <div className="space-y-2">
                {thingsToDoList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-slate-50 border border-slate-200/80 text-xs text-slate-800"
                  >
                    <span className="leading-relaxed">
                      <span className="font-semibold text-[var(--season-primary)] mr-2">{idx + 1}.</span>
                      {item}
                    </span>
                    <button
                      type="button"
                      onClick={() => setThingsToDoList(thingsToDoList.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                      aria-label="Remove highlight"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newThingToDo}
                onChange={(e) => setNewThingToDo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newThingToDo.trim()) {
                    e.preventDefault();
                    setThingsToDoList([...thingsToDoList, newThingToDo.trim()]);
                    setNewThingToDo("");
                  }
                }}
                placeholder="Add a highlight or activity..."
                className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newThingToDo.trim()) return;
                  setThingsToDoList([...thingsToDoList, newThingToDo.trim()]);
                  setNewThingToDo("");
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Visitor Tips */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 pb-2.5 border-b border-slate-100">
              Practical Visitor Tips ({visitorTipsList.length})
            </h2>

            {visitorTipsList.length === 0 ? (
              <p className="text-xs text-slate-500">No visitor tips added yet.</p>
            ) : (
              <div className="space-y-2">
                {visitorTipsList.map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-800"
                  >
                    <span className="leading-relaxed">{tip}</span>
                    <button
                      type="button"
                      onClick={() => setVisitorTipsList(visitorTipsList.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                      aria-label="Remove tip"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newVisitorTip}
                onChange={(e) => setNewVisitorTip(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newVisitorTip.trim()) {
                    e.preventDefault();
                    setVisitorTipsList([...visitorTipsList, newVisitorTip.trim()]);
                    setNewVisitorTip("");
                  }
                }}
                placeholder="Add a practical tip for travelers..."
                className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newVisitorTip.trim()) return;
                  setVisitorTipsList([...visitorTipsList, newVisitorTip.trim()]);
                  setNewVisitorTip("");
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BENTO GALLERY */}
      {activeTab === "gallery" && (
        <div className="space-y-5">
          {/* Primary Cover Image */}
          <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 pb-2.5 border-b border-slate-100">
              Primary Cover Image
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div className="w-36 h-24 rounded-md bg-slate-50 border border-slate-200 relative overflow-hidden shrink-0">
                {imageUrl && isValidImageUrl(imageUrl) ? (
                  <Image
                    key={imageUrl}
                    src={imageUrl}
                    alt={name || "Place cover preview"}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1 text-[10px]">
                    <ImageIcon className="w-5 h-5" />
                    <span>No Cover</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-1.5 w-full">
                <label htmlFor="place-cover-url" className="block text-xs font-medium text-slate-700">
                  Cover Image URL (Cloudinary / HTTPS)
                </label>
                <input
                  id="place-cover-url"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                />
                <p className="text-[11px] text-slate-500">
                  Used for social previews, directory cards, and as the lead Bento photo when not duplicated below.
                </p>
              </div>
            </div>
          </div>

          <AdminMediaGalleryField
            title="Bento Photo Gallery"
            description="Upload or paste Cloudinary URLs. Star an image to prioritize it as cover; reorder with arrows and inspect via Bento Preview."
            items={galleryItems}
            onChange={setGalleryItems}
            entityName={name || "Place"}
            showBentoPreview
            showCaption
            showFeaturedStar
          />
        </div>
      )}

      {/* TAB 4: SEO & VISIBILITY */}
      {activeTab === "seo" && (
        <div className="space-y-5">
          <AdminSeoSection
            seoTitle={seoTitle}
            onSeoTitleChange={setSeoTitle}
            metaDescription={metaDescription}
            onMetaDescriptionChange={setMetaDescription}
            canonicalUrl={canonicalUrl}
            onCanonicalUrlChange={setCanonicalUrl}
            previewUrl={publicRoutePreview}
            fallbackTitle={`${name || "Place Name"}${primaryDest ? `, ${primaryDest.title}` : ""} | WanderKashmir`}
            fallbackDescription={description ? description.slice(0, 160) : undefined}
          />

          <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Featured Place Spotlight</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Prioritizes this place at the top of the public /places directory.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isFeatured}
              onClick={() => setIsFeatured(!isFeatured)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                isFeatured ? "bg-[var(--season-primary)]" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform ${
                  isFeatured ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
