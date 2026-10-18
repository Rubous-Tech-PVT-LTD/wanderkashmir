"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Script from "next/script";
import {
  Calendar,
  ArrowRight,
  ShieldCheck,
  X,
  Loader2,
  CheckCircle2,
  Users,
  DoorOpen,
  Lock,
  Tag,
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  MessageCircle,
} from "lucide-react";
import { HotelConversionInfo, HotelRoomItem } from "./types";
import { validateStayPromoCodeAction } from "@/actions/stayBooking";

interface HotelBookingCTAProps {
  propertyId: string;
  conversion: HotelConversionInfo;
  hotelName: string;
  destinationHub: string;
  rooms?: HotelRoomItem[];
  selectedRoomId?: string | null;
  onSelectRoomId?: (roomId: string | null) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function HotelBookingCTA({
  propertyId,
  conversion,
  hotelName,
  destinationHub,
  rooms = [],
  selectedRoomId: controlledRoomId,
  onSelectRoomId,
  isOpen: controlledIsOpen,
  onOpenChange,
}: HotelBookingCTAProps) {
  // Modal visibility state (controlled or uncontrolled)
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsModalOpen = useCallback(
    (open: boolean) => {
      if (onOpenChange) onOpenChange(open);
      else setInternalIsOpen(open);
    },
    [onOpenChange]
  );

  // Active Room state (controlled or uncontrolled)
  const [internalRoomId, setInternalRoomId] = useState<string | null>(null);
  const activeRoomId = controlledRoomId !== undefined ? controlledRoomId : internalRoomId;
  const setActiveRoomId = useCallback(
    (id: string | null) => {
      if (onSelectRoomId) onSelectRoomId(id);
      else setInternalRoomId(id);
    },
    [onSelectRoomId]
  );

  // Step 1: Dates & Room Configuration
  const [checkIn, setCheckIn] = useState<string>("");
  const [checkOut, setCheckOut] = useState<string>("");
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [adults, setAdults] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);

  // Availability state
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>("");

  // Step 2: Guest Information
  const [guestName, setGuestName] = useState<string>("");
  const [guestPhone, setGuestPhone] = useState<string>("");
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [specialRequests, setSpecialRequests] = useState<string>("");
  const [otherGuests, setOtherGuests] = useState<{ name: string; age: string }[]>([]);

  // Promo Code State
  const [promoInput, setPromoInput] = useState<string>("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string>("");

  // Checkout & Payment State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Dates/Room, 2: Guests, 3: Review/Pay, 4: Confirmed
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    id: string;
    propertyName?: string;
    roomName?: string;
    checkIn?: string;
    checkOut?: string;
    amount?: number;
    guestName?: string;
  } | null>(null);

  // Set default dates on mount (tomorrow and 2 nights later)
  useEffect(() => {
    const today = new Date();
    const tmrw = new Date(today);
    tmrw.setDate(tmrw.getDate() + 1);
    const dayAfter = new Date(tmrw);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const fmt = (d: Date) => d.toISOString().split("T")[0];
    setCheckIn(fmt(tmrw));
    setCheckOut(fmt(dayAfter));

    // Restore saved guest info from previous session if available
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("wk_guest_name");
      const savedPhone = localStorage.getItem("wk_guest_phone");
      const savedEmail = localStorage.getItem("wk_guest_email");
      if (savedName) setGuestName(savedName);
      if (savedPhone) setGuestPhone(savedPhone);
      if (savedEmail) setGuestEmail(savedEmail);
    }
  }, []);

  // Set initial selected room if rooms exist and none is selected
  useEffect(() => {
    if (!activeRoomId && rooms.length > 0) {
      setActiveRoomId(rooms[0].id);
    }
  }, [rooms, activeRoomId, setActiveRoomId]);

  // Adjust otherGuests array when total guests count changes
  useEffect(() => {
    const totalGuests = adults + childrenCount;
    const extraCount = Math.max(0, totalGuests - 1);
    setOtherGuests((prev) => {
      if (prev.length === extraCount) return prev;
      if (prev.length < extraCount) {
        const toAdd = extraCount - prev.length;
        return [...prev, ...Array(toAdd).fill({ name: "", age: "" })];
      }
      return prev.slice(0, extraCount);
    });
  }, [adults, childrenCount]);

  // Calculate nights
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [checkIn, checkOut]);

  // Active selected room object
  const activeRoom = useMemo(() => {
    if (!activeRoomId) return rooms[0] || null;
    return rooms.find((r) => r.id === activeRoomId) || rooms[0] || null;
  }, [activeRoomId, rooms]);

  // Unit rate per night
  const pricePerNight = useMemo(() => {
    if (activeRoom && typeof activeRoom.basePrice === "number") {
      return activeRoom.basePrice;
    }
    return conversion.startingPrice || 0;
  }, [activeRoom, conversion.startingPrice]);

  // Proven V1 Financial Calculations:
  // Base Price = Rate * Nights * Rooms
  const basePrice = useMemo(() => {
    return Math.round(pricePerNight * nights * roomsCount);
  }, [pricePerNight, nights, roomsCount]);

  // Promo Discount
  const discountAmount = useMemo(() => {
    if (!discountPercent || discountPercent <= 0) return 0;
    return Math.round((basePrice * discountPercent) / 100);
  }, [basePrice, discountPercent]);

  const discountedSubtotal = useMemo(() => {
    return Math.max(0, basePrice - discountAmount);
  }, [basePrice, discountAmount]);

  // Exact V1 Formula: 15% Platform & Convenience Fee
  const platformFee = useMemo(() => {
    return Math.round(discountedSubtotal * 0.15);
  }, [discountedSubtotal]);

  // Total Final Amount
  const totalAmount = useMemo(() => {
    return discountedSubtotal + platformFee;
  }, [discountedSubtotal, platformFee]);

  // Live Availability Check (Debounced)
  useEffect(() => {
    if (!checkIn || !checkOut || !propertyId) return;

    let isMounted = true;
    setIsCheckingAvailability(true);
    setIsAvailable(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/stays/${encodeURIComponent(propertyId)}/check?in=${encodeURIComponent(checkIn)}&out=${encodeURIComponent(checkOut)}&rooms=${roomsCount}`
        );
        if (!res.ok) {
          if (isMounted) {
            setIsAvailable(true); // Fallback to allow booking review if network error
            setIsCheckingAvailability(false);
          }
          return;
        }

        const data = await res.json();
        if (isMounted) {
          setIsAvailable(data.available);
          if (data.available) {
            setAvailabilityMessage("Rooms are available for your selected dates");
          } else {
            setAvailabilityMessage("Sold out for these dates. Please try different dates.");
          }
          setIsCheckingAvailability(false);
        }
      } catch (err) {
        if (isMounted) {
          setIsAvailable(true);
          setIsCheckingAvailability(false);
        }
      }
    }, 450);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [propertyId, checkIn, checkOut, roomsCount, activeRoomId]);

  // Promo Code Validation Handler
  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    setPromoError("");

    const res = await validateStayPromoCodeAction(promoInput.trim().toUpperCase(), propertyId);
    if (res.success && typeof res.discountPercent === "number") {
      setAppliedPromo(promoInput.trim().toUpperCase());
      setDiscountPercent(res.discountPercent);
      setPromoInput("");
    } else {
      setPromoError(res.error || "Invalid promo code");
    }
    setIsApplyingPromo(false);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setDiscountPercent(0);
    setPromoError("");
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToGuests = () => {
    if (!checkIn || !checkOut) return;
    setPaymentError(null);
    setStep(2);
  };

  // Step 2 Validation -> Proceed to Step 3
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || guestName.trim().length < 2) {
      setPaymentError("Please enter your full name (minimum 2 characters).");
      return;
    }
    const digits = guestPhone.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      setPaymentError("Please enter a valid phone or WhatsApp number (8-15 digits).");
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("wk_guest_name", guestName.trim());
      localStorage.setItem("wk_guest_phone", guestPhone.trim());
      if (guestEmail.trim()) localStorage.setItem("wk_guest_email", guestEmail.trim());
    }

    setPaymentError(null);
    setStep(3);
  };

  // Step 3: Initiate Razorpay Payment & Booking Confirmation
  const handleCheckoutPayment = async () => {
    setIsProcessingPayment(true);
    setPaymentError(null);

    try {
      // 1. Create Order on Server
      const res = await fetch("/api/stays/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          roomTypeId: activeRoom?.id || undefined,
          checkIn,
          checkOut,
          rooms: roomsCount,
          adults,
          childrenCount,
          guestName: guestName.trim(),
          guestPhone: guestPhone.trim(),
          guestEmail: guestEmail.trim() || undefined,
          specialRequests: specialRequests.trim() || undefined,
          otherGuests: otherGuests.filter((g) => g.name.trim()),
          promoCode: appliedPromo || undefined,
        }),
      });

      const orderData = await res.json();

      if (!res.ok || orderData.error) {
        setPaymentError(orderData.error || "Failed to initialize payment order. Please try again.");
        setIsProcessingPayment(false);
        return;
      }

      // Check if Razorpay script is ready
      if (typeof window === "undefined" || !(window as any).Razorpay) {
        setPaymentError("Payment gateway SDK is loading. Please try again in a few moments.");
        setIsProcessingPayment(false);
        return;
      }

      // Resolve theme color for Razorpay modal
      let seasonPrimaryColor = "#D62828";
      if (typeof window !== "undefined") {
        const computed = getComputedStyle(document.documentElement).getPropertyValue("--season-primary").trim();
        if (computed) seasonPrimaryColor = computed;
      }

      // 2. Initialize Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "WanderKashmir",
        description: `Stay Reservation at ${hotelName}`,
        order_id: orderData.orderId,
        prefill: {
          name: guestName.trim(),
          contact: guestPhone.trim(),
          email: guestEmail.trim() || undefined,
        },
        theme: {
          color: seasonPrimaryColor,
        },
        handler: async function (response: any) {
          try {
            // 3. Verify Payment Signature
            const verifyRes = await fetch("/api/stays/booking/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success && verifyData.booking) {
              setConfirmedBooking(verifyData.booking);
              setStep(4); // Advance to confirmed success state
            } else {
              setPaymentError(verifyData.error || "Payment verification failed. Please contact our support team.");
            }
          } catch (verifyErr) {
            console.error("Verification error:", verifyErr);
            setPaymentError("Network error during payment verification. Please check your bank statement.");
          } finally {
            setIsProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on("payment.failed", function (response: any) {
        setPaymentError(response.error?.description || "Payment was declined or cancelled.");
        setIsProcessingPayment(false);
      });
      rzpInstance.open();
    } catch (err: any) {
      console.error("Booking checkout error:", err);
      setPaymentError(err.message || "An unexpected error occurred during checkout.");
      setIsProcessingPayment(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (step === 4) {
      setStep(1);
    }
  };

  const contactPhone = conversion.phone || "+916005888754";
  const cleanPhone = contactPhone.replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent(
    `Hello WanderKashmir, I would like to book "${hotelName}" in ${destinationHub} from ${checkIn} to ${checkOut} (${nights} nights).`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone}?text=${whatsappMessage}`;

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* 1. Large In-Page Conversion Block (V2 UI Preserved) */}
      <section id="booking" className="scroll-mt-28">
        <div className="rounded-3xl border border-[var(--season-border,#E5E7EB)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 lg:p-10 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--season-primary)]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Direct Host Verification</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white">
              Reserve Your Stay at {hotelName}
            </h2>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-sans">
              Enjoy verified tariffs with zero agent markups. Book directly online with instant confirmation or connect with our Srinagar concierge team.
            </p>

            {/* Price & Action Row */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-white/60">Starting Tariff</div>
                <div className="flex items-baseline gap-1.5">
                  {pricePerNight > 0 ? (
                    <>
                      <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                        ₹{pricePerNight.toLocaleString()}
                      </span>
                      <span className="text-xs text-white/70">/ night</span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-white font-display">Rates On Request</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {/* Core Requirement 1: Label changed strictly to "Book Now" */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="py-3 px-6 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
                  style={{ backgroundColor: "var(--season-primary)" }}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-950" />
                  <span>WhatsApp Concierge</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mobile Sticky Bottom Bar (V2 UI Preserved) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[var(--season-border,#E5E7EB)] p-3 px-4 shadow-lg flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Starting from</div>
          <div className="text-base font-extrabold text-slate-900 font-display">
            {pricePerNight > 0 ? `₹${pricePerNight.toLocaleString()}` : "On Request"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 cursor-pointer"
            aria-label="Chat on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>

          {/* Core Requirement 1: Label changed strictly to "Book Now" on mobile bar */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="py-2.5 px-5 rounded-xl text-xs font-bold text-white shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            style={{ backgroundColor: "var(--season-primary)" }}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Now</span>
          </button>
        </div>
      </div>

      {/* 3. Multi-Step Hotel Booking Modal (Using V2 Design Tokens & Themes) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-[var(--season-border,#E5E7EB)] flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[var(--season-border,#E5E7EB)] flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-5 rounded-full" style={{ backgroundColor: "var(--season-primary)" }} />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[var(--season-text,#111827)] font-display tracking-tight">
                    {step === 4 ? "Reservation Confirmed" : `Book Stay at ${hotelName}`}
                  </h3>
                  {step !== 4 && (
                    <div className="text-[11px] text-[var(--season-muted,#6B7280)] font-medium">
                      Step {step} of 3 • {step === 1 ? "Dates & Rooms" : step === 2 ? "Guest Details" : "Review & Pay"}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
              {paymentError && (
                <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}

              {/* STEP 1: DATES, ROOM & GUESTS */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Selected Room Pill */}
                  {rooms.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-[var(--season-text,#374151)] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <DoorOpen className="w-3.5 h-3.5 text-[var(--season-primary)]" />
                        <span>Room Tier</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {rooms.map((rm) => {
                          const isSelected = activeRoomId === rm.id;
                          return (
                            <button
                              key={rm.id}
                              type="button"
                              onClick={() => setActiveRoomId(rm.id)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                                isSelected
                                  ? "border-[var(--season-primary)] bg-[var(--season-primary-light,#FFF7ED)] ring-1 ring-[var(--season-primary)]"
                                  : "border-[var(--season-border,#E5E7EB)] bg-white hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-slate-900 font-display line-clamp-1">
                                  {rm.name}
                                </span>
                                {isSelected && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 font-medium">
                                ₹{rm.basePrice.toLocaleString()}/night • Up to {rm.capacity} guests
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Dates Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--season-text,#374151)] mb-1">
                        Check-in Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        value={checkIn}
                        onChange={(e) => {
                          const newIn = e.target.value;
                          setCheckIn(newIn);
                          if (newIn && checkOut && newIn >= checkOut) {
                            const d = new Date(newIn);
                            d.setDate(d.getDate() + 1);
                            setCheckOut(d.toISOString().split("T")[0]);
                          }
                        }}
                        className="w-full rounded-xl border border-[var(--season-border,#E5E7EB)] p-2.5 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)] bg-white text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--season-text,#374151)] mb-1">
                        Check-out Date <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="date"
                        min={checkIn || todayStr}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full rounded-xl border border-[var(--season-border,#E5E7EB)] p-2.5 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)] bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Rooms & Guests */}
                  <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl border border-[var(--season-border,#E5E7EB)] bg-slate-50/50">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Rooms</label>
                      <select
                        value={roomsCount}
                        onChange={(e) => setRoomsCount(parseInt(e.target.value, 10))}
                        className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num} Room{num > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Adults (12+)</label>
                      <select
                        value={adults}
                        onChange={(e) => setAdults(parseInt(e.target.value, 10))}
                        className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                          <option key={num} value={num}>
                            {num} Adult{num > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Children (0-11)</label>
                      <select
                        value={childrenCount}
                        onChange={(e) => setChildrenCount(parseInt(e.target.value, 10))}
                        className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none"
                      >
                        {[0, 1, 2, 3, 4].map((num) => (
                          <option key={num} value={num}>
                            {num} Child{num > 1 ? "ren" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Live Availability Feedback */}
                  <div className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-1.5">
                      {isCheckingAvailability ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--season-primary)]" />
                          <span className="text-slate-500 font-medium">Checking live room availability...</span>
                        </>
                      ) : isAvailable === true ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">{availabilityMessage}</span>
                        </>
                      ) : isAvailable === false ? (
                        <>
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                          <span className="text-rose-700 font-semibold">{availabilityMessage}</span>
                        </>
                      ) : null}
                    </div>

                    <div className="font-semibold text-slate-700 font-display text-right">
                      {nights} Night{nights > 1 ? "s" : ""} • ₹{basePrice.toLocaleString()}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleProceedToGuests}
                    disabled={isCheckingAvailability || isAvailable === false || pricePerNight <= 0}
                    className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "var(--season-primary)" }}
                  >
                    <span>Continue to Guest Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: GUEST DETAILS */}
              {step === 2 && (
                <form onSubmit={handleProceedToReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lead Guest Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full rounded-xl border border-[var(--season-border,#E5E7EB)] p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)] text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone / WhatsApp <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full rounded-xl border border-[var(--season-border,#E5E7EB)] p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)] text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="For booking receipt"
                        className="w-full rounded-xl border border-[var(--season-border,#E5E7EB)] p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)] text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Special Requests (Optional)</label>
                    <textarea
                      rows={2}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="e.g. Late check-in, heater confirmation, quiet room..."
                      className="w-full rounded-xl border border-[var(--season-border,#E5E7EB)] p-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)] text-slate-900"
                    />
                  </div>

                  {otherGuests.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="text-xs font-bold text-slate-700">Other Accompanying Guests ({otherGuests.length})</div>
                      {otherGuests.map((g, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={g.name}
                            onChange={(e) => {
                              const arr = [...otherGuests];
                              arr[idx] = { ...arr[idx], name: e.target.value };
                              setOtherGuests(arr);
                            }}
                            placeholder={`Guest ${idx + 2} Name`}
                            className="flex-1 rounded-lg border border-slate-200 p-2 text-xs text-slate-900"
                          />
                          <input
                            type="number"
                            value={g.age}
                            onChange={(e) => {
                              const arr = [...otherGuests];
                              arr[idx] = { ...arr[idx], age: e.target.value };
                              setOtherGuests(arr);
                            }}
                            placeholder="Age"
                            className="w-20 rounded-lg border border-slate-200 p-2 text-xs text-slate-900"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="py-3 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                      style={{ backgroundColor: "var(--season-primary)" }}
                    >
                      <span>Continue to Review & Pay</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: REVIEW SUMMARY & CHECKOUT */}
              {step === 3 && (
                <div className="space-y-4">
                  {/* Summary Card */}
                  <div className="p-4 rounded-xl border border-[var(--season-border,#E5E7EB)] bg-slate-50/70 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--season-text,#111827)] font-display">
                        {hotelName}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">{destinationHub}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 border-t border-slate-200/60 pt-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Check-in</span>
                        <span className="font-semibold text-slate-900">{checkIn}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Check-out</span>
                        <span className="font-semibold text-slate-900">{checkOut}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Room</span>
                        <span className="font-semibold text-slate-900">{activeRoom?.name || "Standard Room"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Stay Configuration</span>
                        <span className="font-semibold text-slate-900">
                          {nights} Night{nights > 1 ? "s" : ""}, {roomsCount} Room{roomsCount > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 border-t border-slate-200/60 pt-2 flex items-center justify-between">
                      <span>Lead Guest: <strong className="text-slate-900">{guestName}</strong></span>
                      <span>Phone: <strong className="text-slate-900">{guestPhone}</strong></span>
                    </div>
                  </div>

                  {/* Pricing Breakdown Card */}
                  <div className="p-4 rounded-xl border border-[var(--season-border,#E5E7EB)] bg-white space-y-2 text-xs">
                    <div className="font-bold text-slate-900 text-xs pb-1.5 border-b border-slate-100 flex items-center justify-between">
                      <span>Price Breakdown</span>
                      <span className="text-[10px] text-slate-400 font-normal">All taxes included</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>
                        Room Tariff ({nights} night{nights > 1 ? "s" : ""} × {roomsCount} room{roomsCount > 1 ? "s" : ""})
                      </span>
                      <span className="font-medium text-slate-900">₹{basePrice.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Convenience & Platform Fee (15%)</span>
                      <span className="font-medium text-slate-900">₹{platformFee.toLocaleString()}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          Promo Code Discount ({discountPercent}%)
                        </span>
                        <span>-₹{discountAmount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm sm:text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200 font-display">
                      <span>Total Amount To Pay</span>
                      <span style={{ color: "var(--season-primary)" }}>₹{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Promo Code Input */}
                  <div>
                    {appliedPromo ? (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Tag className="w-3.5 h-3.5" />
                          Code &apos;{appliedPromo}&apos; applied (-{discountPercent}%)
                        </span>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                            placeholder="Enter Promo Code"
                            className="flex-1 rounded-xl border border-[var(--season-border,#E5E7EB)] px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:ring-1 focus:ring-[var(--season-primary)]"
                          />
                          <button
                            type="button"
                            onClick={handleApplyPromo}
                            disabled={isApplyingPromo || !promoInput.trim()}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            {isApplyingPromo ? "..." : "Apply"}
                          </button>
                        </div>
                        {promoError && <p className="text-rose-600 text-[11px] font-medium">{promoError}</p>}
                      </div>
                    )}
                  </div>

                  {/* Checkout Button */}
                  <div className="space-y-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleCheckoutPayment}
                      disabled={isProcessingPayment || totalAmount <= 0}
                      className="w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: "var(--season-primary)" }}
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Securing Reservation...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Pay with Razorpay (₹{totalAmount.toLocaleString()})</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>100% Encrypted & Verified via Razorpay Official Gateway</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        ← Back to Guest Details
                      </button>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Pay via Concierge</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: CONFIRMATION SUCCESS STATE */}
              {step === 4 && confirmedBooking && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <h4 className="text-xl font-extrabold text-slate-900 font-display">
                      Reservation Confirmed!
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Your stay at <strong>{confirmedBooking.propertyName || hotelName}</strong> is verified.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-left text-xs space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                      <span className="text-slate-500">Booking Reference</span>
                      <span className="font-mono font-bold text-slate-900">
                        WK-STAY-{confirmedBooking.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Guest Name</span>
                      <span className="font-semibold text-slate-900">{confirmedBooking.guestName || guestName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Paid</span>
                      <span className="font-extrabold text-emerald-700">₹{confirmedBooking.amount?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 leading-relaxed max-w-sm mx-auto">
                    A booking confirmation has been issued. Please keep a valid government-issued photo ID handy for check-in as per J&K Tourism regulations.
                  </div>

                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full py-3 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer"
                    style={{ backgroundColor: "var(--season-primary)" }}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
