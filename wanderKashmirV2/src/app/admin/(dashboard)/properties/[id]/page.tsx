import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getAdminPropertyById, getVendorsForSelection } from "@/lib/admin/properties";
import PropertyForm from "@/components/admin/properties/PropertyForm";

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
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Property Not Found</h1>
        <p className="text-sm text-slate-400">
          The requested property (ID: {id}) does not exist in the production database.
        </p>
        <div>
          <Link
            href="/admin/properties"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Properties List
          </Link>
        </div>
      </div>
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
