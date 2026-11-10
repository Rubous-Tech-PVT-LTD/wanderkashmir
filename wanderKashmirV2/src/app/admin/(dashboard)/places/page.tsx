import { getAdminPlaces, getAvailableDestinations } from "@/lib/admin/places";
import PlacesDashboardClient from "@/components/admin/places/PlacesDashboardClient";

export const revalidate = 0; // Fresh real-time data for CMS operations

export default async function AdminPlacesPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    destinationId?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const destinationId = params.destinationId || "ALL";
  const status = params.status || "ALL";
  const page = parseInt(params.page || "1", 10) || 1;

  const [placesData, destinations] = await Promise.all([
    getAdminPlaces({
      search: search || undefined,
      destinationId: destinationId !== "ALL" ? destinationId : undefined,
      status: status !== "ALL" ? status : undefined,
      page,
      limit: 20,
    }),
    getAvailableDestinations(),
  ]);

  return (
    <PlacesDashboardClient
      places={placesData.places}
      totalCount={placesData.totalCount}
      currentPage={placesData.page}
      totalPages={placesData.totalPages}
      currentSearch={search}
      currentStatus={status}
      currentDestinationId={destinationId}
      destinations={destinations}
      stats={placesData.stats}
    />
  );
}

