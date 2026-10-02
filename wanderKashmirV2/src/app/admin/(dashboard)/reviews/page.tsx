import { getAdminReviewsList, getAdminReviewsStats } from "@/lib/admin/reviews";
import ReviewListClient from "@/components/admin/reviews/ReviewListClient";

export const revalidate = 0; // Fresh admin data on every request

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    entityType?: string;
    rating?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10) || 1;
  const search = params.search || "";
  const entityType = (params.entityType?.toUpperCase() || "ALL") as
    | "ALL"
    | "PROPERTY"
    | "TOUR"
    | "OTHER";
  const rating = params.rating && params.rating !== "ALL" ? parseInt(params.rating, 10) : undefined;

  const [reviewsResult, stats] = await Promise.all([
    getAdminReviewsList({
      search,
      entityType,
      rating,
      page,
      limit: 20,
    }),
    getAdminReviewsStats(),
  ]);

  return (
    <ReviewListClient
      reviews={reviewsResult.reviews}
      totalCount={reviewsResult.totalCount}
      currentPage={reviewsResult.page}
      totalPages={reviewsResult.totalPages}
      currentEntityType={entityType}
      currentRating={params.rating || "ALL"}
      currentSearch={search}
      stats={stats}
    />
  );
}
