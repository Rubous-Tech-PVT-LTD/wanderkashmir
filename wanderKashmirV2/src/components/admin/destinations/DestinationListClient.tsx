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
} from "lucide-react";
import {
  AdminDestinationListItem,
  AdminDestinationsStats,
} from "@/lib/admin/destinations";
import { toggleDestinationPublishAction } from "@/actions/adminDestinations";
import {
  AdminPageHeader,
  AdminStatStrip,
  AdminFilterBar,
  AdminToastBanner,
  AdminPagination,
  AdminEmptyState,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface DestinationListClientProps {
  destinations: AdminDestinationListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentStatus: string;
  currentSearch: string;
  stats: AdminDestinationsStats;
}

export default function DestinationListClient({
  destinations,
  totalCount,
  currentPage,
  totalPages,
  currentStatus,
  currentSearch,
  stats,
}: DestinationListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { adminHref } = useAdminBasePath();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

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
    router.push(qs ? `${adminHref("/admin/destinations")}?${qs}` : adminHref("/admin/destinations"));
  };

  const handleTogglePublish = async (dest: AdminDestinationListItem) => {
    const isPublished = dest.workflowState === "PUBLISHED";
    setTogglingId(dest.id);
    setFeedback(null);
    try {
      const res = await toggleDestinationPublishAction(dest.id, !isPublished);
      if (res.success) {
        setFeedback({
          type: "success",
          text: `"${dest.title.split("|")[0].trim()}" is now ${!isPublished ? "Published" : "Draft"}.`,
        });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Failed to update publication status.",
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Error communicating with server." });
    } finally {
      setTogglingId(null);
    }
  };

  const hasFilters = Boolean(currentSearch) || currentStatus !== "ALL";

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Destinations"
        subtitle="Manage Kashmir destination travel guides, editorial sections, photo galleries, and linked attractions."
        actions={
          <>
            <Link
              href={adminHref("/admin/places")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Landmark className="w-3.5 h-3.5 text-slate-500" />
              <span>Manage Places ({stats.activePlaces})</span>
            </Link>
            <Link
              href={adminHref("/admin/destinations/new")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Destination</span>
            </Link>
          </>
        }
      />

      <AdminStatStrip
        columns={4}
        items={[
          {
            label: "Published Hubs",
            value: stats.publishedDestinations,
            helper: "Live on /destinations",
            tone: "primary",
            active: currentStatus === "PUBLISHED",
            onClick: () => applyFilters({ status: currentStatus === "PUBLISHED" ? "ALL" : "PUBLISHED" }),
          },
          {
            label: "Draft Hubs",
            value: stats.draftDestinations,
            helper: "Hidden from public",
            tone: stats.draftDestinations > 0 ? "amber" : "default",
            active: currentStatus === "DRAFT",
            onClick: () => applyFilters({ status: currentStatus === "DRAFT" ? "ALL" : "DRAFT" }),
          },
          {
            label: "Active Places",
            value: stats.activePlaces,
            helper: "Managed in Places CMS",
            href: adminHref("/admin/places"),
          },
          {
            label: "Linked Attractions",
            value: stats.totalLinkedPlaces,
            helper: "Destination-to-place links",
          },
        ]}
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      <AdminFilterBar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        onSearchSubmit={() => applyFilters({ search: searchVal.trim() })}
        searchPlaceholder="Search destinations by title or slug..."
        tabs={[
          { key: "ALL", label: "All", count: stats.publishedDestinations + stats.draftDestinations },
          { key: "PUBLISHED", label: "Published", count: stats.publishedDestinations },
          { key: "DRAFT", label: "Draft", count: stats.draftDestinations },
        ]}
        activeTab={currentStatus}
        onTabChange={(status) => applyFilters({ status })}
        hasActiveFilters={hasFilters}
        onReset={() => {
          setSearchVal("");
          router.push(adminHref("/admin/destinations"));
        }}
      />

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {destinations.length === 0 ? (
          <AdminEmptyState
            icon={<MapPin className="w-5 h-5" />}
            title="No destinations found"
            description={
              hasFilters
                ? "No destinations match your active filters."
                : "Create your first destination travel guide."
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchVal("");
                    router.push(adminHref("/admin/destinations"));
                  }}
                  className="px-3.5 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Reset Filters
                </button>
              ) : (
                <Link
                  href={adminHref("/admin/destinations/new")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Destination</span>
                </Link>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Destination</th>
                  <th className="py-2.5 px-4">Slug</th>
                  <th className="py-2.5 px-4 text-center">Linked Places</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4">Updated</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {destinations.map((dest) => {
                  const isPublished = dest.workflowState === "PUBLISHED";
                  const displayName = dest.title.split("|")[0].trim();

                  return (
                    <tr key={dest.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-9 rounded-md bg-slate-100 relative overflow-hidden shrink-0 border border-slate-200">
                            {dest.imageUrl ? (
                              <Image
                                src={dest.imageUrl}
                                alt={displayName}
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
                              href={adminHref(`/admin/destinations/${dest.id}`)}
                              className="font-medium text-slate-900 hover:text-[var(--season-primary)] text-[13px] block truncate max-w-xs transition-colors"
                            >
                              {displayName}
                            </Link>
                            {dest.description && (
                              <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                                {dest.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          /destinations/{dest.slug}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium tabular-nums">
                          {dest.placesCount}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(dest)}
                          disabled={togglingId === dest.id}
                          className="cursor-pointer disabled:opacity-50"
                          title={isPublished ? "Click to unpublish" : "Click to publish"}
                        >
                          {togglingId === dest.id ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-500 border border-slate-200">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Updating</span>
                            </span>
                          ) : (
                            <StatusBadge status={dest.workflowState} />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap tabular-nums">
                        {new Date(dest.updatedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={adminHref(`/admin/destinations/${dest.id}`)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-[var(--season-primary)] hover:bg-[var(--season-primary-light)] transition-colors"
                            title="Edit Destination"
                            aria-label={`Edit ${displayName}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {isPublished && (
                            <Link
                              href={`/destinations/${dest.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors"
                              title="View Live Page"
                              aria-label={`View live page for ${displayName}`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
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

        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          itemLabel="destinations"
          onPageChange={(page) => applyFilters({ page: String(page) })}
        />
      </div>
    </div>
  );
}
