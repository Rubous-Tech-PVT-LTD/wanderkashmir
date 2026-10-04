import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getAdminTourById, getAdminTourFormOptions } from "@/lib/admin/tours";
import TourForm from "@/components/admin/tours/TourForm";

export const revalidate = 0;

export default async function EditTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [tour, formOptions] = await Promise.all([
    getAdminTourById(id),
    getAdminTourFormOptions(),
  ]);

  if (!tour) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Tour Not Found</h1>
        <p className="text-sm text-slate-400">
          The requested tour (ID: {id}) does not exist in the production database.
        </p>
        <div>
          <Link
            href="/admin/tours"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Tours List
          </Link>
        </div>
      </div>
    );
  }

  const initialData = {
    id: tour.id,
    title: tour.title,
    slug: tour.slug,
    duration: tour.duration,
    price: tour.price,
    originalPrice: tour.originalPrice,
    category: tour.category,
    categoryId: tour.categoryId,
    maxPersons: tour.maxPersons,
    badge: tour.badge,
    overview: tour.overview,
    destinations: tour.destinations,
    images: tour.images,
    highlights: tour.highlights,
    inclusions: tour.inclusions,
    exclusions: tour.exclusions,
    itinerary: tour.itinerary,
    travelStyleIds: tour.travelStyles.map((ts) => ts.travelStyleId),
    stays: tour.stays.map((s) => ({
      id: s.id,
      destination: s.destination,
      stayType: s.stayType,
      propertyId: s.propertyId,
      nights: s.nights,
      displayOrder: s.displayOrder,
    })),
    transports: tour.transports.map((t) => ({
      id: t.id,
      origin: t.origin,
      destination: t.destination,
      purpose: t.purpose,
      vehicleId: t.vehicleId,
      driverId: t.driverId,
      displayOrder: t.displayOrder,
      status: t.status,
    })),
    experiences: tour.experiences.map((exp) => ({
      id: exp.id,
      experienceId: exp.experienceId,
      isOptional: exp.isOptional,
      dayNumber: exp.dayNumber,
      displayOrder: exp.displayOrder,
    })),
    travelGuides: tour.travelGuides.map((g) => ({
      id: g.id,
      guideId: g.guideId,
      displayOrder: g.displayOrder,
    })),
    isLive: tour.isLive,
    isPopular: tour.isPopular ?? false,
    popularOrder: tour.popularOrder ?? null,
  };

  return (
    <TourForm
      initialData={initialData}
      categories={formOptions.categories}
      travelStyles={formOptions.travelStyles}
      properties={formOptions.properties}
      vehicles={formOptions.vehicles}
      drivers={formOptions.drivers}
      experiences={formOptions.experiences}
      travelGuides={formOptions.travelGuides}
      isEdit={true}
    />
  );
}
