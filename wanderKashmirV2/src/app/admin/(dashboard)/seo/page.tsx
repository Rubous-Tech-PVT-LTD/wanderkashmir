import Link from "next/link";
import { headers } from "next/headers";
import { FileText, Lightbulb, BarChart3 } from "lucide-react";
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
import { AdminPageHeader } from "@/components/admin/ui";

export const revalidate = 0;

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
  const [params, headerList] = await Promise.all([searchParams, headers()]);
  const base = headerList.get("x-admin-alias") === "wander-admin" ? "/wander-admin" : "/admin";
  const activeTab =
    params.tab === "opportunities"
      ? "opportunities"
      : params.tab === "gsc"
      ? "gsc"
      : "pages";

  const [oppStats, stats, gscConnection] = await Promise.all([
    getAdminSeoOpportunityStats(),
    getAdminSeoStats(),
    getGscConnectionStatus(),
  ]);

  let tabContent: React.ReactNode = null;

  if (activeTab === "gsc") {
    const overview = await getGsc90DayOverview();
    tabContent = <SeoGscOverviewClient overview={overview} connection={gscConnection} />;
  } else if (activeTab === "opportunities") {
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

    tabContent = (
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
    );
  } else {
    const page = parseInt(params.page || "1", 10) || 1;
    const search = params.search || "";
    const workflowState = params.workflowState || "ALL";
    const type = params.type || "ALL";

    const [seoResult, gscOverview] = await Promise.all([
      getAdminSeoList({
        search,
        workflowState,
        type,
        page,
        limit: 20,
      }),
      getGscIntegrationOverview(),
    ]);

    tabContent = (
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
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="SEO Intelligence"
        subtitle="Manage blogs, programmatic landing pages, keyword opportunities, and Search Console performance."
      />

      {/* Single Shared Subtabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        <Link
          href={`${base}/seo`}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "pages"
              ? "border-[var(--season-primary)] text-[var(--season-primary-hover)] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Pages &amp; Content</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 tabular-nums">
            {stats.total}
          </span>
        </Link>

        <Link
          href={`${base}/seo?tab=opportunities`}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "opportunities"
              ? "border-[var(--season-primary)] text-[var(--season-primary-hover)] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Opportunities</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-800 border border-amber-200/80 tabular-nums">
            {oppStats.discovered}
          </span>
        </Link>

        <Link
          href={`${base}/seo?tab=gsc`}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "gsc"
              ? "border-[var(--season-primary)] text-[var(--season-primary-hover)] font-semibold"
              : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>GSC Overview</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              gscConnection.connected ? "bg-[var(--season-primary)]" : "bg-slate-300"
            }`}
            title={gscConnection.connected ? "Connected" : "Disconnected"}
          />
        </Link>
      </div>

      {tabContent}
    </div>
  );
}
