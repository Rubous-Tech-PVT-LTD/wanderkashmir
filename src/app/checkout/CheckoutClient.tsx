"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import CheckoutButton from "@/components/CheckoutButton";
import { CheckCircle2, ChevronRight, Car, UserCircle2, Info, Tag, X } from "lucide-react";
import CustomDatePicker from "@/components/CustomDatePicker";
import { validatePromoCode } from "@/actions/promo-codes";

export default function CheckoutClient({ 
  isLoggedIn, 
  checkoutData 
}: { 
  isLoggedIn: boolean;
  checkoutData: any;
}) {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get("success") === "true";

  // Guest Details
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  
  // Dates
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [nights, setNights] = useState<number>(1);
  const [guests, setGuests] = useState<number>(parseInt(searchParams.get("guests") || "1"));

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  // Load from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("wk_guest_name");
      const savedPhone = localStorage.getItem("wk_guest_phone");
      if (savedName) setGuestName(savedName);
      if (savedPhone) setGuestPhone(savedPhone);
    }
  }, []);

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const tmrw = new Date(today);
    tmrw.setDate(tmrw.getDate() + 1);
    
    setCheckIn(tmrw);
    if (checkoutData?.type === "guide") {
      setCheckOut(tmrw); // Same day by default for 1-day guide booking
    } else {
      setCheckOut(tmrw); // Same day for taxi by default
    }
  }, [checkoutData?.type]);

  // Calculate nights/days
  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn.toDateString()); // Reset time
      const end = new Date(checkOut.toDateString());
      const diffTime = Math.abs(end.getTime() - start.getTime());
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (checkoutData?.type === "guide") {
        // Inclusive days for guides: Start 10th, End 10th = 1 day. 10th to 11th = 2 days.
        diffDays += 1;
      }
      
      setNights(diffDays > 0 ? diffDays : 1);
    }
  }, [checkIn, checkOut, checkoutData?.type]);

  const addonGuide = searchParams.get("addonGuide") === "true";

  const [selectedGuideId, setSelectedGuideId] = useState<string>("");
  
  // Pre-select guide if addonGuide is true
  useEffect(() => {
    const isTour = checkoutData?.type === "tour";
    const availableGuides = checkoutData?.availableGuides;
    if (addonGuide && isTour && availableGuides && availableGuides.length > 0 && !selectedGuideId) {
      setSelectedGuideId(availableGuides[0].id);
    }
  }, [addonGuide, checkoutData, selectedGuideId]);

  if (isSuccess) {
    return (
      <div className="container-custom py-16 flex justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Booking Confirmed!</h1>
          <p className="text-slate-500 mb-8">
            Thank you for booking with WanderKashmir. Your booking details have been sent to your email.
          </p>
          <a href="/trips" className="btn-primary w-full inline-block text-center py-3">
            Go to My Bookings
          </a>
        </div>
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div className="container-custom py-16 text-center">
        <h1 className="text-2xl font-bold">Invalid Booking Request</h1>
        <p className="text-slate-500 mt-2">Missing required parameters.</p>
      </div>
    );
  }

  const { type, price, vehicleType, route, driverId, guide, tour, tourId, availableGuides } = checkoutData;
  const isTaxi = type === "taxi";
  const isGuide = type === "guide";
  const isTour = type === "tour";

  const selectedGuide = availableGuides?.find((g: any) => g.id === selectedGuideId);
  const guideRate = selectedGuide ? selectedGuide.pricePerDay : 0;
  
  // Extract days for tour
  const tourDaysMatch = isTour ? tour?.duration?.match(/(\d+)\s*Days?/i) : null;
  const tourDays = tourDaysMatch ? parseInt(tourDaysMatch[1]) : nights;
  
  // Price calculation
  const basePrice = (isGuide || isTour) ? price * (isTour ? guests : nights) : price; 
  const addonAmount = (isTour && selectedGuide) ? (guideRate * tourDays) : 0;
  
  const subtotal = basePrice + addonAmount;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const discountedSubtotal = subtotal - discountAmount;

  const platformFeeRate = 0.10; // 10% for Taxi, Tour, Guide
  const platformFee = Math.round(discountedSubtotal * platformFeeRate);
  
  const totalAmount = discountedSubtotal + platformFee;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    setPromoError("");
    
    // Validate with server
    const res = await validatePromoCode(promoInput.trim().toUpperCase(), { tourId: tour?.id });
    if (res.success && res.discountPercent) {
      setAppliedPromo(promoInput.trim().toUpperCase());
      setDiscountPercent(res.discountPercent);
      setPromoInput("");
    } else {
      setPromoError(res.error || "Invalid promo code");
    }
    setIsApplyingPromo(false);
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setDiscountPercent(0);
    setPromoError("");
  };

  let placeholderText = "e.g. Arriving late, ground floor room, etc.";
  if (isTaxi) {
    placeholderText = "e.g. Need a child seat, lots of luggage, etc.";
  } else if (isGuide) {
    placeholderText = "e.g. Traveling with elderly, prefer historical sites, language preference, etc.";
  }

  return (
    <div className="container-custom py-10">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Secure Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          {/* Guest Details Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Guest Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Lead Guest Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={guestName}
                  onChange={(e) => {
                    setGuestName(e.target.value);
                    localStorage.setItem("wk_guest_name", e.target.value);
                  }}
                  placeholder="e.g. John Doe"
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input 
                  type="tel" 
                  value={guestPhone}
                  onChange={(e) => {
                    setGuestPhone(e.target.value);
                    localStorage.setItem("wk_guest_phone", e.target.value);
                  }}
                  placeholder="e.g. +91 9876543210"
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Special Requests (Optional)</label>
                <textarea 
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder={placeholderText}
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
          </div>
          
          {/* Dates & Requirements */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Booking Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">{isTaxi ? "Travel Date" : "Start Date"} <span className="text-red-500">*</span></label>
                <CustomDatePicker 
                  selected={checkIn}
                  onChange={(date) => {
                    setCheckIn(date);
                    if (date && isGuide && checkOut && date > checkOut) {
                      setCheckOut(date);
                    } else if (date && !isGuide && checkOut && date >= checkOut) {
                      const newOut = new Date(date);
                      newOut.setDate(newOut.getDate() + 1);
                      setCheckOut(newOut);
                    } else if (date && isTaxi) {
                      setCheckOut(date);
                    }
                  }}
                  minDate={new Date()}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none text-slate-600 bg-transparent cursor-pointer" 
                />
              </div>
              {isGuide && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">End Date <span className="text-red-500">*</span></label>
                  <CustomDatePicker 
                    selected={checkOut}
                    onChange={(date) => setCheckOut(date)}
                    minDate={checkIn ? (isGuide ? checkIn : new Date(checkIn.getTime() + 86400000)) : new Date()}
                    className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none text-slate-600 bg-transparent cursor-pointer" 
                  />
                </div>
              )}
              <div className={isTaxi ? "md:col-span-1" : "md:col-span-2"}>
                <label className="block text-sm font-bold text-slate-700 mb-1">{isTaxi ? "Passengers" : "People in Group"} <span className="text-red-500">*</span></label>
                <select 
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none text-slate-600 bg-white"
                >
                  {[...Array(20)].map((_, i) => {
                    const num = i + 1;
                    return (
                      <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Tour Addons Section */}
          {isTour && availableGuides && availableGuides.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Enhance Your Tour</h2>
              <p className="text-sm text-slate-500 mb-6">Want a local expert? Select a certified guide for your {tourDays}-day trip.</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCircle2 className="w-5 h-5 text-orange-500" />
                  <h3 className="font-bold text-slate-900">Select Local Guide (Optional)</h3>
                </div>
                
                <select 
                  value={selectedGuideId} 
                  onChange={(e) => setSelectedGuideId(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-slate-700 font-medium cursor-pointer transition-all hover:border-slate-300"
                >
                  <option value="">No Guide Needed</option>
                  {availableGuides.map((g: any) => (
                    <option key={g.id} value={g.id}>
                      {g.vendorProfile?.businessName || "Certified Guide"} - ₹{g.pricePerDay}/day (+₹{g.pricePerDay * tourDays} total)
                    </option>
                  ))}
                </select>
                
                {selectedGuide && (
                  <div className="mt-3 p-4 bg-orange-500 border border-orange-500 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={selectedGuide.vendorProfile?.logoUrl || "https://placehold.co/100x100"} 
                        alt="Guide" 
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div>
                        <span className="block font-bold text-slate-900">{selectedGuide.vendorProfile?.businessName || "Certified Guide"}</span>
                        <span className="text-xs text-slate-500 line-clamp-1">{selectedGuide.languages}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-black text-orange-500">+₹{(guideRate * tourDays).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Booking Summary Sidebar */}
        <aside className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 pb-4 border-b border-slate-100">Booking Summary</h2>
            
            {/* Service Details */}
            <div className="mb-6 space-y-3">
              {isTaxi && (
                <>
                  <div>
                    <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Service Type</span>
                    <span className="font-semibold text-slate-900">Taxi Booking ({vehicleType})</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Route</span>
                    <span className="font-semibold text-slate-900">{route}</span>
                  </div>
                </>
              )}
              {isGuide && (
                <>
                  <div>
                    <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Service Type</span>
                    <span className="font-semibold text-slate-900">Local Guide ({guide?.vendorProfile?.businessName})</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Duration</span>
                    <span className="font-semibold text-slate-900">{nights} Day(s)</span>
                  </div>
                </>
              )}
              
              {isTour && (
                <>
                  <div>
                    <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Service Type</span>
                    <span className="font-semibold text-slate-900">Tour Package ({tour?.title})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Duration</span>
                      <span className="font-semibold text-slate-900">{tour?.duration}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Guests</span>
                      <span className="font-semibold text-slate-900">{guests}</span>
                    </div>
                  </div>
                </>
              )}
              
              <div className="pt-2 border-t border-slate-100 flex justify-between text-slate-600 text-sm">
                <span>Base Price {isGuide ? `x ${nights} days` : isTour ? `x ${guests} person(s)` : ''}</span>
                <span>₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              
              {isTour && selectedGuide && (
                <div className="flex justify-between text-slate-600 text-sm text-orange-500 font-medium mt-2">
                  <span>Guide Add-on ({tourDays} days)</span>
                  <span>+₹{(guideRate * tourDays).toLocaleString('en-IN')}</span>
                </div>
              )}

              {appliedPromo && (
                <div className="flex justify-between text-emerald-600 text-sm font-bold mt-2">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4" /> 
                    Discount ({discountPercent}%)
                  </span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 text-sm mt-2 pt-2 border-t border-slate-100">
                <span className="underline decoration-slate-300">Convenience & Platform Fee</span>
                <span>₹{platformFee.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Promo Code Section */}
            <div className="mb-6 pt-4 border-t border-slate-200">
              {appliedPromo ? (
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <div>
                      <p className="font-bold text-sm">'{appliedPromo}' Applied</p>
                      <p className="text-xs">You saved ₹{discountAmount.toLocaleString('en-IN')}!</p>
                    </div>
                  </div>
                  <button onClick={removePromo} className="text-emerald-700 hover:text-emerald-900 p-1">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1">
                    <Tag className="w-4 h-4" /> Have a Promo Code?
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none uppercase"
                    />
                    <button 
                      onClick={handleApplyPromo}
                      disabled={isApplyingPromo || !promoInput.trim()}
                      className="bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-800 transition-colors"
                    >
                      {isApplyingPromo ? "..." : "Apply"}
                    </button>
                  </div>
                  {promoError && <p className="text-red-500 text-xs mt-1 font-medium">{promoError}</p>}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center font-bold text-slate-900 text-lg mb-6">
              <span>Total Amount To Pay</span>
              <span>₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

            {(!guestName || !guestPhone) ? (
              <button 
                disabled
                className="w-full bg-slate-200 text-slate-400 font-bold py-3.5 rounded-xl transition-colors cursor-not-allowed"
              >
                Please fill guest details
              </button>
            ) : (
              <CheckoutButton 
                propertyId="" 
                pricePerNight={0} 
                isLoggedIn={isLoggedIn} 
                checkIn={checkIn?.toISOString().split("T")[0] || ""}
                checkOut={checkOut?.toISOString().split("T")[0] || ""}
                guests={guests}
                adults={guests}
                childrenCount={0}
                nights={nights}
                guestName={guestName}
                guestPhone={guestPhone}
                specialRequests={specialRequests}
                otherGuests={[]}
                tourId={tour?.id}
                baseAmount={discountedSubtotal + platformFee}
                taxiAmount={isTaxi ? basePrice : 0}
                guideAmount={isGuide ? basePrice : (isTour && selectedGuide ? guideRate * tourDays : 0)}
                selectedTaxiId={isTaxi ? driverId || "generic" : ""}
                selectedGuideId={isGuide ? checkoutData.guideId : (isTour && selectedGuide ? selectedGuide.id : "")}
                promoCode={appliedPromo || undefined}
                discountAmount={discountAmount}
              />
            )}
            
            <p className="text-center text-xs text-slate-500 mt-4">100% Secure Checkout via Razorpay</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
