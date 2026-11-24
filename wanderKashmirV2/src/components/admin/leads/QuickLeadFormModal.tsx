"use client";

import React, { useState } from "react";
import {
  Plus,
  CheckCircle2,
  Loader2,
  Phone,
  User,
  Calendar,
  Users,
  MessageSquare,
} from "lucide-react";
import { createAdminLeadAction } from "@/actions/adminLeads";
import { useRouter } from "next/navigation";
import { AdminModal } from "@/components/admin/ui";

const COMMON_DESTINATIONS = ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg", "Doodhpathri"];
const QUICK_GUEST_OPTIONS = ["Couple (2 Adults)", "Family (2+1)", "Family (2+2)", "Group (4-6)"];
const QUICK_DURATION_OPTIONS = ["4D/3N", "5D/4N", "6D/5N", "7D/6N", "Upcoming"];

export default function QuickLeadFormModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRef, setCreatedRef] = useState<string | null>(null);

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
      setError("Please enter a valid phone or WhatsApp number.");
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
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--season-primary)] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[var(--season-primary-hover)] cursor-pointer"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add WhatsApp Lead</span>
      </button>

      <AdminModal
        open={isOpen}
        onClose={handleClose}
        title="Add WhatsApp Lead"
        subtitle="Record a direct phone or WhatsApp customer inquiry."
        maxWidth="lg"
      >
        {createdRef ? (
          <div className="py-4 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--season-primary-light)] border border-[var(--season-primary)]/25 text-[var(--season-primary-hover)]">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-semibold text-slate-900">Lead saved</h4>
              <p className="text-xs text-slate-500">
                The inquiry has been added to the leads pipeline.
              </p>
              <div className="pt-2">
                <span className="inline-block rounded-md bg-[var(--season-primary-light)] border border-[var(--season-primary)]/25 px-3 py-1 font-mono text-xs font-semibold text-[var(--season-primary-hover)]">
                  Ref ID: {createdRef}
                </span>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Add Another Lead
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
              >
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Customer Name <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <User className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  WhatsApp / Phone <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Travel Duration / Dates</span>
                <span className="text-[11px] font-normal text-slate-400">Optional</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {QUICK_DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setTravelDates(opt)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      travelDates === opt
                        ? "bg-[var(--season-primary)] text-white shadow-xs"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Calendar className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={travelDates}
                  onChange={(e) => setTravelDates(e.target.value)}
                  placeholder="e.g. 15–20 May 2027 or 6 Days"
                  className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Number of Guests
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {QUICK_GUEST_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setGuestsCount(opt)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      guestsCount === opt
                        ? "bg-[var(--season-primary)] text-white shadow-xs"
                        : "border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <div className="relative">
                <Users className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                  placeholder="e.g. 2 Adults, 2 Children"
                  className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Destinations
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_DESTINATIONS.map((dest) => {
                  const isSelected = selectedDestinations.includes(dest);
                  return (
                    <button
                      key={dest}
                      type="button"
                      onClick={() => toggleDestination(dest)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium border transition-colors cursor-pointer ${
                        isSelected
                          ? "border-[var(--season-primary)]/30 bg-[var(--season-primary-light)] text-[var(--season-primary-hover)]"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {dest}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Hotel Category
                </label>
                <select
                  value={hotelType}
                  onChange={(e) => setHotelType(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
                >
                  <option value="3 Star Standard">3 Star Standard</option>
                  <option value="4 Star Premium">4 Star Premium</option>
                  <option value="5 Star Luxury">5 Star Luxury</option>
                  <option value="Dal Lake Houseboat">Houseboat Only</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  value={cabType}
                  onChange={(e) => setCabType(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[var(--season-primary)] focus:outline-hidden"
                >
                  <option value="Sedan / Etios">Sedan (Etios/Dzire)</option>
                  <option value="Sedan / SUV">SUV (Innova/Crysta)</option>
                  <option value="Tempo Traveller">Tempo Traveller</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Notes / WhatsApp Message <span className="font-normal text-slate-400">(Optional)</span>
              </label>
              <div className="relative">
                <MessageSquare className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Paste the customer's WhatsApp message or special requirements..."
                  className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[var(--season-primary)] focus:outline-hidden resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-[var(--season-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--season-primary-hover)] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Save Lead</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </AdminModal>
    </>
  );
}
