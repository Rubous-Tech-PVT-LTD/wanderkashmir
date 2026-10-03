"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lightbulb,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart2,
  AlertTriangle,
  CheckCircle2,
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Filter,
} from "lucide-react";
import {
  AdminSeoOpportunityListItem,
  AdminSeoOpportunityStats,
} from "@/lib/admin/seoOpportunities";
import { refreshOpportunitiesAction } from "@/actions/adminSeo";

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

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const applyFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    // Ensure we preserve the tab="opportunities" param
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
    router.push(`/admin/seo?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchVal });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setStatusMessage(null);
    try {
      const res = await refreshOpportunitiesAction();
      if (res.success && res.data) {
        setStatusMessage(res.data.message);
        router.refresh();
      } else {
        alert(res.error || "Failed to reload opportunities.");
      }
    } catch {
      alert("Network error refreshing opportunities.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subtab Header / Notification */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
            <Lightbulb className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-slate-500 mt-1">Discovered topics</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.discovered}</div>
          <div className="text-xs text-slate-500 mt-1">Ready for action</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Manual Review</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {stats.byType.MANUAL_REVIEW}
          </div>
          <div className="text-xs text-slate-500 mt-1">Cannibalization check</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Optimize</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">{stats.byType.OPTIMIZE}</div>
          <div className="text-xs text-slate-500 mt-1">Existing pages</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-400">{stats.resolved}</div>
          <div className="text-xs text-slate-500 mt-1">Historical baseline</div>
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
            {(
              [
                { label: "All Opportunities", val: "ALL" },
                { label: `Active (${stats.discovered})`, val: "DISCOVERED" },
                { label: `Resolved (${stats.resolved})`, val: "RESOLVED" },
              ] as const
            ).map((tab) => {
              const active = currentStatus === tab.val;
              return (
                <button
                  key={tab.val}
                  type="button"
                  onClick={() => applyFilters({ status: tab.val })}
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

          <div className="flex items-center gap-2.5 flex-wrap flex-1 max-w-2xl justify-end">
            {/* Action / Type Filter */}
            <select
              value={currentType}
              onChange={(e) => applyFilters({ type: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">All Actions</option>
              <option value="OPTIMIZE">OPTIMIZE</option>
              <option value="MANUAL_REVIEW">MANUAL REVIEW</option>
              <option value="MONITOR">MONITOR</option>
              <option value="CREATE">CREATE</option>
              <option value="IGNORE">IGNORE</option>
            </select>

            {/* Sorting */}
            <select
              value={currentSort}
              onChange={(e) => applyFilters({ sort: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
            >
              <option value="score_desc">Highest Score</option>
              <option value="score_asc">Lowest Score</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search topic, reason, URL..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-14 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
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

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs transition shadow-sm disabled:opacity-50"
              title="Reload / Sync opportunities"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Refreshing..." : "Reload"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {opportunities.length === 0 ? (
          <div className="p-12 text-center">
            <Lightbulb className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-medium text-slate-300">
              No SEO opportunities found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your search query, action filter, or status selection.
            </p>
            {(currentSearch || currentStatus !== "ALL" || currentType !== "ALL") && (
              <button
                onClick={() => {
                  setSearchVal("");
                  router.push("/admin/seo?tab=opportunities");
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
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Topic / Query</th>
                  <th className="py-3 px-4 text-center">Intent</th>
                  <th className="py-3 px-4 text-right">Imp.</th>
                  <th className="py-3 px-4 text-right">Pos.</th>
                  <th className="py-3 px-4">Target Content</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {opportunities.map((op) => {
                  const isExpanded = expandedId === op.id;
                  const isResolved = op.status === "RESOLVED";

                  return (
                    <React.Fragment key={op.id}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : op.id)}
                        className={`hover:bg-slate-800/30 transition-colors cursor-pointer ${
                          isExpanded ? "bg-slate-800/20" : ""
                        }`}
                      >
                        {/* Action Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                              isResolved
                                ? "bg-slate-800 text-slate-400 border-slate-700"
                                : op.type === "CREATE"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : op.type === "OPTIMIZE"
                                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                                : op.type === "MANUAL_REVIEW"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : op.type === "MONITOR"
                                ? "bg-slate-800 text-slate-300 border-slate-700"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                          >
                            {op.type}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="py-3.5 px-4 font-bold text-white">
                          <span
                            className={
                              op.opportunityScore >= 70
                                ? "text-emerald-400"
                                : op.opportunityScore >= 40
                                ? "text-amber-400"
                                : "text-slate-400"
                            }
                          >
                            {op.opportunityScore}
                          </span>
                        </td>

                        {/* Topic / Query */}
                        <td className="py-3.5 px-4">
                          <div className="min-w-0 max-w-sm">
                            <span className="font-medium text-white block text-sm">
                              {op.topic}
                            </span>
                            {op.gscSignals?.feedbackSignal && (
                              <span className="inline-block mt-1 px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                Feedback: {op.gscSignals.feedbackSignal.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Intent */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            {op.intent || "GENERAL"}
                          </span>
                        </td>

                        {/* Impressions */}
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-300">
                          {op.gscSignals?.impressions?.toLocaleString("en-IN") ?? "-"}
                        </td>

                        {/* Position */}
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-300">
                          {op.gscSignals?.position != null
                            ? Number(op.gscSignals.position).toFixed(1)
                            : "-"}
                        </td>

                        {/* Target Content & Safe Landing Page Link */}
                        <td className="py-3.5 px-4">
                          {op.matchedLandingPage ? (
                            <Link
                              href={`/admin/seo/${op.matchedLandingPage.id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-medium max-w-xs truncate"
                              title={`Edit SEO Page: ${op.matchedLandingPage.title}`}
                            >
                              <Compass className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{op.matchedLandingPage.title}</span>
                            </Link>
                          ) : op.existingPageUrl ? (
                            <a
                              href={op.existingPageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 max-w-xs truncate font-mono"
                            >
                              <span className="truncate">{op.existingPageUrl}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-500 italic">None found</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${
                              isResolved
                                ? "bg-slate-800 text-slate-500"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            }`}
                          >
                            {op.status}
                          </span>
                        </td>

                        {/* Details Toggle */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                            aria-label="Toggle details"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Context Details Drawer */}
                      {isExpanded && (
                        <tr className="bg-slate-950/80 border-b border-slate-800">
                          <td colSpan={9} className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Left Column: Reasons & Signals */}
                              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-2.5">
                                <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                                  <span>Opportunity Intelligence Context</span>
                                </h4>
                                <div>
                                  <span className="text-slate-400 font-medium">Reason: </span>
                                  <span className="text-slate-200">{op.reason || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 font-medium">Evidence: </span>
                                  <span className="text-slate-200">{op.evidence || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 font-medium">Business Relevance: </span>
                                  <span className="text-slate-200">{op.businessRelevance || "N/A"}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 font-medium">Cannibalization Risk: </span>
                                  <span
                                    className={
                                      op.cannibalizationRisk === "HIGH"
                                        ? "text-red-400 font-bold"
                                        : "text-slate-200"
                                    }
                                  >
                                    {op.cannibalizationRisk || "N/A"}
                                  </span>
                                </div>
                                {op.cluster && op.cluster.length > 0 && (
                                  <div>
                                    <span className="text-slate-400 font-medium">Cluster Queries: </span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {op.cluster.map((c, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]"
                                        >
                                          {c}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Right Column: Performance & Actions */}
                              <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-2.5">
                                <h4 className="font-semibold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                  <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>Performance & Associated Page</span>
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                    <span className="text-slate-500 block">Impressions</span>
                                    <span className="text-white font-mono font-bold">
                                      {op.gscSignals?.impressions ?? 0}
                                    </span>
                                  </div>
                                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                    <span className="text-slate-500 block">Clicks</span>
                                    <span className="text-white font-mono font-bold">
                                      {op.gscSignals?.clicks ?? 0}
                                    </span>
                                  </div>
                                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                    <span className="text-slate-500 block">CTR</span>
                                    <span className="text-white font-mono font-bold">
                                      {op.gscSignals?.ctr != null
                                        ? `${(Number(op.gscSignals.ctr) * 100).toFixed(1)}%`
                                        : "0.0%"}
                                    </span>
                                  </div>
                                  <div className="bg-slate-950 p-2 rounded border border-slate-800">
                                    <span className="text-slate-500 block">Average Position</span>
                                    <span className="text-white font-mono font-bold">
                                      {op.gscSignals?.position != null
                                        ? Number(op.gscSignals.position).toFixed(1)
                                        : "N/A"}
                                    </span>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                                  <div>
                                    <span className="text-slate-400 block text-[11px]">
                                      Target Page:
                                    </span>
                                    {op.matchedLandingPage ? (
                                      <Link
                                        href={`/admin/seo/${op.matchedLandingPage.id}`}
                                        className="text-cyan-400 hover:underline font-medium flex items-center gap-1 mt-0.5 text-xs"
                                      >
                                        <span>{op.matchedLandingPage.title}</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </Link>
                                    ) : (
                                      <span className="text-slate-300 font-mono text-xs">
                                        {op.existingPageUrl || "No page currently associated"}
                                      </span>
                                    )}
                                  </div>

                                  {op.matchedLandingPage && (
                                    <Link
                                      href={`/admin/seo/${op.matchedLandingPage.id}`}
                                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition"
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

        {/* Footer & Pagination */}
        <div className="bg-slate-950 px-4 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-xs text-slate-500">
            Showing {opportunities.length} of {totalCount} opportunities &bull; Database-backed intelligence
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-400 mr-2">
                Page {currentPage} of {totalPages}
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
