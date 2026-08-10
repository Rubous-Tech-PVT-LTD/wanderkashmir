import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, MapPin, CheckCircle2, Clock, Phone, Download } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch bookings for this user, including related entities
  const bookings = await prisma.booking.findMany({
    where: { 
      userId,
    },
    include: {
      property: { include: { vendorProfile: true } },
      tour: true,
      vehicle: { include: { vendorProfile: true } },
      guideProfile: { include: { vendorProfile: true } }
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="pt-24 pb-20 container-custom">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No trips booked yet</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Time to dust off your bags and start planning your next adventure in paradise!
            </p>
            <Link href="/stays" className="btn-primary inline-block">
              Explore Kashmir
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const isTour = !!booking.tourId;
              const isHotel = !!booking.propertyId;
              const isTaxi = !!booking.vehicleId;
              const isGuide = !!booking.guideProfileId;

              let serviceName = "Custom Booking";
              let image = "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=800";
              let location = "Kashmir";
              let viewLink = "";
              let contactPhone = "+916005888754"; // Default support
              let contactLabel = "Contact Support";

              if (isHotel && booking.property) {
                serviceName = booking.property.name;
                image = booking.property.images?.[0] || image;
                location = booking.property.location;
                viewLink = `/stays/${booking.property.id}`;
                contactPhone = booking.property.vendorProfile?.phone || contactPhone;
                contactLabel = "Contact Hotel";
              } else if (isTour && booking.tour) {
                serviceName = booking.tour.title;
                image = booking.tour.images?.[0] || image;
                location = "Tour Package";
                viewLink = `/tours/${booking.tour.slug}`;
                contactPhone = "+916005888754"; // Force support for packages
                contactLabel = "Contact Support";
              } else if (isTaxi && booking.vehicle) {
                serviceName = `${booking.vehicle.make} ${booking.vehicle.model}`;
                image = booking.vehicle.images?.[0] || image;
                location = "Taxi Booking";
                viewLink = `/taxis`;
                contactPhone = booking.vehicle.vendorProfile?.phone || contactPhone;
                contactLabel = "Contact Driver";
              } else if (isGuide && booking.guideProfile) {
                serviceName = "Local Guide";
                image = booking.guideProfile.images?.[0] || image;
                location = booking.guideProfile.location;
                viewLink = `/guides`;
                contactPhone = booking.guideProfile.vendorProfile?.phone || contactPhone;
                contactLabel = "Contact Guide";
              }

              return (
                <div key={booking.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
                  
                  {/* Image */}
                  <div className="w-full md:w-64 h-48 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 relative">
                    <img src={image} alt={serviceName} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      {booking.status === "SUCCESS" || booking.status === "CONFIRMED" ? (
                        <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed
                        </span>
                      ) : booking.status === "PENDING" ? (
                        <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                          {booking.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">
                          {serviceName}
                        </h2>
                        <p className="text-slate-500 flex items-center gap-1 text-sm">
                          <MapPin className="w-4 h-4" /> {location}
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
                        <p className="font-medium text-slate-900 text-xs mt-1 truncate">{booking.id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {viewLink && (
                        <Link href={viewLink} className="text-white hover:text-white text-sm font-bold bg-orange-500 px-4 py-2 rounded-lg transition-colors">
                          View Details
                        </Link>
                      )}
                      <a 
                        href={`tel:${contactPhone}`}
                        className="text-slate-700 hover:text-slate-900 text-sm font-bold bg-slate-200 hover:bg-slate-300 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" /> {contactLabel}
                      </a>
                      <a 
                        href={`/api/booking/${booking.id}/receipt`}
                        target="_blank"
                        className="text-slate-600 hover:text-slate-900 text-sm font-bold border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ml-auto"
                      >
                        <Download className="w-4 h-4" /> Download PDF
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
