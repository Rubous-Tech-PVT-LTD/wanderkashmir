import { getAdminVendorsList, getAdminVendorsStats } from "@/lib/admin/vendors";
import VendorListClient from "@/components/admin/vendors/VendorListClient";

export const revalidate = 0;

export const metadata = {
  title: "16 Rejected Vendors | WanderKashmir Admin",
  robots: {
    index: false,
    follow: false,
  },
};

interface AdminVendorsRejectedPageProps {
  searchParams?: Promise<{
    search?: string;
    type?: string;
    page?: string;
  }>;
}

export default async function AdminVendorsRejectedPage({ searchParams }: AdminVendorsRejectedPageProps) {
  const params = searchParams ? await searchParams : {};
  const page = parseInt(params.page || "1", 10) || 1;
  const search = params.search || "";
  const type = params.type?.toUpperCase() || "ALL";

  const [vendorsResult, stats] = await Promise.all([
    getAdminVendorsList({
      search,
      type,
      status: "REJECTED",
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
      currentStatus="REJECTED"
      currentSearch={search}
      stats={stats}
      baseRoute="/admin/vendors"
    />
  );
}
