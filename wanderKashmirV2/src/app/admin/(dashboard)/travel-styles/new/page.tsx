import { getAllToursForStyleSelect } from "@/lib/admin/travelStyles";
import TravelStyleForm from "@/components/admin/travelStyles/TravelStyleForm";

export const revalidate = 0;

export default async function NewTravelStylePage() {
  const tours = await getAllToursForStyleSelect();

  return <TravelStyleForm availableTours={tours} isEdit={false} />;
}
