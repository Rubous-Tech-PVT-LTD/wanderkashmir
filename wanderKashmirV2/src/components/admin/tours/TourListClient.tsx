"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
  Compass,
} from "lucide-react";
import { AdminTourListItem } from "@/lib/admin/tours";
import { toggleTourPublishAction, deleteTourAction } from "@/actions/adminTours";
import {
  AdminPageHeader,
  AdminFilterBar,
  AdminToastBanner,
  ConfirmActionDialog,
  AdminEmptyState,
  AdminPagination,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

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
  const basePath = useAdminBasePath();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const applyFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === "all") {
        params.delete(key);
      } else {
        params.set(key, val);
      }
    });
    if (!updates.page) {
      params.delete("page");
    }
    const qs = params.toString();
    router.push(qs ? `${basePath}/tours?${qs}` : `${basePath}/tours`);
  };

  const handleTogglePublish = async (tour: AdminTourListItem) => {
    setTogglingId(tour.id);
    setFeedback(null);
    try {
      const res = await toggleTourPublishAction(tour.id, !tour.isLive);
      if (res.success) {
        setFeedback({
          type: "success",
          text: `"${tour.title}" is now ${!tour.isLive ? "Live" : "Draft"}.`,
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to update tour status." });
      }
    } catch {
      setFeedback({ type: "error", text: "Error communicating with server." });
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteTourAction(deleteTarget.id);
    if (res.success) {
      setFeedback({ type: "success", text: `Deleted tour "${deleteTarget.title}".` });
      setDeleteTarget(null);
      router.refresh();
    } else {
      throw new Error(res.error || "Failed to delete tour.");
    }
  };

  const activeStatus = currentStatus || "all";
  const hasFilters = Boolean(currentSearch || activeStatus !== "all" || (currentCategory && currentCategory !== "all"));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tours"
        subtitle={`Create, edit, and publish tour packages (${totalCount} total).`}
        actions={
          <Link
            href={`${basePath}/tours/new`}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Tour</span>
          </Link>
        }
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      <AdminFilterBar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        onSearchSubmit={() => applyFilters({ search: searchVal.trim() })}
        searchPlaceholder="Search tour title or slug..."
        tabs={[
          { key: "all", label: "All Tours" },
          { key: "live", label: "Live" },
          { key: "draft", label: "Drafts" },
        ]}
        activeTab={activeStatus}
        onTabChange={(status) => applyFilters({ status })}
        hasActiveFilters={hasFilters}
        onReset={() => {
          setSearchVal("");
          router.push(`${basePath}/tours`);
        }}
        filters={
          <select
            value={currentCategory || "all"}
            onChange={(e) =>
              applyFilters({ categoryId: e.target.value === "all" ? null : e.target.value })
            }
            aria-label="Filter by tour category"
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        }
      />

      <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-xs">
        {tours.length === 0 ? (
          <AdminEmptyState
            icon={<Compass className="h-5 w-5" />}
            title="No tours found"
            description="No tour packages matched the selected filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Tour</th>
                  <th className="py-3 px-4">Category & Styles</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tours.map((tour) => {
                  const isToggling = togglingId === tour.id;
                  return (
                    <tr key={tour.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`${basePath}/tours/${tour.id}`}
                            className="font-semibold text-slate-900 hover:text-[var(--season-primary)] transition-colors"
                          >
                            {tour.title}
                          </Link>
                          {tour.badge && (
                            <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                              {tour.badge}
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                          /{tour.slug} · {tour.duration} · Max {tour.maxPersons} pax
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{tour.categoryName}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tour.travelStyles.length > 0 ? (
                            tour.travelStyles.map((ts) => (
                              <span
                                key={ts.id}
                                className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600"
                              >
                                {ts.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-slate-400">No styles</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-semibold text-slate-900 tabular-nums">
                          ₹{tour.price.toLocaleString("en-IN")}
                        </div>
                        {tour.originalPrice && (
                          <div className="font-mono text-[11px] text-slate-400 line-through">
                            ₹{tour.originalPrice.toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleTogglePublish(tour)}
                          className="inline-flex items-center cursor-pointer disabled:opacity-50"
                          title={`Click to ${tour.isLive ? "unpublish" : "publish"}`}
                        >
                          {isToggling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                          ) : (
                            <StatusBadge status={tour.isLive ? "LIVE" : "DRAFT"} />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {tour.isLive && (
                            <Link
                              href={`/tours/${tour.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                              title="View public page"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`${basePath}/tours/${tour.id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Pencil className="h-3 w-3" />
                            <span>Edit</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ id: tour.id, title: tour.title })}
                            className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete tour"
                            aria-label={`Delete ${tour.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          itemLabel="tours"
          onPageChange={(page) => applyFilters({ page: String(page) })}
        />
      </div>

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Tour"
        description={
          deleteTarget
            ? `Permanently delete "${deleteTarget.title}"? Tours referenced by customer bookings are protected from deletion.`
            : ""
        }
        confirmLabel="Delete Tour"
        tone="danger"
      />
    </div>
  );
}
