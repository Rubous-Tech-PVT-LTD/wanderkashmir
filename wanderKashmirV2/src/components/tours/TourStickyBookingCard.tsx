"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import CustomizeTripModal from "@/components/CustomizeTripModal";
import TourCheckAvailabilityModal from "@/components/tours/TourCheckAvailabilityModal";
import { FixedContentValue } from "@/data/liveToursData";

interface TourStickyBookingCardProps {
  title: string;
  price: number;
  originalPrice?: number;
  duration: string;
  maxPersons?: number;
  whyThisRoute?: FixedContentValue;
}

export default function TourStickyBookingCard({
  title,
  price,
  duration,
  maxPersons,
}: TourStickyBookingCardProps) {
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

  // Pre-filled WhatsApp link
  const whatsappMessage = encodeURIComponent(
    `Hello Wander Kashmir! I'm interested in the "${title}" (${duration}) starting at ₹${price.toLocaleString()}/person. Could you please share itinerary details and available dates?`
  );
  const whatsappUrl = `https://wa.me/916005888754?text=${whatsappMessage}`;

  return (
    <div className="space-y-5">
      {/* 1. Main Booking Card - Clean & Matching Reference Layout */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        {/* Pricing header */}
        <div className="mb-5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--season-text,#111827)] tracking-tight font-display">
              ₹{price.toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm font-medium text-[var(--season-muted,#6B7280)]">
              / person
            </span>
          </div>
          <div className="text-xs text-[var(--season-muted,#6B7280)] mt-0.5">
            Based on {maxPersons ?? 2} {(maxPersons ?? 2) === 1 ? "adult" : "adults"}
          </div>
        </div>

        {/* Action Buttons Stack */}
        <div className="space-y-2.5">
          {/* Primary CTA: Check Availability */}
          <button
            type="button"
            onClick={() => setIsAvailabilityModalOpen(true)}
            className="w-full py-3 px-5 rounded-xl font-bold text-sm text-white bg-[var(--season-primary,#065F46)] hover:bg-[var(--season-primary-hover,#047857)] transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Check Availability</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary CTA: Customize This Trip (Clean, No Extra Icon) */}
          <button
            type="button"
            onClick={() => setIsCustomizeModalOpen(true)}
            className="w-full py-2.5 px-5 rounded-xl font-semibold text-sm text-slate-800 border border-slate-300 hover:border-[var(--season-primary)] hover:text-[var(--season-primary)] bg-white transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
          >
            <span>Customize This Trip</span>
          </button>

          {/* WhatsApp CTA: Chat on WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-5 rounded-xl font-semibold text-sm text-emerald-800 border border-emerald-300 hover:bg-emerald-50/70 transition-colors flex items-center justify-center gap-2 bg-white cursor-pointer shadow-2xs"
          >
            <svg
              className="w-4 h-4 fill-current text-emerald-600 shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.301-.15-1.782-.879-2.057-.98-.276-.1-.476-.15-.677.15-.2.301-.776.98-.952 1.181-.176.201-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.798-1.5-1.784-1.676-2.085-.176-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.176.2-.301.301-.502.1-.2.05-.376-.025-.526-.075-.15-.677-1.632-.928-2.235-.244-.588-.493-.508-.677-.517-.176-.008-.376-.01-.577-.01-.2 0-.527.075-.803.376s-1.054 1.03-1.054 2.511c0 1.482 1.079 2.91 1.23 3.111.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.378.197 1.897.12.578-.087 1.782-.728 2.033-1.431.251-.703.251-1.305.176-1.431-.076-.126-.277-.201-.578-.352z" />
            </svg>
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Modals */}
      <CustomizeTripModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
      />

      <TourCheckAvailabilityModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        title={title}
        price={price}
        duration={duration}
      />
    </div>
  );
}
