import { notFound } from "next/navigation";
import { getAdminPlaceById, getAvailableDestinations } from "@/lib/admin/places";
import PlaceEditorForm from "@/components/admin/places/PlaceEditorForm";

export const revalidate = 0;

export default async function AdminEditPlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [place, destinations] = await Promise.all([
    getAdminPlaceById(id),
    getAvailableDestinations(),
  ]);

  if (!place) {
    notFound();
  }

  return (
    <div className="py-2">
      <PlaceEditorForm mode="edit" initialData={place} destinations={destinations} />
    </div>
  );
}

