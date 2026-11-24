import {
  getAdminDestinationById,
  getAllAvailablePlaces,
  getAllAvailableProperties,
} from "@/lib/admin/destinations";
import DestinationForm from "@/components/admin/destinations/DestinationForm";
import { AdminNotFoundCard } from "@/components/admin/ui";

export const revalidate = 0;

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [destination, availablePlaces, availableProperties] = await Promise.all([
    getAdminDestinationById(id),
    getAllAvailablePlaces(),
    getAllAvailableProperties(),
  ]);

  if (!destination) {
    return (
      <AdminNotFoundCard
        title="Destination not found"
        description={`No destination record exists for ID "${id}".`}
        backHref="/admin/destinations"
        backLabel="Back to Destinations"
      />
    );
  }

  const initialData = {
    id: destination.id,
    slug: destination.slug,
    title: destination.title,
    h1Heading: destination.h1Heading,
    description: destination.description,
    imageUrl: destination.imageUrl,
    content: destination.content,
    workflowState: destination.workflowState,
    seoStrategy: destination.seoStrategy,
    faqs: destination.faqs,
    places: destination.places.map((dp) => ({
      id: dp.id,
      displayOrder: dp.displayOrder,
      place: {
        id: dp.place.id,
        name: dp.place.name,
        slug: dp.place.slug,
        description: dp.place.description,
        imageUrl: dp.place.imageUrl,
        status: dp.place.status,
      },
    })),
  };

  return (
    <DestinationForm
      initialData={initialData}
      availablePlaces={availablePlaces}
      availableProperties={availableProperties}
      isEdit={true}
    />
  );
}
