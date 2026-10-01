import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TourPackageView from "@/components/tours/TourPackageView";
import { getDefaultTour } from "@/data/liveToursData";

export const metadata: Metadata = {
  title: "Complete Kashmir Experience (7 Days • 6 Nights) | WanderKashmir",
  description:
    "Experience the best of Kashmir with our 7 Days Complete Kashmir Experience package. Srinagar, Gulmarg, Pahalgam & Sonamarg with private cab, hotel stays, Dal Lake houseboat, and meals.",
};

export default function TourSingularPage() {
  const premierTour = getDefaultTour();

  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--season-text)] transition-colors duration-200">
      <Navbar />
      <main className="flex-1">
        <TourPackageView tour={premierTour} />
      </main>
      <Footer />
    </div>
  );
}
