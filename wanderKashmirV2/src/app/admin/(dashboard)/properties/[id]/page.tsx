import { getAdminPropertyById, getVendorsForSelection } from "@/lib/admin/properties";
import PropertyForm from "@/components/admin/properties/PropertyForm";
import { AdminNotFoundCard } from "@/components/admin/ui";

export const revalidate = 0;

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [property, vendors] = await Promise.all([
    getAdminPropertyById(id),
    getVendorsForSelection(),
  ]);

  if (!property) {
    return (
      <AdminNotFoundCard
        title="Property not found"
        description={`The requested property (ID: ${id}) could not be found.`}
        backHref="/admin/properties"
        backLabel="Return to Properties"
      />
    );
  }

  const initialData = {
    id: property.id,
    name: property.name,
    location: property.location,
    description: property.description,
    pricePerNight: property.pricePerNight,
    propertyType: property.propertyType,
    vendorProfileId: property.vendorProfileId,
    images: Array.isArray(property.images) ? property.images : [],
    amenities: Array.isArray(property.amenities) ? property.amenities : [],
    bedrooms: property.bedrooms,
    beds: property.beds,
    guests: property.guests,
    totalRooms: property.totalRooms,
    availableRooms: property.availableRooms,
    breakfastIncluded: property.breakfastIncluded,
    dinnerIncluded: property.dinnerIncluded,
    bedDetails: property.bedDetails,
    googlePlaceId: property.googlePlaceId,
    latitude: property.latitude,
    longitude: property.longitude,
    isApproved: property.isApproved,
    status: property.status,
    rejectionReason: property.rejectionReason,
    roomTypes: property.roomTypes.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      basePrice: r.basePrice,
      capacity: r.capacity,
      totalUnits: r.totalUnits,
      priceEP: r.priceEP,
      priceCP: r.priceCP,
      priceMAP: r.priceMAP,
      extraBedPrice: r.extraBedPrice,
      childNoBedPrice: r.childNoBedPrice,
    })),
    reviews: property.reviews.map((rev) => ({
      id: rev.id,
      rating: rev.rating,
      comment: rev.comment,
      createdAt: rev.createdAt,
      user: rev.user,
    })),
  };

  return <PropertyForm initialData={initialData} vendors={vendors} isEdit={true} />;
}
