"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  RefreshCw,
  Search,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  Gsc90DayOverviewResult,
  GscConnectionStatus,
} from "@/lib/admin/seoGsc";
import { refreshGscOverviewAction } from "@/actions/adminSeo";
import {
  AdminStatStrip,
  AdminToastBanner,
  StatusBadge,
  type FeedbackMessage,
} from "@/components/admin/ui";

interface SeoGscOverviewClientProps {
  overview: Gsc90DayOverviewResult;
  connection: GscConnectionStatus;
}

export default function SeoGscOverviewClient({
  overview,
  connection,
}: SeoGscOverviewClientProps) {
  const router = useRouter();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [querySearch, setQuerySearch] = useState("");
  const [pageSearch, setPageSearch] = useState("");
  const [trendMetric, setTrendMetric] = useState<"clicks" | "impressions">("clicks");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setFeedback(null);

    try {
      const res = await refreshGscOverviewAction();
      if (res.success && res.data) {
        setFeedback({ type: "success", text: res.data.message });
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Failed to refresh Search Console data.",
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Network error communicating with server." });
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredQueries = overview.topQueries.filter((q) =>
    q.query.toLowerCase().includes(querySearch.toLowerCase().trim())
  );

  const filteredPages = overview.topPages.filter(
    (p) =>
      p.cleanPath.toLowerCase().includes(pageSearch.toLowerCase().trim()) ||
      p.pageUrl.toLowerCase().includes(pageSearch.toLowerCase().trim())
  );

  const maxClicks = Math.max(...overview.daily.map((d) => d.clicks), 1);
  const maxImpressions = Math.max(...overview.daily.map((d) => d.impressions), 1);
  const permission = connection.permissionLevel || overview.permissionLevel || "Unknown";

  return (
    <div className="space-y-6">
      <AdminToastBanner message={feedback} onDismiss={() => setFeedback(null)} />

      {/* Connection Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-md p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-md bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-slate-900">Google Search Console</h2>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80">
                {overview.siteUrl}
              </span>
              <StatusBadge
                status={overview.connected ? "ACTIVE" : "PENDING"}
                label={overview.connected ? "Connected" : overview.status}
              />
            </div>
            <div className="flex items-center gap-2.5 text-[11px] text-slate-500 flex-wrap">
              <span>
                Permission: <strong className="text-slate-700">{permission}</strong>
              </span>
              {connection.authenticatedEmail && (
                <span>
                  · Account: <span className="font-mono text-slate-700">{connection.authenticatedEmail}</span>
                </span>
              )}
              {overview.startDate && overview.endDate && (
                <span className="inline-flex items-center gap-1">
                  · <Calendar className="w-3 h-3" /> {overview.startDate} to {overview.endDate} (90d)
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>

      {/* Honest Disconnected / Error State (No fake zeroed KPIs) */}
      {!overview.connected ? (
        <div className="bg-white border border-amber-200 rounded-md p-6 flex items-start gap-3.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-900">
              Search Console Data Unavailable ({overview.status})
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {overview.message ||
                connection.message ||
                "Verify Google Search Console OAuth credentials and property permissions to view live search performance."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <AdminStatStrip
            columns={4}
            items={[
              {
                label: "Total Clicks (90d)",
                value: overview.totals.clicks.toLocaleString("en-IN"),
                tone: "primary",
              },
              {
                label: "Impressions (90d)",
                value: overview.totals.impressions.toLocaleString("en-IN"),
              },
              {
                label: "Average CTR",
                value: `${overview.totals.averageCtr.toFixed(2)}%`,
              },
              {
                label: "Average Position",
                value: overview.totals.averagePosition.toFixed(1),
              },
            ]}
          />

          {/* Daily Trend Bars */}
          {overview.daily.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-md p-5 space-y-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">90-Day Search Trend</h3>
                  <p className="text-xs text-slate-500">
                    Hover any bar to inspect daily clicks and impressions.
                  </p>
                </div>
                <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setTrendMetric("clicks")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                      trendMetric === "clicks"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Clicks
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendMetric("impressions")}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                      trendMetric === "impressions"
                        ? "bg-white text-slate-900 shadow-xs"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Impressions
                  </button>
                </div>
              </div>

              <div className="h-32 flex items-end gap-[2px] pt-2 border-b border-slate-200 overflow-x-auto">
                {overview.daily.map((d) => {
                  const rawVal = trendMetric === "clicks" ? d.clicks : d.impressions;
                  const maxVal = trendMetric === "clicks" ? maxClicks : maxImpressions;
                  const pct = rawVal === 0 ? 0 : Math.max(Math.round((rawVal / maxVal) * 100), 2);
                  return (
                    <div
                      key={d.date}
                      title={`${d.date}: ${d.clicks} clicks · ${d.impressions} impressions`}
                      className="flex-1 min-w-[4px] h-full flex items-end"
                    >
                      <div
                        style={{ height: `${pct}%` }}
                        className="w-full rounded-t-xs bg-[var(--season-primary)]/80 hover:bg-[var(--season-primary)] transition-colors"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Queries & Top Pages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Queries */}
            <div className="bg-white border border-slate-200/90 rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Top Queries ({filteredQueries.length})
                </h3>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={querySearch}
                    onChange={(e) => setQuerySearch(e.target.value)}
                    placeholder="Filter queries..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[var(--season-primary)]"
                  />
                </div>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-medium uppercase text-slate-500 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-4">Query</th>
                      <th className="py-2 px-3 text-right">Clicks</th>
                      <th className="py-2 px-3 text-right">Impr.</th>
                      <th className="py-2 px-3 text-right">Pos.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredQueries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          No matching queries
                        </td>
                      </tr>
                    ) : (
                      filteredQueries.slice(0, 50).map((q) => (
                        <tr key={q.query} className="hover:bg-slate-50">
                          <td className="py-2 px-4 text-slate-900 font-medium truncate max-w-[200px]">
                            {q.query}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-[var(--season-primary)] font-medium">
                            {q.clicks}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-600">
                            {q.impressions}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-500">
                            {q.position.toFixed(1)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Pages */}
            <div className="bg-white border border-slate-200/90 rounded-md overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  Top Pages ({filteredPages.length})
                </h3>
                <div className="relative w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={pageSearch}
                    onChange={(e) => setPageSearch(e.target.value)}
                    placeholder="Filter paths..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[var(--season-primary)]"
                  />
                </div>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-medium uppercase text-slate-500 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-4">Path</th>
                      <th className="py-2 px-3 text-right">Clicks</th>
                      <th className="py-2 px-3 text-right">CTR</th>
                      <th className="py-2 px-3 text-right">Pos.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPages.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          No matching pages
                        </td>
                      </tr>
                    ) : (
                      filteredPages.slice(0, 50).map((p) => (
                        <tr key={p.pageUrl} className="hover:bg-slate-50">
                          <td className="py-2 px-4 font-mono text-[11px] text-slate-700 truncate max-w-[200px]" title={p.pageUrl}>
                            {p.cleanPath}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-[var(--season-primary)] font-medium">
                            {p.clicks}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-600">
                            {p.ctr.toFixed(1)}%
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-500">
                            {p.position.toFixed(1)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
