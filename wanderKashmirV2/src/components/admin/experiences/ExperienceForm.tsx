"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  Compass,
  ExternalLink,
  MapPin,
  Clock,
} from "lucide-react";
import {
  createExperienceAction,
  updateExperienceAction,
  assignTourToExperienceAction,
  removeTourFromExperienceAction,
  deleteExperienceAction,
  ExperienceFormInput,
} from "@/actions/adminExperiences";
import {
  AdminPageHeader,
  AdminToastBanner,
  ConfirmActionDialog,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface ConnectedTour {
  id: string;
  tourId: string;
  isOptional: boolean;
  dayNumber: number | null;
  displayOrder: number;
  tour: {
    id: string;
    title: string;
    slug: string;
    duration: string;
    price: number;
    isLive: boolean;
  };
}

interface AvailableTour {
  id: string;
  title: string;
  slug: string;
  duration: string;
  isLive: boolean;
}

interface ExperienceFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    destination: string;
    duration: string | null;
    basePrice: number | null;
    status: string;
    description: string | null;
    images: string[];
    tourExperiences?: ConnectedTour[];
  };
  availableTours?: AvailableTour[];
}

function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function ExperienceForm({ initialData, availableTours = [] }: ExperienceFormProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();
  const isEdit = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugManual, setSlugManual] = useState(isEdit);
  const [destination, setDestination] = useState(initialData?.destination || "");
  const [duration, setDuration] = useState(initialData?.duration || "");
  const [basePrice, setBasePrice] = useState<string>(
    initialData?.basePrice !== undefined && initialData?.basePrice !== null
      ? String(initialData.basePrice)
      : ""
  );
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">(
    (initialData?.status as "ACTIVE" | "INACTIVE") || "ACTIVE"
  );
  const [description, setDescription] = useState(initialData?.description || "");
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");

  const [connectedTours, setConnectedTours] = useState<ConnectedTour[]>(
    initialData?.tourExperiences || []
  );
  const [selectedTourId, setSelectedTourId] = useState("");
  const [isOptionalTour, setIsOptionalTour] = useState(false);
  const [tourDayNumber, setTourDayNumber] = useState<string>("");
  const [isLinkingTour, setIsLinkingTour] = useState(false);
  const [removingTourId, setRemovingTourId] = useState<string | null>(null);
  const [tourToDetach, setTourToDetach] = useState<ConnectedTour | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) {
      setSlug(sanitizeSlug(val));
    }
  };

  const handleAddImage = () => {
    const url = newImageUrl.trim();
    if (!url) return;
    if (images.includes(url)) {
      setFeedback({ type: "warning", text: "This image URL is already in the list." });
      return;
    }
    setFeedback(null);
    setImages([...images, url]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!title.trim()) {
      setFeedback({ type: "error", text: "Experience title is required." });
      return;
    }
    if (!destination.trim()) {
      setFeedback({ type: "error", text: "Destination location is required." });
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setFeedback({ type: "error", text: "Description must be at least 5 characters." });
      return;
    }

    const cleanSlug = sanitizeSlug(slug || title);
    if (!cleanSlug) {
      setFeedback({ type: "error", text: "A valid URL slug is required." });
      return;
    }

    const payload: ExperienceFormInput = {
      title: title.trim(),
      slug: cleanSlug,
      destination: destination.trim(),
      duration: duration.trim() || null,
      basePrice: basePrice.trim() !== "" ? parseFloat(basePrice) : null,
      status,
      description: description.trim(),
      images,
    };

    setIsSaving(true);
    try {
      if (isEdit && initialData?.id) {
        const res = await updateExperienceAction(initialData.id, payload);
        if (res.success && res.data) {
          setFeedback({ type: "success", text: "Experience updated successfully." });
          router.refresh();
        } else {
          setFeedback({ type: "error", text: res.error || "Failed to update experience." });
        }
      } else {
        const res = await createExperienceAction(payload);
        if (res.success && res.data) {
          router.push(`${basePath}/experiences/${res.data.id}`);
        } else {
          setFeedback({ type: "error", text: res.error || "Failed to create experience." });
        }
      }
    } catch {
      setFeedback({ type: "error", text: "An unexpected network error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignTour = async () => {
    if (!isEdit || !initialData?.id || !selectedTourId) return;

    setIsLinkingTour(true);
    setFeedback(null);
    try {
      const res = await assignTourToExperienceAction({
        experienceId: initialData.id,
        tourId: selectedTourId,
        isOptional: isOptionalTour,
        dayNumber: tourDayNumber ? parseInt(tourDayNumber, 10) : null,
        displayOrder: 0,
      });

      if (res.success) {
        const linkedTourObj = availableTours.find((t) => t.id === selectedTourId);
        if (linkedTourObj) {
          setConnectedTours((prev) => [
            ...prev,
            {
              id: res.data?.id || `temp-${Date.now()}`,
              tourId: selectedTourId,
              isOptional: isOptionalTour,
              dayNumber: tourDayNumber ? parseInt(tourDayNumber, 10) : null,
              displayOrder: 0,
              tour: {
                id: linkedTourObj.id,
                title: linkedTourObj.title,
                slug: linkedTourObj.slug,
                duration: linkedTourObj.duration,
                price: 0,
                isLive: linkedTourObj.isLive,
              },
            },
          ]);
        }
        setSelectedTourId("");
        setTourDayNumber("");
        setIsOptionalTour(false);
        setFeedback({ type: "success", text: "Tour linked to experience." });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to link tour." });
      }
    } catch {
      setFeedback({ type: "error", text: "Failed to assign tour." });
    } finally {
      setIsLinkingTour(false);
    }
  };

  const handleConfirmDetachTour = async () => {
    if (!isEdit || !initialData?.id || !tourToDetach) return;
    setRemovingTourId(tourToDetach.tourId);
    try {
      const res = await removeTourFromExperienceAction(initialData.id, tourToDetach.tourId);
      if (res.success) {
        setConnectedTours((prev) => prev.filter((t) => t.tourId !== tourToDetach.tourId));
        setFeedback({ type: "success", text: "Tour link removed." });
        setTourToDetach(null);
        router.refresh();
      } else {
        throw new Error(res.error || "Failed to remove tour link.");
      }
    } finally {
      setRemovingTourId(null);
    }
  };

  const handleConfirmDeleteExperience = async () => {
    if (!initialData?.id) return;
    const res = await deleteExperienceAction(initialData.id);
    if (res.success) {
      router.push(`${basePath}/experiences`);
    } else {
      throw new Error(res.error || "Failed to delete experience.");
    }
  };

  const alreadyAssignedIds = new Set(connectedTours.map((ct) => ct.tourId));
  const unassignedTours = availableTours.filter((t) => !alreadyAssignedIds.has(t.id));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      <AdminPageHeader
        title={isEdit ? "Edit Experience" : "New Experience"}
        subtitle={
          isEdit
            ? `Editing ${initialData?.title}`
            : "Configure activity details, pricing, and gallery images."
        }
        backHref={`${basePath}/experiences`}
        backLabel="Back to Experiences"
        badge={isEdit ? <StatusBadge status={status} /> : undefined}
        actions={
          isEdit ? (
            <div className="flex items-center gap-2">
              {initialData?.slug && (
                <Link
                  href={`/experiences/${initialData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>View Public</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  if (connectedTours.length > 0) {
                    setFeedback({
                      type: "warning",
                      text: `Cannot delete while linked to ${connectedTours.length} tour(s). Unlink them first or set status to Inactive.`,
                    });
                    return;
                  }
                  setDeleteDialogOpen(true);
                }}
                disabled={connectedTours.length > 0}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  connectedTours.length > 0
                    ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                    : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer"
                }`}
                title={
                  connectedTours.length > 0
                    ? `Linked to ${connectedTours.length} tour(s)`
                    : "Delete experience"
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            </div>
          ) : undefined
        }
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="rounded-md border border-slate-200/90 bg-white p-5 sm:p-6 space-y-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="exp-title" className="block text-xs font-medium text-slate-700 mb-1.5">
                Experience Title <span className="text-rose-600">*</span>
              </label>
              <input
                id="exp-title"
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Traditional Shikara Ride at Sunset"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label htmlFor="exp-slug" className="block text-xs font-medium text-slate-700 mb-1.5">
                URL Slug <span className="text-rose-600">*</span>
              </label>
              <input
                id="exp-slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugManual(true);
                  setSlug(sanitizeSlug(e.target.value));
                }}
                placeholder="traditional-shikara-ride-sunset"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Public URL: /experiences/{slug || "..."}
              </p>
            </div>

            <div>
              <label htmlFor="exp-dest" className="block text-xs font-medium text-slate-700 mb-1.5">
                Destination <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <MapPin className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="exp-dest"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Srinagar, Dal Lake"
                  className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="exp-dur" className="block text-xs font-medium text-slate-700 mb-1.5">
                Duration
              </label>
              <div className="relative">
                <Clock className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="exp-dur"
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 2 Hours, Full Day"
                  className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label htmlFor="exp-price" className="block text-xs font-medium text-slate-700 mb-1.5">
                Base Price (₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  ₹
                </span>
                <input
                  id="exp-price"
                  type="number"
                  min="0"
                  step="any"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full rounded-md border border-slate-200 bg-white pl-7 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label htmlFor="exp-status" className="block text-xs font-medium text-slate-700 mb-1.5">
                Publishing Status
              </label>
              <select
                id="exp-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
              >
                <option value="ACTIVE">Active (Published)</option>
                <option value="INACTIVE">Inactive (Hidden / Draft)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="exp-desc" className="block text-xs font-medium text-slate-700 mb-1.5">
              Description <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="exp-desc"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the experience highlights, inclusions, meeting points, and cultural relevance..."
              className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden leading-relaxed"
              required
            />
          </div>
        </div>

        {/* Media & Images */}
        <div className="rounded-md border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-semibold text-slate-900">Media & Photos</h2>
            <span className="text-xs text-slate-500">{images.length} images</span>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/... or image URL"
              className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add URL</span>
            </button>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video"
                >
                  <Image
                    src={img}
                    alt={`Experience image ${idx + 1}`}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="rounded-lg bg-rose-600 p-1.5 text-white hover:bg-rose-700 cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-slate-900/75 px-1.5 py-0.5 text-[10px] text-white font-medium">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No images added yet. Add Cloudinary or web URLs above to showcase this experience.
            </p>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`${basePath}/experiences`}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>{isEdit ? "Save Changes" : "Create Experience"}</span>
          </button>
        </div>
      </form>

      {/* Connected Tours (Edit Mode) */}
      {isEdit && (
        <div className="rounded-md border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Compass className="h-4 w-4 text-slate-400" />
                <span>Connected Tour Packages</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Link or unlink itineraries that include this experience without modifying the tour records.
              </p>
            </div>
            <span className="text-xs font-medium text-slate-500 tabular-nums">
              {connectedTours.length} connected
            </span>
          </div>

          {unassignedTours.length > 0 ? (
            <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <span className="text-xs font-medium text-slate-700 block">Link an Existing Tour</span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <select
                    value={selectedTourId}
                    onChange={(e) => setSelectedTourId(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
                  >
                    <option value="">Select a tour package...</option>
                    {unassignedTours.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title} ({t.duration}) {t.isLive ? "" : "[Draft]"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Day #"
                    value={tourDayNumber}
                    onChange={(e) => setTourDayNumber(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                    title="Day of itinerary when this experience occurs (optional)"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOptionalTour}
                      onChange={(e) => setIsOptionalTour(e.target.checked)}
                      className="rounded border-slate-300 text-[var(--season-primary)] focus:ring-[var(--season-primary)]"
                    />
                    <span>Optional</span>
                  </label>
                </div>

                <div className="sm:col-span-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleAssignTour}
                    disabled={!selectedTourId || isLinkingTour}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {isLinkingTour ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    <span>Link</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              All available tours are already linked to this experience.
            </p>
          )}

          {connectedTours.length > 0 ? (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
              {connectedTours.map((ct) => (
                <div
                  key={ct.tourId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs text-slate-900 truncate">
                        {ct.tour.title}
                      </span>
                      <StatusBadge status={ct.tour.isLive ? "LIVE" : "DRAFT"} />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span>{ct.tour.duration}</span>
                      {ct.dayNumber !== null && ct.dayNumber !== undefined && (
                        <span>Day {ct.dayNumber}</span>
                      )}
                      {ct.isOptional && (
                        <span className="text-amber-700 font-medium">Optional addon</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <Link
                      href={`/tours/${ct.tour.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      title="View public tour page"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setTourToDetach(ct)}
                      disabled={removingTourId === ct.tourId}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50 cursor-pointer"
                      title="Detach tour"
                    >
                      {removingTourId === ct.tourId ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <Compass className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-medium text-slate-600">No tours linked yet.</p>
            </div>
          )}
        </div>
      )}

      <ConfirmActionDialog
        open={Boolean(tourToDetach)}
        onClose={() => setTourToDetach(null)}
        onConfirm={handleConfirmDetachTour}
        title="Detach Tour"
        description={
          tourToDetach
            ? `Remove the link to "${tourToDetach.tour.title}"? The tour package itself will not be deleted or altered.`
            : ""
        }
        confirmLabel="Detach Tour"
        tone="warning"
      />

      <ConfirmActionDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDeleteExperience}
        title="Delete Experience"
        description={`Permanently delete "${initialData?.title || title}"? This action cannot be undone.`}
        confirmLabel="Delete Experience"
        tone="danger"
      />
    </div>
  );
}
