import { getAdminTourById, getAdminTourFormOptions } from "@/lib/admin/tours";
import TourForm from "@/components/admin/tours/TourForm";
import { AdminNotFoundCard } from "@/components/admin/ui";

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
      <AdminNotFoundCard
        title="Tour not found"
        description={`The requested tour (ID: ${id}) could not be found.`}
        backHref="/admin/tours"
        backLabel="Return to Tours"
      />
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
    h1Heading: tour.h1Heading ?? null,
    seoTitle: tour.seoTitle ?? null,
    metaDescription: tour.metaDescription ?? null,
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
      availablePlaces={formOptions.availablePlaces}
      isEdit={true}
    />
  );
}
