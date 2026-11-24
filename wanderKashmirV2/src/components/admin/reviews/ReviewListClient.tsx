"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Star,
  ExternalLink,
  Pencil,
  Building,
  Compass,
  MessageSquare,
  User,
  Car,
} from "lucide-react";
import { AdminReviewListItem, AdminReviewsStats } from "@/lib/admin/reviews";
import {
  AdminPageHeader,
  AdminStatStrip,
  AdminFilterBar,
  AdminEmptyState,
  AdminPagination,
  useAdminBasePath,
} from "@/components/admin/ui";

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
  const basePath = useAdminBasePath();

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
    const qs = params.toString();
    router.push(qs ? `${basePath}/reviews?${qs}` : `${basePath}/reviews`);
  };

  const hasFilters = Boolean(
    currentSearch || currentEntityType !== "ALL" || currentRating !== "ALL"
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reviews & Testimonials"
        subtitle="Verified customer ratings and feedback across stays, tours, and transport."
        actions={
          <a
            href="https://maps.google.com/?cid=13210438173678079031"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span>Google Reviews</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </a>
        }
      />

      <AdminStatStrip
        columns={5}
        items={[
          { label: "Total Reviews", value: stats.total },
          {
            label: "Average Rating",
            value: stats.total > 0 ? `${stats.averageRating} / 5` : "—",
            tone: "amber",
          },
          { label: "Stays", value: stats.propertyReviewsCount, tone: "blue" },
          { label: "Tours", value: stats.tourReviewsCount },
          { label: "5-Star Reviews", value: stats.fiveStarCount, tone: "primary" },
        ]}
      />

      <AdminFilterBar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        onSearchSubmit={() => applyFilters({ search: searchVal.trim() })}
        searchPlaceholder="Search reviewer, comment, property, or tour..."
        tabs={[
          { key: "ALL", label: "All Reviews" },
          { key: "PROPERTY", label: "Stays & Hotels" },
          { key: "TOUR", label: "Tour Packages" },
          { key: "OTHER", label: "Other / Direct" },
        ]}
        activeTab={currentEntityType}
        onTabChange={(val) => applyFilters({ entityType: val })}
        hasActiveFilters={hasFilters}
        onReset={() => {
          setSearchVal("");
          router.push(`${basePath}/reviews`);
        }}
        filters={
          <select
            value={currentRating}
            onChange={(e) => applyFilters({ rating: e.target.value })}
            aria-label="Filter by star rating"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-[var(--season-primary)] focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        }
      />

      <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-xs">
        {reviews.length === 0 ? (
          <AdminEmptyState
            icon={<MessageSquare className="h-5 w-5" />}
            title="No reviews found"
            description="No customer reviews match the current filter selection."
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchVal("");
                    router.push(`${basePath}/reviews`);
                  }}
                  className="rounded-md border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Reset Filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Reviewer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Comment</th>
                  <th className="py-3 px-4">Associated Item</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((rev) => {
                  const initial = rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : "U";
                  return (
                    <tr key={rev.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="relative h-8 w-8 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600">
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
                            <div className="font-medium text-slate-900 truncate">
                              {rev.user?.name || "Anonymous Traveler"}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {rev.user?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < rev.rating
                                  ? "text-amber-500 fill-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                          <span className="ml-1.5 font-semibold text-slate-700 tabular-nums">
                            {rev.rating}/5
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="max-w-md text-slate-700 line-clamp-2">
                          {rev.comment ? (
                            `“${rev.comment}”`
                          ) : (
                            <span className="text-slate-400 italic">No written comment</span>
                          )}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 max-w-[200px]">
                          {rev.entityType === "PROPERTY" ? (
                            <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          ) : rev.entityType === "TOUR" ? (
                            <Compass className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          ) : rev.entityType === "VEHICLE" ? (
                            <Car className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          ) : (
                            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="text-slate-700 truncate">{rev.entityName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap tabular-nums">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {rev.entityLink && (
                            <Link
                              href={rev.entityLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                              title="View public page"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`${basePath}/reviews/${rev.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                          >
                            <Pencil className="h-3 w-3" />
                            <span>Edit</span>
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

        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          itemLabel="reviews"
          onPageChange={(page) => applyFilters({ page: String(page) })}
        />
      </div>
    </div>
  );
}
