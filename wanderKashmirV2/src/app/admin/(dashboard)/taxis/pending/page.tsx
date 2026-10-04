import {
  getAdminVehiclesList,
  getAdminVehicleStats,
  getAdminRateCardsList,
} from "@/lib/admin/taxis";
import TaxisListClient from "@/components/admin/taxis/TaxisListClient";

export const revalidate = 0;

export default async function AdminPendingTaxisPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    type?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10) || 1;
  const search = params.search || "";
  const type = params.type || "ALL";

  const [vehiclesResult, stats, rateCardsResult] = await Promise.all([
    getAdminVehiclesList({
      search,
      type,
      status: "PENDING",
      page,
      limit: 15,
    }),
    getAdminVehicleStats(),
    getAdminRateCardsList({ limit: 10 }),
  ]);

  return (
    <TaxisListClient
      vehicles={vehiclesResult.vehicles}
      totalCount={vehiclesResult.totalCount}
      currentPage={vehiclesResult.page}
      totalPages={vehiclesResult.totalPages}
      stats={stats}
      currentSearch={search}
      currentStatus="PENDING"
      currentType={type}
      activeTab="vehicles"
      rateCards={rateCardsResult.rateCards}
      rateCardsTotalCount={rateCardsResult.totalCount}
      rateCardsPage={rateCardsResult.page}
      rateCardsTotalPages={rateCardsResult.totalPages}
      fixedStatusTab="PENDING"
    />
  );
}
