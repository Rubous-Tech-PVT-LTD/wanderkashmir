import {
  getAdminVehiclesList,
  getAdminVehicleStats,
  getAdminRateCardsList,
} from "@/lib/admin/taxis";
import TaxisListClient from "@/components/admin/taxis/TaxisListClient";

export const revalidate = 0;

export default async function AdminTaxisPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    type?: string;
    status?: string;
    page?: string;
    tab?: string;
    rcPage?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10) || 1;
  const rcPage = parseInt(params.rcPage || "1", 10) || 1;
  const search = params.search || "";
  const type = params.type || "ALL";
  const status = (params.status?.toUpperCase() || "ALL") as
    | "ALL"
    | "PENDING"
    | "APPROVED"
    | "LIVE"
    | "SUSPENDED"
    | "REJECTED";
  const tab = params.tab === "rate_cards" ? "rate_cards" : "vehicles";

  const [vehiclesResult, stats, rateCardsResult] = await Promise.all([
    getAdminVehiclesList({
      search,
      type,
      status,
      page,
      limit: 15,
    }),
    getAdminVehicleStats(),
    getAdminRateCardsList({
      page: rcPage,
      limit: 30,
    }),
  ]);

  return (
    <TaxisListClient
      vehicles={vehiclesResult.vehicles}
      totalCount={vehiclesResult.totalCount}
      currentPage={vehiclesResult.page}
      totalPages={vehiclesResult.totalPages}
      stats={stats}
      currentSearch={search}
      currentStatus={status}
      currentType={type}
      activeTab={tab}
      rateCards={rateCardsResult.rateCards}
      rateCardsTotalCount={rateCardsResult.totalCount}
      rateCardsPage={rateCardsResult.page}
      rateCardsTotalPages={rateCardsResult.totalPages}
    />
  );
}
