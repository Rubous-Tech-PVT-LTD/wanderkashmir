import prisma from "@/lib/prisma";

export interface AdminDashboardMetrics {
  liveTours: number;
  totalTours: number;
  activeTravelStyles: number;
  approvedProperties: number;
  totalProperties: number;
  activeExperiences: number;
  leadsCount: number;
  publishedDestinations: number;
  reviewsCount: number;
  seoPagesCount: number;
}

export interface AdminLeadItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  travelDates: string | null;
  guestsCount: string;
  destinations: string[];
  hotelType: string;
  cabType: string;
  specialRequests: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: Date;
}

/**
 * Server-side read-only aggregate queries for the Admin Dashboard.
 * Queries the shared production database via Prisma.
 */
export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  try {
    const [
      liveTours,
      totalTours,
      activeTravelStyles,
      approvedProperties,
      totalProperties,
      activeExperiences,
      leadsCount,
      publishedDestinations,
      reviewsCount,
      seoPagesCount,
    ] = await Promise.all([
      prisma.tour.count({ where: { isLive: true } }),
      prisma.tour.count(),
      prisma.travelStyle.count({ where: { isActive: true } }),
      prisma.property.count({ where: { isApproved: true, status: "APPROVED" } }),
      prisma.property.count(),
      prisma.experience.count({ where: { status: "ACTIVE" } }),
      prisma.customTourRequest.count(),
      prisma.seoLandingPage.count({ where: { type: "DESTINATION", workflowState: "PUBLISHED" } }),
      prisma.review.count(),
      prisma.seoLandingPage.count(),
    ]);

    return {
      liveTours,
      totalTours,
      activeTravelStyles,
      approvedProperties,
      totalProperties,
      activeExperiences,
      leadsCount,
      publishedDestinations,
      reviewsCount,
      seoPagesCount,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard metrics:", error);
    return {
      liveTours: 0,
      totalTours: 0,
      activeTravelStyles: 0,
      approvedProperties: 0,
      totalProperties: 0,
      activeExperiences: 0,
      leadsCount: 0,
      publishedDestinations: 0,
      reviewsCount: 0,
      seoPagesCount: 0,
    };
  }
}

/**
 * Server-side read-only queries for customer inquiries/leads.
 * Queries real CustomTourRequest entries from the shared production database.
 */
export async function getAdminLeads(limit: number = 50): Promise<AdminLeadItem[]> {
  try {
    const leads = await prisma.customTourRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        travelDates: true,
        guestsCount: true,
        destinations: true,
        hotelType: true,
        cabType: true,
        specialRequests: true,
        status: true,
        adminNotes: true,
        createdAt: true,
      },
    });

    return leads;
  } catch (error) {
    console.error("Error fetching admin leads:", error);
    return [];
  }
}
