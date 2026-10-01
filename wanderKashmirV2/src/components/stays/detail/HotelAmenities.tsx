import React from "react";
import { Check, Sparkles } from "lucide-react";
import { HotelAmenitiesGroup } from "./types";
import { SectionEmptyState } from "./HotelEmptyState";

interface HotelAmenitiesProps {
  groups: HotelAmenitiesGroup[];
  allAmenities: string[];
}

export default function HotelAmenities({ groups, allAmenities }: HotelAmenitiesProps) {
  const hasAmenities = allAmenities && allAmenities.length > 0;

  return (
    <section id="amenities" className="scroll-mt-28 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-[var(--season-primary)]" />
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--season-text,#111827)] font-display tracking-tight">
          Amenities & Facilities
        </h2>
      </div>

      <div className="rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white p-5 sm:p-6 shadow-2xs">
        {hasAmenities ? (
          <div className="space-y-6">
            {groups.map((group, gIdx) => (
              <div key={gIdx} className={gIdx > 0 ? "pt-5 border-t border-[var(--season-border,#F3F4F6)]" : ""}>
                <h3 className="text-xs font-bold text-[var(--season-text,#111827)] uppercase tracking-wider mb-3">
                  {group.category}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {group.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-[var(--season-text,#374151)] font-medium"
                    >
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <SectionEmptyState
            icon={Sparkles}
            title="Amenities Information Is Not Available Yet"
            message="On-site amenities, heating facilities, and property features will be listed once confirmed by the host."
          />
        )}
      </div>
    </section>
  );
}
