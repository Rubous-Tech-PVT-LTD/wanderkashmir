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
  ArrowRight,
  ImageIcon,
  MapPin,
  UtensilsCrossed,
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
    contentSections?: TourContentSectionsInput;
    dynamicBlocks?: TourDynamicBlockInput[];
    travelStyleIds: string[];
    stays?: TourStayInput[];
    transports?: TourTransportInput[];
    experiences?: TourExperienceInput[];
    travelGuides?: TourTravelGuideInput[];
    isLive: boolean;
  };
  categories: TourCategoryOption[];
  travelStyles: TravelStyleOption[];
  properties?: PropertyOption[];
  vehicles?: VehicleOption[];
  drivers?: DriverOption[];
  experiences?: ExperienceOption[];
  travelGuides?: TravelGuideOption[];
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
  isEdit = false,
}: TourFormProps) {
  const router = useRouter();

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

  const initialItinerary = initialDaysRaw.map((item: any, idx: number) => ({
    day: item.day || `Day ${idx + 1}`,
    title: item.title || "",
    description: item.desc || item.description || "",
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
      description: string;
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      alert("Please enter a valid HTTP/HTTPS URL.");
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
    val: string
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
        driverId: drivers[0]?.id || null,
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
          image: d.image.trim() || undefined,
          location: d.location.trim() || undefined,
          stay: d.stay.trim() || undefined,
          meals: d.meals.trim() || undefined,
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

  const handleDelete = async () => {
    if (!initialData?.id) return;
    setDeleting(true);
    try {
      const res = await deleteTourAction(initialData.id);
      if (res.success) {
        router.push("/admin/tours");
        router.refresh();
      } else {
        alert(res.error || "Failed to delete tour.");
        setShowDeleteModal(false);
      }
    } catch {
      alert("Error deleting tour.");
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
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
              ? "Modify production tour details with strict relation safeguards"
              : "Register a new tour directly to the shared production database"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isEdit && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Tour
            </button>
          )}

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
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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

      {/* 1. Publishing Status & Core Info */}
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

      {/* 2. Travel Styles */}
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

      {/* 3. Images Management */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Tour Images ({imagesList.length})</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add Cloudinary or verified CDN image URLs. The first image is used as the cover photo.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Add image URL (https://res.cloudinary.com/...)"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
          >
            Add Photo
          </button>
        </div>

        {imagesList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {imagesList.map((img, idx) => (
              <div
                key={idx}
                className="group relative aspect-video bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm"
              >
                <Image
                  src={img}
                  alt={`Tour image ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute top-1 left-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-white font-mono">
                  #{idx + 1} {idx === 0 && "(Cover)"}
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveImage(idx, "left")}
                      className="p-1 bg-slate-800 text-white rounded hover:bg-slate-700 text-xs"
                      title="Move left"
                    >
                      ←
                    </button>
                  )}
                  {idx < imagesList.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveImage(idx, "right")}
                      className="p-1 bg-slate-800 text-white rounded hover:bg-slate-700 text-xs"
                      title="Move right"
                    >
                      →
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1 bg-rose-600 text-white rounded hover:bg-rose-500 text-xs"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
            No images added. Paste an image URL above to add a photo.
          </div>
        )}
      </div>

      {/* 4. Overview, Highlights, Inclusions, Exclusions */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-5">
        <h2 className="text-sm font-semibold text-white">Content & Inclusions</h2>

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

      {/* 5. Day-by-Day Itinerary Builder (with Reorder Up / Down) */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Day-by-Day Itinerary</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add structured itinerary milestones for each day. Reorder using up/down arrows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {itinerary.length > 1 && (
              <button
                type="button"
                onClick={renumberItineraryDays}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded transition-colors"
                title="Renumber days sequentially"
              >
                Renumber
              </button>
            )}
            <button
              type="button"
              onClick={addItineraryDay}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Day
            </button>
          </div>
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
                className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 space-y-3.5"
              >
                {/* Row 1: Day Number, Title, Reorder & Remove Buttons */}
                <div className="flex items-center justify-between gap-3">
                  <div className="w-28 shrink-0">
                    <input
                      type="text"
                      value={item.day}
                      onChange={(e) => updateItineraryItem(idx, "day", e.target.value)}
                      placeholder={`Day ${idx + 1}`}
                      className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItineraryItem(idx, "title", e.target.value)}
                      placeholder="Day Title (e.g. Arrival in Srinagar & Dal Lake Shikara Ride)"
                      className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none font-medium"
                    />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItineraryDay(idx, "up")}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors rounded hover:bg-slate-800"
                      title="Move day up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === itinerary.length - 1}
                      onClick={() => moveItineraryDay(idx, "down")}
                      className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors rounded hover:bg-slate-800"
                      title="Move day down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItineraryDay(idx)}
                      className="p-1 text-slate-500 hover:text-red-400 transition-colors rounded hover:bg-slate-800"
                      title="Remove day"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Location & Day Photo URL with Live Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Location / Stop
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={item.location}
                        onChange={(e) => updateItineraryItem(idx, "location", e.target.value)}
                        placeholder="e.g. Srinagar, Gulmarg, or Pahalgam"
                        className="w-full rounded border border-slate-700 bg-slate-800 pl-8 pr-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Day Photo URL
                    </label>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                        <input
                          type="url"
                          value={item.image}
                          onChange={(e) => updateItineraryItem(idx, "image", e.target.value)}
                          placeholder="https://... (Day featured photo)"
                          className="w-full rounded border border-slate-700 bg-slate-800 pl-8 pr-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      {item.image && (
                        <div className="relative w-8 h-8 rounded border border-slate-700 bg-slate-800 overflow-hidden shrink-0">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Overnight Stay Note
                    </label>
                    <input
                      type="text"
                      value={item.stay}
                      onChange={(e) => updateItineraryItem(idx, "stay", e.target.value)}
                      placeholder="e.g. Premium Houseboat, Dal Lake"
                      className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Meal Plan Note
                    </label>
                    <input
                      type="text"
                      value={item.meals}
                      onChange={(e) => updateItineraryItem(idx, "meals", e.target.value)}
                      placeholder="e.g. Dinner Included or Breakfast & Dinner"
                      className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 4: Daily Activities list */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Daily Activities (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={item.activities}
                    onChange={(e) => updateItineraryItem(idx, "activities", e.target.value)}
                    placeholder="e.g. Shikara Ride on Dal Lake, Mughal Gardens, Nishat Bagh, Sunset over Boulevard"
                    className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Row 5: Detailed Description */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Day Schedule Details
                  </label>
                  <textarea
                    rows={3}
                    value={item.description}
                    onChange={(e) => updateItineraryItem(idx, "description", e.target.value)}
                    placeholder="Full day narrative, schedule milestones, meeting points, sightseeing notes..."
                    className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Fixed Content Sections Editor (Best Time, Food, Shopping, Nearby, FAQs) */}
      <TourFixedContentSectionsEditor
        contentSections={contentSections}
        onChange={setContentSections}
      />

      {/* 7. Dynamic Tour Content Blocks (Rich CMS Blocks) */}
      <TourDynamicBlocksEditor
        blocks={dynamicBlocks}
        onChange={setDynamicBlocks}
      />

      {/* 6. Tour Stays (TourStay Relation Management) */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-400" /> Accommodation Stays ({stays.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Assign real approved properties/hotels for each destination in this package
            </p>
          </div>

          <button
            type="button"
            onClick={addStay}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Stay
          </button>
        </div>

        {stays.length > 0 ? (
          <div className="space-y-3">
            {stays.map((stay, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-xs"
              >
                <div className="sm:col-span-3">
                  <label className="text-[10px] text-slate-400 block mb-1">Destination</label>
                  <input
                    type="text"
                    value={stay.destination}
                    onChange={(e) => updateStay(idx, { destination: e.target.value })}
                    placeholder="e.g. Srinagar"
                    className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-slate-400 block mb-1">Stay Type</label>
                  <select
                    value={stay.stayType || "Hotel"}
                    onChange={(e) => updateStay(idx, { stayType: e.target.value })}
                    className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-white"
                  >
                    <option value="Hotel">Hotel</option>
                    <option value="Resort">Resort</option>
                    <option value="Homestay">Homestay</option>
                    <option value="Houseboat">Houseboat</option>
                  </select>
                </div>
                <div className="sm:col-span-4">
                  <label className="text-[10px] text-slate-400 block mb-1">Linked Property</label>
                  <select
                    value={stay.propertyId || ""}
                    onChange={(e) => updateStay(idx, { propertyId: e.target.value || null })}
                    className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-white"
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
                  <label className="text-[10px] text-slate-400 block mb-1">Nights</label>
                  <input
                    type="number"
                    min="1"
                    value={stay.nights}
                    onChange={(e) =>
                      updateStay(idx, { nights: Math.max(1, parseInt(e.target.value, 10) || 1) })
                    }
                    className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-white"
                  />
                </div>
                <div className="sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeStay(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove stay"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
            No stay accommodations assigned. Click &quot;Add Stay&quot; to link properties to this tour.
          </div>
        )}
      </div>

      {/* 7. Tour Transport (TourTransport Relation Management) */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Car className="w-4 h-4 text-sky-400" /> Transportation Segments ({transports.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Assign transport routes, dedicated vehicles, and drivers
            </p>
          </div>

          <button
            type="button"
            onClick={addTransport}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Transport
          </button>
        </div>

        {transports.length > 0 ? (
          <div className="space-y-3">
            {transports.map((trans, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-xs"
              >
                <div className="sm:col-span-3">
                  <label className="text-[10px] text-slate-400 block mb-1">Origin</label>
                  <input
                    type="text"
                    value={trans.origin}
                    onChange={(e) => updateTransport(idx, { origin: e.target.value })}
                    placeholder="e.g. Srinagar Airport"
                    className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[10px] text-slate-400 block mb-1">Destination</label>
                  <input
                    type="text"
                    value={trans.destination}
                    onChange={(e) => updateTransport(idx, { destination: e.target.value })}
                    placeholder="e.g. Gulmarg"
                    className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[10px] text-slate-400 block mb-1">Vehicle</label>
                  <select
                    value={trans.vehicleId || ""}
                    onChange={(e) => updateTransport(idx, { vehicleId: e.target.value || null })}
                    className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-white"
                  >
                    <option value="">-- No specific vehicle --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.make} {v.model} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] text-slate-400 block mb-1">Purpose</label>
                  <input
                    type="text"
                    value={trans.purpose}
                    onChange={(e) => updateTransport(idx, { purpose: e.target.value })}
                    placeholder="Transfer / Tour"
                    className="w-full rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-white"
                  />
                </div>
                <div className="sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeTransport(idx)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove segment"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
            No transport segments added. Click &quot;Add Transport&quot; to configure travel legs.
          </div>
        )}
      </div>

      {/* 11. Tour Experiences & Travel Guides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Experiences */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Experiences ({tourExperiences.length})
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Link curated master activities from catalog
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/experiences"
                target="_blank"
                className="text-[11px] text-slate-400 hover:text-amber-400 flex items-center gap-0.5"
                title="Open master experiences in new tab"
              >
                <span>Manage</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={addExperience}
                disabled={experiences.length === 0}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors disabled:opacity-40"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </div>

          {tourExperiences.length > 0 ? (
            <div className="space-y-2.5">
              {tourExperiences.map((exp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 text-xs space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <select
                      value={exp.experienceId}
                      onChange={(e) => updateExperience(idx, { experienceId: e.target.value })}
                      className="flex-1 rounded border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-white"
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
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Day:</span>
                      <input
                        type="number"
                        min={1}
                        value={exp.dayNumber ?? 1}
                        onChange={(e) =>
                          updateExperience(idx, {
                            dayNumber: parseInt(e.target.value, 10) || 1,
                          })
                        }
                        className="w-16 rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-white text-center"
                      />
                    </div>

                    <label className="flex items-center gap-1.5 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exp.isOptional}
                        onChange={(e) =>
                          updateExperience(idx, { isOptional: e.target.checked })
                        }
                        className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-0"
                      />
                      <span>Optional Activity</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
              No experiences linked yet.
            </div>
          )}
        </div>

        {/* Travel Guides */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" /> Travel Guides ({tourGuides.length})
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Link published blog guides & field notes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/seo"
                target="_blank"
                className="text-[11px] text-slate-400 hover:text-purple-400 flex items-center gap-0.5"
                title="Open SEO blog studio in new tab"
              >
                <span>Articles</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
              <button
                type="button"
                onClick={addTravelGuide}
                disabled={travelGuides.length === 0}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors disabled:opacity-40"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </div>

          {tourGuides.length > 0 ? (
            <div className="space-y-2.5">
              {tourGuides.map((guide, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs"
                >
                  <select
                    value={guide.guideId}
                    onChange={(e) => updateTravelGuide(idx, { guideId: e.target.value })}
                    className="flex-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-white"
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
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
              No travel guides linked.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <div>
          {isEdit && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Tour
            </button>
          )}
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
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEdit ? "Save Tour Changes" : "Create Tour"}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Tour Package</h3>
                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[280px]">{title}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete this tour package? This action will verify
              that no customer bookings are linked to this package before proceeding.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
