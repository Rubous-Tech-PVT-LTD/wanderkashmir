import { TrendingUp, Users, Home, Car, AlertCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AdminOverview() {
  // Fetch real metrics from Prisma
  const [
    bookings,
    approvedVendorsCount,
    pendingVendors,
    propertiesCount,
    vehiclesCount,
    recentBookings,
  ] = await Promise.all([
    // 1. GMV and Revenue
    prisma.booking.findMany({
      where: { status: "CONFIRMED" },
      select: { amount: true, property: { select: { vendorProfile: { select: { type: true } } } }, vehicle: { select: { type: true } } },
    }),
    // 2. Active Vendors
    prisma.vendorProfile.count({ where: { isApproved: true } }),
    // 3. Pending Vendors
    prisma.vendorProfile.findMany({
      where: { isApproved: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // 4. Properties Listed
    prisma.property.count(),
    // 5. Vehicles Listed
    prisma.vehicle.count(),
    // 6. Recent Bookings
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        property: true,
        vehicle: true,
        user: true,
      },
    }),
  ]);

  // Calculate GMV
  const gmv = bookings.reduce((sum, booking) => sum + booking.amount, 0);

  // Approximate Platform Revenue (using a blended average of 10% for simplicity if type is unknown, 
  // but we can apply the rules: Homestay 8%, Hotel 15%, Guide 15%, Taxi ~10%)
  const platformRevenue = bookings.reduce((sum, booking) => {
    let rate = 0.10;
    const type = booking.property?.vendorProfile?.type;
    if (type === "HOMESTAY") rate = 0.08;
    else if (type === "HOTEL") rate = 0.15;
    else if (type === "GUIDE") rate = 0.15;
    
    return sum + (booking.amount * rate);
  }, 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)}L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Overview</h1>
        <p className="text-slate-500 mt-1">Real-time metrics for the WanderKashmir marketplace.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Gross Merchandise Value</h3>
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-sky-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(gmv)}</p>
          <p className="text-slate-500 text-sm font-medium mt-2">Total Confirmed Bookings</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Platform Revenue (Comms)</h3>
            <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center">
              <span className="text-lg font-bold text-sky-600">₹</span>
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(platformRevenue)}</p>
          <p className="text-slate-500 text-sm font-medium mt-2">Estimated Commissions</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Total Active Vendors</h3>
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{approvedVendorsCount}</p>
          <p className="text-orange-500 text-sm font-medium mt-2">{pendingVendors.length} pending approval</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-500">Properties Listed</h3>
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{propertiesCount + vehiclesCount}</p>
          <p className="text-slate-500 text-sm font-medium mt-2">{vehiclesCount} Taxis/Vehicles</p>
        </div>
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Action Required</h2>
            {pendingVendors.length > 0 && (
              <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">{pendingVendors.length} Pending</span>
            )}
          </div>
          <div className="p-0">
            {pendingVendors.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No pending approvals.</div>
            ) : (
              pendingVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-start gap-4 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-900">New {vendor.type} Approval</p>
                    <p className="text-xs text-slate-500 mt-1">"{vendor.businessName}" is waiting for document verification.</p>
                  </div>
                  <Link href={`/wander-admin/approvals`} className="text-sky-600 text-sm font-semibold hover:text-sky-700">Review</Link>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Recent Bookings</h2>
          </div>
          <div className="p-0">
            {recentBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No recent bookings.</div>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">ID: {booking.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {booking.property?.name || booking.vehicle?.model || "Custom Package"} (₹{booking.amount.toLocaleString('en-IN')})
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    booking.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" :
                    booking.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {booking.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
