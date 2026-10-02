"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Plus,
  ExternalLink,
  Edit,
  Loader2,
  CheckCircle,
  EyeOff,
  MapPin,
  Compass,
  Layers,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  AdminDestinationListItem,
  AdminPlaceListItem,
  AdminDestinationsStats,
} from "@/lib/admin/destinations";
import {
  toggleDestinationPublishAction,
  togglePlaceActiveAction,
  createPlaceAction,
  updatePlaceAction,
  PlaceFormInput,
} from "@/actions/adminDestinations";

interface DestinationListClientProps {
  currentTab: "destinations" | "places";
  destinations: AdminDestinationListItem[];
  destinationsTotalCount: number;
  destinationsCurrentPage: number;
  destinationsTotalPages: number;
  places: AdminPlaceListItem[];
  placesTotalCount: number;
  placesCurrentPage: number;
  placesTotalPages: number;
  currentStatus: string;
  currentSearch: string;
  stats: AdminDestinationsStats;
}

export default function DestinationListClient({
  currentTab,
  destinations,
  destinationsTotalCount,
  destinationsCurrentPage,
  destinationsTotalPages,
  places,
  placesTotalCount,
  placesCurrentPage,
  placesTotalPages,
  currentStatus,
  currentSearch,
  stats,
}: DestinationListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Place Modal state
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<AdminPlaceListItem | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [placeSlug, setPlaceSlug] = useState("");
  const [placeDesc, setPlaceDesc] = useState("");
  const [placeImg, setPlaceImg] = useState("");
  const [placeDestination, setPlaceDestination] = useState("");
  const [placeStatus, setPlaceStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [placeSaving, setPlaceSaving] = useState(false);

  const applyFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === "ALL") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    if (!updates.page) {
      params.delete("page");
    }
    router.push(`/admin/destinations?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchVal });
  };

  const handleTogglePublish = async (destId: string, currentPublished: boolean) => {
    setTogglingId(destId);
    try {
      const res = await toggleDestinationPublishAction(destId, !currentPublished);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to update publication status.");
      }
    } catch {
      alert("Error communicating with server.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleTogglePlaceActive = async (placeId: string, currentActive: boolean) => {
    setTogglingId(placeId);
    try {
      const res = await togglePlaceActiveAction(placeId, !currentActive);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to update place active status.");
      }
    } catch {
      alert("Error communicating with server.");
    } finally {
      setTogglingId(null);
    }
  };

  const openCreatePlaceModal = () => {
    setEditingPlace(null);
    setPlaceName("");
    setPlaceSlug("");
    setPlaceDesc("");
    setPlaceImg("");
    setPlaceDestination("");
    setPlaceStatus("ACTIVE");
    setShowPlaceModal(true);
  };

  const openEditPlaceModal = (p: AdminPlaceListItem) => {
    setEditingPlace(p);
    setPlaceName(p.name);
    setPlaceSlug(p.slug);
    setPlaceDesc(p.description || "");
    setPlaceImg(p.imageUrl || "");
    setPlaceDestination(p.destination || "");
    setPlaceStatus(p.status === "ACTIVE" ? "ACTIVE" : "INACTIVE");
    setShowPlaceModal(true);
  };

  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlaceSaving(true);

    const payload: PlaceFormInput = {
      name: placeName,
      slug: placeSlug,
      description: placeDesc || null,
      imageUrl: placeImg || null,
      destination: placeDestination || null,
      status: placeStatus,
    };

    try {
      if (editingPlace) {
        const res = await updatePlaceAction(editingPlace.id, payload);
        if (!res.success) {
          alert(res.error || "Failed to update place");
          setPlaceSaving(false);
          return;
        }
      } else {
        const res = await createPlaceAction(payload);
        if (!res.success) {
          alert(res.error || "Failed to create place");
          setPlaceSaving(false);
          return;
        }
      }
      setShowPlaceModal(false);
      router.refresh();
    } catch {
      alert("Error saving place.");
    } finally {
      setPlaceSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Create CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Destinations & Places CMS
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage comprehensive Kashmiri destination hubs, content sections, and tourist attraction places
          </p>
        </div>

        {currentTab === "destinations" ? (
          <Link
            href="/admin/destinations/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Destination
          </Link>
        ) : (
          <button
            onClick={openCreatePlaceModal}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Place
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs font-medium text-slate-400">Published Destinations</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{stats.publishedDestinations}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Live on /destinations</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs font-medium text-slate-400">Draft Destinations</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{stats.draftDestinations}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Hidden from catalog</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs font-medium text-slate-400">Active Places</div>
          <div className="text-xl font-bold text-sky-400 mt-1">{stats.activePlaces}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tourist attractions</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
          <div className="text-xs font-medium text-slate-400">Destination ↔ Place Links</div>
          <div className="text-xl font-bold text-purple-400 mt-1">{stats.totalLinkedPlaces}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">DestinationPlace relations</div>
        </div>
      </div>

      {/* Tabs Navigation (Destinations vs Places) */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => applyFilters({ tab: "destinations", page: "1" })}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            currentTab === "destinations"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Compass className="w-4 h-4" />
          Destinations ({destinationsTotalCount})
        </button>

        <button
          onClick={() => applyFilters({ tab: "places", page: "1" })}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
            currentTab === "places"
              ? "border-emerald-400 text-emerald-400"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <MapPin className="w-4 h-4" />
          Places to Visit ({placesTotalCount})
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              currentTab === "destinations"
                ? "Search destination title, slug..."
                : "Search place name, slug, region..."
            }
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <select
            value={currentStatus}
            onChange={(e) => applyFilters({ status: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            {currentTab === "destinations" ? (
              <>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </>
            ) : (
              <>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Main Table: Destinations OR Places */}
      {currentTab === "destinations" ? (
        /* Destinations Table */
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">URL Slug</th>
                  <th className="py-3 px-4">Places</th>
                  <th className="py-3 px-4">Publication</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {destinations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <Compass className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                      No destinations found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  destinations.map((d) => {
                    const isPublished = d.workflowState === "PUBLISHED";
                    const isToggling = togglingId === d.id;

                    return (
                      <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0 relative border border-slate-700/50">
                              {d.imageUrl ? (
                                <Image
                                  src={d.imageUrl}
                                  alt={d.title}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                  <Compass className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-white truncate max-w-[240px]">
                                {d.title}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[240px]">
                                {d.h1Heading}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-mono text-emerald-400 text-[11px]">
                            /{d.slug}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-slate-300">
                            <Layers className="w-3.5 h-3.5 text-slate-500" />
                            {d.placesCount}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              isPublished
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {isPublished ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                            {d.workflowState}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {new Date(d.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Publish / Unpublish Toggle */}
                            <button
                              onClick={() => handleTogglePublish(d.id, isPublished)}
                              disabled={isToggling}
                              title={isPublished ? "Unpublish Destination" : "Publish Destination"}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isPublished
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                              }`}
                            >
                              {isToggling ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isPublished ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Edit */}
                            <Link
                              href={`/admin/destinations/${d.id}`}
                              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                              title="Edit Destination"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            {/* View Public Page */}
                            {isPublished && (
                              <Link
                                href={`/destinations/${d.slug}`}
                                target="_blank"
                                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                                title="View Public Destination Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with Pagination */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Delete: <strong className="text-slate-400">NOT IMPLEMENTED</strong> (Unpublish controls visibility)</span>
            </div>

            <div className="flex items-center gap-2">
              <span>
                Page {destinationsCurrentPage} of {destinationsTotalPages} ({destinationsTotalCount} destinations)
              </span>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => applyFilters({ page: String(destinationsCurrentPage - 1) })}
                  disabled={destinationsCurrentPage <= 1}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Prev
                </button>
                <button
                  onClick={() => applyFilters({ page: String(destinationsCurrentPage + 1) })}
                  disabled={destinationsCurrentPage >= destinationsTotalPages}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Places Table */
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Place Name</th>
                  <th className="py-3 px-4">URL Slug</th>
                  <th className="py-3 px-4">Destination Region</th>
                  <th className="py-3 px-4">Linked Destinations</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {places.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <MapPin className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                      No places found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  places.map((p) => {
                    const isActive = p.status === "ACTIVE";
                    const isToggling = togglingId === p.id;
                    const primaryDest = p.linkedDestinations[0];

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0 relative border border-slate-700/50">
                              {p.imageUrl ? (
                                <Image
                                  src={p.imageUrl}
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                  <MapPin className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-white truncate max-w-[200px]">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                                {p.description || "No description"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-mono text-sky-400 text-[11px]">
                            /{p.slug}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-300">
                          {p.destination || "Kashmir"}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {p.linkedDestinations.map((d) => (
                              <span
                                key={d.id}
                                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700"
                              >
                                {d.title.split("|")[0].trim()}
                              </span>
                            ))}
                            {p.linkedDestinations.length === 0 && (
                              <span className="text-[11px] text-slate-500">Unlinked</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                            }`}
                          >
                            {isActive ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                            {p.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Active Toggle */}
                            <button
                              onClick={() => handleTogglePlaceActive(p.id, isActive)}
                              disabled={isToggling}
                              title={isActive ? "Deactivate Place" : "Activate Place"}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                isActive
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                              }`}
                            >
                              {isToggling ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isActive ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEditPlaceModal(p)}
                              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                              title="Edit Place"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* View Public Route */}
                            {isActive && primaryDest && (
                              <Link
                                href={`/destinations/${primaryDest.slug}/${p.slug}`}
                                target="_blank"
                                className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
                                title="View Public Place Page"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with Pagination */}
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-slate-500">
              <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
              <span>Delete: <strong className="text-slate-400">NOT IMPLEMENTED</strong> (Deactivate controls visibility)</span>
            </div>

            <div className="flex items-center gap-2">
              <span>
                Page {placesCurrentPage} of {placesTotalPages} ({placesTotalCount} places)
              </span>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => applyFilters({ page: String(placesCurrentPage - 1) })}
                  disabled={placesCurrentPage <= 1}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Prev
                </button>
                <button
                  onClick={() => applyFilters({ page: String(placesCurrentPage + 1) })}
                  disabled={placesCurrentPage >= placesTotalPages}
                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Place Create/Edit Modal */}
      {showPlaceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">
              {editingPlace ? "Edit Tourist Attraction Place" : "Add New Place"}
            </h3>

            <form onSubmit={handleSavePlace} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Place Name *</label>
                <input
                  type="text"
                  required
                  value={placeName}
                  onChange={(e) => {
                    setPlaceName(e.target.value);
                    if (!editingPlace) {
                      setPlaceSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)+/g, "")
                      );
                    }
                  }}
                  placeholder="e.g. Shalimar Bagh Mughal Garden"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={placeSlug}
                  onChange={(e) => setPlaceSlug(e.target.value)}
                  placeholder="shalimar-bagh-srinagar"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Destination Region</label>
                <input
                  type="text"
                  value={placeDestination}
                  onChange={(e) => setPlaceDestination(e.target.value)}
                  placeholder="e.g. Srinagar or Gulmarg"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Image URL</label>
                <input
                  type="text"
                  value={placeImg}
                  onChange={(e) => setPlaceImg(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={placeDesc}
                  onChange={(e) => setPlaceDesc(e.target.value)}
                  placeholder="Historic Mughal garden built by Emperor Jahangir for his wife Nur Jahan in 1619..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Status</label>
                <select
                  value={placeStatus}
                  onChange={(e) => setPlaceStatus(e.target.value as "ACTIVE" | "INACTIVE")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPlaceModal(false)}
                  className="px-3 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={placeSaving}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 cursor-pointer disabled:opacity-50"
                >
                  {placeSaving ? "Saving..." : "Save Place"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
