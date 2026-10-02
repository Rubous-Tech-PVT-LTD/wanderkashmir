"use client";

import React, { useState } from "react";
import { MessageCircle, Phone, Calendar, ArrowRight, ShieldCheck, X, Loader2 } from "lucide-react";
import { HotelConversionInfo } from "./types";
import { submitPropertyEnquiry } from "@/actions/propertyEnquiry";

interface HotelBookingCTAProps {
  propertyId: string;
  conversion: HotelConversionInfo;
  hotelName: string;
  destinationHub: string;
}

export default function HotelBookingCTA({
  propertyId,
  conversion,
  hotelName,
  destinationHub,
}: HotelBookingCTAProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dates, setDates] = useState("");
  const [guests, setGuests] = useState("2 Guests");

  const contactPhone = conversion.phone || "+916005888754";
  const cleanPhone = contactPhone.replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent(
    `Hello WanderKashmir, I would like to check room availability and enquire about "${hotelName}" in ${destinationHub}.`
  );
  const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone}?text=${whatsappMessage}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setSubmissionError("Please enter your name.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 8) {
      setSubmissionError("Please enter a valid phone number (at least 8-10 digits).");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const res = await submitPropertyEnquiry({
        propertyId,
        name: name.trim(),
        phone: phone.trim(),
        dates: dates.trim() || undefined,
        guests: guests.trim() || undefined,
      });

      if (res.success) {
        setReferenceId(res.referenceId || null);
        setSubmitted(true);
      } else {
        setSubmissionError(
          res.error || "Unable to send inquiry. Please try again or reach out on WhatsApp."
        );
      }
    } catch (err) {
      console.error("Error submitting stay inquiry:", err);
      setSubmissionError(
        "An unexpected error occurred. Please try again or message us on WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSubmissionError(null);
  };

  return (
    <>
      {/* 1. Large In-Page Conversion Block */}
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
              Enjoy verified tariffs with zero agent markups. Send an inquiry or connect instantly with our Srinagar concierge team for instant date confirmation.
            </p>

            {/* Price & Action Row */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <div className="text-[10px] uppercase font-bold text-white/60">
                  Starting Tariff
                </div>
                <div className="flex items-baseline gap-1.5">
                  {conversion.startingPrice ? (
                    <>
                      <span className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                        ₹{conversion.startingPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-white/70">/ {conversion.priceUnit}</span>
                    </>
                  ) : (
                    <span className="text-xl font-bold text-white font-display">
                      Rates On Request
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="py-3 px-5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs hover:scale-[1.02] transition-all flex items-center gap-2 cursor-pointer"
                  style={{ backgroundColor: "var(--season-primary)" }}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Send Availability Inquiry</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-950" />
                  <span>WhatsApp Inquiry</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mobile Sticky Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[var(--season-border,#E5E7EB)] p-3 px-4 shadow-lg flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] text-slate-500 uppercase font-semibold">Starting from</div>
          <div className="text-base font-extrabold text-slate-900 font-display">
            {conversion.startingPrice ? `₹${conversion.startingPrice.toLocaleString()}` : "On Request"}
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

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-2xs cursor-pointer"
            style={{ backgroundColor: "var(--season-primary)" }}
          >
            Check Availability
          </button>
        </div>
      </div>

      {/* 3. Availability Inquiry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              aria-label="Close inquiry modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    Inquire About {hotelName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Our local reservation team will verify room availability and reply within 15 minutes.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--season-primary)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--season-primary)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Approximate Dates
                      </label>
                      <input
                        type="text"
                        value={dates}
                        onChange={(e) => setDates(e.target.value)}
                        placeholder="e.g. 15-18 Oct"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-[var(--season-primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Guests
                      </label>
                      <select
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-[var(--season-primary)]"
                      >
                        <option>1 Guest</option>
                        <option>2 Guests</option>
                        <option>3 Guests</option>
                        <option>4+ Family</option>
                      </select>
                    </div>
                  </div>

                  {submissionError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                      {submissionError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-2xs cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: "var(--season-primary)" }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Submitting Inquiry...</span>
                      </>
                    ) : (
                      <span>Submit Availability Inquiry</span>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">
                  Inquiry Received
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Thank you, {name.trim().split(" ")[0]}. Our local desk in {destinationHub} will review room availability for {dates || "your dates"} and connect with you on {phone} shortly.
                </p>
                {referenceId && (
                  <div className="py-1 px-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 inline-block font-mono">
                    Reference: {referenceId}
                  </div>
                )}
                <p className="text-[11px] text-slate-400 italic">
                  This is an availability inquiry, not a confirmed reservation. No payment has been taken.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSubmitted(false);
                      setSubmissionError(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
