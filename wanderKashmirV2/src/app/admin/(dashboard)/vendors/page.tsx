import { getAdminVendorsList, getAdminVendorsStats } from "@/lib/admin/vendors";
import VendorListClient from "@/components/admin/vendors/VendorListClient";

export const revalidate = 0;

export const metadata = {
  title: "Vendor Management | WanderKashmir Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminVendorsPageProps {
  searchParams?: Promise<{
    search?: string;
    type?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminVendorsPage({ searchParams }: AdminVendorsPageProps) {
  const params = searchParams ? await searchParams : {};
  const page = parseInt(params.page || "1", 10) || 1;
  const search = params.search || "";
  const type = params.type?.toUpperCase() || "ALL";
  const status = params.status?.toUpperCase() || "ALL";

  const [vendorsResult, stats] = await Promise.all([
    getAdminVendorsList({
      search,
      type,
      status,
      page,
      limit: 20,
    }),
    getAdminVendorsStats(),
  ]);

  return (
    <VendorListClient
      vendors={vendorsResult.vendors}
      totalCount={vendorsResult.totalCount}
      currentPage={vendorsResult.page}
      totalPages={vendorsResult.totalPages}
      currentType={type}
      currentStatus={status}
      currentSearch={search}
      stats={stats}
      baseRoute="/admin/vendors"
    />
  );
}
