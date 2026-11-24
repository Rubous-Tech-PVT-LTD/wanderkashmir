/* eslint-disable @typescript-eslint/no-explicit-any */
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
  ExternalLink,
  Info,
  ChevronUp,
  ChevronDown,
  Building,
  Car,
  Sparkles,
  BookOpen,
  ImageIcon,
  MapPin,
  Search,
  Globe,
} from "lucide-react";
import {
  createTourAction,
  updateTourAction,
  deleteTourAction,
  TourFormInput,
  TourStayInput,
  TourTransportInput,
  TourExperienceInput,
  TourTravelGuideInput,
  TourContentSectionsInput,
  TourDynamicBlockInput,
} from "@/actions/adminTours";
import TourFixedContentSectionsEditor from "./TourFixedContentSectionsEditor";
import TourDynamicBlocksEditor from "./TourDynamicBlocksEditor";
import EditorJsField from "@/components/admin/editor/EditorJsField";
import { AvailablePlaceOption } from "@/components/admin/destinations/NearbyPlacesEditor";
import {
  AdminPageHeader,
  AdminToastBanner,
  ConfirmActionDialog,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

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

interface PropertyOption {
  id: string;
  name: string;
  location: string;
  propertyType: string;
}

interface VehicleOption {
  id: string;
  make: string;
  model: string;
  type: string;
  registrationNum: string;
}

interface DriverOption {
  id: string;
  name: string;
  phone: string;
}

interface ExperienceOption {
  id: string;
  title: string;
  duration?: string | null;
}

interface TravelGuideOption {
  id: string;
  title: string;
  slug: string;
}

export type TourFormInitialData = {
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
  contentSections?: TourContentSectionsInput;
  dynamicBlocks?: TourDynamicBlockInput[];
  travelStyleIds: string[];
  stays?: TourStayInput[];
  transports?: TourTransportInput[];
  experiences?: TourExperienceInput[];
  travelGuides?: TourTravelGuideInput[];
  isLive: boolean;
  isPopular?: boolean;
  popularOrder?: number | null;
  h1Heading?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
};

export interface TourFormProps {
  initialData?: Partial<TourFormInitialData>;
  categories: TourCategoryOption[];
  travelStyles: TravelStyleOption[];
  properties?: PropertyOption[];
  vehicles?: VehicleOption[];
  drivers?: DriverOption[];
  experiences?: ExperienceOption[];
  travelGuides?: TravelGuideOption[];
  availablePlaces?: AvailablePlaceOption[];
  isEdit?: boolean;
}

export default function TourForm({
  initialData,
  categories,
  travelStyles,
  properties = [],
  vehicles = [],
  drivers = [],
  experiences = [],
  travelGuides = [],
  availablePlaces = [],
  isEdit = false,
}: TourFormProps) {
  const router = useRouter();
  const basePath = useAdminBasePath();

  // Normalize initial itinerary & bundled CMS payload
  const rawItinerary = initialData?.itinerary;
  let initialDaysRaw: any[] = [];
  let initialContentSections: TourContentSectionsInput = initialData?.contentSections || {};
  let initialDynamicBlocks: TourDynamicBlockInput[] = initialData?.dynamicBlocks || [];

  if (Array.isArray(rawItinerary)) {
    initialDaysRaw = rawItinerary;
  } else if (rawItinerary && typeof rawItinerary === "object") {
    if (Array.isArray(rawItinerary.days)) {
      initialDaysRaw = rawItinerary.days;
    }
    if (rawItinerary.contentSections && Object.keys(initialContentSections).length === 0) {
      initialContentSections = rawItinerary.contentSections;
    }
    if (Array.isArray(rawItinerary.dynamicBlocks) && initialDynamicBlocks.length === 0) {
      initialDynamicBlocks = rawItinerary.dynamicBlocks;
    }
  }

  // Ensure howToReachEnabled defaults to true for new or existing tours where it is not explicitly false
  initialContentSections = {
    ...initialContentSections,
    howToReachEnabled: initialContentSections.howToReachEnabled !== false,
  };

  const initialItinerary = initialDaysRaw.map((item: any, idx: number) => ({
    day: item.day || `Day ${idx + 1}`,
    title: item.title || "",
    description:
      item.desc !== undefined && item.desc !== null && item.desc !== "" && item.desc !== "[object Object]"
        ? item.desc
        : item.description !== undefined && item.description !== null && item.description !== "" && item.description !== "[object Object]"
        ? item.description
        : "",
    image: item.image || item.imageUrl || "",
    location: item.location || item.destination || "",
    stay: item.stay || item.overnight || "",
    meals: item.meals || "",
    activities: Array.isArray(item.activities)
      ? item.activities.join(", ")
      : typeof item.activities === "string"
      ? item.activities
      : "",
  }));

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [duration, setDuration] = useState(initialData?.duration || "");
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : "");
  const [originalPrice, setOriginalPrice] = useState(
    initialData?.originalPrice ? String(initialData.originalPrice) : ""
  );
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || (categories[0]?.id || "")
  );
  const [categoryName, setCategoryName] = useState(
    initialData?.category || (categories[0]?.name || "General")
  );
  const [maxPersons, setMaxPersons] = useState(
    initialData?.maxPersons ? String(initialData.maxPersons) : "15"
  );
  const [badge, setBadge] = useState(initialData?.badge || "");
  const [overview, setOverview] = useState(initialData?.overview || "");
  const [h1Heading, setH1Heading] = useState(initialData?.h1Heading || "");
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  const [destinationsStr, setDestinationsStr] = useState(
    initialData?.destinations?.join(", ") || ""
  );

  // Images list
  const [imagesList, setImagesList] = useState<string[]>(initialData?.images || []);
  const [newImageUrl, setNewImageUrl] = useState("");

  const [highlightsStr, setHighlightsStr] = useState(
    initialData?.highlights?.join(", ") || ""
  );
  const [inclusionsStr, setInclusionsStr] = useState(
    initialData?.inclusions?.join(", ") || "Hotel, Meals, Taxi, Shikara Ride"
  );
  const [exclusionsStr, setExclusionsStr] = useState(
    initialData?.exclusions?.join(", ") || "Flights, Personal Expenses"
  );
  const [itinerary, setItinerary] = useState<
    {
      day: string;
      title: string;
      description: any;
      image: string;
      location: string;
      stay: string;
      meals: string;
      activities: string;
    }[]
  >(initialItinerary);

  // Fixed content sections state
  const [contentSections, setContentSections] =
    useState<TourContentSectionsInput>(initialContentSections);

  // Dynamic blocks state
  const [dynamicBlocks, setDynamicBlocks] =
    useState<TourDynamicBlockInput[]>(initialDynamicBlocks);

  const [selectedStyleIds, setSelectedStyleIds] = useState<string[]>(
    initialData?.travelStyleIds || []
  );

  // Relational Modules State
  const [stays, setStays] = useState<TourStayInput[]>(initialData?.stays || []);
  const [transports, setTransports] = useState<TourTransportInput[]>(
    initialData?.transports || []
  );
  const [tourExperiences, setTourExperiences] = useState<TourExperienceInput[]>(
    initialData?.experiences || []
  );
  const [tourGuides, setTourGuides] = useState<TourTravelGuideInput[]>(
    initialData?.travelGuides || []
  );

  const [isLive, setIsLive] = useState<boolean>(initialData?.isLive ?? true);
  const [isPopular, setIsPopular] = useState<boolean>(initialData?.isPopular ?? false);
  const [popularOrder, setPopularOrder] = useState<string>(
    initialData?.popularOrder !== undefined && initialData?.popularOrder !== null
      ? String(initialData.popularOrder)
      : ""
  );

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<FeedbackMessage | null>(null);

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  // Image handlers
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setToast({ type: "error", text: "Please enter a valid HTTP/HTTPS image URL." });
      return;
    }
    setImagesList([...imagesList, url]);
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImagesList(imagesList.filter((_, i) => i !== index));
  };

  const handleMoveImage = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= imagesList.length) return;
    const updated = [...imagesList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImagesList(updated);
  };

  // Itinerary handlers with reordering
  const addItineraryDay = () => {
    const nextDayNum = itinerary.length + 1;
    setItinerary([
      ...itinerary,
      {
        day: `Day ${nextDayNum}`,
        title: "",
        description: "",
        image: "",
        location: "",
        stay: "",
        meals: "",
        activities: "",
      },
    ]);
  };

  const updateItineraryItem = (
    index: number,
    field:
      | "day"
      | "title"
      | "description"
      | "image"
      | "location"
      | "stay"
      | "meals"
      | "activities",
    val: any
  ) => {
    const updated = [...itinerary];
    updated[index][field] = val;
    setItinerary(updated);
  };

  const moveItineraryDay = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= itinerary.length) return;
    const updated = [...itinerary];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setItinerary(updated);
  };

  const removeItineraryDay = (index: number) => {
    setItinerary(itinerary.filter((_, i) => i !== index));
  };

  const renumberItineraryDays = () => {
    setItinerary(
      itinerary.map((item, idx) => ({
        ...item,
        day: `Day ${idx + 1}`,
      }))
    );
  };

  // Stays Handlers
  const addStay = () => {
    setStays([
      ...stays,
      {
        destination: "Srinagar",
        stayType: "Hotel",
        propertyId: properties[0]?.id || null,
        nights: 1,
        displayOrder: stays.length + 1,
      },
    ]);
  };

  const updateStay = (index: number, updates: Partial<TourStayInput>) => {
    const updated = [...stays];
    updated[index] = { ...updated[index], ...updates };
    setStays(updated);
  };

  const removeStay = (index: number) => {
    setStays(stays.filter((_, i) => i !== index));
  };

  // Transport Handlers
  const addTransport = () => {
    setTransports([
      ...transports,
      {
        origin: "Srinagar Airport",
        destination: "Srinagar Hotel",
        purpose: "Airport Transfer",
        vehicleId: vehicles[0]?.id || null,
        driverId: null,
        displayOrder: transports.length + 1,
      },
    ]);
  };

  const updateTransport = (index: number, updates: Partial<TourTransportInput>) => {
    const updated = [...transports];
    updated[index] = { ...updated[index], ...updates };
    setTransports(updated);
  };

  const removeTransport = (index: number) => {
    setTransports(transports.filter((_, i) => i !== index));
  };

  // Experience Handlers
  const addExperience = () => {
    if (experiences.length === 0) return;
    setTourExperiences([
      ...tourExperiences,
      {
        experienceId: experiences[0].id,
        isOptional: false,
        dayNumber: 1,
        displayOrder: tourExperiences.length + 1,
      },
    ]);
  };

  const updateExperience = (index: number, updates: Partial<TourExperienceInput>) => {
    const updated = [...tourExperiences];
    updated[index] = { ...updated[index], ...updates };
    setTourExperiences(updated);
  };

  const removeExperience = (index: number) => {
    setTourExperiences(tourExperiences.filter((_, i) => i !== index));
  };

  // Travel Guide Handlers
  const addTravelGuide = () => {
    if (travelGuides.length === 0) return;
    setTourGuides([
      ...tourGuides,
      {
        guideId: travelGuides[0].id,
        displayOrder: tourGuides.length + 1,
      },
    ]);
  };

  const updateTravelGuide = (index: number, updates: Partial<TourTravelGuideInput>) => {
    const updated = [...tourGuides];
    updated[index] = { ...updated[index], ...updates };
    setTourGuides(updated);
  };

  const removeTravelGuide = (index: number) => {
    setTourGuides(tourGuides.filter((_, i) => i !== index));
  };

  // Main Save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);
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
        destinations: destinationsStr
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        images: imagesList,
        highlights: highlightsStr
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        inclusions: inclusionsStr
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        exclusions: exclusionsStr
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        itinerary: itinerary.map((d, idx) => ({
          day: d.day || `Day ${idx + 1}`,
          title: d.title,
          description: d.description,
          image: (d.image || "").trim(),
          location: (d.location || "").trim(),
          stay: (d.stay || "").trim(),
          meals: (d.meals || "").trim(),
          activities: d.activities
            ? d.activities
                .split(",")
                .map((a) => a.trim())
                .filter(Boolean)
            : [],
        })),
        contentSections,
        dynamicBlocks,
        travelStyleIds: selectedStyleIds,
        stays,
        transports,
        experiences: tourExperiences,
        travelGuides: tourGuides,
        isLive,
        isPopular,
        popularOrder:
          isPopular && popularOrder && parseInt(popularOrder, 10) > 0
            ? Math.max(1, parseInt(popularOrder, 10))
            : null,
        h1Heading: h1Heading.trim() || null,
        seoTitle: seoTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
      };

      if (isEdit && initialData?.id) {
        const res = await updateTourAction(initialData.id, payload);
        if (res.success) {
          setToast({ type: "success", text: "Tour updated successfully." });
          router.refresh();
        } else {
          setToast({ type: "error", text: res.error || "Failed to update tour." });
        }
      } else {
        const res = await createTourAction(payload);
        if (res.success && res.data?.id) {
          setToast({ type: "success", text: "Tour created successfully." });
          router.push(`${basePath}/tours/${res.data.id}`);
          router.refresh();
        } else {
          setToast({ type: "error", text: res.error || "Failed to create tour." });
        }
      }
    } catch {
      setToast({ type: "error", text: "An unexpected network or server error occurred." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    const res = await deleteTourAction(initialData.id);
    if (!res.success) {
      throw new Error(res.error || "Failed to delete tour.");
    }
    setShowDeleteModal(false);
    router.push(`${basePath}/tours`);
    router.refresh();
  };

  const inputClass =
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--season-primary)]/20 transition-colors";
  const compactInputClass =
    "w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--season-primary)]/20 transition-colors";
  const labelClass = "block text-xs font-medium text-slate-700 mb-1.5";
  const cardClass = "rounded-md border border-slate-200 bg-white p-5 sm:p-6 space-y-5";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-6 pb-16">
      <AdminPageHeader
        title={isEdit ? initialData?.title || "Edit Tour Package" : "Create New Tour Package"}
        subtitle={
          isEdit
            ? "Manage itinerary, stays, transport, content sections, and publishing settings."
            : "Create a new Kashmir tour package with itinerary, stays, and SEO metadata."
        }
        backHref={`${basePath}/tours`}
        backLabel="Back to Tours"
        badge={
          <StatusBadge
            status={isLive ? "PUBLISHED" : "DRAFT"}
            label={isLive ? "Live" : "Draft"}
            showDot
          />
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isEdit && initialData?.slug && isLive && (
              <Link
                href={`/tours/${initialData.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Live
              </Link>
            )}
            {isEdit && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
            <Link
              href={`${basePath}/tours`}
              className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-medium text-white hover:bg-[var(--season-primary-hover)] transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEdit ? "Save Changes" : "Create Tour"}
            </button>
          </div>
        }
      />

      <AdminToastBanner message={toast} onDismiss={() => setToast(null)} />

      {/* 1. Publishing Status & Core Info */}
      <section className={cardClass}>
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Publishing Status</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Controls visibility on the public website and XML sitemap.
            </p>
          </div>

          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={isLive}
              onChange={(e) => setIsLive(e.target.checked)}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[var(--season-primary)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
            <span className="ml-3 text-xs font-medium text-slate-700">
              {isLive ? "Live (Publicly Visible)" : "Draft (Hidden)"}
            </span>
          </label>
        </div>

        {/* Homepage Visibility / Popular Tour */}
        <div className="space-y-3 border-b border-slate-100 pb-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Homepage Visibility</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Controls whether this tour appears in the homepage Popular Kashmir Tours section.
              </p>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isPopular}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setIsPopular(checked);
                  if (checked && !popularOrder) {
                    setPopularOrder("1");
                  }
                }}
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
              <span className="ml-3 text-xs font-medium text-slate-700">
                {isPopular ? "Popular Tour (Featured)" : "Standard Tour"}
              </span>
            </label>
          </div>

          {isPopular && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <label className="text-xs font-medium text-slate-700">Popular Order</label>
              <input
                type="number"
                min="1"
                step="1"
                value={popularOrder}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || parseInt(val, 10) >= 1) {
                    setPopularOrder(val);
                  }
                }}
                placeholder="1"
                className="w-24 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-[var(--season-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--season-primary)]/20"
              />
              <span className="text-xs text-slate-500">
                Lower numbers appear first on the homepage (e.g. 1, 2, 3).
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>
              Tour Title <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. 5 Days Complete Kashmir Experience"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              URL Slug <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. 5-days-complete-kashmir-experience"
              className={`${inputClass} font-mono text-xs`}
            />
            {isEdit && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-700">
                <Info className="h-3 w-3 shrink-0" />
                Changing an existing slug alters public canonical URLs.
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Duration <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 5D/4N or 5 Days · 4 Nights"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Price (INR) <span className="text-rose-600">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="12999"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label className={labelClass}>Original Price (Optional)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={originalPrice}
              onChange={(e) => setOriginalPrice(e.target.value)}
              placeholder="15999"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div>
            <label className={labelClass}>Category</label>
            <select
              value={categoryId}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Max Persons</label>
            <input
              type="number"
              min="1"
              value={maxPersons}
              onChange={(e) => setMaxPersons(e.target.value)}
              placeholder="15"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Badge / Ribbon Label</label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. Best Seller, Most Popular, Winter Special"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* 2. Travel Styles */}
      <section className={cardClass}>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Travel Styles</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Select one or more active travel styles to link this tour to style category pages.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {travelStyles.map((style) => {
            const isSelected = selectedStyleIds.includes(style.id);
            return (
              <label
                key={style.id}
                className={`flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? "border-[var(--season-primary)]/30 bg-[var(--season-primary-light)] text-[var(--season-primary-hover)]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleStyle(style.id)}
                  className="h-4 w-4 rounded border-slate-300 text-[var(--season-primary)] focus:ring-[var(--season-primary)]"
                />
                <span>{style.name}</span>
              </label>
            );
          })}
        </div>
      </section>

      {/* 3. Images Management */}
      <section className={cardClass}>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Tour Images ({imagesList.length})
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Add Cloudinary or verified CDN image URLs. The first image is used as the cover photo.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Add image URL (https://res.cloudinary.com/...)"
            className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--season-primary)]/20"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap transition-colors cursor-pointer"
          >
            Add Photo
          </button>
        </div>

        {imagesList.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {imagesList.map((img, idx) => (
              <div
                key={idx}
                className="group relative aspect-video overflow-hidden rounded-md border border-slate-200 bg-slate-100"
              >
                <Image
                  src={img}
                  alt={`Tour image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-white">
                  #{idx + 1} {idx === 0 && "(Cover)"}
                </div>
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/55 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveImage(idx, "left")}
                      className="rounded bg-white/95 px-2 py-1 text-xs font-semibold text-slate-800 hover:bg-white cursor-pointer"
                      title="Move left"
                    >
                      ←
                    </button>
                  )}
                  {idx < imagesList.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveImage(idx, "right")}
                      className="rounded bg-white/95 px-2 py-1 text-xs font-semibold text-slate-800 hover:bg-white cursor-pointer"
                      title="Move right"
                    >
                      →
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="rounded bg-rose-600 p-1.5 text-white hover:bg-rose-700 cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/70 py-8 text-center text-xs text-slate-500">
            No images added. Paste an image URL above to add a photo.
          </div>
        )}
      </section>

      {/* 4. Overview, Highlights, Inclusions, Exclusions */}
      <section className={cardClass}>
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-semibold text-slate-900">Content & Inclusions</h2>
        </div>

        <div>
          <label className={labelClass}>Overview / Description</label>
          <textarea
            rows={4}
            value={overview}
            onChange={(e) => setOverview(e.target.value)}
            placeholder="Detailed description of the tour experience..."
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Destinations (Comma-separated)</label>
          <input
            type="text"
            value={destinationsStr}
            onChange={(e) => setDestinationsStr(e.target.value)}
            placeholder="Srinagar, Gulmarg, Pahalgam, Sonamarg"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Key Highlights (Comma-separated)</label>
          <input
            type="text"
            value={highlightsStr}
            onChange={(e) => setHighlightsStr(e.target.value)}
            placeholder="Dal Lake Shikara Ride, Gulmarg Gondola Phase 2, Betaab Valley Excursion"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Inclusions (Comma-separated)</label>
            <input
              type="text"
              value={inclusionsStr}
              onChange={(e) => setInclusionsStr(e.target.value)}
              placeholder="Hotel, Daily Breakfast, Private Cab, Shikara Ride"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Exclusions (Comma-separated)</label>
            <input
              type="text"
              value={exclusionsStr}
              onChange={(e) => setExclusionsStr(e.target.value)}
              placeholder="Airfare, Gondola Tickets, Personal Expenses"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* 5. Day-by-Day Itinerary Builder (with Reorder Up / Down) */}
      <section className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Day-by-Day Itinerary ({itinerary.length})
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Add structured itinerary milestones for each day. Reorder using up/down arrows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {itinerary.length > 1 && (
              <button
                type="button"
                onClick={renumberItineraryDays}
                className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Renumber days sequentially"
              >
                Renumber
              </button>
            )}
            <button
              type="button"
              onClick={addItineraryDay}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] px-3 py-1.5 text-xs font-medium text-[var(--season-primary-hover)] hover:bg-[var(--season-primary)]/15 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Day
            </button>
          </div>
        </div>

        {itinerary.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-xs text-slate-500">
            No itinerary items added yet. Click &quot;Add Day&quot; to begin building the day-by-day plan.
          </div>
        ) : (
          <div className="space-y-4">
            {itinerary.map((item, idx) => (
              <div
                key={idx}
                className="space-y-3.5 rounded-md border border-slate-200 bg-slate-50/70 p-4"
              >
                {/* Row 1: Day Number, Title, Reorder & Remove Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 sm:flex-nowrap">
                  <div className="w-24 shrink-0">
                    <input
                      type="text"
                      value={item.day}
                      onChange={(e) => updateItineraryItem(idx, "day", e.target.value)}
                      placeholder={`Day ${idx + 1}`}
                      className={`${compactInputClass} font-semibold`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItineraryItem(idx, "title", e.target.value)}
                      placeholder="Day Title (e.g. Arrival in Srinagar & Dal Lake Shikara Ride)"
                      className={`${compactInputClass} font-medium`}
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItineraryDay(idx, "up")}
                      className="rounded p-1 text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-30 transition-colors cursor-pointer"
                      title="Move day up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === itinerary.length - 1}
                      onClick={() => moveItineraryDay(idx, "down")}
                      className="rounded p-1 text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-30 transition-colors cursor-pointer"
                      title="Move day down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItineraryDay(idx)}
                      className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Remove day"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Location & Day Photo URL with Live Preview */}
                <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Location / Stop
                    </label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={item.location}
                        onChange={(e) => updateItineraryItem(idx, "location", e.target.value)}
                        placeholder="e.g. Srinagar, Gulmarg, or Pahalgam"
                        className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--season-primary)]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Day Photo URL
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <ImageIcon className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="url"
                          value={item.image}
                          onChange={(e) => updateItineraryItem(idx, "image", e.target.value)}
                          placeholder="https://... (Day featured photo)"
                          className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--season-primary)]/20"
                        />
                      </div>
                      {item.image && (
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-100">
                          <Image
                            src={item.image}
                            alt="Day"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 3: Stay accommodation note & Meal plan note */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Overnight Stay Note
                    </label>
                    <input
                      type="text"
                      value={item.stay}
                      onChange={(e) => updateItineraryItem(idx, "stay", e.target.value)}
                      placeholder="e.g. Premium Houseboat, Dal Lake"
                      className={compactInputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-slate-600">
                      Meal Plan Note
                    </label>
                    <input
                      type="text"
                      value={item.meals}
                      onChange={(e) => updateItineraryItem(idx, "meals", e.target.value)}
                      placeholder="e.g. Dinner Included or Breakfast & Dinner"
                      className={compactInputClass}
                    />
                  </div>
                </div>

                {/* Row 4: Daily Activities list */}
                <div>
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Daily Activities (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={item.activities}
                    onChange={(e) => updateItineraryItem(idx, "activities", e.target.value)}
                    placeholder="e.g. Shikara Ride on Dal Lake, Mughal Gardens, Nishat Bagh"
                    className={compactInputClass}
                  />
                </div>

                {/* Row 5: Detailed Description */}
                <div className="space-y-1">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Day Schedule Details
                  </label>
                  <EditorJsField
                    value={item.description}
                    onChange={(val: any) => updateItineraryItem(idx, "description", val)}
                    placeholder="Full day narrative, schedule milestones, meeting points, sightseeing notes..."
                    minHeight={100}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 6. Fixed Content Sections Editor (Best Time, Food, Shopping, Nearby, FAQs) */}
      <TourFixedContentSectionsEditor
        contentSections={contentSections}
        onChange={setContentSections}
        availablePlaces={availablePlaces}
      />

      {/* 7. Dynamic Tour Content Blocks (Rich CMS Blocks) */}
      <TourDynamicBlocksEditor
        blocks={dynamicBlocks}
        onChange={setDynamicBlocks}
      />

      {/* 6. Tour Stays (TourStay Relation Management) */}
      <section className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Building className="h-4 w-4 text-[var(--season-primary)]" />
              Accommodation Stays ({stays.length})
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Assign approved properties and hotels for each destination in this package.
            </p>
          </div>

          <button
            type="button"
            onClick={addStay}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] px-3 py-1.5 text-xs font-medium text-[var(--season-primary-hover)] hover:bg-[var(--season-primary)]/15 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Stay
          </button>
        </div>

        {stays.length > 0 ? (
          <div className="space-y-3">
            {stays.map((stay, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 items-end gap-3 rounded-md border border-slate-200 bg-slate-50/70 p-3 text-xs sm:grid-cols-12"
              >
                <div className="sm:col-span-3">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={stay.destination}
                    onChange={(e) => updateStay(idx, { destination: e.target.value })}
                    placeholder="e.g. Srinagar"
                    className={compactInputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Stay Type
                  </label>
                  <select
                    value={stay.stayType || "Hotel"}
                    onChange={(e) => updateStay(idx, { stayType: e.target.value })}
                    className={compactInputClass}
                  >
                    <option value="Hotel">Hotel</option>
                    <option value="Resort">Resort</option>
                    <option value="Homestay">Homestay</option>
                    <option value="Houseboat">Houseboat</option>
                  </select>
                </div>
                <div className="sm:col-span-4">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Linked Property
                  </label>
                  <select
                    value={stay.propertyId || ""}
                    onChange={(e) => updateStay(idx, { propertyId: e.target.value || null })}
                    className={compactInputClass}
                  >
                    <option value="">-- No specific property --</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.location})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Nights
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={stay.nights}
                    onChange={(e) =>
                      updateStay(idx, { nights: Math.max(1, parseInt(e.target.value, 10) || 1) })
                    }
                    className={compactInputClass}
                  />
                </div>
                <div className="text-right sm:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeStay(idx)}
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove stay"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/70 py-6 text-center text-xs text-slate-500">
            No stay accommodations assigned. Click &quot;Add Stay&quot; to link properties to this tour.
          </div>
        )}
      </section>

      {/* 7. Tour Transport (TourTransport Relation Management) */}
      <section className={cardClass}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Car className="h-4 w-4 text-[var(--season-primary)]" />
              Transportation Segments ({transports.length})
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Assign transport routes, dedicated vehicles, and drivers.
            </p>
          </div>

          <button
            type="button"
            onClick={addTransport}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Transport
          </button>
        </div>

        {transports.length > 0 ? (
          <div className="space-y-3">
            {transports.map((trans, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 items-end gap-3 rounded-md border border-slate-200 bg-slate-50/70 p-3 text-xs sm:grid-cols-12"
              >
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Origin
                  </label>
                  <input
                    type="text"
                    value={trans.origin}
                    onChange={(e) => updateTransport(idx, { origin: e.target.value })}
                    placeholder="e.g. Srinagar Airport"
                    className={compactInputClass}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={trans.destination}
                    onChange={(e) => updateTransport(idx, { destination: e.target.value })}
                    placeholder="e.g. Gulmarg"
                    className={compactInputClass}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Vehicle
                  </label>
                  <select
                    value={trans.vehicleId || ""}
                    onChange={(e) => updateTransport(idx, { vehicleId: e.target.value || null })}
                    className={compactInputClass}
                  >
                    <option value="">No specific vehicle</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Driver
                  </label>
                  <select
                    value={trans.driverId || ""}
                    onChange={(e) => updateTransport(idx, { driverId: e.target.value || null })}
                    className={compactInputClass}
                  >
                    <option value="">Unassigned</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-[11px] font-medium text-slate-600">
                    Purpose
                  </label>
                  <input
                    type="text"
                    value={trans.purpose}
                    onChange={(e) => updateTransport(idx, { purpose: e.target.value })}
                    placeholder="Transfer / Tour"
                    className={compactInputClass}
                  />
                </div>
                <div className="text-right sm:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeTransport(idx)}
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove segment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/70 py-6 text-center text-xs text-slate-500">
            No transport segments added. Click &quot;Add Transport&quot; to configure travel legs.
          </div>
        )}
      </section>

      {/* 8. Tour Experiences & Travel Guides */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Experiences */}
        <section className={cardClass}>
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  Experiences ({tourExperiences.length})
                </h2>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    experiences.length > 0
                      ? "border-slate-200 bg-slate-50 text-slate-600"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                  title={
                    experiences.length > 0
                      ? `${experiences.length} master experiences in catalog`
                      : "0 master experiences in catalog"
                  }
                >
                  {experiences.length} in catalog
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Link curated master activities from catalog.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`${basePath}/experiences`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[var(--season-primary)]"
                title="Open master experiences in new tab"
              >
                Manage
                <ExternalLink className="h-3 w-3" />
              </Link>
              <button
                type="button"
                onClick={addExperience}
                disabled={experiences.length === 0}
                title={
                  experiences.length === 0
                    ? "Cannot add: 0 master experiences in catalog. Create one first."
                    : "Add an experience to this tour"
                }
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          </div>

          {tourExperiences.length > 0 ? (
            <div className="space-y-2.5">
              {tourExperiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="space-y-2 rounded-md border border-slate-200 bg-slate-50/70 p-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <select
                      value={exp.experienceId}
                      onChange={(e) => updateExperience(idx, { experienceId: e.target.value })}
                      className={`flex-1 ${compactInputClass}`}
                    >
                      {experiences.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title} {item.duration ? `(${item.duration})` : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-600">Day:</span>
                      <input
                        type="number"
                        min={1}
                        value={exp.dayNumber ?? 1}
                        onChange={(e) =>
                          updateExperience(idx, {
                            dayNumber: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        className="w-16 rounded border border-slate-200 bg-white px-2 py-0.5 text-center text-slate-900 focus:border-[var(--season-primary)] focus:outline-none"
                      />
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-1.5 text-slate-700">
                      <input
                        type="checkbox"
                        checked={exp.isOptional}
                        onChange={(e) =>
                          updateExperience(idx, { isOptional: e.target.checked })
                        }
                        className="rounded border-slate-300 text-[var(--season-primary)] focus:ring-[var(--season-primary)]"
                      />
                      <span>Optional Activity</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : experiences.length === 0 ? (
            <div className="space-y-2 rounded-md border border-dashed border-amber-200 bg-amber-50/60 px-4 py-6 text-center text-xs">
              <div className="flex items-center justify-center gap-1.5 font-medium text-amber-800">
                <Sparkles className="h-4 w-4" />
                No experiences in catalog yet
              </div>
              <p className="mx-auto max-w-sm text-[11px] leading-relaxed text-amber-900/75">
                Create a master experience first to link it with tour packages.
              </p>
              <div className="pt-1">
                <Link
                  href={`${basePath}/experiences/new`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-50 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Experience
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/70 py-6 text-center text-xs text-slate-500">
              No experiences linked yet. Click &quot;Add&quot; to choose from {experiences.length} catalog items.
            </div>
          )}
        </section>

        {/* Travel Guides */}
        <section className={cardClass}>
          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <BookOpen className="h-4 w-4 text-[var(--season-primary)]" />
                  Travel Guides ({tourGuides.length})
                </h2>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    travelGuides.length > 0
                      ? "border-slate-200 bg-slate-50 text-slate-600"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                  }`}
                  title={
                    travelGuides.length > 0
                      ? `${travelGuides.length} published articles available`
                      : "0 published articles available"
                  }
                >
                  {travelGuides.length} published
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Link published blog guides and field notes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`${basePath}/seo`}
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[var(--season-primary)]"
                title="Open SEO blog studio in new tab"
              >
                Articles
                <ExternalLink className="h-3 w-3" />
              </Link>
              <button
                type="button"
                onClick={addTravelGuide}
                disabled={travelGuides.length === 0}
                title={
                  travelGuides.length === 0
                    ? "Cannot add: 0 published articles available."
                    : "Add an article to this tour"
                }
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          </div>

          {tourGuides.length > 0 ? (
            <div className="space-y-2.5">
              {tourGuides.map((guide, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/70 p-2.5 text-xs"
                >
                  <select
                    value={guide.guideId}
                    onChange={(e) => updateTravelGuide(idx, { guideId: e.target.value })}
                    className={`flex-1 ${compactInputClass}`}
                  >
                    {travelGuides.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.title}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeTravelGuide(idx)}
                    className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50/70 py-6 text-center text-xs text-slate-500">
              No travel guides linked yet.
            </div>
          )}
        </section>
      </div>

      {/* 9. Search Engine Optimization (SEO) & Headings */}
      <section className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[var(--season-primary)]" />
              <h2 className="text-sm font-semibold text-slate-900">
                Search Engine Optimization (SEO) & Headings
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Optional search metadata and page heading override. Fallbacks apply automatically when blank.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] px-2.5 py-1 text-[11px] font-medium text-[var(--season-primary-hover)]">
            <Globe className="h-3 w-3" />
            Search Ready
          </span>
        </div>

        <div className="space-y-4">
          {/* H1 Heading */}
          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-medium text-slate-700">
                H1 / Page Title Heading (Optional Override)
              </label>
              <span className="text-[11px] text-slate-500">
                Fallback:{" "}
                <span className="font-mono text-slate-700">
                  {title ? `"${title}"` : "Tour Title"}
                </span>
              </span>
            </div>
            <input
              type="text"
              value={h1Heading}
              onChange={(e) => setH1Heading(e.target.value)}
              placeholder={
                title
                  ? `Fallback: ${title}`
                  : "e.g. 5 Days Kashmir Honeymoon Tour: Gulmarg & Pahalgam"
              }
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Primary <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-700">&lt;h1&gt;</code> heading displayed on the tour detail page.
            </p>
          </div>

          {/* SEO Title */}
          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-medium text-slate-700">
                SEO Title (Meta Title)
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <span
                  className={
                    seoTitle.length > 60 ? "font-semibold text-amber-700" : "text-slate-500"
                  }
                >
                  {seoTitle.length}/60 chars
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">
                  Fallback:{" "}
                  <span className="font-mono text-slate-700">
                    &quot;Title (Duration) | WanderKashmir&quot;
                  </span>
                </span>
              </div>
            </div>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={
                title
                  ? `Fallback: ${title} (${duration || "Duration"}) | WanderKashmir`
                  : "e.g. 5 Days Kashmir Tour Package | WanderKashmir"
              }
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Browser tab title and Google search headline. Optimal length: 50–60 characters.
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
              <label className="block text-xs font-medium text-slate-700">
                Meta Description
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <span
                  className={
                    metaDescription.length > 160
                      ? "font-semibold text-amber-700"
                      : "text-slate-500"
                  }
                >
                  {metaDescription.length}/160 chars
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">
                  Fallback: <span className="font-mono text-slate-700">Tour Overview</span>
                </span>
              </div>
            </div>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder={
                overview
                  ? `Fallback to Tour Overview (${overview.slice(0, 100)}...)`
                  : "e.g. Experience the valleys of Kashmir on our curated 5-day tour with private chauffeurs, verified stays, and 24/7 local support."
              }
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Google search snippet summary. Optimal length: 140–160 characters.
            </p>
          </div>

          {/* Live Google Search Snippet Preview */}
          <div className="pt-1">
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-slate-500">
              Google Search Snippet Preview
            </label>
            <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-4 text-left">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <span className="font-medium text-[var(--season-primary)]">wanderkashmir.com</span>
                <span>› tours ›</span>
                <span className="font-mono text-slate-700">{slug || "tour-slug"}</span>
              </div>
              <div className="truncate text-base font-medium text-blue-700">
                {seoTitle.trim() ||
                  (title
                    ? `${title} (${duration || "Duration"}) | WanderKashmir`
                    : "Tour Title | WanderKashmir")}
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
                {metaDescription.trim() ||
                  overview.trim() ||
                  "Experience hand-crafted Kashmir tour packages with local guides, private chauffeurs, verified stays, and transparent pricing."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Save Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
        <div>
          {isEdit && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Tour
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`${basePath}/tours`}
            className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--season-primary)] px-5 py-2 text-xs font-medium text-white hover:bg-[var(--season-primary-hover)] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? "Save Tour Changes" : "Create Tour"}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmActionDialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Tour Package"
        description={`Are you sure you want to permanently delete "${title || "this tour package"}"? This action verifies that no customer bookings are linked before deleting.`}
        confirmLabel="Confirm Delete"
        tone="danger"
        onConfirm={handleDelete}
      />
    </form>
  );
}
