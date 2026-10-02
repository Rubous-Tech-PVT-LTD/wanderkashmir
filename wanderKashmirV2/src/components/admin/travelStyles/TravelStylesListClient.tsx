"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Plus,
  ExternalLink,
  Edit,
  Loader2,
  CheckCircle,
  EyeOff,
  Palette,
  Image as ImageIcon,
} from "lucide-react";
import { AdminTravelStyleItem } from "@/lib/admin/travelStyles";
import { toggleTravelStyleActiveAction } from "@/actions/adminTravelStyles";

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
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900 text-slate-200 border border-slate-800">
                          <strong>{style.toursCount}</strong> Tours
                        </span>
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
        <p className="font-semibold text-slate-300">Phase 6B Policy Disclosure:</p>
        <p className="mt-0.5 leading-relaxed">
          Destructive deletion of travel style records is intentionally excluded from Phase 6B to safeguard SEO indexing
          and relational mappings. Deactivating a travel style immediately unpublishes its public category page and hides it
          from user discovery while preserving all underlying tour data.
        </p>
      </div>
    </div>
  );
}
