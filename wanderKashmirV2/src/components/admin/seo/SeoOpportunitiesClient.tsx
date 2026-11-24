"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lightbulb,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Compass,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  AdminSeoOpportunityListItem,
  AdminSeoOpportunityStats,
} from "@/lib/admin/seoOpportunities";
import { refreshOpportunitiesAction } from "@/actions/adminSeo";
import {
  AdminStatStrip,
  AdminFilterBar,
  AdminToastBanner,
  AdminEmptyState,
  AdminPagination,
  StatusBadge,
  useAdminBasePath,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface SeoOpportunitiesClientProps {
  opportunities: AdminSeoOpportunityListItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentStatus: string;
  currentType: string;
  currentSort: string;
  currentSearch: string;
  stats: AdminSeoOpportunityStats;
}

function formatCtrPercent(rawCtr: unknown): string {
  if (rawCtr === null || rawCtr === undefined) return "0.0%";
  const num = Number(rawCtr);
  if (Number.isNaN(num)) return "0.0%";
  // Normalize whether stored as 0..1 ratio or 0..100 percentage
  const pct = num <= 1 ? num * 100 : num;
  return `${pct.toFixed(1)}%`;
}

export default function SeoOpportunitiesClient({
  opportunities,
  totalCount,
  currentPage,
  totalPages,
  currentStatus,
  currentType,
  currentSort,
  currentSearch,
  stats,
}: SeoOpportunitiesClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const basePath = useAdminBasePath();

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const applyFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "opportunities");

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
    router.push(`${basePath}/seo?${params.toString()}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setFeedback(null);
    try {
      const res = await refreshOpportunitiesAction();
      if (res.success && res.data) {
        setFeedback({ type: "success", text: res.data.message });
        router.refresh();
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to reload opportunities." });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error refreshing opportunities." });
    } finally {
      setIsRefreshing(false);
    }
  };

  const hasFilters = Boolean(currentSearch || currentStatus !== "ALL" || currentType !== "ALL");

  return (
    <div className="space-y-5">
      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      <AdminStatStrip
        columns={5}
        items={[
          { label: "Total Discovered", value: stats.total },
          { label: "Active", value: stats.discovered, tone: "emerald" },
          { label: "Manual Review", value: stats.byType.MANUAL_REVIEW, tone: "amber" },
          { label: "Optimize", value: stats.byType.OPTIMIZE, tone: "blue" },
          { label: "Resolved", value: stats.resolved },
        ]}
      />

      <AdminFilterBar
        searchValue={searchVal}
        onSearchChange={setSearchVal}
        onSearchSubmit={() => applyFilters({ search: searchVal.trim() })}
        searchPlaceholder="Search topic, reason, or URL..."
        tabs={[
          { key: "ALL", label: "All Opportunities" },
          { key: "DISCOVERED", label: "Active", count: stats.discovered },
          { key: "RESOLVED", label: "Resolved", count: stats.resolved },
        ]}
        activeTab={currentStatus}
        onTabChange={(status) => applyFilters({ status })}
        hasActiveFilters={hasFilters}
        onReset={() => {
          setSearchVal("");
          router.push(`${basePath}/seo?tab=opportunities`);
        }}
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={currentType}
              onChange={(e) => applyFilters({ type: e.target.value })}
              aria-label="Filter by opportunity action"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-[var(--season-primary)] focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="OPTIMIZE">Optimize</option>
              <option value="MANUAL_REVIEW">Manual Review</option>
              <option value="MONITOR">Monitor</option>
              <option value="CREATE">Create</option>
              <option value="IGNORE">Ignore</option>
            </select>

            <select
              value={currentSort}
              onChange={(e) => applyFilters({ sort: e.target.value })}
              aria-label="Sort opportunities"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:border-[var(--season-primary)] focus:outline-hidden cursor-pointer"
            >
              <option value="score_desc">Highest Score</option>
              <option value="score_asc">Lowest Score</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] disabled:opacity-50 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Reloading..." : "Reload"}</span>
            </button>
          </div>
        }
      />

      <div className="rounded-md border border-slate-200/90 bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {opportunities.length === 0 ? (
          <AdminEmptyState
            icon={<Lightbulb className="h-5 w-5" />}
            title="No SEO opportunities found"
            description="Try adjusting your search query, action filter, or status selection."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Topic / Query</th>
                  <th className="py-3 px-4 text-center">Intent</th>
                  <th className="py-3 px-4 text-right">Impr.</th>
                  <th className="py-3 px-4 text-right">Pos.</th>
                  <th className="py-3 px-4">Target Content</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {opportunities.map((op) => {
                  const isExpanded = expandedId === op.id;
                  const isResolved = op.status === "RESOLVED";
                  const actionTone = isResolved
                    ? "slate"
                    : op.type === "CREATE" || op.type === "OPTIMIZE"
                    ? "blue"
                    : op.type === "MANUAL_REVIEW"
                    ? "amber"
                    : op.type === "IGNORE"
                    ? "rose"
                    : "slate";

                  return (
                    <React.Fragment key={op.id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : op.id)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          isExpanded ? "bg-slate-50" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <StatusBadge
                            status={op.type}
                            label={op.type.replace(/_/g, " ")}
                            tone={actionTone}
                            showDot={false}
                          />
                        </td>

                        <td className="py-3.5 px-4 font-bold tabular-nums">
                          <span
                            className={
                              op.opportunityScore >= 70
                                ? "text-emerald-700"
                                : op.opportunityScore >= 40
                                ? "text-amber-700"
                                : "text-slate-500"
                            }
                          >
                            {op.opportunityScore}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="min-w-0 max-w-sm">
                            <span className="font-semibold text-slate-900 block">
                              {op.topic}
                            </span>
                            {op.gscSignals?.feedbackSignal && (
                              <span className="inline-block mt-1 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                                {op.gscSignals.feedbackSignal.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                            {op.intent || "GENERAL"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-slate-700 tabular-nums">
                          {op.gscSignals?.impressions?.toLocaleString("en-IN") ?? "—"}
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono text-slate-700 tabular-nums">
                          {op.gscSignals?.position != null
                            ? Number(op.gscSignals.position).toFixed(1)
                            : "—"}
                        </td>

                        <td className="py-3.5 px-4">
                          {op.matchedLandingPage ? (
                            <Link
                              href={`${basePath}/seo/${op.matchedLandingPage.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 font-medium text-[var(--season-primary)] hover:underline max-w-xs truncate"
                            >
                              <Compass className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{op.matchedLandingPage.title}</span>
                            </Link>
                          ) : op.existingPageUrl ? (
                            <a
                              href={op.existingPageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 font-mono text-slate-500 hover:text-slate-900 max-w-xs truncate"
                            >
                              <span className="truncate">{op.existingPageUrl}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-400 italic">None linked</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <StatusBadge
                            status={isResolved ? "INACTIVE" : "ACTIVE"}
                            label={op.status}
                          />
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                            aria-label="Toggle opportunity details"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          <td colSpan={9} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                                <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                                  <Sparkles className="h-3.5 w-3.5 text-slate-400" />
                                  <span>Opportunity Context</span>
                                </h4>
                                <div>
                                  <span className="font-medium text-slate-500">Reason: </span>
                                  <span className="text-slate-800">{op.reason || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-slate-500">Evidence: </span>
                                  <span className="text-slate-800">{op.evidence || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="font-medium text-slate-500">
                                    Business Relevance:{" "}
                                  </span>
                                  <span className="text-slate-800">
                                    {op.businessRelevance || "N/A"}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium text-slate-500">
                                    Cannibalization Risk:{" "}
                                  </span>
                                  <span
                                    className={
                                      op.cannibalizationRisk === "HIGH"
                                        ? "font-semibold text-rose-700"
                                        : "text-slate-800"
                                    }
                                  >
                                    {op.cannibalizationRisk || "N/A"}
                                  </span>
                                </div>
                                {op.cluster && op.cluster.length > 0 && (
                                  <div>
                                    <span className="font-medium text-slate-500">
                                      Cluster Queries:
                                    </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {op.cluster.map((c, idx) => (
                                        <span
                                          key={idx}
                                          className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] text-slate-700"
                                        >
                                          {c}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
                                <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
                                  <BarChart2 className="h-3.5 w-3.5 text-slate-400" />
                                  <span>Search Signals & Associated Page</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                                    <span className="text-[10px] text-slate-500 block">
                                      Impressions
                                    </span>
                                    <span className="font-mono font-semibold text-slate-900">
                                      {op.gscSignals?.impressions ?? 0}
                                    </span>
                                  </div>
                                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                                    <span className="text-[10px] text-slate-500 block">Clicks</span>
                                    <span className="font-mono font-semibold text-slate-900">
                                      {op.gscSignals?.clicks ?? 0}
                                    </span>
                                  </div>
                                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                                    <span className="text-[10px] text-slate-500 block">CTR</span>
                                    <span className="font-mono font-semibold text-slate-900">
                                      {formatCtrPercent(op.gscSignals?.ctr)}
                                    </span>
                                  </div>
                                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
                                    <span className="text-[10px] text-slate-500 block">
                                      Avg. Position
                                    </span>
                                    <span className="font-mono font-semibold text-slate-900">
                                      {op.gscSignals?.position != null
                                        ? Number(op.gscSignals.position).toFixed(1)
                                        : "N/A"}
                                    </span>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <span className="text-[11px] text-slate-500 block">
                                      Target Page
                                    </span>
                                    {op.matchedLandingPage ? (
                                      <Link
                                        href={`${basePath}/seo/${op.matchedLandingPage.id}`}
                                        className="inline-flex items-center gap-1 font-medium text-[var(--season-primary)] hover:underline mt-0.5 truncate"
                                      >
                                        <span className="truncate">
                                          {op.matchedLandingPage.title}
                                        </span>
                                        <ArrowRight className="h-3 w-3 shrink-0" />
                                      </Link>
                                    ) : (
                                      <span className="font-mono text-slate-600 truncate block">
                                        {op.existingPageUrl || "No page associated"}
                                      </span>
                                    )}
                                  </div>

                                  {op.matchedLandingPage && (
                                    <Link
                                      href={`${basePath}/seo/${op.matchedLandingPage.id}`}
                                      className="rounded-md bg-[var(--season-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] shadow-xs shrink-0"
                                    >
                                      Edit Page
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
          itemLabel="opportunities"
          onPageChange={(page) => applyFilters({ page: String(page) })}
        />
      </div>
    </div>
  );
}
