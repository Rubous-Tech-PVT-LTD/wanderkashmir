"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Plus,
  ExternalLink,
  Pencil,
  Loader2,
  Sparkles,
  Compass,
  MapPin,
  Clock,
  Trash2,
} from "lucide-react";
import { AdminExperienceListItem, AdminExperiencesStats } from "@/lib/admin/experiences";
import { toggleExperienceStatusAction, deleteExperienceAction } from "@/actions/adminExperiences";
import {
  AdminPageHeader,
  AdminStatStrip,
  AdminFilterBar,
  AdminToastBanner,
  ConfirmActionDialog,
  AdminEmptyState,
  AdminPagination,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface ExperienceListClientProps {
  experiences: AdminExperienceListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentStatus: string;
  currentSearch: string;
  stats: AdminExperiencesStats;
}

export default function ExperienceListClient({
  experiences,
  totalCount,
  currentPage,
  totalPages,
  currentStatus,
  currentSearch,
  stats,
}: ExperienceListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = useAdminBasePath();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminExperienceListItem | null>(null);
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
    router.push(qs ? `${basePath}/experiences?${qs}` : `${basePath}/experiences`);
  };

  const handleToggleStatus = async (exp: AdminExperienceListItem) => {
    setTogglingId(exp.id);
    setFeedback(null);
    try {
      const nextStatus = exp.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      const res = await toggleExperienceStatusAction(exp.id, nextStatus);
      if (res.success) {
        setFeedback({
          type: "success",
          text: `"${exp.title}" is now ${nextStatus === "ACTIVE" ? "Active" : "Inactive"}.`,
        });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to update experience status." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error communicating with server." });
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteExperienceAction(deleteTarget.id);
    if (res.success) {
      setFeedback({ type: "success", text: `Deleted experience "${deleteTarget.title}".` });
      setDeleteTarget(null);
      router.refresh();
    } else {
      throw new Error(res.error || "Failed to delete experience.");
    }
  };

  const hasFilters = Boolean(currentSearch || currentStatus !== "ALL");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Experiences & Activities"
        subtitle="Manage curated Kashmir experiences, pricing, and tour package associations."
        actions={
          <Link
            href={`${basePath}/experiences/new`}
            className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Experience</span>
          </Link>
        }
      />

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      <AdminStatStrip
        columns={4}
        items={[
          { label: "Total Experiences", value: stats.total },
          { label: "Active", value: stats.active, tone: "primary" },
          { label: "Inactive", value: stats.inactive, tone: "amber" },
          { label: "Tour Links", value: stats.totalTourLinks, tone: "blue" },
        ]}
      />

      <AdminFilterBar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        onSearchSubmit={() => applyFilters({ search: searchVal.trim() })}
        searchPlaceholder="Search by title, slug, or destination..."
        tabs={[
          { key: "ALL", label: "All", count: stats.total },
          { key: "ACTIVE", label: "Active", count: stats.active },
          { key: "INACTIVE", label: "Inactive", count: stats.inactive },
        ]}
        activeTab={currentStatus}
        onTabChange={(status) => applyFilters({ status })}
        hasActiveFilters={hasFilters}
        onReset={() => {
          setSearchVal("");
          router.push(`${basePath}/experiences`);
        }}
      />

      <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-xs">
        {experiences.length === 0 ? (
          <AdminEmptyState
            icon={<Sparkles className="h-5 w-5" />}
            title="No experiences found"
            description="Adjust your search or create a new curated experience."
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchVal("");
                    router.push(`${basePath}/experiences`);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
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
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Duration & Pricing</th>
                  <th className="py-3 px-4">Tour Links</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {experiences.map((exp) => {
                  const isActive = exp.status === "ACTIVE";
                  const isToggling = togglingId === exp.id;

                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-12 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            {exp.images?.[0] ? (
                              <Image
                                src={exp.images[0]}
                                alt={exp.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400">
                                <Sparkles className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <Link
                              href={`${basePath}/experiences/${exp.id}`}
                              className="font-semibold text-slate-900 hover:text-[var(--season-primary)] truncate block transition-colors"
                            >
                              {exp.title}
                            </Link>
                            <div className="font-mono text-[11px] text-slate-500 truncate">
                              /{exp.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{exp.destination}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {exp.duration && (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>{exp.duration}</span>
                            </div>
                          )}
                          <div className="font-semibold text-slate-900 tabular-nums">
                            {exp.basePrice !== null && exp.basePrice !== undefined
                              ? `₹${exp.basePrice.toLocaleString("en-IN")}`
                              : "On request"}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          <Compass className="h-3 w-3 text-slate-400" />
                          <span>
                            {exp.toursCount} {exp.toursCount === 1 ? "tour" : "tours"}
                          </span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(exp)}
                          disabled={isToggling}
                          className="inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title={`Click to ${isActive ? "deactivate" : "activate"}`}
                        >
                          {isToggling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                          ) : (
                            <StatusBadge status={isActive ? "ACTIVE" : "INACTIVE"} />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {isActive && (
                            <Link
                              href={`/experiences/${exp.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                              title="View public page"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`${basePath}/experiences/${exp.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <Pencil className="h-3 w-3" />
                            <span>Edit</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              if (exp.toursCount > 0) {
                                setFeedback({
                                  type: "warning",
                                  text: `Cannot delete "${exp.title}" while linked to ${exp.toursCount} tour(s). Unlink it from tours or set it Inactive.`,
                                });
                                return;
                              }
                              setDeleteTarget(exp);
                            }}
                            disabled={exp.toursCount > 0}
                            className={`rounded-lg p-1.5 transition-colors ${
                              exp.toursCount > 0
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                            }`}
                            title={
                              exp.toursCount > 0
                                ? `Linked to ${exp.toursCount} tour(s)`
                                : "Delete experience"
                            }
                            aria-label={`Delete ${exp.title}`}
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
          itemLabel="experiences"
          onPageChange={(page) => applyFilters({ page: String(page) })}
        />
      </div>

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Experience"
        description={
          deleteTarget
            ? `Permanently delete "${deleteTarget.title}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Experience"
        tone="danger"
      />
    </div>
  );
}
