"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle,
  EyeOff,
  Palette,
  Image as ImageIcon,
} from "lucide-react";
import { AdminTravelStyleItem } from "@/lib/admin/travelStyles";
import {
  toggleTravelStyleActiveAction,
  deleteTravelStyleAction,
} from "@/actions/adminTravelStyles";

interface TravelStylesListClientProps {
  styles: AdminTravelStyleItem[];
  currentSearch: string;
}

export default function TravelStylesListClient({
  styles,
  currentSearch,
}: TravelStylesListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalStyle, setDeleteModalStyle] = useState<AdminTravelStyleItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [forceHardDelete, setForceHardDelete] = useState(false);

  const applySearch = (search: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (search && search.trim() !== "") {
      params.set("search", search.trim());
    } else {
      params.delete("search");
    }
    router.push(`/admin/travel-styles?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applySearch(searchVal);
  };

  const handleToggleActive = async (styleId: string, currentActive: boolean) => {
    setTogglingId(styleId);
    try {
      const res = await toggleTravelStyleActiveAction(styleId, !currentActive);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to update status");
      }
    } catch {
      alert("Error communicating with server.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalStyle) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteTravelStyleAction(deleteModalStyle.id, forceHardDelete);
      if (res.success) {
        setDeleteModalStyle(null);
        router.refresh();
      } else {
        setDeleteError(res.error || "Failed to delete travel style.");
      }
    } catch {
      setDeleteError("Network error while deleting travel style.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
            <Palette className="w-7 h-7 text-emerald-400" />
            Travel Styles Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Organize travel style categories, display sequence, and tour associations ({styles.length} categories)
          </p>
        </div>

        <Link
          href="/admin/travel-styles/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Travel Style
        </Link>
      </div>

      {/* Search Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
            <Search className="h-3.5 w-3.5" />
          </div>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search style name, slug, description..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="text-xs text-slate-400">
          Total: <strong className="text-white">{styles.length}</strong> styles
        </div>
      </div>

      {/* Styles Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-sm">
        {styles.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No travel styles found matching the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5 w-16">Order</th>
                  <th className="px-5 py-3.5">Style Details</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Connected Tours</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {styles.map((style) => {
                  const isToggling = togglingId === style.id;
                  return (
                    <tr key={style.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Order */}
                      <td className="px-5 py-4 font-mono font-semibold text-slate-400 text-xs">
                        #{style.displayOrder}
                      </td>

                      {/* Name, Slug, Thumbnail */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shrink-0 flex items-center justify-center">
                            {style.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={style.imageUrl}
                                alt={style.imageAlt || style.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-600" />
                            )}
                          </div>

                          <div>
                            <div className="font-semibold text-white text-sm">
                              {style.name}
                            </div>
                            <div className="font-mono text-xs text-slate-400 mt-0.5">
                              /{style.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-5 py-4 max-w-xs truncate text-xs text-slate-400">
                        {style.description || <span className="text-slate-600">No description</span>}
                      </td>

                      {/* Connected Tours */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="inline-flex flex-col">
                          <span className="text-xs font-bold text-white">
                            {style.toursCount} Tours
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                            <span className="text-emerald-400 font-medium">
                              {style.liveToursCount} live
                            </span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-400 font-medium">
                              {style.draftToursCount} draft
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Active Status Toggle */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleToggleActive(style.id, style.isActive)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                            style.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                          }`}
                          title={`Click to ${style.isActive ? "deactivate" : "activate"}`}
                        >
                          {isToggling ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : style.isActive ? (
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{style.isActive ? "Active" : "Inactive"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {style.isActive && (
                            <Link
                              href={`/tours/${style.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="View Public Page"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/travel-styles/${style.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteModalStyle(style);
                              setDeleteError(null);
                              setForceHardDelete(false);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
                            title="Delete / Archive Travel Style"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Safety Notice */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400">
        <p className="font-semibold text-slate-300">Travel Styles Relational Safety Policy:</p>
        <p className="mt-0.5 leading-relaxed">
          Deleting a travel style that is linked to tours safely deactivates (archives) it to preserve public URLs and tour categorization.
          Permanent removal is only permitted when zero tours are connected, preventing orphaned database relationships.
        </p>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalStyle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Travel Style</h3>
                <p className="text-xs text-slate-400">Production Relationship Safety Guard</p>
              </div>
            </div>

            {deleteError && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {deleteError}
              </div>
            )}

            {deleteModalStyle.toursCount > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Travel style <strong className="text-white">"{deleteModalStyle.name}"</strong> has{" "}
                  <strong className="text-amber-400">{deleteModalStyle.toursCount} connected tour package(s)</strong>.
                  To protect public URLs and tour associations, deleting this style will safely{" "}
                  <strong className="text-emerald-400">deactivate (archive)</strong> it rather than destroying relationships.
                </p>

                <label className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceHardDelete}
                    onChange={(e) => setForceHardDelete(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-800 text-rose-500 focus:ring-0"
                  />
                  <span className="text-[11px] text-slate-400">
                    Force permanent deletion (removes all {deleteModalStyle.toursCount} tour mapping rows from this style)
                  </span>
                </label>
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete travel style{" "}
                <strong className="text-white">"{deleteModalStyle.name}"</strong>?
                This style has 0 linked tours and can be safely deleted.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setDeleteModalStyle(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {deleteModalStyle.toursCount > 0 && !forceHardDelete ? "Archive Style" : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
