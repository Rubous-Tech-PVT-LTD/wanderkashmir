"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  CheckCircle,
  Phone,
  Mail,
  User,
  Users,
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react";
import { submitCustomTripRequest } from "@/actions/customTrip";
import { trackEvent } from "@/lib/analytics";
import { LeadContextPayload } from "@/types/leadPopup";

interface CustomizeTripModalProps {
  renderTrigger?: (openModal: () => void) => React.ReactNode;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  defaultCategory?: string;
  customTitle?: string;
  customSubtitle?: string;
  contextPayload?: LeadContextPayload;
  onSuccess?: () => void;
}

export default function CustomizeTripModal({
  renderTrigger,
  trigger,
  isOpen: controlledIsOpen,
  onClose,
  defaultCategory,
  customTitle,
  customSubtitle,
  contextPayload,
  onSuccess,
}: CustomizeTripModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [noOfTravellers, setNoOfTravellers] = useState("");
  const [preference, setPreference] = useState(
    defaultCategory ? `Interested in ${defaultCategory} package.` : ""
  );

  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const modalRef = useRef<HTMLDivElement>(null);

  // Body scroll lock, Escape key handling, and open tracking
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";

      try {
        localStorage.setItem("lead_popup_last_shown", Date.now().toString());
      } catch (_) {}

      trackEvent("customize_popup_open", {
        triggerType: contextPayload?.triggerType || "cta",
        sourceType: contextPayload?.sourceType,
        tourSlug: contextPayload?.tourSlug,
        travelStyle: contextPayload?.travelStyle,
        destination: contextPayload?.destination,
      });

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isModalOpen]);

  const handleClose = () => {
    if (!isSuccess) {
      try {
        localStorage.setItem("lead_popup_dismissed", Date.now().toString());
      } catch (_) {}
      trackEvent("customize_popup_close", {
        sourceType: contextPayload?.sourceType,
      });
    }

    if (controlledIsOpen !== undefined && onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
    // Reset success/error states after close
    setTimeout(() => {
      setSubmissionError(null);
      setIsSuccess(false);
    }, 300);
  };

  const handleOpen = () => {
    setSubmissionError(null);
    setIsSuccess(false);
    if (controlledIsOpen !== undefined) {
      // controlled open handled by parent
    } else {
      setInternalIsOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setSubmissionError("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setSubmissionError("Please enter a valid email address.");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 8) {
      setSubmissionError("Please enter a valid phone number (at least 8-10 digits).");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    // Build context metadata tags cleanly without modifying customer inputs
    const contextTags: string[] = [];
    if (contextPayload?.sourceType) contextTags.push(`Source: ${contextPayload.sourceType}`);
    if (contextPayload?.tourSlug) contextTags.push(`Tour: ${contextPayload.tourSlug}`);
    if (contextPayload?.travelStyle) contextTags.push(`Travel Style: ${contextPayload.travelStyle}`);
    if (contextPayload?.destination) contextTags.push(`Destination: ${contextPayload.destination}`);
    if (contextPayload?.propertyId) contextTags.push(`Property: ${contextPayload.propertyId}`);
    if (contextPayload?.experienceId) contextTags.push(`Experience: ${contextPayload.experienceId}`);
    if (contextPayload?.triggerType) contextTags.push(`Trigger: ${contextPayload.triggerType}`);
    if (contextPayload?.sourcePage) contextTags.push(`Page: ${contextPayload.sourcePage}`);

    const metaString = contextTags.length > 0 ? `[Context: ${contextTags.join(" | ")}]` : "";
    const combinedSpecialRequests = [metaString, preference.trim()].filter(Boolean).join("\n") || undefined;

    const destinations = contextPayload?.destination
      ? [contextPayload.destination]
      : ["Srinagar", "Gulmarg", "Pahalgam"];

    try {
      const result = await submitCustomTripRequest({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        guestsCount: noOfTravellers.trim() || "2 Adults",
        destinations: destinations,
        specialRequests: combinedSpecialRequests,
      });

      if (result.success) {
        setReferenceId(result.referenceId || "WK-CUSTOM");
        setIsSuccess(true);
        try {
          localStorage.setItem("lead_popup_submitted", "true");
        } catch (_) {}
        onSuccess?.();
        trackEvent("customize_popup_submit", {
          referenceId: result.referenceId,
          sourceType: contextPayload?.sourceType,
          tourSlug: contextPayload?.tourSlug,
          travelStyle: contextPayload?.travelStyle,
          destination: contextPayload?.destination,
        });
      } else {
        setSubmissionError(result.error || "Unable to submit your request. Please try again.");
      }
    } catch (err: any) {
      console.error("Error submitting custom trip request:", err);
      setSubmissionError("Something went wrong. Please try again or message us on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Optional Trigger Buttons */}
      {renderTrigger ? (
        renderTrigger(handleOpen)
      ) : trigger ? (
        <span onClick={handleOpen}>{trigger}</span>
      ) : null}

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="customize-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div
            ref={modalRef}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[88vh] sm:max-h-[90vh] my-auto shrink-0"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
              <div className="pr-3">
                <h3
                  id="customize-modal-title"
                  className="font-display text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug"
                >
                  {isSuccess ? "Request Submitted" : (customTitle || "Customize Your Itinerary")}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 font-sans mt-0.5 leading-relaxed">
                  {isSuccess
                    ? "Our Srinagar team will get in touch with you shortly."
                    : (customSubtitle || "Share your details and preferences to get a personalized quote.")}
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close modal"
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            {isSuccess ? (
              /* Success View */
              <div className="p-5 overflow-y-auto">
                <div className="py-4 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-bold text-slate-900 font-display">
                      Thank You, {name.trim().split(" ")[0]}!
                    </h4>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                      We have received your custom itinerary request. One of our local Kashmir specialists will call or WhatsApp you shortly.
                    </p>
                    {referenceId && (
                      <div className="pt-2">
                        <span className="inline-block px-3 py-1 bg-slate-100 rounded-md text-[11px] font-mono text-slate-700 font-semibold border border-slate-200">
                          Ref: {referenceId}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <a
                      href={`https://wa.me/916005888754?text=${encodeURIComponent(
                        `Hi WanderKashmir, I just submitted custom itinerary request (${referenceId || name}).`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <span>Connect on WhatsApp Directly</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Simple 5-Field Form: Name, Email, Phone, No of Travellers, Preference */
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
                {/* Scrollable Fields on Mobile */}
                <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
                  {/* 1. Name */}
                  <div>
                    <label
                      htmlFor="custom-name"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                      <input
                        id="custom-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full h-10 pl-9 pr-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* 2. Email */}
                  <div>
                    <label
                      htmlFor="custom-email"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                      <input
                        id="custom-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full h-10 pl-9 pr-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* 3. Phone */}
                  <div>
                    <label
                      htmlFor="custom-phone"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Phone <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                      <input
                        id="custom-phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="10-digit WhatsApp or Phone number"
                        className="w-full h-10 pl-9 pr-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* 4. No of Travellers */}
                  <div>
                    <label
                      htmlFor="custom-travellers"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      No of Travellers
                    </label>
                    <div className="relative flex items-center">
                      <Users className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                      <input
                        id="custom-travellers"
                        type="text"
                        value={noOfTravellers}
                        onChange={(e) => setNoOfTravellers(e.target.value)}
                        placeholder="e.g. 2 Adults, 1 Child"
                        className="w-full h-10 pl-9 pr-3 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* 5. Preference */}
                  <div>
                    <label
                      htmlFor="custom-preference"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Preference
                    </label>
                    <div className="relative">
                      <textarea
                        id="custom-preference"
                        rows={2}
                        value={preference}
                        onChange={(e) => setPreference(e.target.value)}
                        placeholder="Travel dates, places (Gulmarg, Pahalgam), hotel category, or specific requests..."
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Error Notification */}
                  {submissionError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                      {submissionError}
                    </div>
                  )}
                </div>

                {/* Sticky Submit Button - Always Visible on Mobile */}
                <div className="p-3.5 sm:px-5 sm:py-3.5 border-t border-slate-100 bg-white/95 backdrop-blur-xs shrink-0">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: "var(--season-primary, #D62828)",
                      color: "#FFFFFF",
                    }}
                    className="w-full h-11 px-4 rounded-xl text-white font-bold text-sm bg-[#D62828] hover:brightness-105 active:scale-[0.99] transition-all shadow-md shadow-black/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span className="text-white font-semibold">Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-white shrink-0" />
                        <span className="text-white font-bold tracking-wide">Request Custom Itinerary</span>
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
