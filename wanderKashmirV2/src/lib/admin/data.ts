import prisma from "@/lib/prisma";

export interface AdminDashboardMetrics {
  // Actionable Pending Queues
  pendingVendors: number;
  pendingListings: number;
  pendingVehicles: number;
  newLeadsCount: number;
  pendingSeoComments: number;
  // Core Catalog & CMS Aggregates
  liveTours: number;
  totalTours: number;
  activeTravelStyles: number;
  approvedProperties: number;
  totalProperties: number;
  activeExperiences: number;
  leadsCount: number;
  publishedDestinations: number;
  draftDestinations: number;
  activePlaces: number;
  draftPlaces: number;
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

export interface AdminDraftContentItem {
  id: string;
  title: string;
  slug: string;
  kind: "PLACE" | "DESTINATION" | "BLOG";
  status: string;
  updatedAt: Date;
}

/**
 * Server-side read-only aggregate queries for the Admin Dashboard.
 * Every metric is backed by a real Prisma query against the shared database.
 */
export async function getAdminDashboardMetrics(): Promise<AdminDashboardMetrics> {
  try {
    const [
      pendingVendors,
      pendingListings,
      pendingVehicles,
      newLeadsCount,
      pendingSeoComments,
      liveTours,
      totalTours,
      activeTravelStyles,
      approvedProperties,
      totalProperties,
      activeExperiences,
      leadsCount,
      publishedDestinations,
      draftDestinations,
      activePlaces,
      draftPlaces,
      reviewsCount,
      seoPagesCount,
    ] = await Promise.all([
      prisma.vendorProfile.count({
        where: {
          OR: [
            { status: "PENDING" },
            { isApproved: false, status: { notIn: ["REJECTED", "SUSPENDED"] } },
          ],
        },
      }),
      prisma.property.count({
        where: {
          OR: [
            { status: "PENDING" },
            { isApproved: false, status: { notIn: ["REJECTED", "SUSPENDED"] } },
          ],
        },
      }),
      prisma.vehicle.count({
        where: {
          OR: [
            { status: "PENDING" },
            { isApproved: false, status: { notIn: ["REJECTED", "SUSPENDED"] } },
          ],
        },
      }),
      prisma.customTourRequest.count({ where: { status: "PENDING" } }),
      prisma.seoPageComment.count({ where: { isApproved: false } }),
      prisma.tour.count({ where: { isLive: true } }),
      prisma.tour.count(),
      prisma.travelStyle.count({ where: { isActive: true } }),
      prisma.property.count({ where: { isApproved: true, status: "APPROVED" } }),
      prisma.property.count(),
      prisma.experience.count({ where: { status: "ACTIVE" } }),
      prisma.customTourRequest.count(),
      prisma.seoLandingPage.count({ where: { type: "DESTINATION", workflowState: "PUBLISHED" } }),
      prisma.seoLandingPage.count({ where: { type: "DESTINATION", workflowState: { not: "PUBLISHED" } } }),
      prisma.place.count({ where: { status: "ACTIVE" } }),
      prisma.place.count({ where: { status: { not: "ACTIVE" } } }),
      prisma.review.count(),
      prisma.seoLandingPage.count(),
    ]);

    return {
      pendingVendors,
      pendingListings,
      pendingVehicles,
      newLeadsCount,
      pendingSeoComments,
      liveTours,
      totalTours,
      activeTravelStyles,
      approvedProperties,
      totalProperties,
      activeExperiences,
      leadsCount,
      publishedDestinations,
      draftDestinations,
      activePlaces,
      draftPlaces,
      reviewsCount,
      seoPagesCount,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard metrics:", error);
    return {
      pendingVendors: 0,
      pendingListings: 0,
      pendingVehicles: 0,
      newLeadsCount: 0,
      pendingSeoComments: 0,
      liveTours: 0,
      totalTours: 0,
      activeTravelStyles: 0,
      approvedProperties: 0,
      totalProperties: 0,
      activeExperiences: 0,
      leadsCount: 0,
      publishedDestinations: 0,
      draftDestinations: 0,
      activePlaces: 0,
      draftPlaces: 0,
      reviewsCount: 0,
      seoPagesCount: 0,
    };
  }
}

/**
 * Recent unpublished/draft editorial items across Places, Destinations, and Blogs.
 */
export async function getRecentDraftContent(limit: number = 8): Promise<AdminDraftContentItem[]> {
  try {
    const [draftPlaces, draftSeoPages] = await Promise.all([
      prisma.place.findMany({
        where: { status: { not: "ACTIVE" } },
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: { id: true, name: true, slug: true, status: true, updatedAt: true },
      }),
      prisma.seoLandingPage.findMany({
        where: { workflowState: { not: "PUBLISHED" } },
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: { id: true, title: true, slug: true, type: true, workflowState: true, updatedAt: true },
      }),
    ]);

    const merged: AdminDraftContentItem[] = [
      ...draftPlaces.map((p) => ({
        id: p.id,
        title: p.name,
        slug: p.slug,
        kind: "PLACE" as const,
        status: p.status,
        updatedAt: p.updatedAt,
      })),
      ...draftSeoPages.map((s) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        kind: (s.type === "DESTINATION" ? "DESTINATION" : "BLOG") as "DESTINATION" | "BLOG",
        status: s.workflowState,
        updatedAt: s.updatedAt,
      })),
    ];

    return merged
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching recent draft content:", error);
    return [];
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

/**
 * Fetch a single lead by ID for voucher/receipt rendering.
 */
export async function getAdminLeadById(id: string): Promise<AdminLeadItem | null> {
  try {
    const lead = await prisma.customTourRequest.findUnique({
      where: { id },
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
    return lead;
  } catch (error) {
    console.error("Error fetching lead by id:", error);
    return null;
  }
}
