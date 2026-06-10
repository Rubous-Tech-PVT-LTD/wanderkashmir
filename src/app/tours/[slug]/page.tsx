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
    where: { slug }
  });

  if (!tour) {
    notFound();
  }

  return <TourDetailClient initialTour={tour} />;
}
