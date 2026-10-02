import { getAdminExperiencesList, getAdminExperiencesStats } from "@/lib/admin/experiences";
import ExperienceListClient from "@/components/admin/experiences/ExperienceListClient";

export const revalidate = 0; // Fresh admin data on every request

export default async function AdminExperiencesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10) || 1;
  const search = params.search || "";
  const status = (params.status?.toUpperCase() || "ALL") as "ALL" | "ACTIVE" | "INACTIVE";

  const [experiencesResult, stats] = await Promise.all([
    getAdminExperiencesList({
      search,
      status,
      page,
      limit: 20,
    }),
    getAdminExperiencesStats(),
  ]);

  return (
    <ExperienceListClient
      experiences={experiencesResult.experiences}
      totalCount={experiencesResult.totalCount}
      currentPage={experiencesResult.page}
      totalPages={experiencesResult.totalPages}
      currentStatus={status}
      currentSearch={search}
      stats={stats}
    />
  );
}
