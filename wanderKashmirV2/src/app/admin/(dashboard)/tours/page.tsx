import prisma from "@/lib/prisma";
import { getAdminToursList } from "@/lib/admin/tours";
import TourListClient from "@/components/admin/tours/TourListClient";

export const revalidate = 0;

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

  const [toursData, categories] = await Promise.all([
    getAdminToursList({
      search,
      status,
      categoryId,
      page,
      limit: 20,
    }),
    prisma.tourCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <TourListClient
      tours={toursData.tours}
      totalCount={toursData.totalCount}
      currentPage={toursData.page}
      totalPages={toursData.totalPages}
      categories={categories}
      currentStatus={status}
      currentSearch={search}
      currentCategory={categoryId}
    />
  );
}
