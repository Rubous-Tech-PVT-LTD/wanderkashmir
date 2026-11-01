"use client";

import { useState, useEffect } from "react";
import {
  Plus, Edit2, Trash2, Globe, ArrowLeft, RefreshCw,
  MapPin, Image as ImageIcon, Save, Check, ExternalLink,
  Eye, AlertCircle, Sparkles, ArrowUp, ArrowDown, Search,
  Upload, X, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";
import {
  getDestinationsHeroImage, setDestinationsHeroImage,
  getDestinationCategories, getDestinationCategoryMappings,
  saveDestinationCategoryMappings, DestinationCategory, DestinationCategoryMapping,
  searchPlaces, getDestinationPlaces, createPlace, updatePlace, saveDestinationPlaces,
  PlaceData, LinkedDestinationPlace,
  searchProperties, getPropertiesByIds, searchTours, getToursByIds,
  SimpleProperty, SimpleTour
} from "@/actions/destinations";

interface DestinationPage {
  id: string;
  slug: string;
  type: string;
  title: string;
  description: string | null;
  h1Heading: string;
  content: string | null;
  imageUrl: string | null;
  workflowState: string;
  seoStrategy?: any;
  faqs?: any;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminV2DestinationsTab() {
  const [destinations, setDestinations] = useState<DestinationPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Editor Sub-tabs: "basic" | "gallery" | "sections" | "places" | "featured" | "dynamic" | "faqs"
  const [editorTab, setEditorTab] = useState<"basic" | "gallery" | "sections" | "places" | "featured" | "dynamic" | "faqs">("basic");

  // Category State
  const [categories, setCategories] = useState<DestinationCategory[]>([]);
  const [categoryMappings, setCategoryMappings] = useState<DestinationCategoryMapping>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Hero Image Banner State
  const [heroImage, setHeroImage] = useState("");
  const [isSavingHero, setIsSavingHero] = useState(false);

  // Destination Form State
  const [formData, setFormData] = useState({
    id: "",
    type: "DESTINATION",
    slug: "",
    title: "",
    description: "",
    h1Heading: "",
    content: "",
    imageUrl: "",
    workflowState: "PUBLISHED"
  });

  // CMS Structured Sections State
  const [cmsSections, setCmsSections] = useState({
    overview: "",
    bestTimeToVisit: "",
    itinerary: "",
    howToReach: "",
    food: "",
    shopping: "",
    activities: "",
    nearbyPlacesContent: "",
  });

  // Gallery Images State
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");

  // FAQs State
  const [cmsFaqs, setCmsFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });

  // Places to Visit State
  const [linkedPlaces, setLinkedPlaces] = useState<PlaceData[]>([]);
  const [availablePlaces, setAvailablePlaces] = useState<PlaceData[]>([]);
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [isSavingPlaces, setIsSavingPlaces] = useState(false);
  const [showCreatePlaceModal, setShowCreatePlaceModal] = useState(false);

  const [newPlaceData, setNewPlaceData] = useState({
    name: "",
    slug: "",
    description: "",
    imageUrl: "",
    destination: "",
    status: "ACTIVE",
    linkImmediately: true,
  });
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [isCreatingPlace, setIsCreatingPlace] = useState(false);

  // Featured Properties State
  const [linkedProperties, setLinkedProperties] = useState<SimpleProperty[]>([]);
  const [availableProperties, setAvailableProperties] = useState<SimpleProperty[]>([]);
  const [propertySearchQuery, setPropertySearchQuery] = useState("");
  const [isSearchingProperties, setIsSearchingProperties] = useState(false);

  // Featured Tours State
  const [linkedTours, setLinkedTours] = useState<SimpleTour[]>([]);
  const [availableTours, setAvailableTours] = useState<SimpleTour[]>([]);
  const [tourSearchQuery, setTourSearchQuery] = useState("");
  const [isSearchingTours, setIsSearchingTours] = useState(false);

  // Dynamic Sections State
  type DynBlock = { type: string; [key: string]: any };
  const [dynamicBlocks, setDynamicBlocks] = useState<DynBlock[]>([]);
  const [editingBlockIdx, setEditingBlockIdx] = useState<number | null>(null);
  const [showAddBlockMenu, setShowAddBlockMenu] = useState(false);
  const [blockDraft, setBlockDraft] = useState<DynBlock>({ type: "paragraph", text: "" });


  const fetchCategoryData = async () => {
    try {
      const [cats, mappings] = await Promise.all([
        getDestinationCategories(),
        getDestinationCategoryMappings()
      ]);
      setCategories(cats);
      setCategoryMappings(mappings);
    } catch (e) {
      console.error("Failed to load category data:", e);
    }
  };

  const fetchHeroImage = async () => {
    try {
      const url = await getDestinationsHeroImage();
      if (url) setHeroImage(url);
    } catch (e) {
      console.error("Failed to load hero banner image:", e);
    }
  };

  const handleSaveHeroImage = async () => {
    setIsSavingHero(true);
    const toastId = toast.loading("Saving hero banner image...");
    try {
      const res = await setDestinationsHeroImage(heroImage.trim() || null);
      if (res.success) {
        toast.success("Destinations hero banner updated!", { id: toastId });
      } else {
        toast.error(res.error || "Failed to update hero banner", { id: toastId });
      }
    } catch (e: any) {
      toast.error(e?.message || "Error saving hero banner", { id: toastId });
    } finally {
      setIsSavingHero(false);
    }
  };

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/seo-pages?type=DESTINATION");
      if (res.ok) {
        const json = await res.json();
        const items: DestinationPage[] = Array.isArray(json) ? json : (json.data || []);
        const dests = items.filter((p: DestinationPage) => (p.type || "").toUpperCase() === "DESTINATION");
        setDestinations(dests);
      } else {
        toast.error("Failed to load destinations from server");
      }
    } catch (err) {
      console.error("Error fetching destinations:", err);
      toast.error("Failed to load destinations");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableProperties = async (query: string = "") => {
    setIsSearchingProperties(true);
    try {
      const res = await searchProperties(query);
      if (res.success && res.properties) setAvailableProperties(res.properties);
    } catch (e) {
      console.error("Failed to search properties:", e);
    } finally {
      setIsSearchingProperties(false);
    }
  };

  const fetchAvailableTours = async (query: string = "") => {
    setIsSearchingTours(true);
    try {
      const res = await searchTours(query);
      if (res.success && res.tours) setAvailableTours(res.tours);
    } catch (e) {
      console.error("Failed to search tours:", e);
    } finally {
      setIsSearchingTours(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
    fetchHeroImage();
    fetchCategoryData();
  }, []);

  // Debounced property search
  useEffect(() => {
    if (!isEditing) return;
    const timer = setTimeout(() => { fetchAvailableProperties(propertySearchQuery); }, 300);
    return () => clearTimeout(timer);
  }, [propertySearchQuery, isEditing]);

  // Debounced tour search
  useEffect(() => {
    if (!isEditing) return;
    const timer = setTimeout(() => { fetchAvailableTours(tourSearchQuery); }, 300);
    return () => clearTimeout(timer);
  }, [tourSearchQuery, isEditing]);

  const fetchPlacesForDestination = async (destId: string) => {
    if (!destId) {
      setLinkedPlaces([]);
      return;
    }
    setLoadingPlaces(true);
    try {
      const res = await getDestinationPlaces(destId);
      if (res.success && res.places) {
        setLinkedPlaces(res.places.map((p) => p.place));
      } else {
        setLinkedPlaces([]);
      }
    } catch (e) {
      console.error("Failed to load linked places:", e);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const fetchAvailablePlaces = async (query: string = "") => {
    setIsSearchingPlaces(true);
    try {
      const res = await searchPlaces(query);
      if (res.success && res.places) {
        setAvailablePlaces(res.places);
      }
    } catch (e) {
      console.error("Failed to search places:", e);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  // Debounced search for places: read-only lookup that never mutates or saves destination data
  useEffect(() => {
    if (!isEditing) return;
    const timer = setTimeout(() => {
      fetchAvailablePlaces(placeSearchQuery);
    }, 250);

    return () => clearTimeout(timer);
  }, [placeSearchQuery, isEditing]);

  const handleAddPlace = (place: PlaceData) => {
    if (linkedPlaces.some((p) => p.id === place.id)) {
      toast("Place already added to destination", { icon: "ℹ️" });
      return;
    }
    setLinkedPlaces((prev) => [...prev, place]);
  };

  const handleRemovePlace = (placeId: string) => {
    setLinkedPlaces((prev) => prev.filter((p) => p.id !== placeId));
  };

  const handleMovePlace = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= linkedPlaces.length) return;
    const copy = [...linkedPlaces];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setLinkedPlaces(copy);
  };

  const handleSavePlaces = async () => {
    if (!formData.id) {
      toast.error("Please save the destination first before linking places");
      return;
    }
    setIsSavingPlaces(true);
    const toastId = toast.loading("Saving linked places...");
    try {
      const res = await saveDestinationPlaces(formData.id, linkedPlaces.map((p) => p.id));
      if (res.success) {
        toast.success("Places saved successfully!", { id: toastId });
      } else {
        toast.error(res.error || "Failed to save places", { id: toastId });
      }
    } catch (e: any) {
      toast.error(e?.message || "Error saving places", { id: toastId });
    } finally {
      setIsSavingPlaces(false);
    }
  };

  const handleOpenCreatePlace = () => {
    setEditingPlaceId(null);
    setNewPlaceData({
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      destination: formData.h1Heading || formData.title || "",
      status: "ACTIVE",
      linkImmediately: true,
    });
    setShowCreatePlaceModal(true);
  };

  const handleOpenEditPlace = (place: PlaceData) => {
    setEditingPlaceId(place.id);
    setNewPlaceData({
      name: place.name,
      slug: place.slug,
      description: place.description || "",
      imageUrl: place.imageUrl || "",
      destination: place.destination || formData.h1Heading || formData.title || "",
      status: place.status || "ACTIVE",
      linkImmediately: false,
    });
    setShowCreatePlaceModal(true);
  };

  const handlePlaceFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaceData.name.trim()) {
      toast.error("Place name is required");
      return;
    }
    const slug = newPlaceData.slug.trim() || newPlaceData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    if (!slug) {
      toast.error("Valid slug is required");
      return;
    }

    setIsCreatingPlace(true);
    const isEditMode = !!editingPlaceId;
    const toastId = toast.loading(isEditMode ? "Updating place..." : "Creating place...");

    try {
      if (isEditMode) {
        const res = await updatePlace(editingPlaceId!, {
          name: newPlaceData.name.trim(),
          slug,
          description: newPlaceData.description.trim() || null,
          imageUrl: newPlaceData.imageUrl.trim() || null,
          destination: newPlaceData.destination.trim() || formData.h1Heading || formData.title || null,
          status: newPlaceData.status || "ACTIVE",
        });

        if (res.success && res.place) {
          toast.success(`Place "${res.place.name}" updated!`, { id: toastId });
          // Update in local linkedPlaces
          setLinkedPlaces((prev) => prev.map((p) => (p.id === editingPlaceId ? res.place! : p)));
          // Update in local availablePlaces
          setAvailablePlaces((prev) => prev.map((p) => (p.id === editingPlaceId ? res.place! : p)));
          setShowCreatePlaceModal(false);
          setEditingPlaceId(null);
          setNewPlaceData({
            name: "",
            slug: "",
            description: "",
            imageUrl: "",
            destination: formData.h1Heading || formData.title || "",
            status: "ACTIVE",
            linkImmediately: true,
          });
          fetchAvailablePlaces(placeSearchQuery);
        } else {
          toast.error(res.error || "Failed to update place", { id: toastId });
        }
      } else {
        const res = await createPlace({
          name: newPlaceData.name.trim(),
          slug,
          description: newPlaceData.description.trim() || null,
          imageUrl: newPlaceData.imageUrl.trim() || null,
          destination: newPlaceData.destination.trim() || formData.h1Heading || formData.title || null,
          status: newPlaceData.status || "ACTIVE",
        });

        if (res.success && res.place) {
          toast.success(`Place "${res.place.name}" created!`, { id: toastId });
          if (newPlaceData.linkImmediately) {
            handleAddPlace(res.place);
          }
          setShowCreatePlaceModal(false);
          setNewPlaceData({
            name: "",
            slug: "",
            description: "",
            imageUrl: "",
            destination: formData.h1Heading || formData.title || "",
            status: "ACTIVE",
            linkImmediately: true,
          });
          fetchAvailablePlaces(placeSearchQuery);
        } else {
          toast.error(res.error || "Failed to create place", { id: toastId });
        }
      }
    } catch (err: any) {
      toast.error(err?.message || (isEditMode ? "Error updating place" : "Error creating place"), { id: toastId });
    } finally {
      setIsCreatingPlace(false);
    }
  };

  const handleEdit = (dest: DestinationPage) => {
    setFormData({
      id: dest.id,
      type: "DESTINATION",
      slug: dest.slug || "",
      title: dest.title || "",
      description: dest.description || "",
      h1Heading: dest.h1Heading || "",
      content: dest.content || "",
      imageUrl: dest.imageUrl || "",
      workflowState: dest.workflowState || "PUBLISHED"
    });

    const strategy = (typeof dest.seoStrategy === "object" && dest.seoStrategy !== null) ? dest.seoStrategy : {};
    setCmsSections({
      overview: strategy.overview || dest.content || "",
      bestTimeToVisit: strategy.bestTimeToVisit || "",
      itinerary: strategy.itinerary || "",
      howToReach: strategy.howToReach || "",
      food: strategy.food || "",
      shopping: strategy.shopping || "",
      activities: strategy.activities || "",
      nearbyPlacesContent: strategy.nearbyPlacesContent || "",
    });

    const gallery = Array.isArray(strategy.gallery)
      ? strategy.gallery.map((g: any) => (typeof g === "string" ? g : g.url)).filter(Boolean)
      : (dest.imageUrl ? [dest.imageUrl] : []);
    setGalleryImages(gallery);

    const faqs = Array.isArray(strategy.faqs) && strategy.faqs.length > 0
      ? strategy.faqs
      : (Array.isArray(dest.faqs) ? dest.faqs : []);
    setCmsFaqs(faqs);

    // Hydrate dynamic sections blocks
    const dynBlocks = Array.isArray(strategy.dynamicSections) ? strategy.dynamicSections : [];
    setDynamicBlocks(dynBlocks);
    setEditingBlockIdx(null);
    setShowAddBlockMenu(false);

    // Hydrate featured properties & tours from stored IDs
    const propIds: string[] = Array.isArray(strategy.featuredPropertyIds) ? strategy.featuredPropertyIds : [];
    const tourIds: string[] = Array.isArray(strategy.featuredTourIds) ? strategy.featuredTourIds : [];
    if (propIds.length > 0) {
      getPropertiesByIds(propIds).then(res => {
        if (res.success && res.properties) setLinkedProperties(res.properties);
      }).catch(() => {});
    } else {
      setLinkedProperties([]);
    }
    if (tourIds.length > 0) {
      getToursByIds(tourIds).then(res => {
        if (res.success && res.tours) setLinkedTours(res.tours);
      }).catch(() => {});
    } else {
      setLinkedTours([]);
    }
    setPropertySearchQuery("");
    setTourSearchQuery("");
    fetchAvailableProperties("");
    fetchAvailableTours("");

    const destSlug = dest.slug || "";
    setSelectedCategories(categoryMappings[destSlug] || []);
    setPlaceSearchQuery("");
    fetchPlacesForDestination(dest.id);
    fetchAvailablePlaces("");
    setNewPlaceData((prev) => ({
      ...prev,
      destination: dest.h1Heading || dest.title || "",
    }));

    setEditorTab("basic");
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setFormData({
      id: "",
      type: "DESTINATION",
      slug: "",
      title: "",
      description: "",
      h1Heading: "",
      content: "",
      imageUrl: "",
      workflowState: "PUBLISHED"
    });

    setCmsSections({
      overview: "",
      bestTimeToVisit: "",
      itinerary: "",
      howToReach: "",
      food: "",
      shopping: "",
      activities: "",
      nearbyPlacesContent: "",
    });
    setGalleryImages([]);
    setCmsFaqs([]);
    setDynamicBlocks([]);
    setEditingBlockIdx(null);
    setLinkedProperties([]);
    setLinkedTours([]);
    setPropertySearchQuery("");
    setTourSearchQuery("");
    fetchAvailableProperties("");
    fetchAvailableTours("");

    setSelectedCategories([]);
    setPlaceSearchQuery("");
    setLinkedPlaces([]);
    fetchAvailablePlaces("");
    setNewPlaceData((prev) => ({
      ...prev,
      destination: "",
    }));

    setEditorTab("basic");
    setIsEditing(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    const toastId = toast.loading("Deleting destination...");
    try {
      const res = await fetch(`/api/admin/seo-pages/${id}`, { method: "DELETE" });

      if (res.ok) {
        // Save category mappings for this destination
        const newMappings = { ...categoryMappings };
        if (selectedCategories.length > 0) {
          newMappings[formData.slug] = selectedCategories;
        } else {
          delete newMappings[formData.slug];
        }
        await saveDestinationCategoryMappings(newMappings);
        setCategoryMappings(newMappings);

        toast.success("Destination deleted successfully", { id: toastId });
        fetchDestinations();
      } else {
        toast.error("Failed to delete destination", { id: toastId });
      }
    } catch (err) {
      toast.error("Error deleting destination", { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdating = !!formData.id;
    const url = isUpdating ? `/api/admin/seo-pages/${formData.id}` : "/api/admin/seo-pages";
    const method = isUpdating ? "PUT" : "POST";

    const toastId = toast.loading(isUpdating ? "Updating destination..." : "Creating destination...");
    try {
      const existingStrategy = (formData.id && destinations.find(d => d.id === formData.id)?.seoStrategy) || {};
      const payload = {
        ...formData,
        content: cmsSections.overview || formData.content,
        faqs: cmsFaqs,
        seoStrategy: {
          ...existingStrategy,
          gallery: galleryImages.map(url => ({ url, alt: formData.h1Heading || formData.title })),
          overview: cmsSections.overview,
          bestTimeToVisit: cmsSections.bestTimeToVisit,
          itinerary: cmsSections.itinerary,
          howToReach: cmsSections.howToReach,
          food: cmsSections.food,
          shopping: cmsSections.shopping,
          activities: cmsSections.activities,
          featuredPropertyIds: linkedProperties.map(p => p.id),
          featuredTourIds: linkedTours.map(t => t.id),
          nearbyPlacesContent: cmsSections.nearbyPlacesContent,
          faqs: cmsFaqs,
          dynamicSections: dynamicBlocks,
        }
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Save category mappings for this destination
        const newMappings = { ...categoryMappings };
        if (selectedCategories.length > 0) {
          newMappings[formData.slug] = selectedCategories;
        } else {
          delete newMappings[formData.slug];
        }
        await saveDestinationCategoryMappings(newMappings);
        setCategoryMappings(newMappings);

        toast.success(`Destination ${isUpdating ? "updated" : "created"}!`, { id: toastId });
        setIsEditing(false);
        fetchDestinations();
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to save destination", { id: toastId });
      }
    } catch (err) {
      toast.error("An error occurred while saving", { id: toastId });
    }
  };

  const filtered = destinations.filter(d =>
    (d.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.slug || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.h1Heading || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="p-2 bg-orange-50 text-orange-600 rounded-xl">
              <MapPin className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Destinations Management (V2)</h2>
          </div>
          <p className="text-sm text-slate-500">
            Manage live destination pages displayed on the public <span className="font-semibold text-slate-700">/destinations</span> discovery hub.
          </p>
        </div>
        {!isEditing && (
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDestinations}
              className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
              title="Refresh Destinations"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl flex items-center gap-2 font-bold text-sm transition-colors shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" /> Add Destination
            </button>
          </div>
        )}
      </div>

      {/* 2. Hero Banner Settings Box */}
      {!isEditing && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Discovery Page Hero Banner (/destinations)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Controls the top background image</span>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1 w-full">
              <input
                type="text"
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                placeholder="Paste Cloudinary or image URL (e.g. https://res.cloudinary.com/...)"
                className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all font-mono"
              />
            </div>
            <button
              onClick={handleSaveHeroImage}
              disabled={isSavingHero}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors shrink-0 disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              {isSavingHero ? "Saving..." : "Save Banner"}
            </button>
          </div>

          {heroImage && (
            <div className="relative h-28 w-full max-w-md rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <img
                src={heroImage}
                alt="Destinations Hero Preview"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                Active Hero Preview
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. Form OR Table */}
      {isEditing ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
          <button
            onClick={() => setIsEditing(false)}
            className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Destinations List
          </button>

          <h3 className="text-lg font-bold text-slate-900 mb-6">
            {formData.id ? `Edit Destination: ${formData.title}` : "Create New Destination"}
          </h3>

          {/* Sub-tab Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 mb-6 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setEditorTab("basic")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                editorTab === "basic"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              📌 Basic & Categories
            </button>
            <button
              type="button"
              onClick={() => setEditorTab("gallery")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                editorTab === "gallery"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              🖼️ Hero Gallery
              {galleryImages.length > 0 && (
                <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {galleryImages.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setEditorTab("sections")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                editorTab === "sections"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              📝 Rich Content Sections
            </button>
            <button
              type="button"
              onClick={() => setEditorTab("places")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                editorTab === "places"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              📍 Places to Visit
              {linkedPlaces.length > 0 && (
                <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {linkedPlaces.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setEditorTab("featured")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                editorTab === "featured"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              🏨 Where to Stay & Tours
              {(linkedProperties.length > 0 || linkedTours.length > 0) && (
                <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {linkedProperties.length + linkedTours.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setEditorTab("dynamic")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                editorTab === "dynamic"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              ✨ Dynamic Blocks
              {dynamicBlocks.length > 0 && (
                <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {dynamicBlocks.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setEditorTab("faqs")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                editorTab === "faqs"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              ❓ FAQs
              {cmsFaqs.length > 0 && (
                <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {cmsFaqs.length}
                </span>
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            {/* 1. BASIC & CATEGORIES TAB */}
            {editorTab === "basic" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Type
                    </label>
                    <input
                      type="text"
                      value="DESTINATION"
                      disabled
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Publication Status
                    </label>
                    <select
                      value={formData.workflowState}
                      onChange={(e) => setFormData({ ...formData, workflowState: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-sm font-medium"
                    >
                      <option value="PUBLISHED">PUBLISHED (Live)</option>
                      <option value="DRAFT">DRAFT (Hidden)</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    URL Slug <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm font-mono">
                      /destinations/
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      className="flex-1 p-2.5 border border-slate-200 rounded-r-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-sm font-mono"
                      required
                      placeholder="e.g. gulmarg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Page Title (Meta Title) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-sm"
                    required
                    placeholder="e.g. Gulmarg Travel Guide | Best Time to Visit, Places & Gondola"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    H1 Main Heading <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.h1Heading}
                    onChange={(e) => setFormData({ ...formData, h1Heading: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-sm font-bold"
                    required
                    placeholder="e.g. Places to Visit in Gulmarg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Featured Card Image URL
                  </label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-sm font-mono"
                    placeholder="https://images.unsplash.com/... or https://res.cloudinary.com/..."
                  />
                  {formData.imageUrl && (
                    <div className="mt-3 relative h-36 w-60 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Card Excerpt / Short Description (Meta Description)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all text-sm"
                    rows={2}
                    placeholder="A concise 2-sentence summary displayed on cards and in search results."
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Landscape Categories
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <label key={cat.slug} className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.slug)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, cat.slug]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(slug => slug !== cat.slug));
                            }
                          }}
                          className="w-4 h-4 text-[#f97316] border-slate-300 rounded focus:ring-[#f97316]"
                        />
                        <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                  {categories.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No categories available.</p>
                  )}
                </div>
              </div>
            )}

            {/* 2. HERO GALLERY TAB */}
            {editorTab === "gallery" && (
              <div className="space-y-5">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Bento Gallery Photos
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    Add high-resolution image URLs displayed in the Hero Bento Gallery on the public destination page.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      placeholder="Paste image URL (e.g. https://res.cloudinary.com/... or Unsplash)"
                      className="flex-1 p-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newGalleryUrl.trim()) return toast.error("Please enter an image URL");
                        setGalleryImages([...galleryImages, newGalleryUrl.trim()]);
                        setNewGalleryUrl("");
                      }}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Photo
                    </button>
                  </div>
                </div>

                {galleryImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {galleryImages.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100">
                        <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-2">
                          <span className="text-white text-[11px] font-bold px-2 py-0.5 bg-black/60 rounded">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                            className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center">
                    <p className="text-xs text-slate-500">No gallery photos added yet. If left empty, the featured card image will be used as hero background.</p>
                  </div>
                )}
              </div>
            )}

            {/* 3. RICH CONTENT SECTIONS TAB */}
            {editorTab === "sections" && (
              <div className="space-y-6">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>These sections feed directly into the fixed locked destination template. Markdown formatting (headings, lists, bold, italics, tables) is fully rendered.</span>
                </div>

                {/* Overview */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    1. Overview & Destination Intro
                  </label>
                  <textarea
                    value={cmsSections.overview}
                    onChange={(e) => setCmsSections({ ...cmsSections, overview: e.target.value })}
                    rows={6}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] text-sm"
                    placeholder="Introduction and core narrative about this destination..."
                  />
                </div>

                {/* Best Time to Visit */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    2. Best Time to Visit (Seasonal Guide)
                  </label>
                  <textarea
                    value={cmsSections.bestTimeToVisit}
                    onChange={(e) => setCmsSections({ ...cmsSections, bestTimeToVisit: e.target.value })}
                    rows={5}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] text-sm"
                    placeholder="- **Summer (April to June):** Pleasant weather for sightseeing...\n- **Winter (Dec to Feb):** Snow activities and skiing..."
                  />
                </div>

                {/* Itinerary */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    3. Recommended Itinerary
                  </label>
                  <textarea
                    value={cmsSections.itinerary}
                    onChange={(e) => setCmsSections({ ...cmsSections, itinerary: e.target.value })}
                    rows={5}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] text-sm"
                    placeholder="### 2-Day Suggested Itinerary\n- **Day 1:** Arrival and key attractions...\n- **Day 2:** Morning excursions and shopping..."
                  />
                </div>

                {/* How to Reach */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    4. How to Reach
                  </label>
                  <textarea
                    value={cmsSections.howToReach}
                    onChange={(e) => setCmsSections({ ...cmsSections, howToReach: e.target.value })}
                    rows={4}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] text-sm"
                    placeholder="Transit options from Srinagar Airport, road distance, cab routes, and travel tips..."
                  />
                </div>

                {/* Food & Dining */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    5. Food & Culinary Specialties
                  </label>
                  <textarea
                    value={cmsSections.food}
                    onChange={(e) => setCmsSections({ ...cmsSections, food: e.target.value })}
                    rows={4}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] text-sm"
                    placeholder="Must-try local dishes, Kahwa tea, traditional Wazwan, bakeries, and dining recommendations..."
                  />
                </div>

                {/* Shopping */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    6. Shopping & Local Handicrafts
                  </label>
                  <textarea
                    value={cmsSections.shopping}
                    onChange={(e) => setCmsSections({ ...cmsSections, shopping: e.target.value })}
                    rows={4}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] text-sm"
                    placeholder="Authentic local souvenirs, Pashmina shawls, saffron, walnut wood carvings, and bazaars..."
                  />
                </div>

                {/* Activities */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    7. Activities & Things to Do
                  </label>
                  <textarea
                    value={cmsSections.activities}
                    onChange={(e) => setCmsSections({ ...cmsSections, activities: e.target.value })}
                    rows={4}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] text-sm"
                    placeholder="Adventure activities, pony treks, rafting, nature trails, photography frames..."
                  />
                </div>

                {/* Nearby Places Content */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    8. Nearby Places & Day Excursions
                  </label>
                  <textarea
                    value={cmsSections.nearbyPlacesContent}
                    onChange={(e) => setCmsSections({ ...cmsSections, nearbyPlacesContent: e.target.value })}
                    rows={4}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] text-sm"
                    placeholder="Interesting side trips, nearby valleys, viewpoints, and scenic route extensions..."
                  />
                </div>
              </div>
            )}

            {/* 4. PLACES TO VISIT TAB */}
            {editorTab === "places" && (
              <div
                className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5 space-y-4"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                  }
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Places To Visit
                      </h4>
                      <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {linkedPlaces.length} Linked
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Attractions and sightseeing spots displayed on this destination page.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenCreatePlace}
                    className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-orange-500" /> Create New Place
                  </button>
                </div>

                {!formData.id && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Save this destination first to persist places linking and ordering.</span>
                  </div>
                )}

                {/* Linked Places List */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Linked Places in Order
                  </label>

                  {loadingPlaces ? (
                    <div className="py-6 flex justify-center items-center text-slate-400 text-xs gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                      Loading linked places...
                    </div>
                  ) : linkedPlaces.length > 0 ? (
                    <div className="space-y-2">
                      {linkedPlaces.map((place, index) => (
                        <div
                          key={place.id}
                          className="flex items-center justify-between gap-3 p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0">
                              {index + 1}
                            </span>
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 relative border border-slate-200/60">
                              {place.imageUrl ? (
                                <img
                                  src={place.imageUrl}
                                  alt={place.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <ImageIcon className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">
                                {place.name}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                /{place.slug} {place.destination ? `• ${place.destination}` : ""} {place.status === "INACTIVE" ? "• (INACTIVE)" : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenEditPlace(place)}
                              className="p-1.5 text-slate-400 hover:text-orange-600 transition-colors rounded-lg hover:bg-orange-50 cursor-pointer"
                              title="Edit Place"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMovePlace(index, "up")}
                              disabled={index === 0}
                              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-lg hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                              title="Move Up"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMovePlace(index, "down")}
                              disabled={index === linkedPlaces.length - 1}
                              className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors rounded-lg hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                              title="Move Down"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePlace(place.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 ml-1 cursor-pointer"
                              title="Unlink Place"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {formData.id && (
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={handleSavePlaces}
                            disabled={isSavingPlaces}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            {isSavingPlaces ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            Save Places Ordering
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-5 border border-dashed border-slate-200 rounded-xl bg-white text-center">
                      <p className="text-xs text-slate-500 font-medium">
                        No places have been added to this destination yet.
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Search existing places below or create a new place to link it.
                      </p>
                    </div>
                  )}
                </div>

                {/* Search & Available Places */}
                <div className="pt-3 border-t border-slate-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Link Existing Places
                    </label>
                    {isSearchingPlaces && (
                      <span className="text-[11px] font-medium text-orange-600 flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                        Searching places...
                      </span>
                    )}
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={placeSearchQuery}
                      onChange={(e) => setPlaceSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          fetchAvailablePlaces(placeSearchQuery);
                        }
                      }}
                      placeholder="Search existing places by name or slug (e.g. Dal Lake)..."
                      className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all"
                    />
                    {isSearchingPlaces ? (
                      <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin absolute right-3 top-2.5 pointer-events-none" />
                    ) : placeSearchQuery ? (
                      <button
                        type="button"
                        onClick={() => setPlaceSearchQuery("")}
                        className="text-slate-400 hover:text-slate-600 absolute right-3 top-2.5 cursor-pointer"
                        title="Clear search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                    {isSearchingPlaces && availablePlaces.length === 0 ? (
                      <div className="py-6 flex justify-center items-center text-slate-400 text-xs gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                        Searching places...
                      </div>
                    ) : availablePlaces.length > 0 ? (
                      availablePlaces.map((place) => {
                        const isLinked = linkedPlaces.some((p) => p.id === place.id);
                        return (
                          <div
                            key={place.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-all text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                                {place.imageUrl ? (
                                  <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <ImageIcon className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 truncate">{place.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {place.destination || "General"} • {place.slug}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleOpenEditPlace(place)}
                                className="p-1.5 text-slate-400 hover:text-orange-600 transition-colors rounded-lg hover:bg-orange-50 cursor-pointer"
                                title="Edit Place"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddPlace(place)}
                                disabled={isLinked}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                                  isLinked
                                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                    : "bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700"
                                }`}
                              >
                                {isLinked ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" /> Linked
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3" /> Add
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        {placeSearchQuery ? `No places found matching "${placeSearchQuery}".` : "No places created yet."}
                        <button
                          type="button"
                          onClick={handleOpenCreatePlace}
                          className="ml-2 font-bold text-orange-600 hover:underline cursor-pointer"
                        >
                          Create New Place
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 5. FEATURED PROPERTIES & TOURS TAB */}
            {editorTab === "featured" && (
              <div className="space-y-8">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>Select properties and tours to feature in the <strong>"Where to Stay"</strong> and <strong>"Featured Tours"</strong> sections on this destination page. Order matters — use the arrows to reorder.</span>
                </div>

                {/* ── FEATURED PROPERTIES ── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <span className="text-base">🏨</span>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Featured Hotels / Stays</h4>
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {linkedProperties.length} selected
                    </span>
                  </div>

                  {/* Linked Properties */}
                  {linkedProperties.length > 0 ? (
                    <div className="space-y-2">
                      {linkedProperties.map((prop, idx) => (
                        <div key={prop.id} className="flex items-center justify-between gap-3 p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0">{idx + 1}</span>
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                              {prop.images?.[0] ? (
                                <img src={prop.images[0]} alt={prop.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-4 h-4" /></div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{prop.name}</p>
                              <p className="text-[11px] text-slate-400 truncate">{prop.location} • ₹{prop.pricePerNight?.toLocaleString()}/night</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button type="button" onClick={() => { const a = [...linkedProperties]; if (idx > 0) { [a[idx-1], a[idx]] = [a[idx], a[idx-1]]; setLinkedProperties(a); } }} disabled={idx === 0} className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors rounded-lg hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed" title="Move Up"><ArrowUp className="w-4 h-4" /></button>
                            <button type="button" onClick={() => { const a = [...linkedProperties]; if (idx < a.length-1) { [a[idx], a[idx+1]] = [a[idx+1], a[idx]]; setLinkedProperties(a); } }} disabled={idx === linkedProperties.length - 1} className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors rounded-lg hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed" title="Move Down"><ArrowDown className="w-4 h-4" /></button>
                            <button type="button" onClick={() => setLinkedProperties(prev => prev.filter(p => p.id !== prop.id))} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 ml-1 cursor-pointer" title="Remove"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 border border-dashed border-slate-200 rounded-xl bg-white text-center">
                      <p className="text-xs text-slate-500">No hotels/stays selected. Search below to add.</p>
                    </div>
                  )}

                  {/* Property Search */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Search & Add Hotels</label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={propertySearchQuery}
                        onChange={(e) => setPropertySearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); } }}
                        placeholder="Search by name or location (e.g. Houseboat, Dal Lake)..."
                        className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all"
                      />
                      {isSearchingProperties ? (
                        <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin absolute right-3 top-2.5 pointer-events-none" />
                      ) : propertySearchQuery ? (
                        <button type="button" onClick={() => setPropertySearchQuery("")} className="text-slate-400 hover:text-slate-600 absolute right-3 top-2.5 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                      ) : null}
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {availableProperties.length > 0 ? availableProperties.map((prop) => {
                        const isLinked = linkedProperties.some(p => p.id === prop.id);
                        return (
                          <div key={prop.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-all text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                                {prop.images?.[0] ? <img src={prop.images[0]} alt={prop.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-4 h-4" /></div>}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 truncate">{prop.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">{prop.location} • ₹{prop.pricePerNight?.toLocaleString()}/night</p>
                              </div>
                            </div>
                            <button type="button" onClick={() => { if (!isLinked) setLinkedProperties(prev => [...prev, prop]); }} disabled={isLinked} className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all shrink-0 flex items-center gap-1 cursor-pointer ${isLinked ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-orange-50 text-orange-600 hover:bg-orange-100"}`}>
                              {isLinked ? <><Check className="w-3 h-3 text-emerald-600" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
                            </button>
                          </div>
                        );
                      }) : (
                        <div className="py-4 text-center text-slate-400 text-xs">
                          {isSearchingProperties ? "Searching..." : propertySearchQuery ? `No properties found for "${propertySearchQuery}".` : "Type to search or browse all approved properties."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── FEATURED TOURS ── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <span className="text-base">🗺️</span>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Featured Tours</h4>
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {linkedTours.length} selected
                    </span>
                  </div>

                  {/* Linked Tours */}
                  {linkedTours.length > 0 ? (
                    <div className="space-y-2">
                      {linkedTours.map((tour, idx) => (
                        <div key={tour.id} className="flex items-center justify-between gap-3 p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0">{idx + 1}</span>
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                              {tour.images?.[0] ? (
                                <img src={tour.images[0]} alt={tour.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-4 h-4" /></div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-800 truncate">{tour.title}</p>
                              <p className="text-[11px] text-slate-400 truncate">{tour.duration} • ₹{tour.price?.toLocaleString()} • /{tour.slug}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button type="button" onClick={() => { const a = [...linkedTours]; if (idx > 0) { [a[idx-1], a[idx]] = [a[idx], a[idx-1]]; setLinkedTours(a); } }} disabled={idx === 0} className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors rounded-lg hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed" title="Move Up"><ArrowUp className="w-4 h-4" /></button>
                            <button type="button" onClick={() => { const a = [...linkedTours]; if (idx < a.length-1) { [a[idx], a[idx+1]] = [a[idx+1], a[idx]]; setLinkedTours(a); } }} disabled={idx === linkedTours.length - 1} className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors rounded-lg hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed" title="Move Down"><ArrowDown className="w-4 h-4" /></button>
                            <button type="button" onClick={() => setLinkedTours(prev => prev.filter(t => t.id !== tour.id))} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 ml-1 cursor-pointer" title="Remove"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-5 border border-dashed border-slate-200 rounded-xl bg-white text-center">
                      <p className="text-xs text-slate-500">No tours selected. Search below to add.</p>
                    </div>
                  )}

                  {/* Tour Search */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Search & Add Tours</label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                      <input
                        type="text"
                        value={tourSearchQuery}
                        onChange={(e) => setTourSearchQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); } }}
                        placeholder="Search tours by title (e.g. Gulmarg Gondola, Pahalgam Valley)..."
                        className="w-full pl-9 pr-9 py-2 text-xs border border-slate-200 bg-white rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all"
                      />
                      {isSearchingTours ? (
                        <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin absolute right-3 top-2.5 pointer-events-none" />
                      ) : tourSearchQuery ? (
                        <button type="button" onClick={() => setTourSearchQuery("")} className="text-slate-400 hover:text-slate-600 absolute right-3 top-2.5 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                      ) : null}
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                      {availableTours.length > 0 ? availableTours.map((tour) => {
                        const isLinked = linkedTours.some(t => t.id === tour.id);
                        return (
                          <div key={tour.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-all text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                                {tour.images?.[0] ? <img src={tour.images[0]} alt={tour.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-4 h-4" /></div>}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 truncate">{tour.title}</p>
                                <p className="text-[10px] text-slate-400 truncate">{tour.duration} • ₹{tour.price?.toLocaleString()}</p>
                              </div>
                            </div>
                            <button type="button" onClick={() => { if (!isLinked) setLinkedTours(prev => [...prev, tour]); }} disabled={isLinked} className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all shrink-0 flex items-center gap-1 cursor-pointer ${isLinked ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-orange-50 text-orange-600 hover:bg-orange-100"}`}>
                              {isLinked ? <><Check className="w-3 h-3 text-emerald-600" /> Added</> : <><Plus className="w-3 h-3" /> Add</>}
                            </button>
                          </div>
                        );
                      }) : (
                        <div className="py-4 text-center text-slate-400 text-xs">
                          {isSearchingTours ? "Searching..." : tourSearchQuery ? `No tours found for "${tourSearchQuery}".` : "Type to search or browse all live tours."}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. DYNAMIC BLOCKS TAB */}
            {editorTab === "dynamic" && (
              <div className="space-y-5">
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                  <span>Dynamic blocks appear <strong>between fixed sections</strong> on the page. Use them for custom content like local tips, photography guides, cultural notes etc. Reorder freely.</span>
                </div>

                {/* Block List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{dynamicBlocks.length} Block{dynamicBlocks.length !== 1 ? 's' : ''}</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowAddBlockMenu(v => !v)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Block
                      </button>
                      {showAddBlockMenu && (
                        <div className="absolute right-0 top-9 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 min-w-[200px] space-y-0.5">
                          {[
                            { type: "heading", label: "📌 Heading", init: { type: "heading", level: 2, text: "" } },
                            { type: "paragraph", label: "📝 Paragraph", init: { type: "paragraph", text: "" } },
                            { type: "list", label: "📋 List", init: { type: "list", style: "bullet", items: [""] } },
                            { type: "table", label: "📊 Table", init: { type: "table", headers: ["Column 1", "Column 2"], rows: [["Row 1", "Value"]] } },
                            { type: "callout", label: "💡 Callout / Tip", init: { type: "callout", variant: "tip", title: "", text: "" } },
                            { type: "image", label: "🖼️ Image", init: { type: "image", url: "", alt: "", caption: "", layout: "full" } },
                          ].map(item => (
                            <button
                              key={item.type}
                              type="button"
                              onClick={() => {
                                setDynamicBlocks(prev => [...prev, { ...item.init }]);
                                setEditingBlockIdx(dynamicBlocks.length);
                                setBlockDraft({ ...item.init });
                                setShowAddBlockMenu(false);
                              }}
                              className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {dynamicBlocks.length === 0 && (
                    <div className="p-8 border border-dashed border-slate-200 rounded-2xl text-center">
                      <p className="text-xs text-slate-500">No dynamic blocks yet. Click <strong>Add Block</strong> to create your first one.</p>
                    </div>
                  )}

                  {dynamicBlocks.map((block, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                      {/* Block Header */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                          <span className="text-xs font-bold text-slate-700 capitalize">
                            {block.type === "heading" ? `H${block.level || 2} Heading` :
                             block.type === "callout" ? `💡 Callout (${block.variant || "tip"})` :
                             block.type === "list" ? `📋 ${block.style === "numbered" ? "Numbered" : "Bullet"} List` :
                             block.type === "table" ? "📊 Table" :
                             block.type === "image" ? "🖼️ Image" :
                             "📝 Paragraph"}
                          </span>
                          {block.text && <span className="text-[11px] text-slate-400 truncate max-w-[200px]">— {String(block.text).slice(0, 50)}</span>}
                          {block.type === "heading" && block.text && <span className="text-[11px] text-slate-400 truncate max-w-[200px]">— {String(block.text).slice(0, 50)}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => { const a = [...dynamicBlocks]; if (idx > 0) { [a[idx-1], a[idx]] = [a[idx], a[idx-1]]; setDynamicBlocks(a); if (editingBlockIdx === idx) setEditingBlockIdx(idx - 1); } }} disabled={idx === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded cursor-pointer"><ArrowUp className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => { const a = [...dynamicBlocks]; if (idx < a.length - 1) { [a[idx], a[idx+1]] = [a[idx+1], a[idx]]; setDynamicBlocks(a); if (editingBlockIdx === idx) setEditingBlockIdx(idx + 1); } }} disabled={idx === dynamicBlocks.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded cursor-pointer"><ArrowDown className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => { if (editingBlockIdx === idx) { setEditingBlockIdx(null); } else { setEditingBlockIdx(idx); setBlockDraft({ ...block }); } }} className="p-1 text-slate-400 hover:text-blue-600 rounded cursor-pointer"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => { setDynamicBlocks(prev => prev.filter((_, i) => i !== idx)); if (editingBlockIdx === idx) setEditingBlockIdx(null); }} className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>

                      {/* Inline Editor */}
                      {editingBlockIdx === idx && (
                        <div className="p-4 space-y-3 bg-white">

                          {/* HEADING */}
                          {blockDraft.type === "heading" && (
                            <>
                              <select value={blockDraft.level || 2} onChange={e => setBlockDraft({ ...blockDraft, level: Number(e.target.value) })} className="w-full p-2 text-xs border border-slate-200 rounded-xl">
                                <option value={2}>H2 — Large Section Heading</option>
                                <option value={3}>H3 — Sub Heading</option>
                                <option value={4}>H4 — Small Heading</option>
                              </select>
                              <input type="text" value={blockDraft.text || ""} onChange={e => setBlockDraft({ ...blockDraft, text: e.target.value })} placeholder="Heading text..." className="w-full p-2.5 text-sm font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400" />
                            </>
                          )}

                          {/* PARAGRAPH */}
                          {blockDraft.type === "paragraph" && (
                            <textarea value={blockDraft.text || ""} onChange={e => setBlockDraft({ ...blockDraft, text: e.target.value })} rows={5} placeholder="Write paragraph content... (Markdown supported: **bold**, *italic*, [link](url))" className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 font-mono text-xs" />
                          )}

                          {/* LIST */}
                          {blockDraft.type === "list" && (
                            <>
                              <select value={blockDraft.style || "bullet"} onChange={e => setBlockDraft({ ...blockDraft, style: e.target.value })} className="w-full p-2 text-xs border border-slate-200 rounded-xl">
                                <option value="bullet">• Bullet List</option>
                                <option value="numbered">1. Numbered List</option>
                              </select>
                              <div className="space-y-2">
                                {(blockDraft.items || [""]).map((item: string, iIdx: number) => (
                                  <div key={iIdx} className="flex gap-2">
                                    <input type="text" value={item} onChange={e => { const items = [...(blockDraft.items || [])]; items[iIdx] = e.target.value; setBlockDraft({ ...blockDraft, items }); }} placeholder={`Item ${iIdx + 1}...`} className="flex-1 p-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400" />
                                    <button type="button" onClick={() => { const items = (blockDraft.items || []).filter((_: string, i: number) => i !== iIdx); setBlockDraft({ ...blockDraft, items: items.length ? items : [""] }); }} className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                                  </div>
                                ))}
                                <button type="button" onClick={() => setBlockDraft({ ...blockDraft, items: [...(blockDraft.items || []), ""] })} className="text-xs text-purple-600 font-bold hover:underline cursor-pointer flex items-center gap-1"><Plus className="w-3 h-3" /> Add Item</button>
                              </div>
                            </>
                          )}

                          {/* TABLE */}
                          {blockDraft.type === "table" && (
                            <div className="space-y-3">
                              <div>
                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">Headers (comma-separated)</label>
                                <input type="text" value={(blockDraft.headers || []).join(", ")} onChange={e => setBlockDraft({ ...blockDraft, headers: e.target.value.split(",").map((h: string) => h.trim()) })} placeholder="Column 1, Column 2, Column 3" className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 font-mono" />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 block">Rows (one row per line, cells separated by |)</label>
                                <textarea
                                  value={(blockDraft.rows || []).map((r: string[]) => r.join(" | ")).join("\n")}
                                  onChange={e => {
                                    const rows = e.target.value.split("\n").map((line: string) => line.split("|").map((c: string) => c.trim()));
                                    setBlockDraft({ ...blockDraft, rows });
                                  }}
                                  rows={5}
                                  placeholder={`Spring | Best for gardens\nSummer | Lotus blooms\nWinter | Snow & cold`}
                                  className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400 font-mono"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Tip: Separate cells with <code className="bg-slate-100 px-1 rounded">|</code></p>
                              </div>
                            </div>
                          )}

                          {/* CALLOUT */}
                          {blockDraft.type === "callout" && (
                            <>
                              <select value={blockDraft.variant || "tip"} onChange={e => setBlockDraft({ ...blockDraft, variant: e.target.value })} className="w-full p-2 text-xs border border-slate-200 rounded-xl">
                                <option value="tip">💡 Tip / Insider Info</option>
                                <option value="info">ℹ️ Traveler Note</option>
                                <option value="warning">⚠️ Important Advisory</option>
                                <option value="quote">💬 Local Insight / Quote</option>
                              </select>
                              <input type="text" value={blockDraft.title || ""} onChange={e => setBlockDraft({ ...blockDraft, title: e.target.value })} placeholder="Optional title (e.g. Insider Tip)" className="w-full p-2 text-xs border border-slate-200 rounded-xl" />
                              <textarea value={blockDraft.text || ""} onChange={e => setBlockDraft({ ...blockDraft, text: e.target.value })} rows={3} placeholder="Callout text content..." className="w-full p-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-400" />
                            </>
                          )}

                          {/* IMAGE */}
                          {blockDraft.type === "image" && (
                            <>
                              <input type="text" value={blockDraft.url || ""} onChange={e => setBlockDraft({ ...blockDraft, url: e.target.value })} placeholder="Image URL (Cloudinary, Unsplash...)" className="w-full p-2 text-xs border border-slate-200 rounded-xl font-mono" />
                              {blockDraft.url && <img src={blockDraft.url} alt="preview" className="w-full h-32 object-cover rounded-xl border border-slate-200" />}
                              <input type="text" value={blockDraft.alt || ""} onChange={e => setBlockDraft({ ...blockDraft, alt: e.target.value })} placeholder="Alt text (for SEO & accessibility)" className="w-full p-2 text-xs border border-slate-200 rounded-xl" />
                              <input type="text" value={blockDraft.caption || ""} onChange={e => setBlockDraft({ ...blockDraft, caption: e.target.value })} placeholder="Caption (optional)" className="w-full p-2 text-xs border border-slate-200 rounded-xl" />
                              <select value={blockDraft.layout || "full"} onChange={e => setBlockDraft({ ...blockDraft, layout: e.target.value })} className="w-full p-2 text-xs border border-slate-200 rounded-xl">
                                <option value="full">Full Width</option>
                                <option value="inline-left">Inline Left (text wraps right)</option>
                                <option value="inline-right">Inline Right (text wraps left)</option>
                              </select>
                            </>
                          )}

                          {/* Save/Cancel buttons */}
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...dynamicBlocks];
                                updated[idx] = { ...blockDraft };
                                setDynamicBlocks(updated);
                                setEditingBlockIdx(null);
                                toast.success("Block updated — remember to Save Destination!");
                              }}
                              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Apply Block
                            </button>
                            <button type="button" onClick={() => setEditingBlockIdx(null)} className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {dynamicBlocks.length > 0 && (
                  <p className="text-[11px] text-slate-400 text-center pt-2">
                    ✅ {dynamicBlocks.length} block{dynamicBlocks.length !== 1 ? "s" : ""} ready — click <strong>Save Destination CMS</strong> to persist.
                  </p>
                )}
              </div>
            )}

            {/* 7. FAQS TAB */}
            {editorTab === "faqs" && (
              <div className="space-y-5">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Add New FAQ
                  </h4>
                  <input
                    type="text"
                    value={newFaq.question}
                    onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                    placeholder="Frequently Asked Question (e.g. Do I need advance tickets for Gondola?)"
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                  />
                  <textarea
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                    rows={2}
                    placeholder="Clear and detailed answer for visitors..."
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newFaq.question.trim() || !newFaq.answer.trim()) {
                        return toast.error("Please enter both question and answer");
                      }
                      setCmsFaqs([...cmsFaqs, { question: newFaq.question.trim(), answer: newFaq.answer.trim() }]);
                      setNewFaq({ question: "", answer: "" });
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add FAQ Item
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Configured FAQs ({cmsFaqs.length})
                  </label>
                  {cmsFaqs.length > 0 ? (
                    cmsFaqs.map((faq, idx) => (
                      <div key={idx} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-start justify-between gap-3">
                        <div className="space-y-1 min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900">
                            Q: {faq.question}
                          </p>
                          <p className="text-xs text-slate-600">
                            A: {faq.answer}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCmsFaqs(cmsFaqs.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 cursor-pointer shrink-0"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                      No FAQs added for this destination yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="pt-6 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-[#f97316] hover:bg-[#ea580c] transition-colors shadow-sm flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Save className="w-4 h-4" />
                {formData.id ? "Save Destination CMS" : "Create Destination"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Top Bar with Search & Total Count */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {destinations.length} Destinations
              </span>
              <span className="text-xs text-slate-400">
                ({destinations.filter(d => d.workflowState === "PUBLISHED").length} Published)
              </span>
            </div>
            <input
              type="text"
              placeholder="Search by destination name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:max-w-xs p-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all"
            />
          </div>

          {/* Destinations Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Photo</th>
                  <th className="py-3.5 px-4">Destination</th>
                  <th className="py-3.5 px-4">Slug / Live Link</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(dest => {
                  const livePath = `/destinations/${dest.slug}`;
                  return (
                    <tr key={dest.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {dest.imageUrl ? (
                            <img
                              src={dest.imageUrl}
                              alt={dest.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <MapPin className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {dest.title || dest.h1Heading}
                        </div>
                        {dest.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-md">
                            {dest.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <a
                          href={livePath}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-mono text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          {livePath}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          dest.workflowState === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                          dest.workflowState === 'DRAFT' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {dest.workflowState || 'PUBLISHED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={livePath}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors bg-white rounded-lg border border-slate-200 shadow-2xs"
                            title="View Public Page"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleEdit(dest)}
                            className="p-2 text-slate-400 hover:text-[#f97316] transition-colors bg-white rounded-lg border border-slate-200 shadow-2xs"
                            title="Edit Destination"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(dest.id, dest.title || dest.slug)}
                            className="p-2 text-slate-400 hover:text-red-600 transition-colors bg-white rounded-lg border border-slate-200 shadow-2xs"
                            title="Delete Destination"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      {searchQuery ? "No destinations match your search." : "No destinations available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create New Place Modal */}
      {showCreatePlaceModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingPlaceId ? `Edit Place: ${newPlaceData.name || "Place"}` : "Create New Place"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreatePlaceModal(false);
                  setEditingPlaceId(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceFormSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Place Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dal Lake"
                  value={newPlaceData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
                    setNewPlaceData((prev) => ({
                      ...prev,
                      name: val,
                      slug: !editingPlaceId && (prev.slug === "" || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
                        ? autoSlug
                        : prev.slug
                    }));
                  }}
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. dal-lake"
                    value={newPlaceData.slug}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                    className="w-full p-2.5 text-xs font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Destination / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Srinagar"
                    value={newPlaceData.destination}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, destination: e.target.value })}
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={newPlaceData.status}
                  onChange={(e) => setNewPlaceData({ ...newPlaceData, status: e.target.value })}
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Short description of this attraction..."
                  value={newPlaceData.description}
                  onChange={(e) => setNewPlaceData({ ...newPlaceData, description: e.target.value })}
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              {/* Cloudinary Image Upload & Preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Place Photography
                </label>
                <div className="flex gap-2 items-center mb-2">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    {newPlaceData.imageUrl ? (
                      <img src={newPlaceData.imageUrl} alt="Place Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5">
                    <CldUploadWidget
                      uploadPreset="wanderkashmir_preset"
                      onSuccess={(result: any) => {
                        if (result?.event === "success" && result?.info?.secure_url) {
                          setNewPlaceData((prev) => ({ ...prev, imageUrl: result.info.secure_url }));
                          toast.success("Image uploaded successfully!");
                        }
                      }}
                      options={{
                        multiple: false,
                        resourceType: "image",
                        clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
                      }}
                    >
                      {({ open }) => (
                        <button
                          type="button"
                          onClick={() => open()}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 text-xs font-bold rounded-lg shadow-2xs transition-all shrink-0 flex items-center gap-1.5 self-start cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" /> Upload Photo
                        </button>
                      )}
                    </CldUploadWidget>
                    <input
                      type="url"
                      placeholder="Or paste direct image URL (https://...)"
                      value={newPlaceData.imageUrl}
                      onChange={(e) => setNewPlaceData({ ...newPlaceData, imageUrl: e.target.value })}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {!editingPlaceId && formData.id && (
                <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPlaceData.linkImmediately}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, linkImmediately: e.target.checked })}
                    className="w-4 h-4 text-orange-500 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    Immediately link this place to {formData.h1Heading || formData.title || "current destination"}
                  </span>
                </label>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreatePlaceModal(false);
                    setEditingPlaceId(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPlace}
                  className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isCreatingPlace ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {isCreatingPlace ? (editingPlaceId ? "Saving..." : "Creating...") : (editingPlaceId ? "Save Place Changes" : "Create Place")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
