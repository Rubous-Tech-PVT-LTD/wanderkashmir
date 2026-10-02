import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import {
  getAdminTravelStyleById,
  getAllToursForStyleSelect,
} from "@/lib/admin/travelStyles";
import TravelStyleForm from "@/components/admin/travelStyles/TravelStyleForm";

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
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Travel Style Not Found</h1>
        <p className="text-sm text-slate-400">
          The requested travel style category (ID: {id}) does not exist in the production database.
        </p>
        <div>
          <Link
            href="/admin/travel-styles"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Travel Styles List
          </Link>
        </div>
      </div>
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
