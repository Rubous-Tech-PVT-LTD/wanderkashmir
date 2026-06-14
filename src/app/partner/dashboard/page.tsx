import { getVendorSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import HotelDashboard from "../hotel/page";
import HomeStaysDashboard from "../homeStays/page";
import TransportDashboard from "../Taxi_Driver/page";
import GuideDashboard from "../Guide/page";
import { redirect } from "next/navigation";
import { getVendorBookings } from "@/actions/bookings";
import { Clock, XCircle, Mail, LogOut } from "lucide-react";

export default async function DynamicVendorDashboard() {
  const session = await getVendorSession();
  if (!session || (session.role !== "VENDOR" && session.role !== "ADMIN")) {
    redirect("/partner");
  }
  const userId = session.userId;

  const vendorProfile = session.vendorProfileId
    ? await prisma.vendorProfile.findUnique({
        where: { id: session.vendorProfileId },
        include: {
          properties: true,
          vehicles: true,
          drivers: true,
          rateOverrides: true
        }
      })
    : await prisma.vendorProfile.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          properties: true,
          vehicles: true,
          drivers: true,
          rateOverrides: true
        }
      });

  if (!vendorProfile) {
    redirect("/partner");
  }

  // If vendor is rejected, show rejection screen
  if (vendorProfile.status === "REJECTED") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden">
          <div className="bg-gradient-to-br from-red-600 to-red-800 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-white/20">
              <XCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Application Not Approved</h2>
            <p className="text-red-200 text-sm">Unfortunately your application could not be approved</p>
          </div>
          <div className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Reason for Rejection</p>
              <p className="text-red-800 font-medium text-sm leading-relaxed">
                {vendorProfile.rejectionReason || "Please contact support for more information."}
              </p>
            </div>
            <p className="text-slate-500 text-sm text-center mb-6">
              You may resubmit a new application with updated documents.
            </p>
            <a 
              href="/partner/register"
              className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
            >
              Resubmit Application
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If vendor not yet approved, show pending screen
  if (!vendorProfile.isApproved) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden">
          {/* Header */}
          <div
            className="px-8 py-10 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #f97316 0%, transparent 50%), radial-gradient(circle at 80% 20%, #0ea5e9 0%, transparent 50%)" }}
            />
            <div className="relative">
              <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-orange-500/30">
                <Clock className="w-10 h-10 text-orange-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Application Under Review</h2>
              <p className="text-slate-400 text-sm">WanderKashmir Partner Program</p>
            </div>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Status */}
            <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-900">Pending Approval</p>
                <p className="text-amber-700 text-sm mt-0.5">Expected within 24–48 hours</p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center shrink-0">✓</div>
                <span className="text-slate-700 text-sm font-medium flex-1">Documents submitted &amp; received</span>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
                <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 font-black text-sm flex items-center justify-center shrink-0">2</div>
                <span className="text-amber-900 text-sm font-medium flex-1">Admin review in progress ⏳</span>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100 opacity-40">
                <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-400 font-black text-sm flex items-center justify-center shrink-0">3</div>
                <span className="text-slate-400 text-sm font-medium flex-1">Dashboard access &amp; go live 🚀</span>
              </div>
            </div>

            {/* Email note */}
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                <p className="text-sky-800 text-sm leading-relaxed">
                  We will send a confirmation email to <strong>{vendorProfile.email}</strong> once your account is approved.
                </p>
              </div>
            </div>

            {/* Business info */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 text-sm">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Your Application</p>
              <div className="space-y-1.5">
                <p className="text-slate-700"><span className="text-slate-400">Business: </span><strong>{vendorProfile.businessName}</strong></p>
                <p className="text-slate-700"><span className="text-slate-400">Type: </span><strong className="capitalize">{vendorProfile.type.toLowerCase()}</strong></p>
                <p className="text-slate-700"><span className="text-slate-400">Email: </span><strong>{vendorProfile.email}</strong></p>
              </div>
            </div>

            <form action="/api/auth/vendor-logout" method="POST">
              <button 
                type="submit"
                className="w-full border border-slate-200 text-slate-600 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Fetch bookings for this vendor
  const bookingsRes = await getVendorBookings(vendorProfile.id, vendorProfile.type);
  const bookings = bookingsRes.success ? bookingsRes.bookings : [];

  switch (vendorProfile.type) {
    case "HOTEL":
      return <HotelDashboard properties={vendorProfile.properties} bookings={bookings} />;
    case "HOMESTAY":
      return <HomeStaysDashboard properties={vendorProfile.properties} bookings={bookings} />;
    case "TAXI":
      return (
        <TransportDashboard 
          bookings={bookings} 
          vehicles={vendorProfile.vehicles} 
          drivers={vendorProfile.drivers}
          rateOverrides={vendorProfile.rateOverrides}
          taxiRole={vendorProfile.taxiRole}
          vendorProfileId={vendorProfile.id}
        />
      );
    case "GUIDE":
      const guideProfiles = await prisma.guideProfile.findMany({ where: { vendorProfileId: vendorProfile.id }});
      const initialGuideProfile = guideProfiles.length > 0 ? guideProfiles[0] : null;
      return <GuideDashboard bookings={bookings} vendorProfileId={vendorProfile.id} initialGuideProfile={initialGuideProfile} />;
    default:
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h2 className="text-2xl font-bold text-slate-900">Welcome to your dashboard</h2>
          <p className="text-slate-500 mt-2">Please select a service to manage.</p>
        </div>
      );
  }
}
