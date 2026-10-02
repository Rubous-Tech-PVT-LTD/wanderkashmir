import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getAdminDestinationById, getAllAvailablePlaces } from "@/lib/admin/destinations";
import DestinationForm from "@/components/admin/destinations/DestinationForm";

export const revalidate = 0;

export default async function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [destination, availablePlaces] = await Promise.all([
    getAdminDestinationById(id),
    getAllAvailablePlaces(),
  ]);

  if (!destination) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Destination Not Found</h1>
        <p className="text-sm text-slate-400">
          The requested destination (ID: {id}) does not exist in the database.
        </p>
        <div>
          <Link
            href="/admin/destinations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Destinations List
          </Link>
        </div>
      </div>
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
      isEdit={true}
    />
  );
}
