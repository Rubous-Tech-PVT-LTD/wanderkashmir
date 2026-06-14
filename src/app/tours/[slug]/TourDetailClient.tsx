"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { 
  Star, Clock, Users, MapPin, CheckCircle2, 
  Heart, Share2, ChevronRight, Calendar, Info, Shield, Phone, MessageCircle, Utensils, Hotel, ChevronDown, ChevronUp, XCircle, FileText, User, UserCheck, Car, Compass, Camera, AlertCircle
} from "lucide-react";
import CustomDatePicker from "@/components/CustomDatePicker";
import CheckoutButton from "@/components/CheckoutButton";
import { useUser } from "@clerk/nextjs";

// Removed static tour variable

const inclusionIcons: Record<string, React.ReactNode> = {
  accommodation: <Hotel className="w-4 h-4" />,
  meals: <Utensils className="w-4 h-4" />,
  transfers: <Car className="w-4 h-4" />,
  guide: <Compass className="w-4 h-4" />,
  camera: <Camera className="w-4 h-4" />,
};

export default function TourDetailClient({ initialTour }: { initialTour: any }) {
  const [activeImage, setActiveImage] = useState(0);
  const [openDay, setOpenDay] = useState<number | null>(1);
  const [persons, setPersons] = useState(2);
  const [travelDate, setTravelDate] = useState<Date | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  
  // Booking Flow State
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);

  const tour = initialTour;

  const nextImage = () => {
    if (tour.images?.length) {
      setActiveImage((prev) => (prev + 1) % tour.images.length);
    }
  };

  const prevImage = () => {
    if (tour.images?.length) {
      setActiveImage((prev) => (prev - 1 + tour.images.length) % tour.images.length);
    }
  };

  const totalPrice = tour.price * persons;
  const savings = tour.originalPrice - tour.price;

  return (
    <main>
      <Navbar />
      <div className="pt-20 min-h-screen bg-slate-50">
        <div className="container-custom py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-orange-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/tours" className="hover:text-orange-600">Tours</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-medium truncate">{tour.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="relative h-80 md:h-[420px]">
                  <Image
                    src={tour.images?.[activeImage] || "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&q=80"}
                    alt={tour.title}
                    fill
                    className="object-cover transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="badge bg-orange-500 text-white">Best Seller</span>
                    {tour.category?.split(',').map((cat: string, idx: number) => (
                      <span key={idx} className="badge bg-sky-600 text-white">{cat.trim()}</span>
                    ))}
                  </div>
                  {/* Actions */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow transition-transform hover:scale-110"
                    >
                      <Heart
                        className={`w-5 h-5 ${isWishlisted ? "fill-orange-500 text-orange-500" : "text-slate-400"}`}
                      />
                    </button>
                    <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow transition-transform hover:scale-110">
                      <Share2 className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                  
                  {/* Navigation Arrows */}
                  {tour.images?.length > 1 && (
                    <>
                      <button 
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                      >
                        <ChevronRight className="w-6 h-6 text-slate-800 rotate-180" />
                      </button>
                      <button 
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                      >
                        <ChevronRight className="w-6 h-6 text-slate-800" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Title & Rating */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                  {tour.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                    <span className="font-bold text-slate-900">{tour.rating}</span>
                    <span>({tour.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-orange-500" />
                    {tour.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-orange-500" />
                    Max {tour.maxPersons} persons
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tour.destinations?.map((d: string) => (
                      <span key={d} className="flex items-center gap-1 badge badge-saffron">
                        <MapPin className="w-3 h-3" /> {d}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed mt-4 text-sm">{tour.overview}</p>
              </div>

              {/* Highlights */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-display text-xl font-bold text-slate-900 mb-4">Tour Highlights</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tour.highlights?.map((h: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(232,99,26,0.12)" }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-orange-500" />
                      </div>
                      <p className="text-sm text-slate-700">{h}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Itinerary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-display text-xl font-bold text-slate-900 mb-4">
                  Day-by-Day Itinerary
                </h2>
                <div className="space-y-3">
                  {tour.itinerary?.map((day: any) => (
                    <div
                      key={day.day}
                      className="border border-slate-100 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenDay(openDay === day.day ? null : day.day)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                            style={{ background: "var(--grad-saffron)" }}
                          >
                            {day.day}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{day.title}</p>
                            {(day.location || day.meals) && (
                              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                                {day.location && (
                                  <>
                                    <MapPin className="w-3 h-3" />
                                    {day.location}
                                  </>
                                )}
                                {day.meals && (
                                  <>
                                    {day.location && <span className="mx-1">·</span>}
                                    <Utensils className="w-3 h-3" />
                                    {day.meals}
                                  </>
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        {openDay === day.day ? (
                          <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        )}
                      </button>
                      {openDay === day.day && (
                        <div className="border-t border-slate-100 px-4 pb-4 pt-3 bg-slate-50">
                          <ul className="space-y-2">
                            {day.activities ? day.activities.map((a: string, i: number) => (
                              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                                {a}
                              </li>
                            )) : day.description ? (
                              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                                {day.description}
                              </li>
                            ) : null}
                          </ul>
                          {day.overnight && (
                            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                              <Hotel className="w-3.5 h-3.5" />
                              Overnight: <span className="font-medium">{day.overnight}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions & Exclusions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-display text-xl font-bold text-slate-900 mb-4">
                  What's Included
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-sky-700 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Inclusions
                    </h3>
                    <ul className="space-y-2.5">
                      {tour.inclusions?.map((inc: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                          {inc}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-orange-600 mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Exclusions
                    </h3>
                    <ul className="space-y-2.5">
                      {tour.exclusions?.map((exc: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-500">
                          <XCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                          {exc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-xl font-bold text-slate-900">
                    Traveler Reviews
                  </h2>
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
                      style={{ background: "rgba(232,99,26,0.12)" }}
                    >
                      <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
                      <span className="font-bold text-orange-700">{tour.rating}</span>
                    </div>
                    <span className="text-sm text-slate-400">({tour.reviews} reviews)</span>
                  </div>
                </div>
                <div className="space-y-5">
                  {tour.reviewsList?.map((r: any, i: number) => (
                    <div
                      key={i}
                      className="pb-5 border-b border-slate-100 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={r.avatar}
                          alt={r.name}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{r.name}</p>
                              <p className="text-xs text-slate-400">{r.location} · {r.date}</p>
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: r.rating }).map((_, j) => (
                                <Star key={j} className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed mt-2 italic">
                            &ldquo;{r.text}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Booking Widget */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Price Card */}
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-3xl font-bold text-slate-900">
                      ₹{tour.price.toLocaleString("en-IN")}
                    </p>
                    <p className="text-slate-400 line-through text-sm">
                      ₹{tour.originalPrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mb-1">per person</p>
                  <p className="text-sm font-semibold text-sky-600 mb-4">
                    💰 You save ₹{savings.toLocaleString("en-IN")} per person
                  </p>

                  {/* Date Picker */}
                  <div className="mb-3">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                      Travel Date
                    </label>
                    <div className="border-2 border-slate-200 rounded-xl px-3 py-3 focus-within:border-orange-400 transition-colors flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
                      <CustomDatePicker
                        selected={travelDate}
                        onChange={(date) => setTravelDate(date)}
                        minDate={new Date()}
                        placeholderText="Select Date"
                        className="flex-1 text-sm font-medium text-slate-800 focus:outline-none bg-transparent cursor-pointer w-full"
                      />
                    </div>
                  </div>

                  {/* Persons */}
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">
                      Number of Persons
                    </label>
                    <div className="border-2 border-slate-200 rounded-xl px-3 py-3 focus-within:border-orange-400 transition-colors flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-500" />
                      <select
                        value={persons}
                        onChange={(e) => setPersons(Number(e.target.value))}
                        className="flex-1 text-sm font-medium text-slate-800 focus:outline-none bg-transparent appearance-none"
                      >
                        {Array.from({ length: tour.maxPersons }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>{n} person{n > 1 ? "s" : ""}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">₹{tour.price.toLocaleString("en-IN")} × {persons} person{persons > 1 ? "s" : ""}</span>
                      <span className="font-medium text-slate-900">₹{totalPrice.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">GST (5%)</span>
                      <span className="font-medium text-slate-900">₹{Math.round(totalPrice * 0.05).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="font-bold text-orange-600">₹{Math.round(totalPrice * 1.05).toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {!showBookingFlow ? (
                    <button 
                      onClick={() => {
                        if (!isSignedIn) {
                          alert("Please sign in to book a tour.");
                          // Note: In a real app we'd redirect to /sign-in, but alert works for now.
                        }
                        setShowBookingFlow(true);
                      }}
                      className="w-full btn-primary justify-center text-base py-3.5 rounded-xl mb-3 flex items-center"
                    >
                      Book This Tour
                    </button>
                  ) : (
                    <div className="bg-white border-2 border-sky-100 p-4 rounded-2xl mb-4 space-y-4 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                        <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: bookingStep === 1 ? '50%' : '100%' }}></div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2 mt-1">
                        <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                          {bookingStep === 1 ? <User className="w-4 h-4 text-sky-500" /> : <Shield className="w-4 h-4 text-emerald-500" />}
                          {bookingStep === 1 ? "Traveller Details" : "Review & Pay"}
                        </h4>
                        <button onClick={() => setShowBookingFlow(false)} className="text-slate-400 hover:text-slate-600">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>

                      {bookingStep === 1 && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Lead Guest Name *</label>
                            <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="John Doe" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-sky-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
                            <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="+91 9876543210" className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-sky-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">Special Requests</label>
                            <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} placeholder="e.g. Dietary requirements..." className="w-full border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:border-sky-500 h-16" />
                          </div>
                          <button 
                            disabled={!guestName || !guestPhone || !travelDate}
                            onClick={() => setBookingStep(2)}
                            className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 mt-2"
                          >
                            Continue
                          </button>
                          {!travelDate && <p className="text-xs text-red-500 text-center mt-1">Please select a travel date above.</p>}
                        </div>
                      )}

                      {bookingStep === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                            <p className="flex justify-between mb-1"><span className="text-slate-500">Tour:</span> <span className="font-semibold text-slate-800 text-right">{tour.title}</span></p>
                            <p className="flex justify-between mb-1"><span className="text-slate-500">Date:</span> <span className="font-semibold text-slate-800">{travelDate?.toDateString()}</span></p>
                            <p className="flex justify-between"><span className="text-slate-500">Guest:</span> <span className="font-semibold text-slate-800">{guestName}</span></p>
                          </div>

                          <div className="flex items-start gap-2.5 bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                            <input 
                              type="checkbox" 
                              id="policy" 
                              checked={agreedToPolicy} 
                              onChange={(e) => setAgreedToPolicy(e.target.checked)}
                              className="mt-1 flex-shrink-0 w-4 h-4 text-orange-600 rounded border-orange-300 focus:ring-orange-500" 
                            />
                            <label htmlFor="policy" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                              I agree to the <span className="text-orange-600 font-medium">Cancellation & Date Change Policy</span>. 
                              (Free cancellation up to 7 days before travel. Changes subject to availability.)
                            </label>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <button onClick={() => setBookingStep(1)} className="px-4 py-3 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50">
                              Back
                            </button>
                            <div className="flex-1">
                              {!agreedToPolicy ? (
                                <button disabled className="w-full bg-slate-200 text-slate-400 font-bold py-3.5 rounded-xl">
                                  Agree to continue
                                </button>
                              ) : (
                                <CheckoutButton 
                                  propertyId=""
                                  tourId={tour.id}
                                  pricePerNight={0}
                                  isLoggedIn={isSignedIn || false}
                                  checkIn={travelDate?.toISOString() || new Date().toISOString()}
                                  checkOut={travelDate ? new Date(travelDate.getTime() + (parseInt(tour.duration.split(' ')[0]) || 1) * 86400000).toISOString() : new Date().toISOString()}
                                  guests={persons}
                                  nights={parseInt(tour.duration.split(' ')[0]) || 1}
                                  guestName={guestName}
                                  guestPhone={guestPhone}
                                  specialRequests={specialRequests}
                                  baseAmount={Math.round(totalPrice * 1.05)}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <a 
                    href={`https://wa.me/916005888754?text=${encodeURIComponent(`Hello WanderKashmir, I would like to request a custom quote for the tour: *${tour.title}*.`)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full btn-secondary py-3 rounded-xl text-sm justify-center flex items-center"
                  >
                    Request Custom Quote
                  </a>

                  <p className="text-xs text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-sky-500" />
                    Free cancellation up to 7 days before travel
                  </p>
                </div>

                {/* Contact Support */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
                  <p className="font-semibold text-slate-900 mb-3">Need Help Planning?</p>
                  <p className="text-xs text-slate-500 mb-4">
                    Our Kashmir travel experts are available 24/7 to help customize this tour for you.
                  </p>
                  <div className="space-y-2">
                    <a
                      href="tel:+916005888754"
                      className="flex items-center gap-2.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-orange-300 hover:text-orange-600 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-orange-500" />
                      +91 60058 88754
                    </a>
                    <a 
                      href={`https://wa.me/916005888754?text=${encodeURIComponent(`Hello WanderKashmir, I need help planning my trip for ${tour.title}.`)}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-sky-50 border border-sky-200 rounded-xl text-sm text-sky-700 hover:bg-sky-100 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-sky-500" />
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                  <div className="space-y-2">
                    {[
                      "✓ Best price guarantee",
                      "✓ Instant booking confirmation",
                      "✓ Local expert guides included",
                      "✓ 24/7 on-trip support",
                    ].map((t) => (
                      <p key={t} className="text-xs text-orange-800 font-medium">
                        {t}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
