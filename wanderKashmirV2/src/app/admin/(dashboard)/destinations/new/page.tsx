import {
  getAllAvailablePlaces,
  getAllAvailableProperties,
} from "@/lib/admin/destinations";
import DestinationForm from "@/components/admin/destinations/DestinationForm";

export const revalidate = 0;

export default async function NewDestinationPage() {
  const [availablePlaces, availableProperties] = await Promise.all([
    getAllAvailablePlaces(),
    getAllAvailableProperties(),
  ]);

  return (
    <DestinationForm
      availablePlaces={availablePlaces}
      availableProperties={availableProperties}
      isEdit={false}
    />
  );
}
