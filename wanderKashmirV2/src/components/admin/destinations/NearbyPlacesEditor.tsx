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
  Edit2,
  Check,
  X,
  Compass,
  Sparkles,
} from "lucide-react";

export interface NearbyPlaceItemConfig {
  id: string;
  type: "database" | "custom";
  placeId?: string;
  name?: string;
  description?: string | null;
  url?: string | null;
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
  // Database place search state
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Custom place form state
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customUrlError, setCustomUrlError] = useState<string | null>(null);

  // Editing existing custom item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editUrlError, setEditUrlError] = useState<string | null>(null);

  // Set of selected place IDs for quick lookup
  const selectedPlaceIds = useMemo(() => {
    return new Set(
      items
        .filter((it) => it.type === "database" && it.placeId)
        .map((it) => it.placeId as string)
    );
  }, [items]);

  // Lookup map for available places
  const placesMap = useMemo(() => {
    const map = new Map<string, AvailablePlaceOption>();
    for (const p of availablePlaces) {
      map.set(p.id, p);
    }
    return map;
  }, [availablePlaces]);

  // Filtered available places based on search
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

  // Validate URL helper
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

  // Add DB Place handler
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

  // Add Custom Place handler
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
    };

    onChangeItems([...items, newItem]);
    setCustomName("");
    setCustomDescription("");
    setCustomUrl("");
    setCustomUrlError(null);
  };

  // Start editing custom item
  const handleStartEdit = (item: NearbyPlaceItemConfig) => {
    setEditingItemId(item.id);
    setEditName(item.name || "");
    setEditDescription(item.description || "");
    setEditUrl(item.url || "");
    setEditUrlError(null);
  };

  // Save edited custom item
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
        };
      }
      return it;
    });

    onChangeItems(updated);
    setEditingItemId(null);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditName("");
    setEditDescription("");
    setEditUrl("");
    setEditUrlError(null);
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    onChangeItems(items.filter((it) => it.id !== id));
  };

  // Move item up / down
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
    <div className="space-y-4">
      {/* 1. Optional Intro / Overview Text Field (Preserves legacy nearbyPlacesContent) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-300">
            Nearby Places Intro & Guide Copy (Markdown / Text)
          </label>
          <span className="text-[11px] text-slate-500">
            SEO supportive overview paragraph for excursions
          </span>
        </div>
        <textarea
          rows={3}
          value={introContent}
          onChange={(e) => onChangeIntroContent(e.target.value)}
          placeholder="e.g. Srinagar serves as the central hub for exploring neighboring valleys and alpine passes..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
        />
      </div>

      {/* 2. Controls & Actions Bar */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">
            Configured Places & Suggestions ({items.length})
          </span>
        </div>
      </div>

      {/* 3. Searchable Multi-Select for Real Database Places */}
      <div className="relative">
        <label className="block text-xs font-medium text-slate-300 mb-1">
          Select existing places
        </label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
            }}
            placeholder="Search active places by name, slug, or destination..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Visible message when database has no records */}
        {availablePlaces.length === 0 && (
          <div className="mt-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span>No database places available. Add places under Destinations → Places, or create a custom suggestion below.</span>
          </div>
        )}

        {/* Dropdown Options */}
        {isDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsDropdownOpen(false)}
            />
            <div className="absolute z-20 w-full mt-1.5 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-800">
              {filteredAvailablePlaces.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  {availablePlaces.length === 0
                    ? "No database places available. Add places under Destinations → Places, or create a custom suggestion below."
                    : "No matching database places found."}
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
                          ? "bg-slate-800/40 text-slate-500 cursor-not-allowed"
                          : "hover:bg-slate-800 text-slate-200 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {place.imageUrl ? (
                          <div className="w-7 h-7 rounded-md bg-slate-800 relative overflow-hidden shrink-0 border border-slate-700">
                            <Image
                              src={place.imageUrl}
                              alt={place.name}
                              fill
                              className="object-cover"
                              sizes="28px"
                            />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-slate-400">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div className="truncate flex items-center gap-1.5 min-w-0">
                          <span className="font-medium text-white truncate">{place.name}</span>
                          {place.entityType === "DESTINATION" ? (
                            <span className="text-[9.5px] font-semibold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30 shrink-0">
                              Destination
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-semibold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">
                              Attraction
                            </span>
                          )}
                          {linkedDestTitle && place.entityType !== "DESTINATION" && (
                            <span className="text-[11px] text-slate-400 truncate">
                              ({linkedDestTitle})
                            </span>
                          )}
                          <span className="font-mono text-[10px] text-slate-500 shrink-0">
                            /{place.slug}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <Check className="w-3 h-3" /> Added
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-400">
                            <Plus className="w-3 h-3" /> Select
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

      {/* 4. Custom Nearby Place Input Form (Always Visible) */}
      <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Add Custom Nearby Place Suggestion
          </span>
          <span className="text-[10px] text-slate-400">
            For unlisted or external spots (saved directly with this destination)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Place Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Doodhpathri Valley"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">
              Destination / Guide URL (Optional)
            </label>
            <input
              type="text"
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                setCustomUrlError(null);
              }}
              placeholder="/destinations/doodhpathri or https://..."
              className={`w-full bg-slate-900 border rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none ${
                customUrlError
                  ? "border-red-500 focus:border-red-400"
                  : "border-slate-700 focus:border-amber-400"
              }`}
            />
            {customUrlError && (
              <p className="text-[10px] text-red-400 mt-1">{customUrlError}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">
            Short Description / SEO Support Text
          </label>
          <input
            type="text"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
            placeholder="e.g. Untouched alpine meadow 42 km away with grazing herds along Shaliganga River."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleAddCustomPlace}
            disabled={!customName.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Custom Suggestion
          </button>
        </div>
      </div>

      {/* 5. Combined Items List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center space-y-1">
            <p className="text-xs text-slate-400 font-medium">
              No nearby places added yet.
            </p>
            <p className="text-[11px] text-slate-500">
              Use the search above to select existing database places, or click &quot;Add Custom Suggestion&quot; to add manual SEO recommendations.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            {items.map((item, index) => {
              const isDatabase = item.type === "database";
              const dbPlace = isDatabase && item.placeId ? placesMap.get(item.placeId) : null;
              const isEditing = editingItemId === item.id;

              const displayName = isDatabase
                ? dbPlace?.name || `Database Place (${item.placeId})`
                : item.name || "Custom Suggestion";

              const displayDesc = isDatabase
                ? dbPlace?.description || null
                : item.description || null;

              const linkedDest = isDatabase
                ? dbPlace?.destinationPlaces?.[0]?.destination?.title || dbPlace?.destination || null
                : null;

              return (
                <div
                  key={item.id}
                  className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors"
                >
                  {isEditing ? (
                    /* Inline Editing for Custom Item */
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-amber-300">
                          Edit Custom Entry
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Place Name"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                        <input
                          type="text"
                          value={editUrl}
                          onChange={(e) => {
                            setEditUrl(e.target.value);
                            setEditUrlError(null);
                          }}
                          placeholder="URL (optional)"
                          className={`w-full bg-slate-900 border rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none ${
                            editUrlError
                              ? "border-red-500 focus:border-red-400"
                              : "border-slate-700 focus:border-amber-400"
                          }`}
                        />
                      </div>
                      {editUrlError && (
                        <p className="text-[10px] text-red-400">{editUrlError}</p>
                      )}
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Short Description"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-2 py-0.5 text-xs text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(item.id)}
                          className="px-2.5 py-1 rounded text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <>
                      <div className="flex items-start gap-2.5 min-w-0">
                        {/* Order & Drag Indicator */}
                        <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMove(index, "up")}
                            className="p-0.5 rounded text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={index === items.length - 1}
                            onClick={() => handleMove(index, "down")}
                            className="p-0.5 rounded text-slate-500 hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Thumbnail if DB place */}
                        {isDatabase && dbPlace?.imageUrl ? (
                          <div className="w-9 h-9 rounded-lg bg-slate-800 relative overflow-hidden shrink-0 border border-slate-700 mt-0.5">
                            <Image
                              src={dbPlace.imageUrl}
                              alt={displayName}
                              fill
                              className="object-cover"
                              sizes="36px"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${
                              isDatabase
                                ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-400"
                                : "bg-amber-950/40 border-amber-800/40 text-amber-400"
                            }`}
                          >
                            <MapPin className="w-4 h-4" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-xs text-white">
                              {displayName}
                            </span>

                            {/* Badge */}
                            {item.entityType === "DESTINATION" || dbPlace?.entityType === "DESTINATION" ? (
                              <span className="text-[10px] font-semibold text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">
                                Destination
                              </span>
                            ) : isDatabase ? (
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                Database Place
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                Custom Entry
                              </span>
                            )}

                            {linkedDest && (
                              <span className="text-[10px] text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                                {linkedDest}
                              </span>
                            )}

                            {!isDatabase && item.url && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 max-w-[150px] truncate">
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                {item.url}
                              </span>
                            )}
                          </div>

                          {displayDesc && (
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                              {displayDesc}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="shrink-0 flex items-center gap-1.5 self-end sm:self-center">
                        {!isDatabase && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                            title="Edit Custom Suggestion"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
