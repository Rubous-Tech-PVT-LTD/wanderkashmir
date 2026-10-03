"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Globe,
  ExternalLink,
  Edit,
  Loader2,
  CheckCircle,
  EyeOff,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  Sparkles,
  BarChart3,
  Layers,
  SearchCode,
} from "lucide-react";
import { AdminSeoListItem, AdminSeoStats, GscOverviewMetrics } from "@/lib/admin/seo";
import { toggleSeoPublishStatusAction } from "@/actions/adminSeo";
import { SeoWorkflowState } from "@prisma/client";

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

  const [searchVal, setSearchVal] = useState(currentSearch);
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
    router.push(`/admin/seo?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({ search: searchVal });
  };

  const handleTogglePublish = async (pageId: string, currentState: SeoWorkflowState) => {
    setTogglingId(pageId);
    try {
      const nextState: SeoWorkflowState =
        currentState === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      const res = await toggleSeoPublishStatusAction(pageId, nextState);
      if (res.success) {
        router.refresh();
      } else {
        alert(res.error || "Failed to update workflowState.");
      }
    } catch {
      alert("Network error communicating with server.");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
            <FileText className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-slate-500 mt-1">SEO landing pages</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Published</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.published}</div>
          <div className="text-xs text-slate-500 mt-1">Live in sitemap & index</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Drafts</span>
            <EyeOff className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.draft}</div>
          <div className="text-xs text-slate-500 mt-1">In review or staging</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Validated</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">{stats.validated}</div>
          <div className="text-xs text-slate-500 mt-1">Passed validation check</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Intelligence</span>
            <SearchCode className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.withStrategy}</div>
          <div className="text-xs text-slate-500 mt-1">With strategy payload</div>
        </div>
      </div>

      {/* Google Search Console & Intelligence Status Card */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Google Search Console Integration</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                  gscOverview.connected
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {gscOverview.connected ? "CONFIGURED" : "NOT CONNECTED"}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {gscOverview.message ||
                "Live performance metrics are queried securely server-side. Zero fake impressions or rankings are fabricated."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 text-xs text-slate-400 font-mono">
          <span>Property: sc-domain:wanderkashmir.com</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Workflow State Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
            {(
              [
                { label: "All States", val: "ALL" },
                { label: "Published", val: "PUBLISHED" },
                { label: "Draft", val: "DRAFT" },
                { label: "Validated", val: "VALIDATED" },
                { label: "Strategised", val: "STRATEGISED" },
                { label: "Researched", val: "RESEARCHED" },
              ] as const
            ).map((tab) => {
              const active = currentWorkflowState === tab.val;
              return (
                <button
                  key={tab.val}
                  onClick={() => applyFilters({ workflowState: tab.val })}
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
            {/* Type Filter Dropdown */}
            {availableTypes.length > 0 && (
              <select
                value={currentType}
                onChange={(e) => applyFilters({ type: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Page Types</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search title, slug, h1..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-16 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
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

      {/* SEO Pages Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {pages.length === 0 ? (
          <div className="p-12 text-center">
            <Globe className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-medium text-slate-300">No SEO pages found</h3>
            <p className="text-sm text-slate-500 mt-1">
              Try adjusting your search criteria or workflow filter.
            </p>
            {(currentSearch || currentWorkflowState !== "ALL" || currentType !== "ALL") && (
              <button
                onClick={() => {
                  setSearchVal("");
                  router.push("/admin/seo");
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
                  <th className="py-3 px-4">Page Title & Slug</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Intelligence Pipeline</th>
                  <th className="py-3 px-4">Workflow State</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pages.map((p) => {
                  const isPublished = p.workflowState === "PUBLISHED";
                  const isToggling = togglingId === p.id;
                  const publicUrl =
                    p.type === "DESTINATION"
                      ? `/destinations/${p.slug}`
                      : `/${p.slug}`;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Title & Slug */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-0 max-w-sm">
                          <Link
                            href={`/admin/seo/${p.id}`}
                            className="font-medium text-white hover:text-cyan-400 transition truncate block text-sm"
                          >
                            {p.title}
                          </Link>
                          <div className="text-xs text-slate-500 font-mono truncate mt-0.5">
                            /{p.slug}
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                          <Layers className="w-3 h-3 text-cyan-400" />
                          <span>{p.type}</span>
                        </span>
                      </td>

                      {/* Intelligence Pipeline Badges */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                              p.hasResearch
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-slate-800/50 text-slate-500"
                            }`}
                            title={p.hasResearch ? "Research data attached" : "No research data"}
                          >
                            Res
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                              p.hasStrategy
                                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                                : "bg-slate-800/50 text-slate-500"
                            }`}
                            title={p.hasStrategy ? "Strategy payload present" : "No strategy payload"}
                          >
                            Strat
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                              p.hasValidation
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-slate-800/50 text-slate-500"
                            }`}
                            title={p.hasValidation ? "Validation report available" : "No validation report"}
                          >
                            Val
                          </span>
                        </div>
                      </td>

                      {/* Workflow State & Quick Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(p.id, p.workflowState)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition border ${
                            isPublished
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : p.workflowState === "VALIDATED"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20"
                              : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                          }`}
                          title={`Click to ${isPublished ? "unpublish (set to DRAFT)" : "publish"}`}
                        >
                          {isToggling ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isPublished ? (
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-slate-500" />
                          )}
                          <span>{p.workflowState}</span>
                        </button>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                        {new Date(p.updatedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPublished && p.type === "DESTINATION" && (
                            <Link
                              href={publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                              title="View Public Page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                          <Link
                            href={`/admin/seo/${p.id}?studio=true`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition"
                            title="Open SEO Research & Strategy Studio"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Studio</span>
                          </Link>
                          <Link
                            href={`/admin/seo/${p.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition"
                          >
                            <Edit className="w-3 h-3" />
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

        {/* Safety Note & Pagination Footer */}
        <div className="bg-slate-950 px-4 py-3.5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Production SEO safety: Destructive delete is disabled to protect indexed canonicals. Pages can be set to DRAFT to unpublish.
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-400 mr-2">
                Page {currentPage} of {totalPages} ({totalCount} pages)
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
