import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, MapPin, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch bookings for this user, including the related property
  const bookings = await prisma.booking.findMany({
    where: { 
      userId,
      // Only show confirmed bookings or pending ones (maybe they just initiated it)
      // But let's show all for now so the user can see history
    },
    include: {
      property: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="pt-24 pb-20 container-custom">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Trips</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No trips booked yet</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Time to dust off your bags and start planning your next adventure in paradise!
            </p>
            <Link href="/stays" className="btn-primary">
              Explore Kashmir Stays
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const propData: any = booking.property;
              const image = propData?.images && propData.images.length > 0 
                ? propData.images[0] 
                : "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800";

              return (
                <div key={booking.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                  
                  {/* Property Image */}
                  <div className="w-full md:w-64 h-48 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 relative">
                    <img src={image} alt={booking.property?.name || "Property"} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      {booking.status === "CONFIRMED" ? (
                        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed
                        </span>
                      ) : booking.status === "PENDING" ? (
                        <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">
                          {booking.property?.name || "Deleted Property"}
                        </h2>
                        <p className="text-slate-500 flex items-center gap-1 text-sm">
                          <MapPin className="w-4 h-4" /> {booking.property?.location || "Unknown Location"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">₹{booking.amount.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-slate-500">Total Amount Paid</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Check-in</p>
                        <p className="font-medium text-slate-900">
                          {booking.checkIn ? format(new Date(booking.checkIn), "MMM dd, yyyy") : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Check-out</p>
                        <p className="font-medium text-slate-900">
                          {booking.checkOut ? format(new Date(booking.checkOut), "MMM dd, yyyy") : "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Guests</p>
                        <p className="font-medium text-slate-900">{booking.guests || 1}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">Booking ID</p>
                        <p className="font-medium text-slate-900 text-xs mt-1 truncate">{booking.id}</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {booking.propertyId && (
                        <Link href={`/stays/${booking.propertyId}`} className="text-white hover:text-white text-sm font-bold bg-orange-500 px-4 py-2 rounded-lg transition-colors">
                          View Property
                        </Link>
                      )}
                      <a 
                        href={`/api/booking/${booking.id}/receipt`}
                        target="_blank"
                        className="text-slate-600 hover:text-slate-900 text-sm font-bold bg-slate-100 px-4 py-2 rounded-lg transition-colors inline-flex items-center justify-center"
                      >
                        Download Receipt
                      </a>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
