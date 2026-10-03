"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  ExternalLink,
  RefreshCw,
  Search,
  Eye,
  MousePointer,
  Percent,
  Crosshair,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  FileText,
} from "lucide-react";
import {
  Gsc90DayOverviewResult,
  GscConnectionStatus,
} from "@/lib/admin/seoGsc";
import { refreshGscOverviewAction } from "@/actions/adminSeo";

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
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Table search filters
  const [querySearch, setQuerySearch] = useState("");
  const [pageSearch, setPageSearch] = useState("");

  // Trend mode
  const [trendMetric, setTrendMetric] = useState<"clicks" | "impressions">("clicks");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setFeedbackMessage(null);
    setErrorMessage(null);

    try {
      const res = await refreshGscOverviewAction();
      if (res.success && res.data) {
        setFeedbackMessage(res.data.message);
        router.refresh();
      } else {
        setErrorMessage(res.error || "Failed to refresh Search Console data.");
      }
    } catch {
      setErrorMessage("Network error communicating with server.");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter top queries
  const filteredQueries = overview.topQueries.filter((q) =>
    q.query.toLowerCase().includes(querySearch.toLowerCase().trim())
  );

  // Filter top pages
  const filteredPages = overview.topPages.filter(
    (p) =>
      p.cleanPath.toLowerCase().includes(pageSearch.toLowerCase().trim()) ||
      p.pageUrl.toLowerCase().includes(pageSearch.toLowerCase().trim())
  );

  // Daily trend calculations
  const maxClicks = Math.max(...overview.daily.map((d) => d.clicks), 1);
  const maxImpressions = Math.max(...overview.daily.map((d) => d.impressions), 1);

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {feedbackMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Connection & Context Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Google Search Console
                </h2>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {overview.siteUrl}
                </span>
                {overview.connected ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {overview.status}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Permission: <strong className="text-slate-200">{overview.permissionLevel || "siteOwner"}</strong>
                </span>
                {connection.authenticatedEmail && (
                  <span className="text-slate-500">
                    · Account: <span className="text-slate-300 font-mono">{connection.authenticatedEmail}</span>
                  </span>
                )}
                <span className="text-slate-500 flex items-center gap-1">
                  · <Calendar className="w-3 h-3 text-slate-400" />
                  Range: <span className="text-slate-300">{overview.startDate}</span> to{" "}
                  <span className="text-slate-300">{overview.endDate}</span> (Last 90 Days)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Refreshing..." : "Refresh Live Data"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Primary KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Clicks */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Clicks</span>
            <MousePointer className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {overview.totals.clicks.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Google Search referrals (90d)</div>
        </div>

        {/* Total Impressions */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Impressions</span>
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400 tracking-tight">
            {overview.totals.impressions.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Search result appearances (90d)</div>
        </div>

        {/* Average CTR */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Average CTR</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight">
            {overview.totals.averageCtr.toFixed(2)}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Click-through rate aggregate</div>
        </div>

        {/* Average Position */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Position</span>
            <Crosshair className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight">
            {overview.totals.averagePosition.toFixed(1)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Weighted ranking position</div>
        </div>
      </div>

      {/* 90-Day Performance Trend Chart */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>90-Day Daily Performance Trend</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily Google Search Console metrics across all verified queries and pages.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setTrendMetric("clicks")}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                trendMetric === "clicks"
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Clicks
            </button>
            <button
              type="button"
              onClick={() => setTrendMetric("impressions")}
              className={`px-3 py-1 rounded text-xs font-medium transition ${
                trendMetric === "impressions"
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Impressions
            </button>
          </div>
        </div>

        {overview.daily.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No daily search activity recorded for the selected 90-day window.
          </div>
        ) : (
          <div className="space-y-2">
            {/* Visual Bar Graph */}
            <div className="h-32 flex items-end gap-1 pt-6 px-1 bg-slate-950/60 rounded-lg border border-slate-800/80 overflow-x-auto">
              {overview.daily.map((d) => {
                const val = trendMetric === "clicks" ? d.clicks : d.impressions;
                const max = trendMetric === "clicks" ? maxClicks : maxImpressions;
                const heightPercent = Math.max(Math.round((val / max) * 100), 4);

                return (
                  <div
                    key={d.date}
                    className="flex-1 min-w-[5px] flex flex-col items-center group relative h-full justify-end"
                  >
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-sm transition-all ${
                        trendMetric === "clicks"
                          ? "bg-cyan-500 hover:bg-cyan-400 group-hover:bg-cyan-300"
                          : "bg-indigo-500 hover:bg-indigo-400 group-hover:bg-indigo-300"
                      }`}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1.5 hidden group-hover:flex flex-col items-center z-20 pointer-events-none whitespace-nowrap">
                      <div className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[11px] text-white shadow-xl">
                        <span className="text-slate-400 block">{d.date}</span>
                        <span className="font-semibold text-cyan-400">
                          {d.clicks} Clicks
                        </span>{" "}
                        ·{" "}
                        <span className="font-semibold text-indigo-400">
                          {d.impressions} Impr
                        </span>{" "}
                        ·{" "}
                        <span className="text-amber-400 font-mono">
                          pos {d.position}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Date range footer */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
              <span>{overview.daily[0]?.date || overview.startDate}</span>
              <span>
                Peak:{" "}
                <strong className="text-slate-300">
                  {trendMetric === "clicks" ? maxClicks : maxImpressions}{" "}
                  {trendMetric}
                </strong>
              </span>
              <span>
                {overview.daily[overview.daily.length - 1]?.date || overview.endDate}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Two Columns: Top Queries & Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Search Queries Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-orange-400" />
                <span>Top Search Queries (Top 20)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Keywords generating the most clicks and impressions.
              </p>
            </div>

            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={querySearch}
                onChange={(e) => setQuerySearch(e.target.value)}
                placeholder="Filter query..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Search Query</th>
                  <th className="py-2.5 px-3 text-right">Clicks</th>
                  <th className="py-2.5 px-3 text-right">Impr</th>
                  <th className="py-2.5 px-3 text-right">CTR</th>
                  <th className="py-2.5 px-3 text-right">Avg Pos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredQueries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No search queries found.
                    </td>
                  </tr>
                ) : (
                  filteredQueries.map((q, idx) => (
                    <tr
                      key={`${q.query}-${idx}`}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-2 px-3 font-medium text-white max-w-[200px] truncate">
                        {q.query}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-cyan-400">
                        {q.clicks.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">
                        {q.impressions.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-400">
                        {q.ctr.toFixed(1)}%
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-amber-400">
                        {q.position.toFixed(1)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Landing Pages Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Top Performing Pages (Top 20)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target URLs attracting the highest organic traffic.
              </p>
            </div>

            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={pageSearch}
                onChange={(e) => setPageSearch(e.target.value)}
                placeholder="Filter URL..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Landing Page</th>
                  <th className="py-2.5 px-3 text-right">Clicks</th>
                  <th className="py-2.5 px-3 text-right">Impr</th>
                  <th className="py-2.5 px-3 text-right">CTR</th>
                  <th className="py-2.5 px-3 text-right">Avg Pos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No landing pages found.
                    </td>
                  </tr>
                ) : (
                  filteredPages.map((p, idx) => (
                    <tr
                      key={`${p.pageUrl}-${idx}`}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-2 px-3 font-medium max-w-[200px] truncate">
                        <a
                          href={p.pageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 group"
                          title={p.pageUrl}
                        >
                          <span className="truncate">{p.cleanPath}</span>
                          <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
                        </a>
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-cyan-400">
                        {p.clicks.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-300">
                        {p.impressions.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-400">
                        {p.ctr.toFixed(1)}%
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-amber-400">
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
    </div>
  );
}
