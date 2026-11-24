import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getAdminTourCategoriesList } from "@/lib/admin/tourCategories";
import TourCategoriesClient from "@/components/admin/tourCategories/TourCategoriesClient";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Tour Categories | WanderKashmir Admin",
  description: "Manage tour packages categories and classifications.",
};

interface TourCategoriesPageProps {
  searchParams: Promise<{
    search?: string;
  }>;
}

export default async function TourCategoriesPage({
  searchParams,
}: TourCategoriesPageProps) {
  const params = await searchParams;
  const currentSearch = params.search || "";

  const [categories, unassignedCount] = await Promise.all([
    getAdminTourCategoriesList({
      search: currentSearch,
    }),
    prisma.tour.count({ where: { categoryId: null } }),
  ]);

  return (
    <TourCategoriesClient
      categories={categories}
      currentSearch={currentSearch}
      unassignedCount={unassignedCount}
    />
  );
}
