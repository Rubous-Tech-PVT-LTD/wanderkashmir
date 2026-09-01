"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star, X, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import CheckoutButton from "./CheckoutButton";
import { useBookingStore } from "@/store/bookingStore";
import CustomDatePicker from "./CustomDatePicker";
import { validatePromoCode } from "@/actions/promo-codes";
import { Tag } from "lucide-react";

interface BookingSidebarProps {
  propertyId: string;
  pricePerNight: number;
  rating: number;
  isLoggedIn: boolean;
  propertyType?: string;
  maxGuests?: number;
}

export default function BookingSidebar({ propertyId, pricePerNight, rating, isLoggedIn, propertyType = "HOTEL", maxGuests = 2 }: BookingSidebarProps) {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [rooms, setRooms] = useState<number>(1);
  const [adults, setAdults] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [showGuestSelector, setShowGuestSelector] = useState<boolean>(false);
  const [nights, setNights] = useState<number>(1);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [availableRoomTypes, setAvailableRoomTypes] = useState<any[]>([]);
  // Add-ons & Room Selection State (from Zustand)
  const { 
    selectedTaxiId, selectedGuideId, taxiAmount, guideAmount,
    selectedRoomId, selectedRoomName, selectedMealPlan, roomBasePrice
  } = useBookingStore();

  // Removed local selectedRoomTypeId and dynamicPrice states
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const searchParams = useSearchParams();

  // Modal States
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalStep, setModalStep] = useState<number>(1); // 1: Details, 2: Summary
  const [guestName, setGuestName] = useState<string>("");
  const [guestPhone, setGuestPhone] = useState<string>("");

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

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

  // Adjust otherGuests array when total guests count changes
  useEffect(() => {
    const totalGuests = adults + childrenCount;
    const diff = (totalGuests - 1) - otherGuests.length;
    if (diff > 0) {
      setOtherGuests(prev => [...prev, ...Array(diff).fill({name: '', age: ''})]);
    } else if (diff < 0) {
      setOtherGuests(prev => prev.slice(0, Math.max(0, totalGuests - 1)));
    }
  }, [adults, childrenCount]);

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
        const res = await fetch(`/api/stays/${propertyId}/check?in=${inStr}&out=${outStr}&rooms=${rooms}`);
        const data = await res.json();
        setIsAvailable(data.available);
        setAvailableRoomTypes(data.availableRoomTypes || []);
        
        if (data.availableRoomTypes && data.availableRoomTypes.length > 0) {
          // Room availability verified
        } else {
          // Room not available
        }
      } catch (error) {
        console.error("Availability check failed", error);
        setIsAvailable(false);
      } finally {
        setIsChecking(false);
      }
    };

    const debounceTimer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [propertyId, checkIn, checkOut, rooms]);

  // If roomBasePrice exists (from Zustand), it represents the total for 1 room for 1 night
  // We multiply by number of nights and rooms.
  const basePrice = roomBasePrice !== null 
    ? roomBasePrice * nights * rooms
    : pricePerNight * nights * rooms;
  
  const displayPricePerNight = roomBasePrice !== null
    ? roomBasePrice
    : pricePerNight;
  
  const addonAmount = (taxiAmount * nights) + (guideAmount * nights);
  const subtotal = basePrice + addonAmount;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const discountedSubtotal = subtotal - discountAmount;

  const platformFee = Math.round(discountedSubtotal * 0.15); // 15% Convenience & Platform Fee
  const totalAmount = discountedSubtotal + platformFee;

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    setPromoError("");
    
    // Validate with server
    const res = await validatePromoCode(promoInput.trim().toUpperCase(), { propertyId });
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

  const handleAdultsChange = (newAdults: number) => {
    const totalGuests = newAdults + childrenCount;
    if (propertyType === "HOMESTAY" && totalGuests > maxGuests) {
      return;
    }
    setAdults(newAdults);
  };

  const handleChildrenChange = (newChildren: number) => {
    const totalGuests = adults + newChildren;
    if (propertyType === "HOMESTAY" && totalGuests > maxGuests) {
      return;
    }
    setChildrenCount(newChildren);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6">
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-2xl font-black text-slate-900">₹{displayPricePerNight.toLocaleString('en-IN')}</span>
          <span className="text-slate-500 text-sm ml-1">/ night avg</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-medium">
          <Star className="w-4 h-4 fill-slate-900 text-slate-900" /> {rating}
        </div>
      </div>

      {selectedRoomId && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-6">
          <div className="text-xs text-orange-600 font-bold uppercase mb-1">Selected Room</div>
          <div className="font-bold text-slate-900 text-sm">{selectedRoomName}</div>
          {selectedMealPlan && <div className="text-xs text-slate-600 mt-1">Meal Plan: <span className="font-semibold">{selectedMealPlan}</span></div>}
        </div>
      )}

      <div className="border border-slate-300 rounded-xl mb-4 divide-y divide-slate-300">
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
        <div className="p-3 relative">
          <label className="block text-[10px] font-bold uppercase text-slate-900 mb-1">Guests & Rooms</label>
          <button 
            type="button"
            className="w-full text-left text-sm outline-none bg-transparent text-slate-900 font-semibold flex items-center justify-between"
            onClick={() => setShowGuestSelector(!showGuestSelector)}
          >
            <span>{propertyType !== "HOMESTAY" ? `${rooms} Room${rooms > 1 ? 's' : ''}, ` : ''}{adults} Adult{adults > 1 ? 's' : ''}{childrenCount > 0 ? `, ${childrenCount} Child${childrenCount > 1 ? 'ren' : ''}` : ''}</span>
          </button>
          
          {showGuestSelector && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50">
              {/* Rooms */}
              {propertyType !== "HOMESTAY" && (
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-slate-800">Rooms</span>
                  <div className="flex items-center gap-3">
                    <button 
                      type="button"
                      onClick={() => setRooms(Math.max(1, rooms - 1))}
                      className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                    >-</button>
                    <span className="w-4 text-center font-bold text-sm">{rooms}</span>
                    <button 
                      type="button"
                      onClick={() => setRooms(rooms + 1)}
                      className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                    >+</button>
                  </div>
                </div>
              )}
              
              {/* Adults */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="block text-sm font-bold text-slate-800">Adults</span>
                  <span className="block text-xs text-slate-500">12+ Years Old</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => handleAdultsChange(Math.max(1, adults - 1))}
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                  >-</button>
                  <span className="w-4 text-center font-bold text-sm">{adults}</span>
                  <button 
                    type="button"
                    onClick={() => handleAdultsChange(adults + 1)}
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                  >+</button>
                </div>
              </div>
              
              {/* Children */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="block text-sm font-bold text-slate-800">Children</span>
                  <span className="block text-xs text-slate-500">0 - 11 Years Old</span>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => handleChildrenChange(Math.max(0, childrenCount - 1))}
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                  >-</button>
                  <span className="w-4 text-center font-bold text-sm">{childrenCount}</span>
                  <button 
                    type="button"
                    onClick={() => handleChildrenChange(childrenCount + 1)}
                    className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                  >+</button>
                </div>
              </div>
              
              <button 
                type="button"
                onClick={() => setShowGuestSelector(false)}
                className="w-full bg-orange-500 text-white font-bold py-2 rounded-lg mt-2 hover:bg-orange-500"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {!isChecking && isAvailable === false && (
        <div className="bg-orange-50 text-orange-600 p-3 rounded-lg text-sm font-bold mb-4 text-center">
          Sold Out for these dates
        </div>
      )}
      
      {!isChecking && isAvailable === true && availableRoomTypes.length > 0 && selectedRoomId && (
        <div className="mb-4">
          <div className="text-xs text-green-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" /> Selected room available for these dates
          </div>
        </div>
      )}

      {/* Checkout Button */}
      <div className="mt-6">
        <button
          onClick={() => {
            if (!checkIn || !checkOut) {
              const today = new Date();
              const tmrw = new Date(today);
              tmrw.setDate(tmrw.getDate() + 1);
              const dayAfter = new Date(tmrw);
              dayAfter.setDate(dayAfter.getDate() + 2);
              setCheckIn(tmrw);
              setCheckOut(dayAfter);
            }
            if (isAvailable !== false) {
              setShowModal(true);
            }
          }}
          disabled={isChecking || isAvailable === false || displayPricePerNight <= 0}
          className={`w-full font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all ${
            isAvailable === false || displayPricePerNight <= 0
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 active:scale-[0.99]"
          }`}
        >
          {isChecking ? "Checking..." : isAvailable === false ? "Sold Out" : "Continue"}
        </button>
      </div>
      
      <p className="text-center text-xs text-slate-500 mt-4">You won't be charged yet</p>

      <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
        {selectedRoomId && (
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">{selectedRoomName} {selectedMealPlan ? `(${selectedMealPlan})` : ''} x {rooms}</span>
            <span className="font-medium text-slate-900">₹{basePrice.toLocaleString('en-IN')}</span>
          </div>
        )}
        {!selectedRoomId && (
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">₹{displayPricePerNight.toLocaleString('en-IN')} x {nights} night{nights > 1 ? 's' : ''} x {rooms} room{rooms > 1 ? 's' : ''}</span>
            <span className="font-medium text-slate-900">₹{basePrice.toLocaleString('en-IN')}</span>
          </div>
        )}
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
                      className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                      className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Special Requests (Optional)</label>
                    <textarea 
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Need an extra bed, arriving late, etc."
                      rows={3}
                      className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
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
                              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
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
                              className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
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
                    className="w-full mt-4 bg-orange-500 text-white font-bold py-3.5 rounded-xl hover:bg-orange-500 transition-colors shadow-md"
                  >
                    Continue to Review
                  </button>
                </div>
              )}

              {modalStep === 2 && (
                <div className="space-y-6">
                  {/* ADD-ONS SUMMARY (Read-only) */}
                  {(selectedTaxiId || selectedGuideId) && (
                    <div className="bg-orange-500 border border-orange-500 p-4 rounded-xl space-y-3">
                      <h3 className="text-sm font-bold text-orange-500">Selected Add-ons</h3>
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
                      {propertyType !== "HOMESTAY" && (
                        <div>
                          <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Rooms</span>
                          <span className="font-semibold text-slate-900">{rooms} Rooms</span>
                        </div>
                      )}
                      <div>
                        <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Guests</span>
                        <span className="font-semibold text-slate-900">{adults + childrenCount} Guests</span>
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

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Price Breakdown</h3>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Base Price ({nights} nights)</span>
                      <span>₹{basePrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Convenience & Platform Fee</span>
                      <span>₹{platformFee.toLocaleString('en-IN')}</span>
                    </div>

                    {appliedPromo && (
                      <div className="flex justify-between text-emerald-600 text-sm font-bold mt-2 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" /> 
                          Discount ({discountPercent}%)
                        </span>
                        <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  {/* Promo Code Section */}
                  <div className="pt-2">
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
                      rooms={rooms}
                      adults={adults}
                      childrenCount={childrenCount}
                      nights={nights}
                      guestName={guestName}
                      guestPhone={guestPhone}
                      specialRequests={specialRequests}
                      otherGuests={otherGuests}
                      baseAmount={discountedSubtotal + platformFee}
                      taxiAmount={taxiAmount * nights}
                      guideAmount={guideAmount * nights}
                      selectedTaxiId={selectedTaxiId}
                      selectedGuideId={selectedGuideId}
                      promoCode={appliedPromo || undefined}
                      discountAmount={discountAmount}
                      roomTypeId={selectedRoomId || undefined}
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
