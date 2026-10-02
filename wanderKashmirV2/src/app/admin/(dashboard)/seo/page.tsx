import {
  getAdminSeoList,
  getAdminSeoStats,
  getGscIntegrationOverview,
} from "@/lib/admin/seo";
import SeoListClient from "@/components/admin/seo/SeoListClient";

export const revalidate = 0; // Fresh admin data on every request

export default async function AdminSeoPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    workflowState?: string;
    type?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
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
