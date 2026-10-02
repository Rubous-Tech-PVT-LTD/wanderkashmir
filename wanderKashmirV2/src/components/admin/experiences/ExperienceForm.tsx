"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Sparkles,
  Save,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  Compass,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Clock,
  IndianRupee,
} from "lucide-react";
import {
  createExperienceAction,
  updateExperienceAction,
  assignTourToExperienceAction,
  removeTourFromExperienceAction,
  ExperienceFormInput,
} from "@/actions/adminExperiences";

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
  const isEdit = !!initialData?.id;

  // Form State
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

  // Connected Tours State
  const [connectedTours, setConnectedTours] = useState<ConnectedTour[]>(
    initialData?.tourExperiences || []
  );
  const [selectedTourId, setSelectedTourId] = useState("");
  const [isOptionalTour, setIsOptionalTour] = useState(false);
  const [tourDayNumber, setTourDayNumber] = useState<string>("");
  const [tourDisplayOrder, setTourDisplayOrder] = useState<string>("0");
  const [isLinkingTour, setIsLinkingTour] = useState(false);
  const [removingTourId, setRemovingTourId] = useState<string | null>(null);

  // Status & Validation State
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      alert("This image URL is already in the list.");
      return;
    }
    setImages([...images, url]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage("Experience title is required.");
      return;
    }
    if (!destination.trim()) {
      setErrorMessage("Destination location is required (e.g. Srinagar, Gulmarg).");
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setErrorMessage("Description must be at least 5 characters.");
      return;
    }

    const cleanSlug = sanitizeSlug(slug || title);
    if (!cleanSlug) {
      setErrorMessage("A valid URL slug is required.");
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
          setSuccessMessage("Experience updated successfully.");
          router.refresh();
        } else {
          setErrorMessage(res.error || "Failed to update experience.");
        }
      } else {
        const res = await createExperienceAction(payload);
        if (res.success && res.data) {
          router.push(`/admin/experiences/${res.data.id}`);
        } else {
          setErrorMessage(res.error || "Failed to create experience.");
        }
      }
    } catch {
      setErrorMessage("An unexpected network error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  // Tour Linking in Edit Mode
  const handleAssignTour = async () => {
    if (!isEdit || !initialData?.id || !selectedTourId) return;

    setIsLinkingTour(true);
    setErrorMessage(null);
    try {
      const res = await assignTourToExperienceAction({
        experienceId: initialData.id,
        tourId: selectedTourId,
        isOptional: isOptionalTour,
        dayNumber: tourDayNumber ? parseInt(tourDayNumber, 10) : null,
        displayOrder: tourDisplayOrder ? parseInt(tourDisplayOrder, 10) : 0,
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
              displayOrder: tourDisplayOrder ? parseInt(tourDisplayOrder, 10) : 0,
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
        setSuccessMessage("Tour linked to experience successfully.");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to link tour.");
      }
    } catch {
      setErrorMessage("Failed to assign tour.");
    } finally {
      setIsLinkingTour(false);
    }
  };

  const handleRemoveTour = async (tourId: string) => {
    if (!isEdit || !initialData?.id) return;
    if (!confirm("Are you sure you want to detach this tour from the experience? The tour itself will NOT be deleted or altered.")) {
      return;
    }

    setRemovingTourId(tourId);
    setErrorMessage(null);
    try {
      const res = await removeTourFromExperienceAction(initialData.id, tourId);
      if (res.success) {
        setConnectedTours((prev) => prev.filter((t) => t.tourId !== tourId));
        setSuccessMessage("Tour link removed successfully.");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to remove tour link.");
      }
    } catch {
      setErrorMessage("Failed to remove tour link.");
    } finally {
      setRemovingTourId(null);
    }
  };

  const alreadyAssignedIds = new Set(connectedTours.map((ct) => ct.tourId));
  const unassignedTours = availableTours.filter((t) => !alreadyAssignedIds.has(t.id));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/experiences"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              <span>{isEdit ? "Edit Experience" : "Create New Experience"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {isEdit ? `Managing: ${initialData?.title}` : "Fill out details to publish a new experience"}
            </p>
          </div>
        </div>

        {isEdit && initialData?.slug && (
          <div className="flex items-center gap-2">
            <Link
              href={`/experiences/${initialData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:bg-slate-800 transition"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-3 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{successMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
          <h2 className="text-base font-semibold text-white border-b border-slate-800/80 pb-3 flex items-center gap-2">
            <span>Basic Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                Experience Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Traditional Shikara Ride at Sunset"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                URL Slug <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugManual(true);
                  setSlug(sanitizeSlug(e.target.value));
                }}
                placeholder="traditional-shikara-ride-sunset"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm font-mono text-emerald-400 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Public URL: /experiences/{slug || "..."}
              </p>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                Destination <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Srinagar, Dal Lake"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                Duration
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 2 Hours, Full Day"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Base Price */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                Base Price (₹ INR)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
                Publishing Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ACTIVE">ACTIVE (Published publicly)</option>
                <option value="INACTIVE">INACTIVE (Hidden / Draft)</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-300 mb-1.5">
              Experience Description <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the experience highlights, inclusions, meeting points, and cultural relevance..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
        </div>

        {/* Media & Images Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-base font-semibold text-white">Media & Photos</h2>
            <span className="text-xs text-slate-400">{images.length} images added</span>
          </div>

          {/* Add Image Input */}
          <div className="flex gap-2">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/... or image URL"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium inline-flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add URL</span>
            </button>
          </div>

          {/* Image Previews */}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-video"
                >
                  <Image
                    src={img}
                    alt={`Experience image ${idx + 1}`}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 rounded-md bg-red-600/80 text-white hover:bg-red-500"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-emerald-400 font-semibold">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No images added yet. Provide Cloudinary or web URLs to showcase this experience.
            </p>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/experiences"
            className="px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900 text-sm font-medium transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-sm hover:shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEdit ? "Update Experience" : "Create Experience"}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Connected Tours Card (Available in Edit Mode) */}
      {isEdit && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-400" />
                <span>Connected Tour Packages</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage which tour itineraries include this experience via TourExperience relation.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {connectedTours.length} connected
            </span>
          </div>

          {/* Tour Assignment Form */}
          {unassignedTours.length > 0 ? (
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800/80 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                Link an Existing Tour
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <select
                    value={selectedTourId}
                    onChange={(e) => setSelectedTourId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    title="Day of itinerary when this experience occurs (optional)"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOptionalTour}
                      onChange={(e) => setIsOptionalTour(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-0"
                    />
                    <span>Optional addon</span>
                  </label>
                </div>

                <div className="sm:col-span-2 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleAssignTour}
                    disabled={!selectedTourId || isLinkingTour}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition inline-flex items-center justify-center gap-1.5"
                  >
                    {isLinkingTour ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    <span>Link Tour</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              All active production tours are currently linked to this experience or no additional tours are available.
            </p>
          )}

          {/* List of Connected Tours */}
          {connectedTours.length > 0 ? (
            <div className="divide-y divide-slate-800/80 rounded-lg border border-slate-800 overflow-hidden bg-slate-950">
              {connectedTours.map((ct) => (
                <div
                  key={ct.tourId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 gap-3 hover:bg-slate-900/40 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm truncate">
                        {ct.tour.title}
                      </span>
                      {ct.tour.isLive ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                          Live
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Duration: {ct.tour.duration}</span>
                      {ct.dayNumber !== null && ct.dayNumber !== undefined && (
                        <span>Day: {ct.dayNumber}</span>
                      )}
                      {ct.isOptional && (
                        <span className="text-amber-400 font-medium">Optional Addon</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <Link
                      href={`/tours/${ct.tour.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="View Public Tour Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemoveTour(ct.tourId)}
                      disabled={removingTourId === ct.tourId}
                      className="p-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 transition disabled:opacity-50"
                      title="Remove relation from this experience"
                    >
                      {removingTourId === ct.tourId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed border-slate-800 rounded-lg">
              <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400">No tours linked to this experience yet.</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Use the dropdown above to link this experience to relevant tour itineraries.
              </p>
            </div>
          )}

          {/* Safety Notice */}
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-800/60">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Tour Safety Guarantee: Linking or unlinking experiences ONLY modifies the join relation. The underlying Tour records, itineraries, and live statuses are never modified or deleted.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
