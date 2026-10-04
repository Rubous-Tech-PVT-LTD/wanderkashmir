import prisma from "@/lib/prisma";
import { VendorType } from "@prisma/client";

export interface AdminVendorListItem {
  id: string;
  vendorId: string | null;
  userId: string;
  type: VendorType;
  businessName: string;
  status: string;
  isApproved: boolean;
  rejectionReason: string | null;
  subscriptionPlan: string;
  createdAt: Date;
  updatedAt: Date;
  email: string | null;
  phone: string | null;
  address: string | null;
  altContactPerson: string | null;
  altPhone: string | null;
  kycDocuments: string[];
  accountHolderName: string | null;
  accountNumber: string | null;
  bankName: string | null;
  ifscCode: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  tradeLicense: string | null;
  drivingLicense: string | null;
  vehicleRegistration: string | null;
  vehicleType: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    role: string;
    isBanned: boolean;
  } | null;
  propertiesCount: number;
  vehiclesCount: number;
  guidesCount: number;
}

export interface AdminVendorsStats {
  totalVendors: number;
  pendingApprovals: number;
  liveVendors: number;
  rejectedVendors: number;
  suspendedVendors: number;
  hotelCount: number;
  homestayCount: number;
  taxiCount: number;
  guideCount: number;
}

export interface GetAdminVendorsParams {
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export async function getAdminVendorsList(params: GetAdminVendorsParams = {}) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 20));
  const skip = (page - 1) * limit;

  const where: any = {};

  // Search filter across businessName, vendorId, email, phone, and user name/email
  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    where.OR = [
      { businessName: { contains: q, mode: "insensitive" } },
      { vendorId: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  // Type filter
  if (params.type && params.type !== "ALL") {
    const upperType = params.type.toUpperCase();
    if (["HOTEL", "HOMESTAY", "TAXI", "GUIDE"].includes(upperType)) {
      where.type = upperType as VendorType;
    }
  }

  // Status filter
  if (params.status && params.status !== "ALL") {
    const upperStatus = params.status.toUpperCase();
    if (upperStatus === "PENDING") {
      where.OR = [
        { status: "PENDING" },
        { isApproved: false, status: { notIn: ["REJECTED", "SUSPENDED"] } },
      ];
    } else if (upperStatus === "APPROVED" || upperStatus === "LIVE") {
      where.isApproved = true;
      where.status = { notIn: ["SUSPENDED", "REJECTED"] };
    } else if (upperStatus === "REJECTED") {
      where.status = "REJECTED";
    } else if (upperStatus === "SUSPENDED") {
      where.status = "SUSPENDED";
    }
  }

  const [rawVendors, totalCount] = await Promise.all([
    prisma.vendorProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isBanned: true,
          },
        },
        _count: {
          select: {
            properties: true,
            vehicles: true,
            guideProfiles: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.vendorProfile.count({ where }),
  ]);

  const vendors: AdminVendorListItem[] = rawVendors.map((v) => ({
    id: v.id,
    vendorId: v.vendorId,
    userId: v.userId,
    type: v.type,
    businessName: v.businessName,
    status: v.status,
    isApproved: v.isApproved,
    rejectionReason: v.rejectionReason,
    subscriptionPlan: v.subscriptionPlan,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
    email: v.email,
    phone: v.phone,
    address: v.address,
    altContactPerson: v.altContactPerson,
    altPhone: v.altPhone,
    kycDocuments: v.kycDocuments || [],
    accountHolderName: v.accountHolderName,
    accountNumber: v.accountNumber,
    bankName: v.bankName,
    ifscCode: v.ifscCode,
    gstNumber: v.gstNumber,
    panNumber: v.panNumber,
    tradeLicense: v.tradeLicense,
    drivingLicense: v.drivingLicense,
    vehicleRegistration: v.vehicleRegistration,
    vehicleType: v.vehicleType,
    user: v.user,
    propertiesCount: v._count.properties,
    vehiclesCount: v._count.vehicles,
    guidesCount: v._count.guideProfiles,
  }));

  return {
    vendors,
    totalCount,
    page,
    limit,
    totalPages: Math.ceil(totalCount / limit) || 1,
  };
}

export async function getAdminVendorsStats(): Promise<AdminVendorsStats> {
  const [
    totalVendors,
    pendingApprovals,
    liveVendors,
    rejectedVendors,
    suspendedVendors,
    hotelCount,
    homestayCount,
    taxiCount,
    guideCount,
  ] = await Promise.all([
    prisma.vendorProfile.count(),
    prisma.vendorProfile.count({
      where: {
        OR: [
          { status: "PENDING" },
          { isApproved: false, status: { notIn: ["REJECTED", "SUSPENDED"] } },
        ],
      },
    }),
    prisma.vendorProfile.count({
      where: {
        isApproved: true,
        status: { notIn: ["SUSPENDED", "REJECTED"] },
      },
    }),
    prisma.vendorProfile.count({
      where: { status: "REJECTED" },
    }),
    prisma.vendorProfile.count({
      where: { status: "SUSPENDED" },
    }),
    prisma.vendorProfile.count({
      where: { type: "HOTEL" },
    }),
    prisma.vendorProfile.count({
      where: { type: "HOMESTAY" },
    }),
    prisma.vendorProfile.count({
      where: { type: "TAXI" },
    }),
    prisma.vendorProfile.count({
      where: { type: "GUIDE" },
    }),
  ]);

  return {
    totalVendors,
    pendingApprovals,
    liveVendors,
    rejectedVendors,
    suspendedVendors,
    hotelCount,
    homestayCount,
    taxiCount,
    guideCount,
  };
}

export async function getVendorProfileById(vendorProfileId: string) {
  return await prisma.vendorProfile.findUnique({
    where: { id: vendorProfileId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isBanned: true,
        },
      },
      properties: {
        select: {
          id: true,
          name: true,
          location: true,
          pricePerNight: true,
          propertyType: true,
          isApproved: true,
          status: true,
        },
      },
      vehicles: {
        select: {
          id: true,
          make: true,
          model: true,
          registrationNum: true,
          type: true,
          isApproved: true,
          status: true,
        },
      },
      guideProfiles: {
        select: {
          id: true,
          pricePerDay: true,
          experienceYears: true,
          isApproved: true,
        },
      },
    },
  });
}
