import {
  getAllAvailablePlaces,
  getAllAvailableProperties,
  getAllAvailableTours,
} from "@/lib/admin/destinations";
import DestinationForm from "@/components/admin/destinations/DestinationForm";

export const revalidate = 0;

export default async function NewDestinationPage() {
  const [availablePlaces, availableProperties, availableTours] = await Promise.all([
    getAllAvailablePlaces(),
    getAllAvailableProperties(),
    getAllAvailableTours(),
  ]);

  return (
    <DestinationForm
      availablePlaces={availablePlaces}
      availableProperties={availableProperties}
      availableTours={availableTours}
      isEdit={false}
    />
  );
}
