import React from "react";
import { ShieldCheck, HeartHandshake, Eye, Award } from "lucide-react";
import { HotelTrustInfo } from "./types";

interface HotelTrustProps {
  trust: HotelTrustInfo;
  hotelName: string;
}

export default function HotelTrust({ trust, hotelName }: HotelTrustProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-[var(--season-primary)]" />
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--season-text,#111827)] font-display tracking-tight">
          Trust & Authenticity Guarantee
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Verification Card */}
        <div className="p-5 rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[var(--season-text,#111827)] font-display">
            {trust.isVerified ? "100% Verified Property" : "Pending Verification"}
          </h3>
          <p className="text-xs text-[var(--season-muted,#4B5563)] leading-relaxed">
            {trust.isVerified
              ? "Personally inspected for cleanliness, heating amenities, and local host hospitality."
              : "Property listing is currently undergoing standard onboarding review."}
          </p>
        </div>

        {/* Real Photography */}
        <div className="p-5 rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[var(--season-text,#111827)] font-display">
            Genuine Photography
          </h3>
          <p className="text-xs text-[var(--season-muted,#4B5563)] leading-relaxed">
            We prioritize real camera captures from the property and guests over generic studio renders.
          </p>
        </div>

        {/* Local Support */}
        <div className="p-5 rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white shadow-2xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-[var(--season-primary-light,#FFF7ED)] text-[var(--season-primary)] flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[var(--season-text,#111827)] font-display">
            Local On-Ground Team
          </h3>
          <p className="text-xs text-[var(--season-muted,#4B5563)] leading-relaxed">
            Our Srinagar-based concierge team is directly on call to assist before and during your stay.
          </p>
        </div>
      </div>
    </section>
  );
}
