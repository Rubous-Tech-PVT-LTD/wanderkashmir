import { getAdminPropertiesList, getAdminPropertiesStats } from "@/lib/admin/properties";
import PropertyListClient from "@/components/admin/properties/PropertyListClient";

export const revalidate = 0; // Fresh admin data on every request

export default async function AdminPropertiesPage({
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
  const type = (params.type?.toUpperCase() || "ALL") as "ALL" | "HOTEL" | "RESORT" | "HOMESTAY" | "HOUSEBOAT";
  const status = (params.status?.toUpperCase() || "ALL") as "ALL" | "APPROVED" | "PENDING" | "SUSPENDED" | "REJECTED";

  const [propertiesResult, stats] = await Promise.all([
    getAdminPropertiesList({
      search,
      propertyType: type,
      status,
      page,
      limit: 20,
    }),
    getAdminPropertiesStats(),
  ]);

  return (
    <PropertyListClient
      properties={propertiesResult.properties}
      totalCount={propertiesResult.totalCount}
      currentPage={propertiesResult.page}
      totalPages={propertiesResult.totalPages}
      currentType={type}
      currentStatus={status}
      currentSearch={search}
      stats={stats}
    />
  );
}
