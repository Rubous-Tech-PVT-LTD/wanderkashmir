"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Globe,
  ExternalLink,
  Edit,
  Loader2,
  BarChart3,
} from "lucide-react";
import type {
  AdminSeoListItem,
  AdminSeoStats,
  GscOverviewMetrics,
} from "@/lib/admin/seo";
import { toggleSeoPublishStatusAction } from "@/actions/adminSeo";
import {
  AdminStatStrip,
  AdminFilterBar,
  AdminToastBanner,
  AdminPagination,
  AdminEmptyState,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface SeoListClientProps {
  pages: AdminSeoListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentWorkflowState: string;
  currentType: string;
  currentSearch: string;
  availableTypes: string[];
  stats: AdminSeoStats;
  gscOverview: GscOverviewMetrics;
}

function resolvePublicSeoUrl(type: string, slug: string): string | null {
  if (type === "DESTINATION") return `/destinations/${slug}`;
  if (type === "BLOG") return `/blog/${slug}`;
  return null;
}

export default function SeoListClient({
  pages,
  totalCount,
  currentPage,
  totalPages,
  currentWorkflowState,
  currentType,
  currentSearch,
  availableTypes,
  stats,
  gscOverview,
}: SeoListClientProps) {
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
    router.push(qs ? `${adminHref("/admin/seo")}?${qs}` : adminHref("/admin/seo"));
  };

  const handleTogglePublish = async (page: AdminSeoListItem) => {
    const isPublished = page.workflowState === "PUBLISHED";
    setTogglingId(page.id);
    setFeedback(null);
    try {
      const res = await toggleSeoPublishStatusAction(
        page.id,
        isPublished ? "DRAFT" : "PUBLISHED"
      );
      if (res.success) {
        setFeedback({
          type: "success",
          text: `"${page.title}" is now ${!isPublished ? "Published" : "Draft"}.`,
        });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Failed to update publication state.",
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error communicating with server." });
    } finally {
      setTogglingId(null);
    }
  };

  const hasFilters =
    Boolean(currentSearch) || currentWorkflowState !== "ALL" || currentType !== "ALL";

  return (
    <div className="space-y-5">
      <AdminStatStrip
        columns={4}
        items={[
          {
            label: "Total Pages",
            value: stats.total,
            helper: "Blogs & landing pages",
          },
          {
            label: "Published",
            value: stats.published,
            helper: "Live & indexed",
            tone: "primary",
          },
          {
            label: "Drafts",
            value: stats.draft,
            helper: "Not publicly visible",
            tone: stats.draft > 0 ? "amber" : "default",
          },
          {
            label: "With Strategy",
            value: stats.withStrategy,
            helper: `${stats.withResearch} researched`,
          },
        ]}
      />

      {/* Compact GSC Status Strip */}
      <div className="bg-white border border-slate-200/90 rounded-md px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-900">Google Search Console</span>
              <StatusBadge
                status={gscOverview.connected ? "ACTIVE" : "INACTIVE"}
                label={gscOverview.connected ? "Connected" : "Not Connected"}
              />
            </div>
            {gscOverview.message && (
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{gscOverview.message}</p>
            )}
          </div>
        </div>
        <Link
          href={`${adminHref("/admin/seo")}?tab=gsc`}
          className="text-xs font-medium text-[var(--season-primary)] hover:text-[var(--season-primary-hover)] shrink-0"
        >
          Open GSC Overview →
        </Link>
      </div>

      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      <AdminFilterBar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        onSearchSubmit={() => applyFilters({ search: searchVal.trim() })}
        searchPlaceholder="Search by title, slug, or heading..."
        tabs={[
          { key: "ALL", label: "All States" },
          { key: "PUBLISHED", label: "Published" },
          { key: "DRAFT", label: "Draft" },
          { key: "GENERATED", label: "Generated" },
          { key: "VALIDATED", label: "Validated" },
          { key: "STRATEGISED", label: "Strategised" },
          { key: "RESEARCHED", label: "Researched" },
          { key: "REJECTED", label: "Rejected" },
        ]}
        activeTab={currentWorkflowState}
        onTabChange={(workflowState) => applyFilters({ workflowState })}
        hasActiveFilters={hasFilters}
        onReset={() => {
          setSearchVal("");
          router.push(adminHref("/admin/seo"));
        }}
        filters={
          availableTypes.length > 0 ? (
            <select
              value={currentType}
              onChange={(e) => applyFilters({ type: e.target.value })}
              aria-label="Filter by page type"
              className="bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[var(--season-primary)] cursor-pointer"
            >
              <option value="ALL">All Types</option>
              {availableTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          ) : undefined
        }
      />

      {/* Pages Table */}
      <div className="bg-white border border-slate-200/90 rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {pages.length === 0 ? (
          <AdminEmptyState
            icon={<Globe className="w-5 h-5" />}
            title="No SEO pages found"
            description={
              hasFilters
                ? "No pages match your current filter or search query."
                : "No SEO landing pages or blogs found in the database."
            }
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchVal("");
                    router.push(adminHref("/admin/seo"));
                  }}
                  className="px-3.5 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                >
                  Reset Filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4">Title &amp; Path</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Intelligence</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4">Updated</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pages.map((p) => {
                  const isPublished = p.workflowState === "PUBLISHED";
                  const publicUrl = resolvePublicSeoUrl(p.type, p.slug);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="min-w-0 max-w-md">
                          <Link
                            href={adminHref(`/admin/seo/${p.id}`)}
                            className="font-medium text-slate-900 hover:text-[var(--season-primary)] text-[13px] truncate block"
                          >
                            {p.title}
                          </Link>
                          <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                            {publicUrl || `/${p.slug}`}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
                          {p.type}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {p.hasResearch && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-800 border border-sky-200/80">
                              Research
                            </span>
                          )}
                          {p.hasStrategy && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--season-primary-light)] text-[var(--season-primary-hover)] border border-[var(--season-primary)]/25">
                              Strategy
                            </span>
                          )}
                          {p.hasValidation && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              Validated
                            </span>
                          )}
                          {!p.hasResearch && !p.hasStrategy && !p.hasValidation && (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(p)}
                          disabled={togglingId === p.id}
                          className="cursor-pointer disabled:opacity-50"
                          title={isPublished ? "Click to set as Draft" : "Click to Publish"}
                        >
                          {togglingId === p.id ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-500 border border-slate-200">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Updating</span>
                            </span>
                          ) : (
                            <StatusBadge status={p.workflowState} />
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap tabular-nums">
                        {new Date(p.updatedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={adminHref(`/admin/seo/${p.id}`)}
                            className="p-1.5 rounded-md text-slate-500 hover:text-[var(--season-primary)] hover:bg-[var(--season-primary-light)] transition-colors"
                            title="Edit SEO Page"
                            aria-label={`Edit ${p.title}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {isPublished && publicUrl && (
                            <Link
                              href={publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors"
                              title="View Live Page"
                              aria-label={`View live page for ${p.title}`}
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
          itemLabel="pages"
          onPageChange={(page) => applyFilters({ page: String(page) })}
        />
      </div>
    </div>
  );
}
