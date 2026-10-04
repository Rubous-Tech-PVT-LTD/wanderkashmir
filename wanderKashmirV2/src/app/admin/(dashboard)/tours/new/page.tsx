import { getAdminTourFormOptions } from "@/lib/admin/tours";
import TourForm from "@/components/admin/tours/TourForm";

export const revalidate = 0;

interface NewTourPageProps {
  searchParams?: Promise<{
    categoryId?: string;
  }>;
}

export default async function NewTourPage({ searchParams }: NewTourPageProps) {
  const [formOptions, resolvedParams] = await Promise.all([
    getAdminTourFormOptions(),
    searchParams ? searchParams : Promise.resolve(undefined),
  ]);

  const preselectedCat = resolvedParams?.categoryId
    ? formOptions.categories.find((c) => c.id === resolvedParams.categoryId)
    : undefined;

  const initialData = preselectedCat
    ? ({
        categoryId: preselectedCat.id,
        category: preselectedCat.name,
      } as any)
    : undefined;

  return (
    <TourForm
      categories={formOptions.categories}
      travelStyles={formOptions.travelStyles}
      properties={formOptions.properties}
      vehicles={formOptions.vehicles}
      drivers={formOptions.drivers}
      experiences={formOptions.experiences}
      travelGuides={formOptions.travelGuides}
      initialData={initialData}
      isEdit={false}
    />
  );
}
