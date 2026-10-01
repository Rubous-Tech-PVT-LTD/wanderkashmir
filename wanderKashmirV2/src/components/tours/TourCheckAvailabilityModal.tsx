"use client";

import { useState } from "react";
import { X, Calendar, Users, Send, CheckCircle2, Phone, Mail, User } from "lucide-react";

interface TourCheckAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  price: number;
  duration: string;
}

export default function TourCheckAvailabilityModal({
  isOpen,
  onClose,
  title,
  price,
  duration,
}: TourCheckAvailabilityModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    startDate: "",
    guests: "2 Adults",
    roomPreference: "1 Double Room",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const whatsappMessage = encodeURIComponent(
      `Hello Wander Kashmir! I would like to check availability for:\n` +
      `- Tour: ${title} (${duration})\n` +
      `- Name: ${formData.name}\n` +
      `- Phone: ${formData.phone}\n` +
      `- Travel Date: ${formData.startDate || "Flexible"}\n` +
      `- Travelers: ${formData.guests}\n` +
      `- Room Preference: ${formData.roomPreference}\n` +
      `- Est. Price: ₹${price.toLocaleString()} / person`
    );

    // Open WhatsApp after brief delay
    setTimeout(() => {
      window.open(`https://wa.me/916005888754?text=${whatsappMessage}`, "_blank");
    }, 600);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[var(--season-surface)] rounded-2xl sm:rounded-3xl border border-[var(--season-border)] shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--season-muted)] hover:text-[var(--season-text)] hover:bg-[var(--season-border)]/40 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-[var(--season-text)] font-display">
              Availability Inquiry Sent!
            </h3>
            <p className="text-sm text-[var(--season-muted)] max-w-sm mx-auto">
              Thank you, <span className="font-semibold">{formData.name}</span>. Our Kashmir trip specialist is reviewing live hotel and chauffeur availability for <span className="font-semibold">{title}</span> and will connect with you immediately via WhatsApp.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-[var(--season-primary)] text-white text-sm font-semibold hover:bg-[var(--season-primary-hover)] transition-colors"
            >
              Back to Tour
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--season-primary)]">
                Instant Availability Check
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--season-text)] font-display mt-0.5">
                {title}
              </h3>
              <p className="text-xs text-[var(--season-muted)] mt-1">
                {duration} • Starting from ₹{price.toLocaleString()}/person
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-[var(--season-text)] mb-1">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[var(--season-muted)] absolute left-3 top-3" />
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
                  <Phone className="w-4 h-4 text-[var(--season-muted)] absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
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
                  <Mail className="w-4 h-4 text-[var(--season-muted)] absolute left-3 top-3" />
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
                    <Calendar className="w-4 h-4 text-[var(--season-muted)] absolute left-3 top-3" />
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
                    <Users className="w-4 h-4 text-[var(--season-muted)] absolute left-3 top-3" />
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

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full mt-3 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-[var(--season-primary)] hover:bg-[var(--season-primary-hover)] transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Confirm & Get Instant Quotation</span>
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
