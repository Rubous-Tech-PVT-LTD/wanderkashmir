import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CheckoutClient from "./CheckoutClient";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/checkout?" + new URLSearchParams(params as any).toString());
  }

  const type = typeof params.type === "string" ? params.type : null;
  
  let checkoutData = null;

  if (type === "taxi") {
    const vehicleType = typeof params.vehicle === "string" ? params.vehicle : null;
    const route = typeof params.route === "string" ? params.route : null;
    const driverId = typeof params.driverId === "string" ? params.driverId : null;
    
    // Calculate price logic (similar to TaxisClient)
    let price = 0;
    if (route && vehicleType) {
      const rateCard = await prisma.taxiRateCard.findFirst({ where: { place: route } });
      if (rateCard) {
        const rates = rateCard.rates as any;
        price = rates[vehicleType] || 0;
      }
      
      // Override if driverId is provided
      if (driverId) {
        const override = await prisma.taxiStandRateOverride.findUnique({
          where: {
            vendorProfileId_routePlace: {
              vendorProfileId: driverId,
              routePlace: route
            }
          }
        });
        if (override) {
          price = override.customPrice;
        }
      }
    }
    
    checkoutData = {
      type: "taxi",
      vehicleType,
      route,
      driverId,
      price
    };
  } else if (type === "guide") {
    const guideId = typeof params.guideId === "string" ? params.guideId : null;
    let guide = null;
    if (guideId) {
      guide = await prisma.guideProfile.findUnique({
        where: { id: guideId },
        include: { vendorProfile: true }
      });
    }
    checkoutData = {
      type: "guide",
      guideId,
      guide,
      price: guide ? guide.pricePerDay : 0
    };
  }

  // Serialize checkoutData to avoid Next.js serialization error with Prisma Date objects
  const serializedCheckoutData = checkoutData ? JSON.parse(JSON.stringify(checkoutData)) : null;

  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <div className="flex-1 pt-20">
        <Suspense fallback={<div className="container-custom py-10">Loading checkout...</div>}>
          <CheckoutClient 
            isLoggedIn={!!userId} 
            checkoutData={serializedCheckoutData} 
          />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
