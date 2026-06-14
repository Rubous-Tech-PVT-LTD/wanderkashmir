import prisma from "@/lib/prisma";
import TourDetailClient from "./TourDetailClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tour = await prisma.tour.findUnique({ where: { slug } });
  
  if (!tour) return { title: "Tour Not Found" };
  
  return {
    title: `${tour.title} | WanderKashmir`,
    description: tour.overview || `Book the ${tour.title} with WanderKashmir.`,
  };
}

export const revalidate = 60;

export default async function TourPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const tour = await prisma.tour.findUnique({
    where: { slug },
    include: {
      reviews: {
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!tour) {
    notFound();
  }

  // Calculate rating
  const reviewCount = tour.reviews.length;
  const averageRating = reviewCount > 0 
    ? (tour.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
    : "0.0";

  // Format reviews for client
  const formattedTour = {
    ...tour,
    rating: averageRating,
    reviews: reviewCount,
    reviewsList: tour.reviews.map(r => ({
      name: r.user?.name || "Anonymous",
      avatar: r.user?.image || "https://ui-avatars.com/api/?name=" + (r.user?.name || "A"),
      location: "India", // Placeholder as location isn't in User model
      date: r.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      rating: r.rating,
      text: r.comment || ""
    }))
  };

  return <TourDetailClient initialTour={formattedTour} />;
}
