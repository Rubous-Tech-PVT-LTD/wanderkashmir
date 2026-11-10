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
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { AdminPlaceItem, AvailableDestinationOption } from "@/lib/admin/places";
import { togglePlaceStatusAction, deletePlaceAction } from "@/actions/adminPlaces";

interface PlacesDashboardClientProps {
  places: AdminPlaceItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentSearch: string;
  currentStatus: string;
  currentDestinationId: string;
  destinations: AvailableDestinationOption[];
  stats: {
    total: number;
    active: number;
    inactive: number;
    featured: number;
  };
}

export default function PlacesDashboardClient({
  places,
  totalCount,
  currentPage,
  totalPages,
  currentSearch,
  currentStatus,
  currentDestinationId,
  destinations,
  stats,
}: PlacesDashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const applyFilters = (updates: Record<string, string | null>) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === "ALL") {
        current.delete(key);
      } else {
        current.set(key, val);
      }
    });
    // Reset to page 1 on search/filter changes
    if (!updates.page) {
      current.delete("page");
    }
    router.push(`/admin/places?${current.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchVal.trim() });
  };

  const handleToggleStatus = async (place: AdminPlaceItem) => {
    try {
      setTogglingId(place.id);
      const newStatus = place.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const result = await togglePlaceStatusAction(place.id, newStatus);
      if (result.success) {
        setStatusMessage({
          text: `"${place.name}" is now ${newStatus === "ACTIVE" ? "Published (Active)" : "Unpublished (Draft)"}.`,
          type: "success",
        });
        router.refresh();
      } else {
        setStatusMessage({ text: result.error || "Failed to update status.", type: "error" });
      }
    } catch {
      setStatusMessage({ text: "An unexpected error occurred while toggling status.", type: "error" });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeletePlace = async (place: AdminPlaceItem) => {
    if (!confirm(`Are you sure you want to permanently delete "${place.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(place.id);
      const result = await deletePlaceAction(place.id);
      if (result.success) {
        setStatusMessage({ text: `"${place.name}" has been permanently deleted.`, type: "success" });
        router.refresh();
      } else {
        setStatusMessage({ text: result.error || "Failed to delete place.", type: "error" });
      }
    } catch {
      setStatusMessage({ text: "An unexpected error occurred while deleting place.", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Places Management CMS</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-3 h-3" /> V2 Dynamic Places
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Curate attraction pages, manage Bento photo galleries, visitor timings, and SEO discovery metadata.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/places"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Places Directory</span>
          </Link>
          <Link
            href="/admin/places/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-950/40 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Place</span>
          </Link>
        </div>
      </div>

      {/* Real-Time Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Places</span>
            <Compass className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-1">Registered in database</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Active & Live</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.active}</div>
          <div className="text-[11px] text-slate-500 mt-1">Publicly discoverable</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Featured Places</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.featured}</div>
          <div className="text-[11px] text-slate-500 mt-1">Spotlighted on homepage</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Draft / Inactive</span>
            <EyeOff className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-300">{stats.inactive}</div>
          <div className="text-[11px] text-slate-500 mt-1">Hidden from public listing</div>
        </div>
      </div>

      {/* Status Feedback Toast Banner */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm border ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-red-500/10 border-red-500/30 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-70 hover:opacity-100 underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search by Place name, slug, or destination..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-24 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-md transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Destination Filter */}
          <select
            value={currentDestinationId}
            onChange={(e) => applyFilters({ destinationId: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Destinations</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={currentStatus}
            onChange={(e) => applyFilters({ status: e.target.value })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active (Published)</option>
            <option value="INACTIVE">Inactive (Draft)</option>
          </select>

          {/* Clear Filters Button */}
          {(currentSearch || currentStatus !== "ALL" || currentDestinationId !== "ALL") && (
            <button
              onClick={() => {
                setSearchVal("");
                router.push("/admin/places");
              }}
              className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Places Data Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {places.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Compass className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold text-white">No Places Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {currentSearch || currentStatus !== "ALL" || currentDestinationId !== "ALL"
                ? "No places match your active search and filter criteria. Try resetting the filters."
                : "No places have been created yet. Click 'Create New Place' to publish your first attraction."}
            </p>
            <div className="pt-2">
              <Link
                href="/admin/places/new"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Place</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Place & Imagery</th>
                  <th className="py-3 px-4">Slug & URL</th>
                  <th className="py-3 px-4">Linked Destinations</th>
                  <th className="py-3 px-4 text-center">Featured</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {places.map((place) => {
                  const isNishatBagh = place.slug.includes("nishat-bagh");
                  const primaryDest = place.destinationPlaces[0]?.destination;
                  const publicUrl = primaryDest
                    ? `/destinations/${primaryDest.slug}/${place.slug}`
                    : `/places`;

                  return (
                    <tr
                      key={place.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Place & Imagery */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded-lg bg-slate-800 relative overflow-hidden shrink-0 border border-slate-700/60">
                            {place.imageUrl ? (
                              <Image
                                src={place.imageUrl}
                                alt={place.name}
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
                          <div>
                            <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                              <span>{place.name}</span>
                              {isNishatBagh && (
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-medium">
                                  Benchmark
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs mt-0.5">
                              {place.description || "No description provided."}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {place.slug}
                        </span>
                      </td>

                      {/* Linked Destinations */}
                      <td className="py-3 px-4">
                        {place.destinationPlaces.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {place.destinationPlaces.map((dp) => (
                              <span
                                key={dp.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700"
                              >
                                <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                                {dp.destination.title}
                              </span>
                            ))}
                          </div>
                        ) : place.destination ? (
                          <span className="text-slate-400 italic text-[11px]">
                            {place.destination} (scalar)
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Unlinked</span>
                        )}
                      </td>

                      {/* Featured Star */}
                      <td className="py-3 px-4 text-center">
                        {place.isFeatured ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Star className="w-3 h-3 fill-amber-400" /> Featured
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(place)}
                          disabled={togglingId === place.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                            place.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                          }`}
                          title={`Click to ${place.status === "ACTIVE" ? "Unpublish" : "Publish"}`}
                        >
                          {togglingId === place.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : place.status === "ACTIVE" ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                          <span>{place.status === "ACTIVE" ? "Published" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Preview Link */}
                          <Link
                            href={`/admin/places/${place.id}/preview`}
                            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="Preview Place Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Edit Button */}
                          <Link
                            href={`/admin/places/${place.id}/edit`}
                            className="p-1.5 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                            title="Edit Place"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Public Live View Link */}
                          {place.status === "ACTIVE" && (
                            <Link
                              href={publicUrl}
                              target="_blank"
                              className="p-1.5 rounded-md text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                              title="Open Live Public URL"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Delete Action (Admin Only) */}
                          {!isNishatBagh && (
                            <button
                              type="button"
                              onClick={() => handleDeletePlace(place)}
                              disabled={deletingId === place.id}
                              className="p-1.5 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete Place"
                            >
                              {deletingId === place.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
            <div>
              Showing page <span className="font-semibold text-white">{currentPage}</span> of{" "}
              <span className="font-semibold text-white">{totalPages}</span> ({totalCount} places total)
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => applyFilters({ page: String(currentPage - 1) })}
                disabled={currentPage <= 1}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition-colors"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFilters({ page: String(currentPage + 1) })}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 transition-colors"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

