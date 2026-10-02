import { getAdminToursList, getAdminTourFormOptions } from "@/lib/admin/tours";
import TourListClient from "@/components/admin/tours/TourListClient";

export const revalidate = 0; // Fresh admin data on every request

export default async function AdminToursPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    status?: "all" | "live" | "draft";
    categoryId?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10) || 1;
  const search = params.search || "";
  const status = params.status || "all";
  const categoryId = params.categoryId || "";

  const [toursData, formOptions] = await Promise.all([
    getAdminToursList({
      search,
      status,
      categoryId,
      page,
      limit: 20,
    }),
    getAdminTourFormOptions(),
  ]);

  return (
    <TourListClient
      tours={toursData.tours}
      totalCount={toursData.totalCount}
      currentPage={toursData.page}
      totalPages={toursData.totalPages}
      categories={formOptions.categories}
      currentStatus={status}
      currentSearch={search}
      currentCategory={categoryId}
    />
  );
}
