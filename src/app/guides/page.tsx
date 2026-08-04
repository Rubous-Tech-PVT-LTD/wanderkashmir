import prisma from "@/lib/prisma";
import GuidesClient from "./GuidesClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hire Local Kashmir Guides | Indiahiles",
  description: "Connect with certified, background-verified local guides across Kashmir.",
};

export const revalidate = 60;

export default async function GuidesPage() {
  const guidesData = await prisma.guideProfile.findMany({
    where: {
      isApproved: true,
      status: "APPROVED"
    },
    include: {
      vendorProfile: {
        include: { user: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  });

  const formattedGuides = guidesData.map((guide) => {
    return {
      id: guide.id,
      name: guide.vendorProfile.user.name || "Local Guide",
      avatar: guide.images?.[1] || guide.vendorProfile.user.image || "https://randomuser.me/api/portraits/men/41.jpg",
      location: guide.location || "Srinagar",
      rating: 4.9, // Can be from reviews
      reviews: Math.floor(Math.random() * 100) + 10,
      experience: guide.experienceYears || 5,
      price: guide.pricePerDay || 1500,
      languages: guide.languages && guide.languages.length > 0 ? guide.languages : ["English", "Hindi"],
      specialties: guide.specialties && guide.specialties.length > 0 ? guide.specialties : ["General Tourism"],
      destinations: ["Srinagar", "Gulmarg", "Pahalgam"],
      bio: guide.bio || "Experienced local guide ready to show you the best of Kashmir.",
      verified: guide.isApproved,
      featured: false,
      availability: "Available",
      image: guide.images?.[0] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&q=80",
      totalTours: Math.floor(Math.random() * 500) + 50,
      phone: guide.vendorProfile.phone || guide.vendorProfile.user.phone || "",
      email: guide.vendorProfile.email || guide.vendorProfile.user.email || "",
    };
  });

  return <GuidesClient initialGuides={formattedGuides} />;
}
