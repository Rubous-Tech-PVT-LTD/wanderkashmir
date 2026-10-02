"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Search,
  Star,
  ExternalLink,
  Edit,
  Building,
  Compass,
  MessageSquare,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  User,
  Info,
  Car,
  Award,
} from "lucide-react";
import { AdminReviewListItem, AdminReviewsStats } from "@/lib/admin/reviews";

interface ReviewListClientProps {
  reviews: AdminReviewListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentEntityType: string;
  currentRating: string;
  currentSearch: string;
  stats: AdminReviewsStats;
}

export default function ReviewListClient({
  reviews,
  totalCount,
  currentPage,
  totalPages,
  currentEntityType,
  currentRating,
  currentSearch,
  stats,
}: ReviewListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchVal, setSearchVal] = useState(currentSearch);

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
    router.push(`/admin/reviews?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchVal });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
            <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
            <span>Reviews & Testimonials</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Customer feedback, verified stay ratings, and tour reviews from the production database.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Single Production DB Source</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-slate-500 mt-1">Verified reviews in DB</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Average</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {stats.total > 0 ? stats.averageRating : "—"}
          </div>
          <div className="text-xs text-slate-500 mt-1">Calculated from ratings</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Stays</span>
            <Building className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.propertyReviewsCount}</div>
          <div className="text-xs text-slate-500 mt-1">Property feedback</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Tours</span>
            <Compass className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">{stats.tourReviewsCount}</div>
          <div className="text-xs text-slate-500 mt-1">Tour package feedback</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">5 Stars</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.fiveStarCount}</div>
          <div className="text-xs text-slate-500 mt-1">Top-rated submissions</div>
        </div>
      </div>

      {/* Google Reviews Architecture Notice Card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              Google Places Reviews Synchronization
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Google Place ratings on public pages are powered by Google Places API cached per-hour.
              No fake Google review metrics are fabricated or stored into the database.
            </p>
          </div>
        </div>

        <a
          href="https://maps.google.com/?cid=13210438173678079031"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition shrink-0"
        >
          <span>WanderKashmir on Google Maps</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Entity Type Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
            {(
              [
                { label: "All Reviews", val: "ALL" },
                { label: "Stays & Hotels", val: "PROPERTY" },
                { label: "Tour Packages", val: "TOUR" },
                { label: "Other / Direct", val: "OTHER" },
              ] as const
            ).map((tab) => {
              const active = currentEntityType === tab.val;
              return (
                <button
                  key={tab.val}
                  onClick={() => applyFilters({ entityType: tab.val })}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                    active
                      ? "bg-slate-800 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 flex-1 max-w-lg justify-end">
            {/* Rating Filter Dropdown */}
            <select
              value={currentRating}
              onChange={(e) => applyFilters({ rating: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
              <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
              <option value="3">⭐⭐⭐ (3 Stars)</option>
              <option value="2">⭐⭐ (2 Stars)</option>
              <option value="1">⭐ (1 Star)</option>
            </select>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search user, comment, property..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-16 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              {searchVal && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchVal("");
                    applyFilters({ search: null });
                  }}
                  className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
                >
                  ✕
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium"
              >
                Go
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {reviews.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-medium text-slate-300">No reviews found</h3>
            <p className="text-sm text-slate-500 mt-1">
              There are currently no customer review records matching this query.
            </p>
            {(currentSearch || currentEntityType !== "ALL" || currentRating !== "ALL") && (
              <button
                onClick={() => {
                  setSearchVal("");
                  router.push("/admin/reviews");
                }}
                className="mt-4 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:text-white"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Reviewer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Comment</th>
                  <th className="py-3 px-4">Associated Entity</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {reviews.map((rev) => {
                  const initial = rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : "U";

                  return (
                    <tr
                      key={rev.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Reviewer User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-800 shrink-0 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                            {rev.user?.image ? (
                              <Image
                                src={rev.user.image}
                                alt={rev.user.name || "Reviewer"}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            ) : (
                              <span>{initial}</span>
                            )}
                          </div>
                          <div className="min-w-0 max-w-[160px]">
                            <div className="font-medium text-white truncate text-xs">
                              {rev.user?.name || "Anonymous Traveler"}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {rev.user?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-700"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-semibold text-slate-300 ml-1">
                            {rev.rating}/5
                          </span>
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="py-3.5 px-4">
                        <div className="max-w-md">
                          <p className="text-xs text-slate-300 line-clamp-2 italic">
                            {rev.comment ? `“${rev.comment}”` : <span className="text-slate-500 font-sans not-italic">No written comment</span>}
                          </p>
                        </div>
                      </td>

                      {/* Linked Entity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 max-w-[200px]">
                          {rev.entityType === "PROPERTY" ? (
                            <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          ) : rev.entityType === "TOUR" ? (
                            <Compass className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          ) : rev.entityType === "VEHICLE" ? (
                            <Car className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          ) : (
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="text-xs text-slate-300 truncate">
                            {rev.entityName}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {rev.entityLink && (
                            <Link
                              href={rev.entityLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                              title="View Public Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/reviews/${rev.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Details</span>
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

        {/* Safety Note & Pagination Footer */}
        <div className="bg-slate-950 px-4 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Production architecture notice: Review moderation column is not present in the current production Prisma schema. Destructive deletion is not implemented to preserve historical data integrity.
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-400 mr-2">
                Page {currentPage} of {totalPages} ({totalCount} reviews)
              </span>
              <button
                onClick={() => applyFilters({ page: String(currentPage - 1) })}
                disabled={currentPage <= 1}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => applyFilters({ page: String(currentPage + 1) })}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
