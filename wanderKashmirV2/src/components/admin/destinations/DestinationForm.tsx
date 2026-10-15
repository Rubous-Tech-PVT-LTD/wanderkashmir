"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Compass,
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  Image as ImageIcon,
  Camera,
  Building,
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
    seoStrategy?: any;
    faqs?: any;
    places?: LinkedPlaceItem[];
  };
  availablePlaces: PlaceOption[];
  availableProperties?: AvailablePropertyOption[];
  isEdit?: boolean;
}

export default function DestinationForm({
  initialData,
  availablePlaces,
  availableProperties = [],
  isEdit = false,
}: DestinationFormProps) {
  const router = useRouter();

  // Extract initial seoStrategy values
  const strategy = (typeof initialData?.seoStrategy === "object" && initialData?.seoStrategy !== null)
    ? initialData.seoStrategy
    : {};

  // Form Fields
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [h1Heading, setH1Heading] = useState(initialData?.h1Heading || "");
  const [cleanName, setCleanName] = useState(strategy.cleanName || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [workflowState, setWorkflowState] = useState<"PUBLISHED" | "DRAFT" | "ARCHIVED">(
    (initialData?.workflowState as any) || "DRAFT"
  );

  // Content Sections
  const [overview, setOverview] = useState(strategy.overview || initialData?.content || "");
  const [bestTimeToVisit, setBestTimeToVisit] = useState(strategy.bestTimeToVisit || "");
  const [howToReach, setHowToReach] = useState(strategy.howToReach || "");
  const [itinerary, setItinerary] = useState(strategy.itinerary || "");
  const [food, setFood] = useState(strategy.food || "");
  const [shopping, setShopping] = useState(strategy.shopping || "");
  const [activities, setActivities] = useState(strategy.activities || "");
  const initialNearbyConfig = strategy.nearbyPlacesConfig;
  const [nearbyPlacesIntro, setNearbyPlacesIntro] = useState<string>(
    initialNearbyConfig?.introContent !== undefined
      ? initialNearbyConfig.introContent || ""
      : strategy.nearbyPlacesContent || ""
  );
  const [nearbyPlacesItems, setNearbyPlacesItems] = useState<NearbyPlaceItemConfig[]>(
    Array.isArray(initialNearbyConfig?.items) ? initialNearbyConfig.items : []
  );

  // Gallery
  const initialGalleryStr = Array.isArray(strategy.gallery)
    ? strategy.gallery.map((g: any) => (typeof g === "string" ? g : g?.url || "")).filter(Boolean).join("\n")
    : "";
  const [galleryStr, setGalleryStr] = useState(initialGalleryStr);

  // FAQs
  const initialFaqs = Array.isArray(initialData?.faqs)
    ? initialData.faqs.map((f: any) => ({
        question: f.question || f.q || "",
        answer: f.answer || f.a || "",
      }))
    : [];
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(initialFaqs);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  // Photography Spots (Dynamic Section)
  const initialPhotoBlock = Array.isArray(strategy.dynamicSections)
    ? strategy.dynamicSections.find((b: any) => b.blockType === "photographySpots")
    : null;
  const [photoSectionTitle, setPhotoSectionTitle] = useState(
    initialPhotoBlock?.sectionTitle || "Top Photography & Sunset Frames"
  );
  const [photoSectionSubtitle, setPhotoSectionSubtitle] = useState(
    initialPhotoBlock?.sectionSubtitle || "Iconic vantage points for capturing the golden glow of the valley."
  );
  const [photoSpots, setPhotoSpots] = useState<
    Array<{ spotName: string; bestTime: string; image: string; tip: string }>
  >(
    Array.isArray(initialPhotoBlock?.spots)
      ? initialPhotoBlock.spots.map((s: any) => ({
          spotName: s.spotName || "",
          bestTime: s.bestTime || "",
          image: typeof s.image === "string" ? s.image : s.image?.url || "",
          tip: s.tip || "",
        }))
      : []
  );

  const handleAddPhotoSpot = () => {
    setPhotoSpots((prev) => [
      ...prev,
      { spotName: "", bestTime: "Golden Hour (5:30 PM - 6:30 PM)", image: "", tip: "" },
    ]);
  };

  const handleUpdatePhotoSpot = (index: number, field: string, value: string) => {
    setPhotoSpots((prev) =>
      prev.map((spot, i) => (i === index ? { ...spot, [field]: value } : spot))
    );
  };

  const handleRemovePhotoSpot = (index: number) => {
    setPhotoSpots((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMovePhotoSpot = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= photoSpots.length) return;
    const updated = [...photoSpots];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    setPhotoSpots(updated);
  };

  // Featured Properties ("Where to Stay")
  const [featuredPropertyIds, setFeaturedPropertyIds] = useState<string[]>(
    Array.isArray(strategy.featuredPropertyIds) ? strategy.featuredPropertyIds : []
  );
  const [selectedPropertyToAdd, setSelectedPropertyToAdd] = useState("");

  const handleAddFeaturedProperty = (propId: string) => {
    if (!propId || featuredPropertyIds.includes(propId)) return;
    setFeaturedPropertyIds([...featuredPropertyIds, propId]);
    setSelectedPropertyToAdd("");
  };

  const handleRemoveFeaturedProperty = (propId: string) => {
    setFeaturedPropertyIds(featuredPropertyIds.filter((id) => id !== propId));
  };

  const handleMoveFeaturedProperty = (index: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= featuredPropertyIds.length) return;
    const updated = [...featuredPropertyIds];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIdx, 0, moved);
    setFeaturedPropertyIds(updated);
  };

  // Linked Places State
  const [linkedPlaces, setLinkedPlaces] = useState<LinkedPlaceItem[]>(
    initialData?.places || []
  );
  const [selectedPlaceIdToAdd, setSelectedPlaceIdToAdd] = useState("");
  const [isLinkingPlace, setIsLinkingPlace] = useState(false);

  // Feedback States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-fill slug if user types title on create
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

  const handleAddFaq = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setFaqs([...faqs, { question: newQuestion.trim(), answer: newAnswer.trim() }]);
    setNewQuestion("");
    setNewAnswer("");
  };

  const handleRemoveFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const gallery = galleryStr
      .split(/[\n,]+/)
      .map((s: string) => s.trim())
      .filter((s: string) => s.startsWith("http://") || s.startsWith("https://"));

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
          setError(res.error || "Failed to update destination.");
          setLoading(false);
          return;
        }
        setSuccessMsg("Destination updated successfully.");
      } else {
        const res = await createDestinationAction(payload);
        if (!res.success) {
          setError(res.error || "Failed to create destination.");
          setLoading(false);
          return;
        }
        setSuccessMsg("Destination created successfully.");
        if (res.data?.id) {
          router.push(`/admin/destinations/${res.data.id}`);
          return;
        }
      }
      router.refresh();
    } catch {
      setError("An unexpected error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (publish: boolean) => {
    if (!initialData) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await toggleDestinationPublishAction(initialData.id, publish);
      if (res.success && res.data) {
        setWorkflowState(res.data.workflowState as any);
        setSuccessMsg(
          publish ? "Destination published successfully." : "Destination unpublished successfully."
        );
        router.refresh();
      } else {
        setError(res.error || "Failed to toggle publication.");
      }
    } catch {
      setError("Error communicating with server.");
    } finally {
      setLoading(false);
    }
  };

  // Place Link / Unlink / Reorder Handlers
  const handleAssignPlace = async () => {
    if (!initialData || !selectedPlaceIdToAdd) return;
    setIsLinkingPlace(true);

    try {
      const res = await assignPlaceToDestinationAction(initialData.id, selectedPlaceIdToAdd);
      if (res.success && res.data) {
        const placeObj = availablePlaces.find((p) => p.id === selectedPlaceIdToAdd);
        if (placeObj) {
          const newLinked: LinkedPlaceItem = {
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
          };
          setLinkedPlaces([...linkedPlaces, newLinked]);
        }
        setSelectedPlaceIdToAdd("");
        router.refresh();
      } else {
        alert(res.error || "Failed to assign place.");
      }
    } catch {
      alert("Error assigning place.");
    } finally {
      setIsLinkingPlace(false);
    }
  };

  const handleRemovePlace = async (placeId: string) => {
    if (!initialData) return;
    if (!confirm("Unlink this place from destination? (The place record will not be deleted)")) return;

    try {
      const res = await removePlaceFromDestinationAction(initialData.id, placeId);
      if (res.success) {
        setLinkedPlaces(linkedPlaces.filter((lp) => lp.place.id !== placeId));
        router.refresh();
      } else {
        alert(res.error || "Failed to unlink place.");
      }
    } catch {
      alert("Error unlinking place.");
    }
  };

  const handleMovePlace = async (index: number, direction: "up" | "down") => {
    if (!initialData) return;
    const newIdx = direction === "up" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= linkedPlaces.length) return;

    const copy = [...linkedPlaces];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

    setLinkedPlaces(copy);

    try {
      const placeIds = copy.map((lp) => lp.place.id);
      const res = await reorderDestinationPlacesAction(initialData.id, placeIds);
      if (!res.success) {
        alert(res.error || "Failed to save reordered places.");
        router.refresh();
      }
    } catch {
      alert("Error updating order.");
      router.refresh();
    }
  };

  const isPublished = workflowState === "PUBLISHED";
  const unlinkedPlaces = availablePlaces.filter(
    (ap) => !linkedPlaces.some((lp) => lp.place.id === ap.id)
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/admin/destinations"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Destinations
        </Link>

        {isEdit && initialData && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isPublished
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-emerald-400" : "bg-amber-400"}`} />
              {workflowState}
            </span>

            {isPublished && (
              <Link
                href={`/destinations/${initialData.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Public Page
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Title & Description */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {isEdit ? `Edit Destination: ${initialData?.title.split("|")[0].trim()}` : "Create New Destination"}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Configure destination metadata, SEO landing architecture, rich editorial sections, and tourist attraction places.
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Overview & SEO Meta */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Compass className="w-4 h-4 text-emerald-400" />
            1. Overview & SEO Landing Metadata
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Page Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Srinagar Travel Guide | Places to Visit & Stays"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Clean Name (Hub Label)
              </label>
              <input
                type="text"
                value={cleanName}
                onChange={(e) => setCleanName(e.target.value)}
                placeholder="e.g. Srinagar"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                URL Slug <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="srinagar"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                H1 Heading <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={h1Heading}
                onChange={(e) => setH1Heading(e.target.value)}
                placeholder="e.g. Discover Srinagar — Venice of the East"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Featured Hero Image URL
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono text-[11px] placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Meta Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Compelling SEO meta description summarizing destination attractions, weather, and travel tips..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Section 2: Structured Editorial Content Sections */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <Compass className="w-4 h-4 text-emerald-400" />
            2. Structured Editorial Content Sections
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Overview & Introduction
              </label>
              <textarea
                rows={4}
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                placeholder="Comprehensive introduction to the valley or town..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Best Time to Visit & Weather
              </label>
              <textarea
                rows={4}
                value={bestTimeToVisit}
                onChange={(e) => setBestTimeToVisit(e.target.value)}
                placeholder="Seasonal breakdown: Summer vs Autumn vs Snow winter..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                How to Reach (Air, Rail, Road)
              </label>
              <textarea
                rows={4}
                value={howToReach}
                onChange={(e) => setHowToReach(e.target.value)}
                placeholder="Route options from Srinagar airport or Jammu railway station..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Suggested Itinerary & Sightseeing
              </label>
              <textarea
                rows={4}
                value={itinerary}
                onChange={(e) => setItinerary(e.target.value)}
                placeholder="Day-by-day sightseeing highlights..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Food & Kashmiri Dining Culture
              </label>
              <textarea
                rows={4}
                value={food}
                onChange={(e) => setFood(e.target.value)}
                placeholder="Wazwan delicacies, Noon Chai, Kahwa, local bakeries..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Shopping & Handcrafted Souvenirs
              </label>
              <textarea
                rows={4}
                value={shopping}
                onChange={(e) => setShopping(e.target.value)}
                placeholder="Pashmina shawls, walnut wood carvings, saffron, carpets..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Top Activities & Adventures
              </label>
              <textarea
                rows={4}
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                placeholder="Shikara ride, Gondola cable car, pony trekking, skiing..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
                8. Nearby Places & Day Excursions
              </label>
              <NearbyPlacesEditor
                introContent={nearbyPlacesIntro}
                onChangeIntroContent={setNearbyPlacesIntro}
                items={nearbyPlacesItems}
                onChangeItems={setNearbyPlacesItems}
                availablePlaces={availablePlaces}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Media Gallery */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
            <ImageIcon className="w-4 h-4 text-emerald-400" />
            3. Photo Gallery (Cloudinary URLs)
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Gallery Image URLs (one per line)
            </label>
            <textarea
              rows={4}
              value={galleryStr}
              onChange={(e) => setGalleryStr(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
            />
          </div>

          {galleryStr.trim() && (
            <div className="flex flex-wrap gap-2 pt-2">
              {galleryStr
                .split(/[\n,]+/)
                .map((url: string) => url.trim())
                .filter((url: string) => url.startsWith("http"))
                .slice(0, 6)
                .map((url: string, idx: number) => (
                  <div
                    key={idx}
                    className="w-20 h-16 rounded-lg bg-slate-800 relative overflow-hidden border border-slate-700/60"
                  >
                    <Image src={url} alt={`Gallery preview ${idx + 1}`} fill className="object-cover" sizes="80px" />
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Section: Photography & Sunset Spots (Dynamic Section) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                Photography & Sunset Spots ({photoSpots.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Curate prime camera angles, golden hour timings, and vantage points with photos.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddPhotoSpot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Add Photography Spot
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Section Heading
              </label>
              <input
                type="text"
                value={photoSectionTitle}
                onChange={(e) => setPhotoSectionTitle(e.target.value)}
                placeholder="Top Photography & Sunset Frames"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Section Subtitle
              </label>
              <input
                type="text"
                value={photoSectionSubtitle}
                onChange={(e) => setPhotoSectionSubtitle(e.target.value)}
                placeholder="Iconic vantage points for capturing the golden glow of the valley."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {photoSpots.length === 0 ? (
            <div className="p-6 rounded-lg border border-dashed border-slate-800 text-center text-xs text-slate-500">
              No photography spots configured yet. Click &quot;Add Photography Spot&quot; above to add viewpoints and golden hour spots.
            </div>
          ) : (
            <div className="space-y-3">
              {photoSpots.map((spot, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/90 space-y-3 relative"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMovePhotoSpot(index, "up")}
                          className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === photoSpots.length - 1}
                          onClick={() => handleMovePhotoSpot(index, "down")}
                          className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-slate-300">
                        Spot #{index + 1}: {spot.spotName || "Untitled Spot"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemovePhotoSpot(index)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
                      title="Delete Spot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Spot / Viewpoint Name *
                      </label>
                      <input
                        type="text"
                        value={spot.spotName}
                        onChange={(e) => handleUpdatePhotoSpot(index, "spotName", e.target.value)}
                        placeholder="e.g. Char Chinar Island at Sunset"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Best Time To Shoot *
                      </label>
                      <input
                        type="text"
                        value={spot.bestTime}
                        onChange={(e) => handleUpdatePhotoSpot(index, "bestTime", e.target.value)}
                        placeholder="e.g. Golden Hour (5:30 PM - 6:30 PM)"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Photo / Image URL (Cloudinary or Web URL)
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={spot.image}
                        onChange={(e) => handleUpdatePhotoSpot(index, "image", e.target.value)}
                        placeholder="https://res.cloudinary.com/..."
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                      />
                      {spot.image && (
                        <div className="w-10 h-8 rounded bg-slate-800 relative overflow-hidden border border-slate-700 shrink-0">
                          <Image src={spot.image} alt={spot.spotName || "preview"} fill className="object-cover" sizes="40px" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Framing Advice & Photography Tip
                    </label>
                    <textarea
                      rows={2}
                      value={spot.tip}
                      onChange={(e) => handleUpdatePhotoSpot(index, "tip", e.target.value)}
                      placeholder="e.g. Position your camera from an approaching Shikara with the Zabarwan silhouette behind the trees..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Where to Stay (Featured Properties & Accommodations) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-400" />
                Where to Stay & Featured Accommodations ({featuredPropertyIds.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pin and reorder verified hotels, resorts, and homestays displayed under &quot;Where to Stay&quot; on the public destination page.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedPropertyToAdd}
              onChange={(e) => setSelectedPropertyToAdd(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">-- Choose a verified property to feature --</option>
              {availableProperties
                .filter((p) => !featuredPropertyIds.includes(p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.location} (₹{p.pricePerNight?.toLocaleString("en-IN")}/night) [{p.propertyType}]
                  </option>
                ))}
            </select>
            <button
              type="button"
              disabled={!selectedPropertyToAdd}
              onClick={() => handleAddFeaturedProperty(selectedPropertyToAdd)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add Property
            </button>
          </div>

          {featuredPropertyIds.length === 0 ? (
            <div className="p-5 rounded-lg border border-dashed border-slate-800 text-center text-xs text-slate-500">
              No specific properties pinned. The public destination page will automatically query and display verified properties matching this destination&apos;s location.
            </div>
          ) : (
            <div className="space-y-2">
              {featuredPropertyIds.map((propId, index) => {
                const prop = availableProperties.find((p) => p.id === propId);
                return (
                  <div
                    key={propId}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveFeaturedProperty(index, "up")}
                          className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === featuredPropertyIds.length - 1}
                          onClick={() => handleMoveFeaturedProperty(index, "down")}
                          className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-12 h-10 rounded bg-slate-800 relative overflow-hidden shrink-0 border border-slate-700/60">
                        {prop?.imageUrl ? (
                          <Image src={prop.imageUrl} alt={prop.name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <Building className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-white truncate">
                            {prop ? prop.name : `Property ID: ${propId}`}
                          </p>
                          {prop?.propertyType && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50 shrink-0">
                              {prop.propertyType}
                            </span>
                          )}
                        </div>
                        {prop && (
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{prop.location}</span>
                            </span>
                            <span className="text-emerald-400 font-medium shrink-0">
                              ₹{prop.pricePerNight?.toLocaleString("en-IN")}/night
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFeaturedProperty(propId)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-400 cursor-pointer transition-colors shrink-0"
                      title="Remove Property"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 4: Places to Visit (DestinationPlace Relations) - Only in Edit Mode */}
        {isEdit && initialData && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  4. Places to Visit in this Destination ({linkedPlaces.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ordered tourist attractions linked via DestinationPlace join records.
                </p>
              </div>

              {/* Add Place Picker */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedPlaceIdToAdd}
                  onChange={(e) => setSelectedPlaceIdToAdd(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 max-w-[200px]"
                >
                  <option value="">Select Place to Link...</option>
                  {unlinkedPlaces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.slug})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  disabled={!selectedPlaceIdToAdd || isLinkingPlace}
                  onClick={handleAssignPlace}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Link
                </button>
              </div>
            </div>

            {linkedPlaces.length === 0 ? (
              <div className="py-6 text-center text-slate-500 text-xs">
                No tourist attraction places are currently linked to this destination.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {linkedPlaces.map((lp, index) => (
                  <div key={lp.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMovePlace(index, "up")}
                          className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === linkedPlaces.length - 1}
                          onClick={() => handleMovePlace(index, "down")}
                          className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="w-10 h-9 rounded-lg overflow-hidden bg-slate-800 relative border border-slate-700/60 shrink-0">
                        {lp.place.imageUrl ? (
                          <Image src={lp.place.imageUrl} alt={lp.place.name} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="font-semibold text-white text-xs">{lp.place.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          /destinations/{initialData.slug}/{lp.place.slug}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${
                          lp.place.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {lp.place.status}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemovePlace(lp.place.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Unlink from Destination (Does not delete place)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section 5: FAQs */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-white border-b border-slate-800/80 pb-3">
            5. Frequently Asked Questions ({faqs.length})
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1 relative">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-xs text-white">Q: {faq.question}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(index)}
                    className="text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-400">A: {faq.answer}</p>
              </div>
            ))}

            {/* Add New FAQ Input */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Question (e.g. Is prepaid mobile network working in Srinagar?)"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <textarea
                rows={2}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Answer (e.g. Only postpaid SIMs work across Kashmir...)"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3 inline mr-1" /> Add FAQ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Publishing Lifecycle (Only in Edit Mode) */}
        {isEdit && initialData && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h2 className="text-base font-semibold text-white">6. Publishing Lifecycle</h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full border ${
                  isPublished
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                {workflowState}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Only published destinations (<code className="text-emerald-400">workflowState === &apos;PUBLISHED&apos;</code>) are
              served on <code className="text-slate-300">/destinations</code> and rendered in the sitemap.
            </p>

            <div className="flex items-center gap-3">
              {isPublished ? (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleTogglePublish(false)}
                  className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  Unpublish Destination
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleTogglePublish(true)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  Publish Destination
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 text-slate-500 text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                Delete: <strong>NOT IMPLEMENTED</strong>. Soft unpublishing is used to preserve SEO rankings,
                internal links, and place relations.
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/destinations"
            className="px-4 py-2.5 rounded-lg border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> {isEdit ? "Update Destination" : "Create Destination"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
