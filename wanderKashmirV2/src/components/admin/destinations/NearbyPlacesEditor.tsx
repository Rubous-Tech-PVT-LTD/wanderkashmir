"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  MapPin,
  ExternalLink,
  Pencil,
  Check,
  X,
  Compass,
} from "lucide-react";

export interface NearbyPlaceItemConfig {
  id: string;
  type: "database" | "custom";
  placeId?: string;
  name?: string;
  description?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  entityType?: "DESTINATION" | "PLACE";
}

export interface NearbyPlacesConfig {
  introContent?: string | null;
  items: NearbyPlaceItemConfig[];
}

export interface AvailablePlaceOption {
  id: string;
  name: string;
  slug: string;
  status: string;
  description?: string | null;
  destination: string | null;
  imageUrl: string | null;
  entityType?: "DESTINATION" | "PLACE";
  destinationPlaces?: {
    destination: {
      id: string;
      slug: string;
      title: string;
    };
  }[];
}

interface NearbyPlacesEditorProps {
  introContent: string;
  onChangeIntroContent: (val: string) => void;
  items: NearbyPlaceItemConfig[];
  onChangeItems: (items: NearbyPlaceItemConfig[]) => void;
  availablePlaces: AvailablePlaceOption[];
}

function generateCustomId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `custom_${crypto.randomUUID()}`;
  }
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function NearbyPlacesEditor({
  introContent,
  onChangeIntroContent,
  items,
  onChangeItems,
  availablePlaces,
}: NearbyPlacesEditorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customImageUrl, setCustomImageUrl] = useState("");
  const [customUrlError, setCustomUrlError] = useState<string | null>(null);

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editUrlError, setEditUrlError] = useState<string | null>(null);

  const selectedPlaceIds = useMemo(() => {
    return new Set(
      items
        .filter((it) => it.type === "database" && it.placeId)
        .map((it) => it.placeId as string)
    );
  }, [items]);

  const placesMap = useMemo(() => {
    const map = new Map<string, AvailablePlaceOption>();
    for (const p of availablePlaces) {
      map.set(p.id, p);
    }
    return map;
  }, [availablePlaces]);

  const filteredAvailablePlaces = useMemo(() => {
    if (!searchTerm.trim()) {
      return availablePlaces.slice(0, 8);
    }
    const term = searchTerm.toLowerCase().trim();
    return availablePlaces.filter((p) => {
      const matchName = p.name.toLowerCase().includes(term);
      const matchSlug = p.slug.toLowerCase().includes(term);
      const matchDest = p.destination?.toLowerCase().includes(term);
      const matchLinkedDest = p.destinationPlaces?.some((dp) =>
        dp.destination.title.toLowerCase().includes(term)
      );
      return matchName || matchSlug || matchDest || matchLinkedDest;
    });
  }, [availablePlaces, searchTerm]);

  const validateUrl = (url: string): { isValid: boolean; error?: string } => {
    if (!url.trim()) return { isValid: true };
    const trimmed = url.trim();
    if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.includes("javascript:")) {
      return { isValid: true };
    }
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
          return { isValid: true };
        }
      } catch {
        return { isValid: false, error: "Invalid URL format." };
      }
    }
    return {
      isValid: false,
      error: "URL must be a relative path (e.g., /destinations/gulmarg) or full http/https link.",
    };
  };

  const handleAddDatabasePlace = (place: AvailablePlaceOption) => {
    if (selectedPlaceIds.has(place.id)) return;
    const newItem: NearbyPlaceItemConfig = {
      id: `db_${place.id}`,
      type: "database",
      placeId: place.id,
      name: place.name,
      description: place.description || null,
      url: place.entityType === "DESTINATION" ? `/destinations/${place.slug}` : undefined,
      entityType: place.entityType || "PLACE",
    };
    onChangeItems([...items, newItem]);
    setSearchTerm("");
    setIsDropdownOpen(false);
  };

  const handleAddCustomPlace = () => {
    const trimmedName = customName.trim();
    if (!trimmedName) return;

    if (customUrl.trim()) {
      const validation = validateUrl(customUrl);
      if (!validation.isValid) {
        setCustomUrlError(validation.error || "Invalid URL");
        return;
      }
    }

    const newItem: NearbyPlaceItemConfig = {
      id: generateCustomId(),
      type: "custom",
      name: trimmedName,
      description: customDescription.trim() || null,
      url: customUrl.trim() || null,
      imageUrl: customImageUrl.trim() || null,
    };

    onChangeItems([...items, newItem]);
    setCustomName("");
    setCustomDescription("");
    setCustomUrl("");
    setCustomImageUrl("");
    setCustomUrlError(null);
  };

  const handleStartEdit = (item: NearbyPlaceItemConfig) => {
    setEditingItemId(item.id);
    setEditName(item.name || "");
    setEditDescription(item.description || "");
    setEditUrl(item.url || "");
    setEditImageUrl(item.imageUrl || "");
    setEditUrlError(null);
  };

  const handleSaveEdit = (id: string) => {
    const trimmedName = editName.trim();
    if (!trimmedName) return;

    if (editUrl.trim()) {
      const validation = validateUrl(editUrl);
      if (!validation.isValid) {
        setEditUrlError(validation.error || "Invalid URL");
        return;
      }
    }

    const updated = items.map((it) => {
      if (it.id === id) {
        return {
          ...it,
          name: trimmedName,
          description: editDescription.trim() || null,
          url: editUrl.trim() || null,
          imageUrl: editImageUrl.trim() || null,
        };
      }
      return it;
    });

    onChangeItems(updated);
    setEditingItemId(null);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditName("");
    setEditDescription("");
    setEditUrl("");
    setEditImageUrl("");
    setEditUrlError(null);
  };

  const handleRemoveItem = (id: string) => {
    onChangeItems(items.filter((it) => it.id !== id));
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    onChangeItems(copy);
  };

  return (
    <div className="space-y-5">
      {/* Intro Copy */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-700">
            Nearby Places Overview Copy (Markdown / Text)
          </label>
          <span className="text-[11px] text-slate-400">Optional intro for nearby excursions</span>
        </div>
        <textarea
          rows={3}
          value={introContent}
          onChange={(e) => onChangeIntroContent(e.target.value)}
          placeholder="e.g. Srinagar serves as the central hub for exploring neighboring valleys and alpine passes..."
          className="w-full rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden leading-relaxed"
        />
      </div>

      {/* Header */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
        <Compass className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-semibold text-slate-900">
          Configured Places & Suggestions ({items.length})
        </span>
      </div>

      {/* Searchable Multi-Select for Existing Database Places */}
      <div className="relative">
        <label className="block text-xs font-medium text-slate-700 mb-1.5">
          Link Existing Place or Destination
        </label>
        <div className="relative">
          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            placeholder="Search places or destinations by name or slug..."
            className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {availablePlaces.length === 0 && (
          <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            No places available yet. Add records under Places, or create a custom suggestion below.
          </div>
        )}

        {isDropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
            <div className="absolute z-20 w-full mt-1.5 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
              {filteredAvailablePlaces.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-500">
                  No matching places found.
                </div>
              ) : (
                filteredAvailablePlaces.map((place) => {
                  const isSelected = selectedPlaceIds.has(place.id);
                  const linkedDestTitle =
                    place.destinationPlaces && place.destinationPlaces.length > 0
                      ? place.destinationPlaces[0].destination.title
                      : place.destination || null;

                  return (
                    <div
                      key={place.id}
                      onClick={() => !isSelected && handleAddDatabasePlace(place)}
                      className={`p-2.5 flex items-center justify-between text-xs transition-colors ${
                        isSelected
                          ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                          : "hover:bg-slate-50 text-slate-700 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {place.imageUrl ? (
                          <div className="h-7 w-7 rounded-md bg-slate-100 relative overflow-hidden shrink-0 border border-slate-200">
                            <Image
                              src={place.imageUrl}
                              alt={place.name}
                              fill
                              className="object-cover"
                              sizes="28px"
                            />
                          </div>
                        ) : (
                          <div className="h-7 w-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-slate-400">
                            <MapPin className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <div className="truncate flex items-center gap-1.5 min-w-0">
                          <span className="font-medium text-slate-900 truncate">{place.name}</span>
                          <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 shrink-0">
                            {place.entityType === "DESTINATION" ? "Destination" : "Place"}
                          </span>
                          {linkedDestTitle && place.entityType !== "DESTINATION" && (
                            <span className="text-[11px] text-slate-500 truncate">
                              ({linkedDestTitle})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-[var(--season-primary)]/25 bg-[var(--season-primary-light)] px-2 py-0.5 text-[10px] font-medium text-[var(--season-primary-hover)]">
                            <Check className="h-3 w-3" /> Added
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--season-primary)]">
                            <Plus className="h-3 w-3" /> Add
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Custom Place Input */}
      <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-900">
            Add Custom Nearby Suggestion
          </span>
          <span className="text-[11px] text-slate-500">
            For unlisted spots (saved directly with this destination)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Place Name <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Doodhpathri Valley"
              className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Guide URL (Optional)
            </label>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                setCustomUrlError(null);
              }}
              placeholder="/destinations/doodhpathri or https://..."
              className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden ${
                customUrlError ? "border-rose-400" : "border-slate-200 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
              }`}
            />
            {customUrlError && <p className="text-[11px] text-rose-600 mt-1">{customUrlError}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Short Description
            </label>
            <input
              type="text"
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="e.g. Historic Mughal garden beside Dal Lake..."
              className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Image URL (Optional)
            </label>
            <input
              type="text"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              placeholder="https://res.cloudinary.com/..."
              className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleAddCustomPlace}
            disabled={!customName.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Custom Suggestion</span>
          </button>
        </div>
      </div>

      {/* Items List */}
      <div>
        {items.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-5 text-center space-y-1">
            <p className="text-xs font-medium text-slate-600">No nearby places configured yet.</p>
            <p className="text-[11px] text-slate-400">
              Select existing records above or add a custom suggestion.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 rounded-md border border-slate-200 bg-white overflow-hidden">
            {items.map((item, index) => {
              const isDatabase = item.type === "database";
              const dbPlace = isDatabase && item.placeId ? placesMap.get(item.placeId) : null;
              const isEditing = editingItemId === item.id;

              const displayName = isDatabase
                ? dbPlace?.name || item.name || `Place (${item.placeId})`
                : item.name || "Custom Suggestion";

              const displayDesc = isDatabase
                ? dbPlace?.description || item.description || null
                : item.description || null;

              const linkedDest = isDatabase
                ? dbPlace?.destinationPlaces?.[0]?.destination?.title || dbPlace?.destination || null
                : null;

              const thumbUrl = (isDatabase && dbPlace?.imageUrl) || item.imageUrl || null;

              return (
                <div
                  key={item.id}
                  className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  {isEditing ? (
                    <div className="w-full space-y-2.5">
                      <span className="text-[11px] font-semibold text-slate-700">
                        Edit Custom Entry
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Place Name"
                          className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                        />
                        <input
                          type="text"
                          value={editUrl}
                          onChange={(e) => {
                            setEditUrl(e.target.value);
                            setEditUrlError(null);
                          }}
                          placeholder="URL (optional)"
                          className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-hidden ${
                            editUrlError ? "border-rose-400" : "border-slate-200 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20"
                          }`}
                        />
                      </div>
                      {editUrlError && <p className="text-[11px] text-rose-600">{editUrlError}</p>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Short Description"
                          className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                        />
                        <input
                          type="text"
                          value={editImageUrl}
                          onChange={(e) => setEditImageUrl(e.target.value)}
                          placeholder="Image URL (optional)"
                          className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item.id)}
                          className="rounded-md bg-[var(--season-primary)] px-3 py-1 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] cursor-pointer shadow-xs"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMove(index, "up")}
                            className="rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-25 cursor-pointer"
                            title="Move up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === items.length - 1}
                            onClick={() => handleMove(index, "down")}
                            className="rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-25 cursor-pointer"
                            title="Move down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>

                        {thumbUrl ? (
                          <div className="h-9 w-9 rounded-lg bg-slate-100 relative overflow-hidden shrink-0 border border-slate-200 mt-0.5">
                            <Image
                              src={thumbUrl}
                              alt={displayName}
                              fill
                              className="object-cover"
                              sizes="36px"
                            />
                          </div>
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400 mt-0.5">
                            <MapPin className="h-4 w-4" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-xs text-slate-900">
                              {displayName}
                            </span>

                            <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                              {item.entityType === "DESTINATION" ||
                              dbPlace?.entityType === "DESTINATION"
                                ? "Destination"
                                : isDatabase
                                ? "Database Place"
                                : "Custom Entry"}
                            </span>

                            {linkedDest && (
                              <span className="text-[11px] text-slate-500">{linkedDest}</span>
                            )}

                            {!isDatabase && item.url && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-sky-50 border border-sky-200 px-1.5 py-0.5 text-[10px] text-sky-700 max-w-[160px] truncate">
                                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                <span className="truncate">{item.url}</span>
                              </span>
                            )}
                          </div>

                          {displayDesc && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {displayDesc}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1 self-end sm:self-center">
                        {!isDatabase && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Edit custom suggestion"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
