"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  Users,
  Send,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Loader2,
  MessageCircle,
  AlertCircle,
  Home,
  RotateCcw,
} from "lucide-react";
import { submitCustomTripRequest } from "@/actions/customTrip";

interface TourCheckAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  price: number;
  duration: string;
  destinations?: string[];
}

const PHONE_CHARS_REGEX = /^[\d\s+\-()]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Resolves the destination list for a package based on its itinerary.
 * Examples:
 * - 2-Day Package: ["Srinagar"]
 * - 3-Day Package: ["Srinagar", "Gulmarg"]
 * - 4-Day Package: ["Srinagar", "Gulmarg", "Pahalgam"]
 * - 5, 6, 7-Day Packages: ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg"]
 */
function resolvePackageDestinations(
  title: string,
  duration: string,
  providedDestinations?: string[]
): string[] {
  if (providedDestinations && providedDestinations.length > 0) {
    return providedDestinations;
  }

  const lowerTitle = title.toLowerCase();
  const lowerDuration = duration.toLowerCase();

  // 1. 2-Day Package: Srinagar only
  if (
    lowerDuration.includes("2 day") ||
    lowerDuration.includes("2d") ||
    lowerTitle.includes("2 day") ||
    lowerTitle.includes("quick srinagar")
  ) {
    return ["Srinagar"];
  }

  // 2. 3-Day Package: Srinagar & Gulmarg
  if (
    lowerDuration.includes("3 day") ||
    lowerDuration.includes("3d") ||
    lowerTitle.includes("3 day") ||
    lowerTitle.includes("srinagar & gulmarg") ||
    lowerTitle.includes("srinagar and gulmarg")
  ) {
    return ["Srinagar", "Gulmarg"];
  }

  // 3. 4-Day Package: Srinagar, Gulmarg, Pahalgam
  if (
    lowerDuration.includes("4 day") ||
    lowerDuration.includes("4d") ||
    lowerTitle.includes("4 day")
  ) {
    return ["Srinagar", "Gulmarg", "Pahalgam"];
  }

  // 4. 5-Day, 6-Day, 7-Day Packages: Srinagar, Gulmarg, Pahalgam, Sonamarg
  if (
    lowerDuration.includes("5 day") ||
    lowerDuration.includes("5d") ||
    lowerTitle.includes("5 day") ||
    lowerDuration.includes("6 day") ||
    lowerDuration.includes("6d") ||
    lowerTitle.includes("6 day") ||
    lowerDuration.includes("7 day") ||
    lowerDuration.includes("7d") ||
    lowerTitle.includes("7 day")
  ) {
    return ["Srinagar", "Gulmarg", "Pahalgam", "Sonamarg"];
  }

  // Fallback: keyword search from title
  const found: string[] = [];
  if (lowerTitle.includes("srinagar")) found.push("Srinagar");
  if (lowerTitle.includes("gulmarg")) found.push("Gulmarg");
  if (lowerTitle.includes("pahalgam")) found.push("Pahalgam");
  if (lowerTitle.includes("sonamarg")) found.push("Sonamarg");

  return found.length > 0 ? found : ["Srinagar", "Gulmarg", "Pahalgam"];
}

export default function TourCheckAvailabilityModal({
  isOpen,
  onClose,
  title,
  price,
  duration,
  destinations: propDestinations,
}: TourCheckAvailabilityModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    startDate: "",
    guests: "2 Adults",
    roomPreference: "1 Double Room",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const packageDestinations = resolvePackageDestinations(title, duration, propDestinations);

  const handleClose = () => {
    onClose();
    // Reset state after transition completes
    setTimeout(() => {
      setSubmitted(false);
      setIsSubmitting(false);
      setErrorMessage(null);
      setReferenceId(null);
    }, 300);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedEmail = formData.email.trim();

    // 1. Client-side structural validation
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage("Please enter your full name (at least 2 characters).");
      return;
    }

    if (!trimmedPhone) {
      setErrorMessage("Please enter your phone or WhatsApp number.");
      return;
    }

    if (!PHONE_CHARS_REGEX.test(trimmedPhone)) {
      setErrorMessage("Phone number contains invalid characters.");
      return;
    }

    const digitsOnly = trimmedPhone.replace(/\D/g, "");
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      setErrorMessage("Please enter a valid phone number with 8 to 15 digits.");
      return;
    }

    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    // 2. Prepare structured server action payload
    const daysMatch = duration.match(/(\d+)\s*Days?/i);
    const durationDays = daysMatch ? daysMatch[1] : undefined;

    const specialRequests = [
      `Package: ${title} (${duration})`,
      `Est. Price: ₹${price.toLocaleString()} / person`,
      formData.roomPreference ? `Room Preference: ${formData.roomPreference}` : null,
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      const result = await submitCustomTripRequest({
        name: trimmedName,
        phone: trimmedPhone,
        email: trimmedEmail || undefined,
        travelDates: formData.startDate ? formData.startDate : undefined,
        durationDays: durationDays,
        guestsCount: formData.guests || "2 Adults",
        destinations: packageDestinations,
        hotelType: formData.roomPreference || "3 Star Standard",
        cabType: "Sedan / SUV",
        specialRequests: specialRequests,
      });

      if (result.success) {
        setReferenceId(result.referenceId || "WK-ENQUIRY");
        setSubmitted(true);
      } else {
        setErrorMessage(
          result.error ||
            "Unable to save your enquiry right now. Your details remain filled below so you can retry."
        );
      }
    } catch (err: unknown) {
      console.error("Error submitting availability enquiry:", err);
      setErrorMessage(
        "A network connection error occurred while saving your enquiry to our database. Your details remain filled below so you can retry."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prefilled WhatsApp URL for successfully saved enquiries (includes verified Reference ID)
  const successWhatsAppUrl = `https://wa.me/916005888754?text=${encodeURIComponent(
    `Hello Wander Kashmir! I would like to check availability for:\n` +
      `- Tour: ${title} (${duration})\n` +
      `- Destinations: ${packageDestinations.join(", ")}\n` +
      (referenceId ? `- Enquiry Ref: ${referenceId}\n` : "") +
      `- Name: ${formData.name.trim()}\n` +
      `- Phone: ${formData.phone.trim()}\n` +
      `- Travel Date: ${formData.startDate || "Flexible"}\n` +
      `- Travelers: ${formData.guests}\n` +
      `- Room Preference: ${formData.roomPreference}\n` +
      `- Est. Price: ₹${price.toLocaleString()} / person`
  )}`;

  // Emergency WhatsApp URL for unsaved enquiries (explicitly discloses unsaved status)
  const unsavedWhatsAppUrl = `https://wa.me/916005888754?text=${encodeURIComponent(
    `Hello Wander Kashmir! (Note: This enquiry was NOT recorded in your booking database due to a network/system failure)\n` +
      `- Tour: ${title} (${duration})\n` +
      `- Destinations: ${packageDestinations.join(", ")}\n` +
      `- Name: ${formData.name.trim()}\n` +
      `- Phone: ${formData.phone.trim()}\n` +
      `- Travel Date: ${formData.startDate || "Flexible"}\n` +
      `- Travelers: ${formData.guests}\n` +
      `- Room Preference: ${formData.roomPreference}\n` +
      `- Est. Price: ₹${price.toLocaleString()} / person`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg bg-[var(--season-surface)] rounded-2xl sm:rounded-3xl border border-[var(--season-border)] shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--season-muted)] hover:text-[var(--season-text)] hover:bg-[var(--season-border)]/40 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          /* Success Screen - Only displayed after database persistence succeeds */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-[var(--season-text)] font-display">
                Enquiry Successfully Saved!
              </h3>
              {referenceId && (
                <div className="mt-2">
                  <span className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono text-slate-800 font-bold border border-slate-200">
                    Enquiry Reference: {referenceId}
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-[var(--season-muted)] max-w-sm mx-auto leading-relaxed">
              Thank you, <span className="font-semibold text-[var(--season-text)]">{formData.name}</span>. Your enquiry for{" "}
              <span className="font-semibold text-[var(--season-text)]">{title}</span> covering{" "}
              <span className="font-semibold text-[var(--season-text)]">{packageDestinations.join(", ")}</span> has been recorded in our booking system. A local Kashmir travel specialist is reviewing live availability.
            </p>

            <div className="pt-2 flex flex-col gap-2.5 max-w-sm mx-auto">
              {/* Direct user click prevents browser popup blockers */}
              <a
                href={successWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[#25D366] hover:bg-[#20ba59] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Continue to WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 px-6 rounded-xl bg-[var(--season-border)]/40 hover:bg-[var(--season-border)] text-[var(--season-text)] text-xs font-semibold transition-colors cursor-pointer"
              >
                Done / Back to Tour
              </button>
            </div>
          </div>
        ) : (
          /* Enquiry Form — Inputs are preserved across retry attempts */
          <div>
            <div className="mb-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--season-primary)]">
                Instant Availability Check
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--season-text)] font-display mt-0.5">
                {title}
              </h3>
              <p className="text-xs text-[var(--season-muted)] mt-1">
                {duration} • {packageDestinations.join(" → ")} • Starting from ₹{price.toLocaleString()}/person
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[var(--season-text)] mb-1">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--season-muted)] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--season-border)] bg-slate-50 text-sm text-[var(--season-text)] focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)]/40"
                  />
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-semibold text-[var(--season-text)] mb-1">
                  WhatsApp / Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[var(--season-muted)] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--season-border)] bg-slate-50 text-sm text-[var(--season-text)] focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)]/40"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[var(--season-text)] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[var(--season-muted)] absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rahul@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--season-border)] bg-slate-50 text-sm text-[var(--season-text)] focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)]/40"
                  />
                </div>
              </div>

              {/* Travel Date & Guests Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--season-text)] mb-1">
                    Approx Travel Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[var(--season-muted)] absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--season-border)] bg-slate-50 text-sm text-[var(--season-text)] focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--season-text)] mb-1">
                    Number of Guests
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-[var(--season-muted)] absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={formData.guests}
                      onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--season-border)] bg-slate-50 text-sm text-[var(--season-text)] focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)]/40"
                    >
                      <option value="2 Adults">2 Adults (Couple)</option>
                      <option value="3 Adults">3 Adults (Family/Friends)</option>
                      <option value="4 Adults">4 Adults (Group)</option>
                      <option value="Family with Kids">Family with Children</option>
                      <option value="Solo Traveler">Solo Traveler</option>
                      <option value="Large Group (6+)">Large Group (6+)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Room Preference */}
              <div>
                <label className="block text-xs font-semibold text-[var(--season-text)] mb-1">
                  Room Preference
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-[var(--season-muted)] absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={formData.roomPreference}
                    onChange={(e) => setFormData({ ...formData, roomPreference: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--season-border)] bg-slate-50 text-sm text-[var(--season-text)] focus:outline-none focus:ring-2 focus:ring-[var(--season-primary)]/40"
                  >
                    <option value="1 Double Room">1 Double Room (Standard / Deluxe)</option>
                    <option value="2 Double Rooms">2 Double Rooms</option>
                    <option value="1 Family Suite">1 Family Suite / Triple Sharing</option>
                    <option value="Premium / Luxury Hotel">Premium / Luxury Hotel Category</option>
                    <option value="Flexible">Flexible / Discuss with Specialist</option>
                  </select>
                </div>
              </div>

              {/* Database Failure / Error Notification */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-900">Enquiry Not Saved to Database</p>
                      <p className="mt-0.5 text-rose-700 leading-relaxed">{errorMessage}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-2.5 border-t border-rose-200/70">
                    <button
                      type="button"
                      onClick={() => handleSubmit()}
                      disabled={isSubmitting}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Submission</span>
                    </button>

                    <a
                      href={unsavedWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 underline ml-auto"
                    >
                      Send as Unsaved WhatsApp Message →
                    </a>
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Checking Availability & Saving Enquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Enquiry & Check Availability</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-[var(--season-muted)] pt-1">
                🔒 Free cancellation available. No payment required at this step.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
