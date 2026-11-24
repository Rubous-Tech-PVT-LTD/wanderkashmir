"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  ExternalLink,
  Edit,
  Loader2,
  MapPin,
  Landmark,
  Star,
  Eye,
  Trash2,
} from "lucide-react";
import { AdminPlaceItem, AvailableDestinationOption } from "@/lib/admin/places";
import { togglePlaceStatusAction, deletePlaceAction } from "@/actions/adminPlaces";
import {
  AdminPageHeader,
  AdminStatStrip,
  AdminFilterBar,
  AdminToastBanner,
  AdminPagination,
  AdminEmptyState,
  ConfirmActionDialog,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

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
  const { adminHref } = useAdminBasePath();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPlaceItem | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const applyFilters = (updates: Record<string, string | null>) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || val === "ALL") {
        current.delete(key);
      } else {
        current.set(key, val);
      }
    });
    if (!updates.page) {
      current.delete("page");
    }
    const qs = current.toString();
    router.push(qs ? `${adminHref("/admin/places")}?${qs}` : adminHref("/admin/places"));
  };

  const handleToggleStatus = async (place: AdminPlaceItem) => {
    try {
      setTogglingId(place.id);
      const newStatus = place.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const result = await togglePlaceStatusAction(place.id, newStatus);
      if (result.success) {
        setFeedback({
          text: `"${place.name}" is now ${newStatus === "ACTIVE" ? "Published (Active)" : "Draft (Inactive)"}.`,
          type: "success",
        });
        router.refresh();
      } else {
        setFeedback({ text: result.error || "Failed to update status.", type: "error" });
      }
    } catch {
      setFeedback({ text: "An unexpected error occurred while updating status.", type: "error" });
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deletePlaceAction(deleteTarget.id);
    if (!result.success) {
      throw new Error(result.error || "Failed to delete place.");
    }
    setFeedback({ text: `"${deleteTarget.name}" has been permanently deleted.`, type: "success" });
    router.refresh();
  };

  const hasFilters =
    Boolean(currentSearch) || currentStatus !== "ALL" || currentDestinationId !== "ALL";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Places"
        subtitle="Manage sightseeing attractions, Bento photo galleries, visitor guidelines, and SEO metadata."
        actions={
          <>
            <Link
              href="/places"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Public Directory</span>
            </Link>
            <Link
              href={adminHref("/admin/places/new")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Place</span>
            </Link>
          </>
        }
      />

      <AdminStatStrip
        columns={4}
        items={[
          {
            label: "Total Places",
            value: stats.total,
            helper: "All registered attractions",
            active: currentStatus === "ALL",
            onClick: () => applyFilters({ status: "ALL" }),
          },
          {
            label: "Published",
            value: stats.active,
            helper: "Live on public pages",
            tone: "primary",
            active: currentStatus === "ACTIVE",
            onClick: () => applyFilters({ status: "ACTIVE" }),
          },
          {
            label: "Draft / Inactive",
            value: stats.inactive,
            helper: "Hidden from public",
            tone: stats.inactive > 0 ? "amber" : "default",
            active: currentStatus === "INACTIVE",
            onClick: () => applyFilters({ status: "INACTIVE" }),
          },
          {
            label: "Featured",
            value: stats.featured,
            helper: "Prioritized on /places",
          },
        ]}
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      <AdminFilterBar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        onSearchSubmit={() => applyFilters({ search: searchVal.trim() })}
        searchPlaceholder="Search by place name, slug, or destination..."
        hasActiveFilters={hasFilters}
        onReset={() => {
          setSearchVal("");
          router.push(adminHref("/admin/places"));
        }}
        filters={
          <>
            <select
              value={currentDestinationId}
              onChange={(e) => applyFilters({ destinationId: e.target.value })}
              aria-label="Filter by destination"
              className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 cursor-pointer"
            >
              <option value="ALL">All Destinations</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>

            <select
              value={currentStatus}
              onChange={(e) => applyFilters({ status: e.target.value })}
              aria-label="Filter by status"
              className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[var(--season-primary)] focus:ring-1 focus:ring-[var(--season-primary)]/20 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Published (Active)</option>
              <option value="INACTIVE">Draft (Inactive)</option>
            </select>
          </>
        }
      />

      {/* Places Table */}
      <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
        {places.length === 0 ? (
          <AdminEmptyState
            icon={<Landmark className="w-5 h-5" />}
            title="No places found"
            description={
              hasFilters
                ? "No places match your active search or filters."
                : "Create your first attraction page to populate the public Places directory."
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchVal("");
                    router.push(adminHref("/admin/places"));
                  }}
                  className="px-3.5 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Reset Filters
                </button>
              ) : (
                <Link
                  href={adminHref("/admin/places/new")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Place</span>
                </Link>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Place</th>
                  <th className="py-2.5 px-4">Slug</th>
                  <th className="py-2.5 px-4">Linked Destinations</th>
                  <th className="py-2.5 px-4 text-center">Featured</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {places.map((place) => {
                  const primaryDest = place.destinationPlaces[0]?.destination;
                  const publicUrl = primaryDest
                    ? `/destinations/${primaryDest.slug}/${place.slug}`
                    : `/places`;

                  return (
                    <tr key={place.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-9 rounded-md bg-slate-100 relative overflow-hidden shrink-0 border border-slate-200">
                            {place.imageUrl ? (
                              <Image
                                src={place.imageUrl}
                                alt={place.name}
                                fill
                                className="object-cover"
                                sizes="44px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <MapPin className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={adminHref(`/admin/places/${place.id}/edit`)}
                              className="font-medium text-slate-900 hover:text-[var(--season-primary)] text-[13px] block truncate transition-colors"
                            >
                              {place.name}
                            </Link>
                            <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                              {place.description || "No description"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          /{place.slug}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        {place.destinationPlaces.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {place.destinationPlaces.map((dp) => (
                              <span
                                key={dp.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80"
                              >
                                <MapPin className="w-2.5 h-2.5 text-[var(--season-primary)]" />
                                {dp.destination.title}
                              </span>
                            ))}
                          </div>
                        ) : place.destination ? (
                          <span className="text-slate-500 text-[11px]">{place.destination}</span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Unlinked</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {place.isFeatured ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>Featured</span>
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(place)}
                          disabled={togglingId === place.id}
                          className="cursor-pointer disabled:opacity-50"
                          title={`Click to ${place.status === "ACTIVE" ? "set as Draft" : "Publish"}`}
                        >
                          {togglingId === place.id ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-500 border border-slate-200">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Updating</span>
                            </span>
                          ) : (
                            <StatusBadge
                              status={place.status === "ACTIVE" ? "PUBLISHED" : "DRAFT"}
                            />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={adminHref(`/admin/places/${place.id}/preview`)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Preview"
                            aria-label={`Preview ${place.name}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            href={adminHref(`/admin/places/${place.id}/edit`)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-[var(--season-primary)] hover:bg-[var(--season-primary-light)] transition-colors"
                            title="Edit"
                            aria-label={`Edit ${place.name}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {place.status === "ACTIVE" && (
                            <Link
                              href={publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors"
                              title="View Live Page"
                              aria-label={`View live page for ${place.name}`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(place)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Place"
                            aria-label={`Delete ${place.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
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
          itemLabel="places"
          onPageChange={(page) => applyFilters({ page: String(page) })}
        />
      </div>

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name || ""}"?`}
        description="This permanently removes the place record and its destination associations. This action cannot be undone."
        confirmLabel="Delete Place"
        tone="danger"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
