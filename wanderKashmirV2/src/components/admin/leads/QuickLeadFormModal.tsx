"use client";

import React, { useState } from "react";
import {
  Plus,
  X,
  CheckCircle,
  Loader2,
  Phone,
  User,
  Calendar,
  Users,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { createAdminLeadAction } from "@/actions/adminLeads";
import { useRouter } from "next/navigation";

const COMMON_DESTINATIONS = ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg", "Doodhpathri"];
const QUICK_GUEST_OPTIONS = ["Couple (2 Adults)", "Family (2+1)", "Family (2+2)", "Group (4-6)"];
const QUICK_DURATION_OPTIONS = ["4D/3N", "5D/4N", "6D/5N", "7D/6N", "Upcoming"];

export default function QuickLeadFormModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRef, setCreatedRef] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [travelDates, setTravelDates] = useState("5D/4N");
  const [guestsCount, setGuestsCount] = useState("Couple (2 Adults)");
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([
    "Srinagar",
    "Gulmarg",
    "Pahalgam",
  ]);
  const [hotelType, setHotelType] = useState("3 Star Standard");
  const [cabType, setCabType] = useState("Sedan / SUV");
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setName("");
    setPhone("");
    setTravelDates("5D/4N");
    setGuestsCount("Couple (2 Adults)");
    setSelectedDestinations(["Srinagar", "Gulmarg", "Pahalgam"]);
    setHotelType("3 Star Standard");
    setCabType("Sedan / SUV");
    setNotes("");
    setError(null);
    setCreatedRef(null);
  };

  const handleOpen = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const toggleDestination = (dest: string) => {
    if (selectedDestinations.includes(dest)) {
      setSelectedDestinations(selectedDestinations.filter((d) => d !== dest));
    } else {
      setSelectedDestinations([...selectedDestinations, dest]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter customer name.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 8) {
      setError("Please enter a valid phone/WhatsApp number.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await createAdminLeadAction({
        name: name.trim(),
        phone: phone.trim(),
        travelDates: travelDates.trim(),
        guestsCount: guestsCount.trim(),
        destinations: selectedDestinations,
        hotelType,
        cabType,
        notes: notes.trim(),
        source: "WhatsApp Direct",
      });

      if (!res.success) {
        setError(res.error || "Failed to save lead.");
      } else {
        setCreatedRef(res.data?.referenceId || "SAVED");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Trigger Button - Optimized for Mobile & Desktop */}
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-emerald-500/20 active:scale-95 transition-all w-full sm:w-auto cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Add WhatsApp Lead</span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Quick WhatsApp Lead Entry
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Turant customer details database me save karein
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            {createdRef ? (
              /* Success View */
              <div className="p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Lead Successfully Saved!</h4>
                  <p className="text-xs text-slate-400">
                    Lead database me successfully store ho chuki hai.
                  </p>
                  <div className="pt-2">
                    <span className="inline-block px-3 py-1 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono text-xs font-semibold">
                      Ref ID: {createdRef}
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                  >
                    + Add Another Lead
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                  >
                    Done (View in Table)
                  </button>
                </div>
              </div>
            ) : (
              /* Form View */
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                  {error && (
                    <div className="p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-200 text-xs">
                      {error}
                    </div>
                  )}

                  {/* 1. Name & Phone (Mobile Priority) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Customer Name <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        WhatsApp / Mobile No. <span className="text-rose-400">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Dates & Duration Quick Chips */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                      <span>Travel Duration / Dates</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {QUICK_DURATION_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setTravelDates(opt)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            travelDates === opt
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={travelDates}
                        onChange={(e) => setTravelDates(e.target.value)}
                        placeholder="e.g. 15-20 May 2027 or 6 Days"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* 3. Number of Guests Quick Chips */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Number of Guests
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {QUICK_GUEST_OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setGuestsCount(opt)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            guestsCount === opt
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <Users className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(e.target.value)}
                        placeholder="e.g. 2 Adults, 2 Kids"
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* 4. Destinations Chips */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Destinations Interested
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_DESTINATIONS.map((dest) => {
                        const isSelected = selectedDestinations.includes(dest);
                        return (
                          <button
                            key={dest}
                            type="button"
                            onClick={() => toggleDestination(dest)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {dest}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 5. Hotel & Cab Type */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Hotel Category
                      </label>
                      <select
                        value={hotelType}
                        onChange={(e) => setHotelType(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                      >
                        <option value="3 Star Standard">3 Star Standard</option>
                        <option value="4 Star Premium">4 Star Premium</option>
                        <option value="5 Star Luxury">5 Star Luxury</option>
                        <option value="Dal Lake Houseboat">Houseboat Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Vehicle Type
                      </label>
                      <select
                        value={cabType}
                        onChange={(e) => setCabType(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                      >
                        <option value="Sedan / Etios">Sedan (Etios/Dzire)</option>
                        <option value="Sedan / SUV">SUV (Innova/Crysta)</option>
                        <option value="Tempo Traveller">Tempo Traveller</option>
                      </select>
                    </div>
                  </div>

                  {/* 6. Notes / Paste WhatsApp Message */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Notes / WhatsApp Message (Optional)
                    </label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="WhatsApp message ya customer ki specific requirements paste karein..."
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Save Lead to DB</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
