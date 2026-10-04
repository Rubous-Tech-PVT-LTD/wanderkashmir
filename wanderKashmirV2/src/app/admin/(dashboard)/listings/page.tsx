import { getAdminListingsList, getAdminListingsStats } from "@/lib/admin/listings";
import ListingListClient from "@/components/admin/listings/ListingListClient";

export const revalidate = 0;

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    type?: string;
    status?: string;
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
  const status = (params.status?.toUpperCase() || "ALL") as
    | "ALL"
    | "PENDING"
    | "APPROVED"
    | "LIVE"
    | "SUSPENDED"
    | "REJECTED";

  const [listingsResult, stats] = await Promise.all([
    getAdminListingsList({
      search,
      propertyType: type,
      status,
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
      currentStatus={status}
      currentSearch={search}
      stats={stats}
      moduleTitle="Listing Management"
      moduleSubtitle="Review and manage Kashmiri stays, hotels, resorts, homestays, and houseboats."
    />
  );
}
