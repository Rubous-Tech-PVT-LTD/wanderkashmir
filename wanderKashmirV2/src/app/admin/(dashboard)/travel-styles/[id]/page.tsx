import {
  getAdminTravelStyleById,
  getAllToursForStyleSelect,
} from "@/lib/admin/travelStyles";
import TravelStyleForm from "@/components/admin/travelStyles/TravelStyleForm";
import { AdminNotFoundCard } from "@/components/admin/ui";

export const revalidate = 0;

export default async function EditTravelStylePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [style, tours] = await Promise.all([
    getAdminTravelStyleById(id),
    getAllToursForStyleSelect(),
  ]);

  if (!style) {
    return (
      <AdminNotFoundCard
        title="Travel style not found"
        description={`The requested travel style (ID: ${id}) could not be found.`}
        backHref="/admin/travel-styles"
        backLabel="Return to Travel Styles"
      />
    );
  }

  const initialData = {
    id: style.id,
    name: style.name,
    slug: style.slug,
    description: style.description,
    imageUrl: style.imageUrl,
    imageAlt: style.imageAlt,
    isActive: style.isActive,
    displayOrder: style.displayOrder,
    assignedTourIds: style.tours.map((t) => t.tour.id),
  };

  return (
    <TravelStyleForm
      initialData={initialData}
      availableTours={tours}
      isEdit={true}
    />
  );
}
