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
  Filter,
} from "lucide-react";
import { AdminTourListItem } from "@/lib/admin/tours";
import { toggleTourPublishAction } from "@/actions/adminTours";

interface TourListClientProps {
  tours: AdminTourListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  categories: { id: string; name: string }[];
  currentStatus: string;
  currentSearch: string;
  currentCategory: string;
}

export default function TourListClient({
  tours,
  totalCount,
  currentPage,
  totalPages,
  categories,
  currentStatus,
  currentSearch,
  currentCategory,
}: TourListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const applyFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === "all") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    // Reset to page 1 on filter/search change
    if (!updates.page) {
      params.delete("page");
    }
    router.push(`/admin/tours?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchVal });
  };

  const handleTogglePublish = async (tourId: string, currentLive: boolean) => {
    setTogglingId(tourId);
    try {
      const res = await toggleTourPublishAction(tourId, !currentLive);
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
      {/* Header with Title and Create CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Tours Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Create, edit, and control publishing status for production tour packages ({totalCount} total)
          </p>
        </div>

        <Link
          href="/admin/tours/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create New Tour
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800 self-start md:self-auto">
          {[
            { label: "All Tours", val: "all" },
            { label: "Live Only", val: "live" },
            { label: "Drafts", val: "draft" },
          ].map((tab) => {
            const active = currentStatus === tab.val || (!currentStatus && tab.val === "all");
            return (
              <button
                key={tab.val}
                type="button"
                onClick={() => applyFilters({ status: tab.val })}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={currentCategory || "all"}
              onChange={(e) => applyFilters({ categoryId: e.target.value === "all" ? null : e.target.value })}
              className="w-full sm:w-auto rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Search className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search title, slug..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </form>
        </div>
      </div>

      {/* Table List */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-sm">
        {tours.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-400">
            No tours found matching the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Tour Details</th>
                  <th className="px-5 py-3.5">Category & Styles</th>
                  <th className="px-5 py-3.5">Price (INR)</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {tours.map((tour) => {
                  const isToggling = togglingId === tour.id;
                  return (
                    <tr key={tour.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Title & Slug */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white text-sm flex items-center gap-2">
                          {tour.title}
                          {tour.badge && (
                            <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                              {tour.badge}
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-xs text-slate-400 mt-0.5">
                          /{tour.slug} • {tour.duration} • Max {tour.maxPersons} Pax
                        </div>
                      </td>

                      {/* Category & Styles */}
                      <td className="px-5 py-4">
                        <div className="text-xs text-slate-200 font-medium">{tour.categoryName}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tour.travelStyles.length > 0 ? (
                            tour.travelStyles.map((ts) => (
                              <span
                                key={ts.id}
                                className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 border border-slate-700"
                              >
                                {ts.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-slate-500">No styles linked</span>
                          )}
                        </div>
                      </td>

                      {/* Pricing */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-mono font-semibold text-white">
                          ₹{tour.price.toLocaleString("en-IN")}
                        </div>
                        {tour.originalPrice && (
                          <div className="font-mono text-[11px] text-slate-500 line-through">
                            ₹{tour.originalPrice.toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>

                      {/* Publishing Status Toggle */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleTogglePublish(tour.id, tour.isLive)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer disabled:opacity-50 ${
                            tour.isLive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700"
                          }`}
                          title={`Click to ${tour.isLive ? "unpublish" : "publish"}`}
                        >
                          {isToggling ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : tour.isLive ? (
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{tour.isLive ? "Live" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {tour.isLive && (
                            <Link
                              href={`/tours/${tour.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="View Public Page"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/tours/${tour.id}`}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="text-xs text-slate-400">
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalCount} tours)
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => applyFilters({ page: String(currentPage - 1) })}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => applyFilters({ page: String(currentPage + 1) })}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
