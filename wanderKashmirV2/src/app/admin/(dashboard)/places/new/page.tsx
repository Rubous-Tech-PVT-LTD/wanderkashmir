import { getAvailableDestinations } from "@/lib/admin/places";
import PlaceEditorForm from "@/components/admin/places/PlaceEditorForm";

export const revalidate = 0;

export default async function AdminNewPlacePage() {
  const destinations = await getAvailableDestinations();

  return (
    <div className="py-2">
      <PlaceEditorForm mode="create" destinations={destinations} />
    </div>
  );
}

