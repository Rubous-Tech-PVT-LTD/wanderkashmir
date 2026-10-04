import Link from "next/link";
import { Globe, ShieldCheck, FileText, Lightbulb, BarChart3 } from "lucide-react";
import {
  getAdminSeoList,
  getAdminSeoStats,
  getGscIntegrationOverview,
} from "@/lib/admin/seo";
import {
  getAdminSeoOpportunitiesList,
  getAdminSeoOpportunityStats,
} from "@/lib/admin/seoOpportunities";
import {
  getGsc90DayOverview,
  getGscConnectionStatus,
} from "@/lib/admin/seoGsc";
import SeoListClient from "@/components/admin/seo/SeoListClient";
import SeoOpportunitiesClient from "@/components/admin/seo/SeoOpportunitiesClient";
import SeoGscOverviewClient from "@/components/admin/seo/SeoGscOverviewClient";

export const revalidate = 0; // Fresh admin data on every request

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    workflowState?: string;
    type?: string;
    status?: string;
    sort?: string;
    sortBy?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const isOpportunities = params.tab === "opportunities";
  const isGsc = params.tab === "gsc";

  // Pre-fetch opportunity statistics so the subtab count badge is accurate everywhere
  const oppStats = await getAdminSeoOpportunityStats();

  // Tab: GSC Overview
  if (isGsc) {
    const [overview, connection] = await Promise.all([
      getGsc90DayOverview(),
      getGscConnectionStatus(),
    ]);

    return (
      <div className="space-y-6">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
              <Globe className="w-7 h-7 text-cyan-400" />
              <span>SEO Intelligence & Operations</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Programmatic landing pages, keyword clusters, Search Console signals, and discovery opportunities.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Admin Module #19</span>
          </div>
        </div>

        {/* Subtabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <Link
            href="/admin/seo"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            <span>Pages & Content</span>
          </Link>
          <Link
            href="/admin/seo?tab=opportunities"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 whitespace-nowrap"
          >
            <Lightbulb className="w-4 h-4 text-orange-400" />
            <span>Opportunities</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-semibold">
              {oppStats.discovered}
            </span>
          </Link>
          <Link
            href="/admin/seo?tab=gsc"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm whitespace-nowrap"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>GSC Overview</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </Link>
        </div>

        {/* GSC Overview Tab Content */}
        <SeoGscOverviewClient overview={overview} connection={connection} />
      </div>
    );
  }

  // Tab: Opportunities
  if (isOpportunities) {
    const page = parseInt(params.page || "1", 10) || 1;
    const search = params.search || "";
    const status = params.status || "ALL";
    const type = params.type || "ALL";
    const sort = (params.sort || params.sortBy || "score_desc") as
      | "score_desc"
      | "score_asc"
      | "newest"
      | "oldest";

    const oppsResult = await getAdminSeoOpportunitiesList({
      search,
      status,
      type,
      sort,
      page,
      limit: 20,
    });

    return (
      <div className="space-y-6">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
              <Globe className="w-7 h-7 text-cyan-400" />
              <span>SEO Intelligence & Operations</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Programmatic landing pages, keyword clusters, Search Console signals, and discovery opportunities.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Admin Module #19</span>
          </div>
        </div>

        {/* Subtabs Bar */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          <Link
            href="/admin/seo"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            <span>Pages & Content</span>
          </Link>
          <Link
            href="/admin/seo?tab=opportunities"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm whitespace-nowrap"
          >
            <Lightbulb className="w-4 h-4 text-orange-400" />
            <span>Opportunities</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-semibold">
              {oppStats.discovered}
            </span>
          </Link>
          <Link
            href="/admin/seo?tab=gsc"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 whitespace-nowrap"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>GSC Overview</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5" />
          </Link>
        </div>

        {/* Opportunities Tab Content */}
        <SeoOpportunitiesClient
          opportunities={oppsResult.opportunities}
          totalCount={oppsResult.totalCount}
          currentPage={oppsResult.page}
          totalPages={oppsResult.totalPages}
          currentStatus={status}
          currentType={type}
          currentSort={sort}
          currentSearch={search}
          stats={oppStats}
        />
      </div>
    );
  }

  // Default: Pages & Content subtab
  const page = parseInt(params.page || "1", 10) || 1;
  const search = params.search || "";
  const workflowState = params.workflowState || "ALL";
  const type = params.type || "ALL";

  const [seoResult, stats, gscOverview] = await Promise.all([
    getAdminSeoList({
      search,
      workflowState,
      type,
      page,
      limit: 20,
    }),
    getAdminSeoStats(),
    getGscIntegrationOverview(),
  ]);

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl flex items-center gap-2.5">
            <Globe className="w-7 h-7 text-cyan-400" />
            <span>SEO Intelligence & Operations</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Programmatic landing pages, keyword clusters, Search Console signals, and discovery opportunities.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Admin Module #19</span>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <Link
          href="/admin/seo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm whitespace-nowrap"
        >
          <FileText className="w-4 h-4" />
          <span>Pages & Content</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {stats.total}
          </span>
        </Link>
        <Link
          href="/admin/seo?tab=opportunities"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 whitespace-nowrap"
        >
          <Lightbulb className="w-4 h-4 text-orange-400" />
          <span>Opportunities</span>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-semibold">
            {oppStats.discovered}
          </span>
        </Link>
        <Link
          href="/admin/seo?tab=gsc"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 whitespace-nowrap"
        >
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span>GSC Overview</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5" />
        </Link>
      </div>

      {/* Pages Tab Content */}
      <SeoListClient
        pages={seoResult.pages}
        totalCount={seoResult.totalCount}
        currentPage={seoResult.page}
        totalPages={seoResult.totalPages}
        currentWorkflowState={workflowState}
        currentType={type}
        currentSearch={search}
        availableTypes={seoResult.availableTypes}
        stats={stats}
        gscOverview={gscOverview}
      />
    </div>
  );
}
