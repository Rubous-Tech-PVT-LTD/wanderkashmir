import {
  getAdminDestinationsList,
  getAdminPlacesList,
  getAdminDestinationsStats,
} from "@/lib/admin/destinations";
import DestinationListClient from "@/components/admin/destinations/DestinationListClient";

export const revalidate = 0; // Fresh data on every admin request

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
  const params = await searchParams;
  const tab = (params.tab === "places" ? "places" : "destinations") as "destinations" | "places";
  const search = params.search || "";
  const status = (params.status?.toUpperCase() || "ALL") as any;
  const page = parseInt(params.page || "1", 10) || 1;

  const [destinationsData, placesData, stats] = await Promise.all([
    getAdminDestinationsList({
      search: tab === "destinations" ? search : undefined,
      status: tab === "destinations" ? status : undefined,
      page: tab === "destinations" ? page : 1,
      limit: 20,
    }),
    getAdminPlacesList({
      search: tab === "places" ? search : undefined,
      status: tab === "places" ? status : undefined,
      page: tab === "places" ? page : 1,
      limit: 20,
    }),
    getAdminDestinationsStats(),
  ]);

  return (
    <DestinationListClient
      currentTab={tab}
      destinations={destinationsData.destinations}
      destinationsTotalCount={destinationsData.totalCount}
      destinationsCurrentPage={destinationsData.page}
      destinationsTotalPages={destinationsData.totalPages}
      places={placesData.places}
      placesTotalCount={placesData.totalCount}
      placesCurrentPage={placesData.page}
      placesTotalPages={placesData.totalPages}
      currentStatus={status}
      currentSearch={search}
      stats={stats}
    />
  );
}
