import { Star } from "lucide-react";
import MigrationPendingView from "@/components/admin/MigrationPendingView";
import prisma from "@/lib/prisma";

export const revalidate = 0;

export default async function AdminReviewsPage() {
  const reviewsCount = await prisma.review.count().catch(() => 0);

  return (
    <MigrationPendingView
      title="Customer Reviews"
      description="Verification and moderation of customer reviews, testimonials, and Google Places synchronization are handled by the primary operational dashboard."
      icon={Star}
      v1RouteName="V1 Reviews / Testimonials"
      stats={[
        { label: "Reviews in DB", value: reviewsCount },
      ]}
    />
  );
}
