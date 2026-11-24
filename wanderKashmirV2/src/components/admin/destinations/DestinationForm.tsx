"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Save,
  Loader2,
  ExternalLink,
  MapPin,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Building,
  Image as ImageIcon,
} from "lucide-react";
import {
  createDestinationAction,
  updateDestinationAction,
  toggleDestinationPublishAction,
  assignPlaceToDestinationAction,
  removePlaceFromDestinationAction,
  reorderDestinationPlacesAction,
  DestinationFormInput,
} from "@/actions/adminDestinations";
import NearbyPlacesEditor, {
  NearbyPlaceItemConfig,
  AvailablePlaceOption,
} from "./NearbyPlacesEditor";
import type { AvailablePropertyOption } from "@/lib/admin/destinations";
import { GalleryImageItem, isValidImageUrl } from "@/lib/places/galleryValidation";
import {
  AdminPageHeader,
  AdminToastBanner,
  AdminMediaGalleryField,
  ConfirmActionDialog,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface PlaceOption extends AvailablePlaceOption {
  id: string;
  name: string;
  slug: string;
  status: string;
  destination: string | null;
  imageUrl: string | null;
  destinationPlaces?: {
    destination: {
      id: string;
      slug: string;
      title: string;
    };
  }[];
}

interface LinkedPlaceItem {
  id: string;
  displayOrder: number;
  place: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    status: string;
  };
}

interface DestinationFormProps {
  initialData?: {
    id: string;
    slug: string;
    title: string;
    h1Heading: string;
    description: string | null;
    imageUrl: string | null;
    content: string | null;
    workflowState: string;
    seoStrategy?: unknown;
    faqs?: unknown;
    places?: LinkedPlaceItem[];
  };
  availablePlaces: PlaceOption[];
  availableProperties?: AvailablePropertyOption[];
  isEdit?: boolean;
}

function asEditableString(val: unknown): string {
  return typeof val === "string" ? val : "";
}

export default function DestinationForm({
  initialData,
  availablePlaces,
  availableProperties = [],
  isEdit = false,
}: DestinationFormProps) {
  const router = useRouter();
  const { adminHref } = useAdminBasePath();

  const [activeTab, setActiveTab] = useState<
    "basics" | "editorial" | "media" | "relations" | "faqs"
  >("basics");

  const strategy =
    typeof initialData?.seoStrategy === "object" && initialData?.seoStrategy !== null
      ? (initialData.seoStrategy as Record<string, unknown>)
      : {};

  // Basics & SEO
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [h1Heading, setH1Heading] = useState(initialData?.h1Heading || "");
  const [cleanName, setCleanName] = useState(asEditableString(strategy.cleanName));
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [workflowState, setWorkflowState] = useState<"PUBLISHED" | "DRAFT">(
    initialData?.workflowState === "PUBLISHED" ? "PUBLISHED" : "DRAFT"
  );

  // Editorial Sections
  const [overview, setOverview] = useState(
    asEditableString(strategy.overview) || initialData?.content || ""
  );
  const [bestTimeToVisit, setBestTimeToVisit] = useState(asEditableString(strategy.bestTimeToVisit));
  const [howToReach, setHowToReach] = useState(asEditableString(strategy.howToReach));
  const [itinerary, setItinerary] = useState(asEditableString(strategy.itinerary));
  const [food, setFood] = useState(asEditableString(strategy.food));
  const [shopping, setShopping] = useState(asEditableString(strategy.shopping));
  const [activities, setActivities] = useState(asEditableString(strategy.activities));

  const initialNearbyConfig = strategy.nearbyPlacesConfig as
    | { introContent?: string | null; items?: NearbyPlaceItemConfig[] }
    | undefined;
  const [nearbyPlacesIntro, setNearbyPlacesIntro] = useState<string>(
    initialNearbyConfig?.introContent !== undefined
      ? initialNearbyConfig.introContent || ""
      : asEditableString(strategy.nearbyPlacesContent)
  );
  const [nearbyPlacesItems, setNearbyPlacesItems] = useState<NearbyPlaceItemConfig[]>(
    Array.isArray(initialNearbyConfig?.items) ? initialNearbyConfig.items : []
  );

  // Media Gallery
  const [galleryItems, setGalleryItems] = useState<GalleryImageItem[]>(() => {
    const raw = strategy.gallery;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((g, idx): GalleryImageItem | null => {
        const url = typeof g === "string" ? g.trim() : typeof g === "object" && g && "url" in g ? String((g as { url?: unknown }).url || "").trim() : "";
        if (!url) return null;
        const alt =
          typeof g === "object" && g && "alt" in g && typeof (g as { alt?: unknown }).alt === "string"
            ? (g as { alt: string }).alt
            : `${initialData?.h1Heading || "Destination"} photo ${idx + 1}`;
        return {
          url,
          alt,
          caption: null,
          order: idx,
          isFeatured: idx === 0,
        };
      })
      .filter((x): x is GalleryImageItem => x !== null);
  });

  // Photography Spots
  const dynamicSections = Array.isArray(strategy.dynamicSections)
    ? (strategy.dynamicSections as Array<Record<string, unknown>>)
    : [];
  const initialPhotoBlock = dynamicSections.find((b) => b.blockType === "photographySpots");
  const [photoSectionTitle, setPhotoSectionTitle] = useState(
    asEditableString(initialPhotoBlock?.sectionTitle) || "Top Photography & Sunset Frames"
  );
  const [photoSectionSubtitle, setPhotoSectionSubtitle] = useState(
    asEditableString(initialPhotoBlock?.sectionSubtitle) ||
      "Iconic vantage points for capturing the golden glow of the valley."
  );
  const [photoSpots, setPhotoSpots] = useState<
    Array<{ spotName: string; bestTime: string; image: string; tip: string }>
  >(() => {
    const rawSpots = initialPhotoBlock?.spots;
    if (!Array.isArray(rawSpots)) return [];
    return rawSpots.map((s: Record<string, unknown>) => ({
      spotName: asEditableString(s.spotName),
      bestTime: asEditableString(s.bestTime),
      image:
        typeof s.image === "string"
          ? s.image
          : typeof s.image === "object" && s.image && "url" in s.image
          ? asEditableString((s.image as { url?: unknown }).url)
          : "",
      tip: asEditableString(s.tip),
    }));
  });

  // Featured Properties & Linked Places
  const [featuredPropertyIds, setFeaturedPropertyIds] = useState<string[]>(
    Array.isArray(strategy.featuredPropertyIds)
      ? (strategy.featuredPropertyIds as string[])
      : []
  );
  const [selectedPropertyToAdd, setSelectedPropertyToAdd] = useState("");

  const [linkedPlaces, setLinkedPlaces] = useState<LinkedPlaceItem[]>(initialData?.places || []);
  const [selectedPlaceIdToAdd, setSelectedPlaceIdToAdd] = useState("");
  const [isLinkingPlace, setIsLinkingPlace] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<LinkedPlaceItem | null>(null);

  // FAQs
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(() => {
    if (!Array.isArray(initialData?.faqs)) return [];
    return (initialData.faqs as Array<Record<string, unknown>>).map((f) => ({
      question: asEditableString(f.question || f.q),
      answer: asEditableString(f.answer || f.a),
    }));
  });
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");

  // Save / Publish Feedback
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEdit && !slug) {
      const generated = val
        .split("|")[0]
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const gallery = galleryItems
      .map((g) => g.url.trim())
      .filter((u) => u.startsWith("http://") || u.startsWith("https://"));

    const payload: DestinationFormInput = {
      title,
      slug,
      h1Heading: h1Heading || title,
      cleanName: cleanName || null,
      description: description || null,
      imageUrl: imageUrl || null,
      workflowState,
      gallery,
      faqs,
      overview: overview || null,
      bestTimeToVisit: bestTimeToVisit || null,
      howToReach: howToReach || null,
      itinerary: itinerary || null,
      food: food || null,
      shopping: shopping || null,
      activities: activities || null,
      nearbyPlacesContent: nearbyPlacesIntro || null,
      nearbyPlacesConfig: {
        introContent: nearbyPlacesIntro || null,
        items: nearbyPlacesItems,
      },
      photographySpots: {
        sectionTitle: photoSectionTitle,
        sectionSubtitle: photoSectionSubtitle,
        spots: photoSpots,
      },
      featuredPropertyIds,
    };

    try {
      if (isEdit && initialData) {
        const res = await updateDestinationAction(initialData.id, payload);
        if (!res.success) {
          setFeedback({ type: "error", text: res.error || "Failed to update destination." });
          return;
        }
        setFeedback({ type: "success", text: "Destination changes saved." });
      } else {
        const res = await createDestinationAction(payload);
        if (!res.success) {
          setFeedback({ type: "error", text: res.error || "Failed to create destination." });
          return;
        }
        setFeedback({ type: "success", text: "Destination created." });
        if (res.data?.id) {
          router.push(adminHref(`/admin/destinations/${res.data.id}`));
          return;
        }
      }
      router.refresh();
    } catch {
      setFeedback({ type: "error", text: "An unexpected error occurred while saving." });
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (publish: boolean) => {
    if (!initialData) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await toggleDestinationPublishAction(initialData.id, publish);
      if (res.success && res.data) {
        setWorkflowState(res.data.workflowState === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
        setFeedback({
          type: "success",
          text: publish ? "Destination published." : "Destination reverted to draft.",
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to update publication status." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error communicating with server." });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPlace = async () => {
    if (!initialData || !selectedPlaceIdToAdd) return;
    setIsLinkingPlace(true);
    setFeedback(null);
    try {
      const res = await assignPlaceToDestinationAction(initialData.id, selectedPlaceIdToAdd);
      if (res.success && res.data) {
        const placeObj = availablePlaces.find((p) => p.id === selectedPlaceIdToAdd);
        if (placeObj) {
          setLinkedPlaces([
            ...linkedPlaces,
            {
              id: res.data.id,
              displayOrder: linkedPlaces.length,
              place: {
                id: placeObj.id,
                name: placeObj.name,
                slug: placeObj.slug,
                description: null,
                imageUrl: placeObj.imageUrl,
                status: placeObj.status,
              },
            },
          ]);
        }
        setSelectedPlaceIdToAdd("");
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to link place." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error linking place." });
    } finally {
      setIsLinkingPlace(false);
    }
  };

  const handleConfirmUnlinkPlace = async () => {
    if (!initialData || !unlinkTarget) return;
    const res = await removePlaceFromDestinationAction(initialData.id, unlinkTarget.place.id);
    if (!res.success) {
      throw new Error(res.error || "Failed to unlink place.");
    }
    setLinkedPlaces(linkedPlaces.filter((lp) => lp.place.id !== unlinkTarget.place.id));
    router.refresh();
  };

  const handleMovePlace = async (index: number, direction: "up" | "down") => {
    if (!initialData) return;
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= linkedPlaces.length) return;
    const copy = [...linkedPlaces];
    [copy[index], copy[newIdx]] = [copy[newIdx], copy[index]];
    setLinkedPlaces(copy);
    try {
      const res = await reorderDestinationPlacesAction(
        initialData.id,
        copy.map((lp) => lp.place.id)
      );
      if (!res.success) {
        setFeedback({ type: "error", text: res.error || "Failed to save place order." });
        router.refresh();
      }
    } catch {
      setFeedback({ type: "error", text: "Error updating order." });
      router.refresh();
    }
  };

  const isPublished = workflowState === "PUBLISHED";
  const unlinkedPlaces = availablePlaces.filter(
    (ap) => !linkedPlaces.some((lp) => lp.place.id === ap.id)
  );

  const tabs: Array<{
    key: "basics" | "editorial" | "media" | "relations" | "faqs";
    label: string;
    count?: number;
  }> = [
    { key: "basics", label: "Basics & SEO" },
    { key: "editorial", label: "Editorial & Nearby" },
    { key: "media", label: "Gallery & Photo Spots", count: galleryItems.length },
    { key: "relations", label: "Places & Stays", count: linkedPlaces.length + featuredPropertyIds.length },
    { key: "faqs", label: "FAQs", count: faqs.length },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl mx-auto pb-16">
      <AdminPageHeader
        title={isEdit ? initialData?.title.split("|")[0].trim() || "Edit Destination" : "New Destination"}
        subtitle={isEdit ? `/destinations/${slug}` : "Create a new destination travel guide."}
        backHref={adminHref("/admin/destinations")}
        backLabel="Back to Destinations"
        badge={isEdit ? <StatusBadge status={workflowState} /> : undefined}
        actions={
          <>
            {isEdit && initialData && isPublished && (
              <Link
                href={`/destinations/${initialData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>View Live</span>
              </Link>
            )}
            {isEdit && initialData && (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleTogglePublish(!isPublished)}
                className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors cursor-pointer disabled:opacity-50 ${
                  isPublished
                    ? "text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100"
                    : "text-[var(--season-primary-hover)] bg-[var(--season-primary-light)] border-[var(--season-primary)]/25 hover:bg-[var(--season-primary-light)]/80"
                }`}
              >
                {isPublished ? "Unpublish" : "Publish"}
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isEdit ? "Save Changes" : "Create Destination"}</span>
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

      {/* TAB 1: BASICS & SEO */}
      {activeTab === "basics" && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 pb-2.5 border-b border-slate-100">
            Destination Metadata &amp; SEO
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Page Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., Srinagar Travel Guide | Places to Visit & Stays"
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Short Name (Hub Label)
              </label>
              <input
                type="text"
                value={cleanName}
                onChange={(e) => setCleanName(e.target.value)}
                placeholder="e.g., Srinagar"
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                URL Slug <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="srinagar"
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Primary H1 Heading <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={h1Heading}
                onChange={(e) => setH1Heading(e.target.value)}
                placeholder="e.g., Discover Srinagar"
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start pt-2">
            <div className="w-32 h-22 rounded-md bg-slate-50 border border-slate-200 relative overflow-hidden shrink-0">
              {imageUrl && isValidImageUrl(imageUrl) ? (
                <Image key={imageUrl} src={imageUrl} alt={title || "Hero"} fill className="object-cover" sizes="128px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <ImageIcon className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Featured Hero Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://res.cloudinary.com/..."
                className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Displayed as the lead cover photo in the destination Bento gallery and social preview cards.
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700">Meta Description</label>
              <span className={`text-[11px] tabular-nums ${description.length > 160 ? "text-amber-700" : "text-slate-400"}`}>
                {description.length} / 160 chars
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summarize destination highlights, best visiting months, and travel tips..."
              className="w-full bg-white border border-slate-200 rounded-md p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
            />
          </div>
        </div>
      )}

      {/* TAB 2: EDITORIAL & NEARBY */}
      {activeTab === "editorial" && (
        <div className="space-y-5">
          <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900 pb-2.5 border-b border-slate-100">
              Travel Guide Sections
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Overview & Introduction", value: overview, set: setOverview, placeholder: "Introduction to the destination..." },
                { label: "Best Time to Visit & Weather", value: bestTimeToVisit, set: setBestTimeToVisit, placeholder: "Seasonal guide across spring, summer, autumn, winter..." },
                { label: "How to Reach (Air, Rail, Road)", value: howToReach, set: setHowToReach, placeholder: "Routes from Srinagar airport or Jammu railway station..." },
                { label: "Suggested Itinerary", value: itinerary, set: setItinerary, placeholder: "Recommended sightseeing plan..." },
                { label: "Food & Local Dining", value: food, set: setFood, placeholder: "Wazwan, Kahwa, Noon Chai, local bakeries..." },
                { label: "Shopping & Crafts", value: shopping, set: setShopping, placeholder: "Pashmina, walnut wood, saffron, carpets..." },
                { label: "Top Activities & Experiences", value: activities, set: setActivities, placeholder: "Shikara ride, gondola, trekking, skiing..." },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    {field.label}
                  </label>
                  <textarea
                    rows={4}
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full bg-white border border-slate-200 rounded-md p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 pb-2.5 border-b border-slate-100">
              Nearby Places &amp; Day Excursions
            </h2>
            <NearbyPlacesEditor
              introContent={nearbyPlacesIntro}
              onChangeIntroContent={setNearbyPlacesIntro}
              items={nearbyPlacesItems}
              onChangeItems={setNearbyPlacesItems}
              availablePlaces={availablePlaces}
            />
          </div>
        </div>
      )}

      {/* TAB 3: GALLERY & PHOTO SPOTS */}
      {activeTab === "media" && (
        <div className="space-y-5">
          <AdminMediaGalleryField
            title="Destination Bento Gallery"
            description="High-resolution photos displayed in the destination hero Bento gallery alongside the cover image."
            items={galleryItems}
            onChange={setGalleryItems}
            entityName={cleanName || title || "Destination"}
            showBentoPreview
            showCaption={false}
            showFeaturedStar={false}
          />

          <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Photography &amp; Viewpoint Spots ({photoSpots.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Curate golden-hour viewpoints and framing tips.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPhotoSpots((prev) => [
                    ...prev,
                    { spotName: "", bestTime: "", image: "", tip: "" },
                  ])
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[var(--season-primary)] text-white text-xs font-medium hover:bg-[var(--season-primary-hover)] transition-colors cursor-pointer self-start shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Spot</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Section Heading</label>
                <input
                  type="text"
                  value={photoSectionTitle}
                  onChange={(e) => setPhotoSectionTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Section Subtitle</label>
                <input
                  type="text"
                  value={photoSectionSubtitle}
                  onChange={(e) => setPhotoSectionSubtitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                />
              </div>
            </div>

            {photoSpots.length === 0 ? (
              <div className="p-6 rounded-md border border-dashed border-slate-200 text-center text-xs text-slate-500 bg-slate-50/50">
                No photography spots added yet.
              </div>
            ) : (
              <div className="space-y-3">
                {photoSpots.map((spot, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-md bg-slate-50/70 border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                      <span className="text-xs font-semibold text-slate-800">
                        Spot #{index + 1}: {spot.spotName || "Untitled"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => {
                            const updated = [...photoSpots];
                            [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
                            setPhotoSpots(updated);
                          }}
                          className="p-1 rounded border border-slate-200 bg-white text-slate-500 hover:text-slate-900 disabled:opacity-35 cursor-pointer"
                          aria-label="Move spot up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === photoSpots.length - 1}
                          onClick={() => {
                            const updated = [...photoSpots];
                            [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
                            setPhotoSpots(updated);
                          }}
                          className="p-1 rounded border border-slate-200 bg-white text-slate-500 hover:text-slate-900 disabled:opacity-35 cursor-pointer"
                          aria-label="Move spot down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPhotoSpots(photoSpots.filter((_, i) => i !== index))}
                          className="p-1 rounded border border-slate-200 bg-white text-slate-400 hover:text-rose-600 cursor-pointer"
                          aria-label="Delete spot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={spot.spotName}
                        onChange={(e) =>
                          setPhotoSpots((prev) =>
                            prev.map((s, i) => (i === index ? { ...s, spotName: e.target.value } : s))
                          )
                        }
                        placeholder="Viewpoint name"
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                      />
                      <input
                        type="text"
                        value={spot.bestTime}
                        onChange={(e) =>
                          setPhotoSpots((prev) =>
                            prev.map((s, i) => (i === index ? { ...s, bestTime: e.target.value } : s))
                          )
                        }
                        placeholder="Best time to shoot (e.g., Golden hour)"
                        className="w-full bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        value={spot.image}
                        onChange={(e) =>
                          setPhotoSpots((prev) =>
                            prev.map((s, i) => (i === index ? { ...s, image: e.target.value } : s))
                          )
                        }
                        placeholder="Image URL (https://...)"
                        className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                      />
                      {spot.image && isValidImageUrl(spot.image) && (
                        <div className="w-10 h-8 rounded bg-white relative overflow-hidden border border-slate-200 shrink-0">
                          <Image src={spot.image} alt={spot.spotName || "Spot"} fill className="object-cover" sizes="40px" />
                        </div>
                      )}
                    </div>

                    <textarea
                      rows={2}
                      value={spot.tip}
                      onChange={(e) =>
                        setPhotoSpots((prev) =>
                          prev.map((s, i) => (i === index ? { ...s, tip: e.target.value } : s))
                        )
                      }
                      placeholder="Framing or lighting advice..."
                      className="w-full bg-white border border-slate-200 rounded-md p-2 text-xs text-slate-900 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PLACES & STAYS */}
      {activeTab === "relations" && (
        <div className="space-y-5">
          {/* Linked Places */}
          <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Linked Places to Visit ({linkedPlaces.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Active linked places appear in the &ldquo;Top Places to Visit&rdquo; section on the public destination page.
                </p>
              </div>
              {isEdit && initialData && (
                <div className="flex items-center gap-2">
                  <select
                    value={selectedPlaceIdToAdd}
                    onChange={(e) => setSelectedPlaceIdToAdd(e.target.value)}
                    className="bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 max-w-[220px] focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                  >
                    <option value="">Select place to link...</option>
                    {unlinkedPlaces.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.status})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selectedPlaceIdToAdd || isLinkingPlace}
                    onClick={handleAssignPlace}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[var(--season-primary)] text-white text-xs font-medium hover:bg-[var(--season-primary-hover)] disabled:opacity-40 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Link</span>
                  </button>
                </div>
              )}
            </div>

            {!isEdit ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                Save this destination first to link and order Places.
              </p>
            ) : linkedPlaces.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No places linked yet. Select an attraction above or manage them in{" "}
                <Link href={adminHref("/admin/places")} className="text-[var(--season-primary)] font-medium underline">
                  Places CMS
                </Link>
                .
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {linkedPlaces.map((lp, index) => (
                  <div key={lp.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMovePlace(index, "up")}
                          className="p-1 rounded border border-slate-200 bg-white text-slate-500 hover:text-slate-900 disabled:opacity-35 cursor-pointer"
                          aria-label="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={index === linkedPlaces.length - 1}
                          onClick={() => handleMovePlace(index, "down")}
                          className="p-1 rounded border border-slate-200 bg-white text-slate-500 hover:text-slate-900 disabled:opacity-35 cursor-pointer"
                          aria-label="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="w-10 h-8 rounded bg-slate-100 relative overflow-hidden border border-slate-200 shrink-0">
                        {lp.place.imageUrl ? (
                          <Image src={lp.place.imageUrl} alt={lp.place.name} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={adminHref(`/admin/places/${lp.place.id}/edit`)}
                          className="text-xs font-medium text-slate-900 hover:text-[var(--season-primary)] block truncate transition-colors"
                        >
                          {lp.place.name}
                        </Link>
                        <div className="text-[11px] text-slate-400 font-mono truncate">
                          /destinations/{initialData?.slug}/{lp.place.slug}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={lp.place.status === "ACTIVE" ? "PUBLISHED" : "DRAFT"} />
                      <button
                        type="button"
                        onClick={() => setUnlinkTarget(lp)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Unlink from destination"
                        aria-label={`Unlink ${lp.place.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Properties */}
          <div className="bg-white border border-slate-200 rounded-md p-5 space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">
                Featured Stays ({featuredPropertyIds.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pin approved hotels and homestays for the &ldquo;Where to Stay&rdquo; section. Leave empty to auto-match by location.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedPropertyToAdd}
                onChange={(e) => setSelectedPropertyToAdd(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
              >
                <option value="">Choose an approved stay to pin...</option>
                {availableProperties
                  .filter((p) => !featuredPropertyIds.includes(p.id))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.location} (₹{p.pricePerNight?.toLocaleString("en-IN")}/night)
                    </option>
                  ))}
              </select>
              <button
                type="button"
                disabled={!selectedPropertyToAdd}
                onClick={() => {
                  if (!selectedPropertyToAdd || featuredPropertyIds.includes(selectedPropertyToAdd)) return;
                  setFeaturedPropertyIds([...featuredPropertyIds, selectedPropertyToAdd]);
                  setSelectedPropertyToAdd("");
                }}
                className="inline-flex items-center justify-center gap-1 px-3.5 py-2 rounded-md bg-[var(--season-primary)] text-white text-xs font-medium hover:bg-[var(--season-primary-hover)] disabled:opacity-40 cursor-pointer shrink-0 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stay</span>
              </button>
            </div>

            {featuredPropertyIds.length > 0 && (
              <div className="divide-y divide-slate-100">
                {featuredPropertyIds.map((propId, index) => {
                  const prop = availableProperties.find((p) => p.id === propId);
                  return (
                    <div key={propId} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              const next = [...featuredPropertyIds];
                              [next[index], next[index - 1]] = [next[index - 1], next[index]];
                              setFeaturedPropertyIds(next);
                            }}
                            className="p-1 rounded border border-slate-200 bg-white text-slate-500 hover:text-slate-900 disabled:opacity-35 cursor-pointer"
                            aria-label="Move stay up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === featuredPropertyIds.length - 1}
                            onClick={() => {
                              const next = [...featuredPropertyIds];
                              [next[index], next[index + 1]] = [next[index + 1], next[index]];
                              setFeaturedPropertyIds(next);
                            }}
                            className="p-1 rounded border border-slate-200 bg-white text-slate-500 hover:text-slate-900 disabled:opacity-35 cursor-pointer"
                            aria-label="Move stay down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="w-10 h-8 rounded bg-slate-100 relative overflow-hidden border border-slate-200 shrink-0">
                          {prop?.imageUrl ? (
                            <Image src={prop.imageUrl} alt={prop.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Building className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-900 truncate">
                            {prop ? prop.name : propId}
                          </div>
                          {prop && (
                            <div className="text-[11px] text-slate-500 truncate">
                              {prop.location} · ₹{prop.pricePerNight?.toLocaleString("en-IN")}/night
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFeaturedPropertyIds(featuredPropertyIds.filter((id) => id !== propId))}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        aria-label="Remove stay"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: FAQs */}
      {activeTab === "faqs" && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-900 pb-2.5 border-b border-slate-100">
            Frequently Asked Questions ({faqs.length})
          </h2>

          {faqs.length > 0 && (
            <div className="space-y-2.5">
              {faqs.map((faq, index) => (
                <div key={index} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-xs text-slate-900">{faq.question}</span>
                    <button
                      type="button"
                      onClick={() => setFaqs(faqs.filter((_, i) => i !== index))}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0"
                      aria-label="Remove FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 rounded-md bg-slate-50/70 border border-slate-200 space-y-2.5">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Question (e.g., Do prepaid SIM cards work in Srinagar?)"
              className="w-full bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
            />
            <textarea
              rows={2}
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Answer..."
              className="w-full bg-white border border-slate-200 rounded-md p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!newQuestion.trim() || !newAnswer.trim()) return;
                  setFaqs([...faqs, { question: newQuestion.trim(), answer: newAnswer.trim() }]);
                  setNewQuestion("");
                  setNewAnswer("");
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmActionDialog
        open={Boolean(unlinkTarget)}
        onClose={() => setUnlinkTarget(null)}
        title={`Unlink "${unlinkTarget?.place.name || ""}"?`}
        description="This removes the place from this destination guide without deleting the underlying Place record."
        confirmLabel="Unlink Place"
        tone="warning"
        onConfirm={handleConfirmUnlinkPlace}
      />
    </form>
  );
}
