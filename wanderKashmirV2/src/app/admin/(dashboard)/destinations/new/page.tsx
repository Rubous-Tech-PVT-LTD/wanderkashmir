import { getAllAvailablePlaces } from "@/lib/admin/destinations";
import DestinationForm from "@/components/admin/destinations/DestinationForm";

export const revalidate = 0;

export default async function NewDestinationPage() {
  const availablePlaces = await getAllAvailablePlaces();

  return <DestinationForm availablePlaces={availablePlaces} isEdit={false} />;
}
