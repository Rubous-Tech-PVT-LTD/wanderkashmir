"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star, X, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import CheckoutButton from "./CheckoutButton";
import { useBookingStore } from "@/store/bookingStore";
import CustomDatePicker from "./CustomDatePicker";

interface BookingSidebarProps {
  propertyId: string;
  pricePerNight: number;
  rating: number;
  isLoggedIn: boolean;
}

export default function BookingSidebar({ propertyId, pricePerNight, rating, isLoggedIn }: BookingSidebarProps) {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState<number>(1);
  const [nights, setNights] = useState<number>(1);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const searchParams = useSearchParams();

  // Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<number>(1); // 1: Details, 2: Summary
  const [guestName, setGuestName] = useState<string>("");
  const [guestPhone, setGuestPhone] = useState<string>("");

  // Load saved details from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("wk_guest_name");
      const savedPhone = localStorage.getItem("wk_guest_phone");
      if (savedName) setGuestName(savedName);
      if (savedPhone) setGuestPhone(savedPhone);
    }
  }, []);
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [otherGuests, setOtherGuests] = useState<{name: string, age: string}[]>([]);

  // Add-ons State (from Zustand)
  const { selectedTaxiId, selectedGuideId, taxiAmount, guideAmount } = useBookingStore();

  // Adjust otherGuests array when guests count changes
  useEffect(() => {
    const diff = (guests - 1) - otherGuests.length;
    if (diff > 0) {
      setOtherGuests(prev => [...prev, ...Array(diff).fill({name: '', age: ''})]);
    } else if (diff < 0) {
      setOtherGuests(prev => prev.slice(0, guests - 1));
    }
  }, [guests]);

  // Close modal on success
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowModal(false);
    }
  }, [searchParams]);

  // Removed fetching addons since it's done on the server page now

  // Set default dates (tomorrow and day after)
  useEffect(() => {
    const today = new Date();
    const tmrw = new Date(today);
    tmrw.setDate(tmrw.getDate() + 1);
    const dayAfter = new Date(tmrw);
    dayAfter.setDate(dayAfter.getDate() + 2); // 2 nights default

    setCheckIn(tmrw);
    setCheckOut(dayAfter);
  }, []);

  // Calculate nights
  useEffect(() => {
    if (checkIn && checkOut) {
      const start = checkIn;
      const end = checkOut;
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setNights(diffDays);
      } else {
        setNights(1);
      }
    }
  }, [checkIn, checkOut]);

  // Check Availability logic
  useEffect(() => {
    const checkAvailability = async () => {
      if (!checkIn || !checkOut) return;
      setIsChecking(true);
      try {
        const inStr = checkIn.toISOString().split("T")[0];
        const outStr = checkOut.toISOString().split("T")[0];
        const res = await fetch(`/api/stays/${propertyId}/check?in=${inStr}&out=${outStr}`);
        const data = await res.json();
        setIsAvailable(data.available);
      } catch (error) {
        console.error("Availability check failed", error);
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    const debounceTimer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [propertyId, checkIn, checkOut]);

  const basePrice = pricePerNight * nights * guests;
  const platformFee = Math.round(basePrice * 0.15); // 15% Convenience & Platform Fee
  const totalAmount = basePrice + platformFee + (taxiAmount * nights) + (guideAmount * nights);

  return (
    <div className="sticky top-28 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6">
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-2xl font-black text-slate-900">₹{pricePerNight.toLocaleString('en-IN')}</span>
          <span className="text-slate-500 text-sm ml-1">/ night / guest</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium">
          <Star className="w-4 h-4 fill-slate-900 text-slate-900" /> {rating}
        </div>
      </div>

      <div className="border border-slate-300 rounded-xl mb-4 overflow-hidden divide-y divide-slate-300">
        <div className="flex divide-x divide-slate-300">
          <div className="flex-1 p-3">
            <label className="block text-[10px] font-bold uppercase text-slate-900 mb-1">Check-in</label>
            <CustomDatePicker 
              selected={checkIn}
              onChange={(date) => {
                setCheckIn(date);
                if (date && checkOut && date >= checkOut) {
                  const newOut = new Date(date);
                  newOut.setDate(newOut.getDate() + 1);
                  setCheckOut(newOut);
                }
              }}
              minDate={new Date()}
              placeholderText="Check-in"
              className="w-full text-sm outline-none text-slate-600 bg-transparent cursor-pointer" 
            />
          </div>
          <div className="flex-1 p-3">
            <label className="block text-[10px] font-bold uppercase text-slate-900 mb-1">Check-out</label>
            <CustomDatePicker 
              selected={checkOut}
              onChange={(date) => setCheckOut(date)}
              minDate={checkIn ? new Date(checkIn.getTime() + 86400000) : new Date()}
              placeholderText="Check-out"
              className="w-full text-sm outline-none text-slate-600 bg-transparent cursor-pointer" 
            />
          </div>
        </div>
        <div className="p-3">
          <label className="block text-[10px] font-bold uppercase text-slate-900 mb-1">Guests</label>
          <select 
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full text-sm outline-none bg-transparent text-slate-600"
          >
            {[...Array(20)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} guest{i === 0 ? '' : 's'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!isChecking && isAvailable === false && (
        <div className="bg-orange-50 text-orange-600 p-3 rounded-lg text-sm font-bold mb-4 text-center">
          Sold Out for these dates
        </div>
      )}

      {isAvailable === true ? (
        <button 
          onClick={() => setShowModal(true)}
          className="w-full bg-sky-600 text-white font-bold py-3.5 rounded-xl hover:bg-sky-700 transition-colors shadow-md"
        >
          Reserve
        </button>
      ) : (
        <button disabled className="w-full bg-slate-200 text-slate-400 font-bold py-3.5 rounded-xl transition-colors">
          {isChecking ? "Checking availability..." : "Not Available"}
        </button>
      )}
      
      <p className="text-center text-xs text-slate-500 mt-4">You won't be charged yet</p>

      <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
        <div className="flex justify-between text-slate-600 text-sm">
          <span className="underline decoration-slate-300">₹{pricePerNight.toLocaleString('en-IN')} x {nights} nights x {guests} guests</span>
          <span>₹{basePrice.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between text-slate-600 text-sm">
          <span className="underline decoration-slate-300">Convenience & Platform Fee</span>
          <span>₹{platformFee.toLocaleString('en-IN')}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center font-bold text-slate-900 text-lg">
        <span>Total Amount</span>
        <span>₹{totalAmount.toLocaleString('en-IN')}</span>
      </div>

      {/* Multi-Step Checkout Modal */}
      {showModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                {modalStep === 1 ? (
                  <>Step 1: Guest Details</>
                ) : (
                  <>Step 2: Review & Pay</>
                )}
              </h2>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {modalStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Lead Guest Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Special Requests (Optional)</label>
                    <textarea 
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Need an extra bed, arriving late, etc."
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                  </div>

                  {otherGuests.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="font-bold text-slate-700 mb-3 text-sm">Other Guests ({otherGuests.length})</h4>
                      {otherGuests.map((guest, idx) => (
                        <div key={idx} className="flex gap-3 mb-3">
                          <div className="flex-1">
                            <input 
                              type="text" 
                              value={guest.name}
                              onChange={(e) => {
                                const newArr = [...otherGuests];
                                newArr[idx] = { ...newArr[idx], name: e.target.value };
                                setOtherGuests(newArr);
                              }}
                              placeholder={`Guest ${idx + 2} Name`}
                              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                            />
                          </div>
                          <div className="w-24">
                            <input 
                              type="number" 
                              value={guest.age}
                              onChange={(e) => {
                                const newArr = [...otherGuests];
                                newArr[idx] = { ...newArr[idx], age: e.target.value };
                                setOtherGuests(newArr);
                              }}
                              placeholder="Age"
                              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-sky-500 outline-none text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <button 
                    onClick={() => {
                      if (!guestName || !guestPhone) {
                        alert("Please fill in Name and Phone Number");
                        return;
                      }
                      localStorage.setItem("wk_guest_name", guestName);
                      localStorage.setItem("wk_guest_phone", guestPhone);
                      setModalStep(2);
                    }}
                    className="w-full mt-4 bg-sky-600 text-white font-bold py-3.5 rounded-xl hover:bg-sky-700 transition-colors shadow-md"
                  >
                    Continue to Review
                  </button>
                </div>
              )}

              {modalStep === 2 && (
                <div className="space-y-6">
                  {/* ADD-ONS SUMMARY (Read-only) */}
                  {(selectedTaxiId || selectedGuideId) && (
                    <div className="bg-sky-50 border border-sky-100 p-4 rounded-xl space-y-3">
                      <h3 className="text-sm font-bold text-sky-900">Selected Add-ons</h3>
                      {selectedTaxiId && (
                        <div className="flex justify-between text-sm text-slate-700">
                          <span>Taxi / Cab Service</span>
                          <span className="font-bold">₹{taxiAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedGuideId && (
                        <div className="flex justify-between text-sm text-slate-700">
                          <span>Local Tour Guide</span>
                          <span className="font-bold">₹{guideAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">Booking Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Check-in</span>
                        <span className="font-semibold text-slate-900">{checkIn?.toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Check-out</span>
                        <span className="font-semibold text-slate-900">{checkOut?.toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Duration</span>
                        <span className="font-semibold text-slate-900">{nights} Nights</span>
                      </div>
                      <div>
                        <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Guests</span>
                        <span className="font-semibold text-slate-900">{guests} Guests</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Guest Name</span>
                      <span className="font-bold text-slate-900">{guestName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Contact</span>
                      <span className="font-bold text-slate-900">{guestPhone}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-lg font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Amount To Pay</span>
                    <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="pt-4 space-y-3">
                    <CheckoutButton 
                      propertyId={propertyId} 
                      pricePerNight={pricePerNight} 
                      isLoggedIn={isLoggedIn} 
                      checkIn={checkIn?.toISOString().split("T")[0] || ""}
                      checkOut={checkOut?.toISOString().split("T")[0] || ""}
                      guests={guests}
                      nights={nights}
                      guestName={guestName}
                      guestPhone={guestPhone}
                      specialRequests={specialRequests}
                      otherGuests={otherGuests}
                      baseAmount={basePrice + platformFee}
                      taxiAmount={taxiAmount * nights}
                      guideAmount={guideAmount * nights}
                      selectedTaxiId={selectedTaxiId}
                      selectedGuideId={selectedGuideId}
                    />
                    <button 
                      onClick={() => setModalStep(1)}
                      className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Back to Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
