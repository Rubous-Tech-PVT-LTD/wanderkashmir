import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TaxisClient from "@/app/taxis/TaxisClient";
import prisma from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kashmir Taxis & Transport | WanderKashmir",
  description: "Book verified cabs and taxis for sightseeing in Srinagar, Gulmarg, Pahalgam, and Sonamarg.",
};

export const revalidate = 60;

export default async function TaxisPage() {
  // Fetch real rate cards
  const ratesData = await prisma.taxiRateCard.findMany({
    orderBy: { place: 'asc' }
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <TaxisClient rateCards={ratesData} />
      <Footer />
    </main>
  );
}
