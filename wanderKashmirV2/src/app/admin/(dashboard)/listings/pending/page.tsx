import { getAdminListingsList, getAdminListingsStats } from "@/lib/admin/listings";
import ListingListClient from "@/components/admin/listings/ListingListClient";

export const revalidate = 0;

export default async function AdminPendingListingsPage({
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
  const type = (params.type?.toUpperCase() || "ALL") as
    | "ALL"
    | "HOTEL"
    | "RESORT"
    | "HOMESTAY"
    | "HOUSEBOAT";

  const [listingsResult, stats] = await Promise.all([
    getAdminListingsList({
      search,
      propertyType: type,
      status: "PENDING",
      page,
      limit: 20,
    }),
    getAdminListingsStats(),
  ]);

  return (
    <ListingListClient
      listings={listingsResult.listings}
      totalCount={listingsResult.totalCount}
      currentPage={listingsResult.page}
      totalPages={listingsResult.totalPages}
      currentType={type}
      currentStatus="PENDING"
      currentSearch={search}
      stats={stats}
      moduleTitle="08. Listing Approvals"
      moduleSubtitle="Review new stay and property listing submissions awaiting admin verification before catalog publication."
      fixedStatusTab="PENDING"
    />
  );
}
