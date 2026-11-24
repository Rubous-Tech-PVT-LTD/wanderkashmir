import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  getAdminDestinationsList,
  getAdminDestinationsStats,
} from "@/lib/admin/destinations";
import DestinationListClient from "@/components/admin/destinations/DestinationListClient";

export const revalidate = 0;

export default async function AdminDestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    search?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const [params, headerList] = await Promise.all([searchParams, headers()]);
  const base = headerList.get("x-admin-alias") === "wander-admin" ? "/wander-admin" : "/admin";

  // Backward-compatible redirect for legacy bookmarks to the old duplicate Places tab
  if (params.tab === "places") {
    redirect(`${base}/places`);
  }

  const search = params.search || "";
  const status = (params.status?.toUpperCase() || "ALL") as "ALL" | "PUBLISHED" | "DRAFT";
  const page = parseInt(params.page || "1", 10) || 1;

  const [destinationsData, stats] = await Promise.all([
    getAdminDestinationsList({
      search: search || undefined,
      status,
      page,
      limit: 20,
    }),
    getAdminDestinationsStats(),
  ]);

  return (
    <DestinationListClient
      destinations={destinationsData.destinations}
      totalCount={destinationsData.totalCount}
      currentPage={destinationsData.page}
      totalPages={destinationsData.totalPages}
      currentStatus={status}
      currentSearch={search}
      stats={stats}
    />
  );
}
