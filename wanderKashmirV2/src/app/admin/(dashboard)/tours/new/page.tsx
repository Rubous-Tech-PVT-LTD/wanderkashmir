import { getAdminTourFormOptions } from "@/lib/admin/tours";
import TourForm from "@/components/admin/tours/TourForm";

export const revalidate = 0;

export default async function NewTourPage() {
  const formOptions = await getAdminTourFormOptions();

  return (
    <TourForm
      categories={formOptions.categories}
      travelStyles={formOptions.travelStyles}
      isEdit={false}
    />
  );
}
