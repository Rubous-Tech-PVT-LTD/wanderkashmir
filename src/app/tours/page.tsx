import prisma from "@/lib/prisma";
import ToursClient from "./ToursClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tour Packages in Kashmir | WanderKashmir",
  description: "Hand-crafted itineraries by local experts. Everything included — stays, meals, transfers & guides.",
};

export const revalidate = 60;

export default async function ToursPage() {
  const tours = await prisma.tour.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  return <ToursClient initialTours={tours} />;
}
