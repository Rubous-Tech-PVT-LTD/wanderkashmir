"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Sparkles, X, Check, Calendar, Users, MapPin, Hotel, Car, MessageSquare, Phone, Mail, User, ShieldCheck, ArrowRight } from "lucide-react";
import { createCustomTourRequest } from "@/actions/customTour";
import toast from "react-hot-toast";

const DESTINATIONS_LIST = [
  "Srinagar & Dal Lake",
  "Gulmarg Ski Resort",
  "Pahalgam Valley",
  "Sonamarg Glacier",
  "Doodhpathri Meadow",
  "Gurez Valley",
  "Houseboat Stay",
  "Betaab Valley & Aru",
];

const HOTEL_TYPES = [
  { id: "Budget / Homestay", label: "Budget / Homestay", desc: "Cozy local Kashmiri experience & value" },
  { id: "3 Star Standard", label: "3★ Deluxe Hotel", desc: "Comfortable rooms with scenic valley views" },
  { id: "4 Star Luxury", label: "4★ Luxury Resort", desc: "Premium amenities, heating & buffet dining" },
  { id: "5 Star Heritage", label: "5★ Heritage / Premium", desc: "Ultra-luxury stays & VIP hospitality" },
  { id: "Houseboat Special", label: "Dal Lake Houseboat", desc: "Iconic traditional wood-carved houseboat stay" },
];

const CAB_TYPES = [
  { id: "Sedan (Etios / Dzire)", label: "Sedan (Etios / Dzire)", desc: "Ideal for couples or 1-4 guests" },
  { id: "SUV (Innova Crysta / Ertiga)", label: "SUV (Innova Crysta / Ertiga)", desc: "Spacious & comfortable for family (up to 6 guests)" },
  { id: "Tempo Traveller", label: "Tempo Traveller", desc: "Best for groups of 7 to 15 guests" },
  { id: "No Cab Needed", label: "No Cab Needed", desc: "We have our own vehicle / Self-drive" },
];

export default function CustomizeTourModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"form" | "success">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [travelDates, setTravelDates] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(["Srinagar & Dal Lake", "Gulmarg Ski Resort", "Pahalgam Valley"]);
  const [hotelType, setHotelType] = useState("3 Star Standard");
  const [cabType, setCabType] = useState("SUV (Innova Crysta / Ertiga)");
  const [specialRequests, setSpecialRequests] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal opens so background page and searchbar don't move/overlap
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleDestination = (dest: string) => {
    if (selectedDestinations.includes(dest)) {
      if (selectedDestinations.length > 1) {
        setSelectedDestinations(selectedDestinations.filter((d) => d !== dest));
      } else {
        toast.error("Please keep at least one destination selected!");
      }
    } else {
      setSelectedDestinations([...selectedDestinations, dest]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter your Name and WhatsApp Phone Number.");
      return;
    }

    setIsSubmitting(true);
    const guestsCount = `${adults} Adult${adults > 1 ? "s" : ""}${children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}`;

    const res = await createCustomTourRequest({
      name,
      phone,
      email,
      travelDates,
      guestsCount,
      destinations: selectedDestinations,
      hotelType,
      cabType,
      specialRequests,
    });

    setIsSubmitting(false);
    if (res.success) {
      setStep("success");
      toast.success("Custom Tour Request sent successfully!");
    } else {
      toast.error(res.error || "Something went wrong. Please try again.");
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (step === "success") {
      setTimeout(() => {
        setStep("form");
        setName("");
        setPhone("");
        setEmail("");
        setSpecialRequests("");
      }, 300);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white px-6 py-3 rounded-full font-bold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30 transform hover:-translate-y-0.5 border border-orange-400/30 group cursor-pointer relative z-30"
      >
        <Sparkles className="w-5 h-5 animate-pulse text-amber-200" />
        <span>Customize Your Tour Package</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>

      {/* Modal Overlay via React Portal to escape parent CSS stacking contexts (z-index bugs) */}
      {isOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleClose}
        >
          <div 
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in zoom-in-95 duration-300 text-slate-800 flex flex-col max-h-[92vh] sm:max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 sm:p-7 text-white shrink-0">
              <button
                type="button"
                onClick={handleClose}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2 sm:mb-3">
                <Sparkles className="w-3.5 h-3.5" /> 100% Tailor-Made Kashmir Trips
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                Craft Your Dream Kashmir Package
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl">
                Tell us your preferences! Our local Kashmir specialists will design a custom itinerary with private cabs, verified hotels & guaranteed lowest rates.
              </p>
            </div>

            {/* Modal Body - Scrollable Area */}
            {step === "form" ? (
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 custom-scrollbar">
                
                {/* 1. Travelers & Dates */}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-orange-500" /> 1. When are you traveling?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Travel Dates / Month</label>
                      <input
                        type="text"
                        placeholder="e.g. 15-20 Oct / Next Month"
                        value={travelDates}
                        onChange={(e) => setTravelDates(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-slate-50 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Adults (12+ yrs)</label>
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700">-</button>
                        <span className="flex-1 text-center font-bold text-sm text-slate-800">{adults}</span>
                        <button type="button" onClick={() => setAdults(adults + 1)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700">+</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Children (Under 12)</label>
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700">-</button>
                        <span className="flex-1 text-center font-bold text-sm text-slate-800">{children}</span>
                        <button type="button" onClick={() => setChildren(children + 1)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700">+</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Destinations */}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-orange-500" /> 2. Which places do you want to visit?
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                    {DESTINATIONS_LIST.map((dest) => {
                      const isSelected = selectedDestinations.includes(dest);
                      return (
                        <button
                          key={dest}
                          type="button"
                          onClick={() => toggleDestination(dest)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all text-xs sm:text-sm font-semibold cursor-pointer ${
                            isSelected
                              ? "bg-orange-50 border-orange-500 text-orange-950 shadow-sm ring-1 ring-orange-500"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <span className="truncate">{dest}</span>
                          {isSelected && <Check className="w-4 h-4 text-orange-600 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Hotel Preference */}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Hotel className="w-4 h-4 text-orange-500" /> 3. Select Hotel Category
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {HOTEL_TYPES.map((type) => {
                      const isSelected = hotelType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setHotelType(type.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-orange-50/80 border-orange-500 text-orange-950 shadow-sm ring-1 ring-orange-500"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <div className="font-bold text-xs sm:text-sm flex items-center justify-between">
                            {type.label}
                            {isSelected && <Check className="w-4 h-4 text-orange-600" />}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">{type.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Cab Preference */}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Car className="w-4 h-4 text-orange-500" /> 4. Private Cab Preference
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {CAB_TYPES.map((type) => {
                      const isSelected = cabType === type.id;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setCabType(type.id)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "bg-orange-50/80 border-orange-500 text-orange-950 shadow-sm ring-1 ring-orange-500"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <div className="font-bold text-xs sm:text-sm flex items-center justify-between">
                            {type.label}
                            {isSelected && <Check className="w-3.5 h-3.5 text-orange-600" />}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">{type.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Contact Info */}
                <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-orange-500" /> 5. Where should we send your quote?
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Phone Number <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Special Requests or Notes (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. We are celebrating our anniversary, need vegetarian Wazwan, prefer Shikara ride at sunset..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                    <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                    <span>Your contact details are 100% private. We never share your data with spam call centers.</span>
                  </div>
                </div>

                {/* Sticky Footer for Form Submit */}
                <div className="sticky bottom-0 bg-white pt-4 pb-1 border-t border-slate-100 flex items-center justify-end gap-3 -mx-5 px-5 sm:-mx-7 sm:px-7 -mb-2 mt-4 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-7 py-3 rounded-full font-bold text-xs sm:text-sm hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/30 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Get Free Quote on WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Success Screen */
              <div className="flex-1 overflow-y-auto p-6 sm:p-10 text-center space-y-5 custom-scrollbar my-auto">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Custom Tour Request Sent! 🎉
                  </h4>
                  <p className="text-slate-600 max-w-md mx-auto text-xs sm:text-sm leading-relaxed">
                    Thank you, <span className="font-bold text-slate-900">{name}</span>! Our Kashmir travel specialists have received your requirements and are preparing your tailored itinerary and price quote.
                  </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3.5 max-w-md mx-auto text-left flex items-start gap-2.5">
                  <Phone className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-orange-950">
                    <p className="font-bold">What happens next?</p>
                    <p className="mt-0.5 text-orange-800 leading-snug">
                      We will contact you on <span className="font-semibold underline">{phone}</span> via WhatsApp / Phone within 2 hours with a comprehensive itinerary & best hotel options.
                    </p>
                  </div>
                </div>
                <div className="pt-2 pb-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="bg-slate-900 text-white px-7 py-3 rounded-full font-bold text-xs sm:text-sm hover:bg-slate-800 transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Back to Explore Kashmir</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        ,
        document.body
      )}
    </>
  );
}
