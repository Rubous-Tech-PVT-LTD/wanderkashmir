import { getAdminVendorsList, getAdminVendorsStats } from "@/lib/admin/vendors";
import VendorListClient from "@/components/admin/vendors/VendorListClient";

export const revalidate = 0;

export const metadata = {
  title: "06 Vendor Approvals | WanderKashmir Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminVendorsPendingPageProps {
  searchParams?: Promise<{
    search?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function AdminVendorsPendingPage({ searchParams }: AdminVendorsPendingPageProps) {
  const params = searchParams ? await searchParams : {};
  const page = parseInt(params.page || "1", 10) || 1;
  const search = params.search || "";
  const type = params.type?.toUpperCase() || "ALL";

  const [vendorsResult, stats] = await Promise.all([
    getAdminVendorsList({
      search,
      type,
      status: "PENDING",
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
      currentStatus="PENDING"
      currentSearch={search}
      stats={stats}
      baseRoute="/admin/vendors"
    />
  );
}
