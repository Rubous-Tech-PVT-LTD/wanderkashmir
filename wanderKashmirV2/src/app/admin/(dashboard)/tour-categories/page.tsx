import { Metadata } from "next";
import { getAdminTourCategoriesList } from "@/lib/admin/tourCategories";
import TourCategoriesClient from "@/components/admin/tourCategories/TourCategoriesClient";

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

  const categories = await getAdminTourCategoriesList({
    search: currentSearch,
  });

  return (
    <TourCategoriesClient
      categories={categories}
      currentSearch={currentSearch}
    />
  );
}
