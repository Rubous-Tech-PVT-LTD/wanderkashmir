import { notFound } from "next/navigation";
import { getAdminReviewById } from "@/lib/admin/reviews";
import ReviewDetailForm from "@/components/admin/reviews/ReviewDetailForm";

export const revalidate = 0;

interface ReviewDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const { id } = await params;
  const review = await getAdminReviewById(id);

  if (!review) {
    notFound();
  }

  return (
    <ReviewDetailForm
      review={{
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: {
          id: review.user.id,
          name: review.user.name,
          email: review.user.email,
          image: review.user.image,
          createdAt: review.user.createdAt,
        },
        property: review.property
          ? {
              id: review.property.id,
              name: review.property.name,
              location: review.property.location,
              propertyType: review.property.propertyType,
              status: review.property.status,
              isApproved: review.property.isApproved,
            }
          : null,
        tour: review.tour
          ? {
              id: review.tour.id,
              title: review.tour.title,
              slug: review.tour.slug,
              duration: review.tour.duration,
              isLive: review.tour.isLive,
            }
          : null,
        booking: review.booking
          ? {
              id: review.booking.id,
              status: review.booking.status,
              amount: review.booking.amount,
              createdAt: review.booking.createdAt,
            }
          : null,
      }}
    />
  );
}
