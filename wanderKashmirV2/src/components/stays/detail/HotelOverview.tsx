import React from "react";
import { Info, Languages, Sparkles } from "lucide-react";
import { HotelOverviewInfo } from "./types";
import { SectionEmptyState } from "./HotelEmptyState";

interface HotelOverviewProps {
  hotelName: string;
  overview: HotelOverviewInfo;
}

export default function HotelOverview({ hotelName, overview }: HotelOverviewProps) {
  const hasDescription = Boolean(overview.description && overview.description.trim());
  const hasLanguages = overview.languages && overview.languages.length > 0;
  const hasHighlights = overview.highlights && overview.highlights.length > 0;

  return (
    <section id="overview" className="scroll-mt-28 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-[var(--season-primary)]" />
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--season-text,#111827)] font-display tracking-tight">
          About {hotelName}
        </h2>
      </div>

      <div className="rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white p-5 sm:p-6 shadow-2xs space-y-5">
        {hasDescription ? (
          <div className="text-sm text-[var(--season-text,#374151)] leading-relaxed whitespace-pre-line font-sans">
            {overview.description}
          </div>
        ) : (
          <SectionEmptyState
            icon={Info}
            title="Property Description Not Available Yet"
            message="Detailed editorial overview and host notes will appear once completed by the verified property manager."
          />
        )}

        {/* Highlights / Features if present in real data */}
        {hasHighlights && (
          <div className="pt-4 border-t border-[var(--season-border,#F3F4F6)]">
            <h3 className="text-xs font-bold text-[var(--season-text,#111827)] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--season-primary)]" />
              <span>Property Highlights</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--season-text,#4B5563)]">
              {overview.highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--season-primary)] mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Spoken Languages */}
        {hasLanguages && (
          <div className="pt-4 border-t border-[var(--season-border,#F3F4F6)] flex items-center gap-2 text-xs text-[var(--season-muted,#6B7280)]">
            <Languages className="w-4 h-4 text-[var(--season-primary)] shrink-0" />
            <span className="font-semibold text-slate-700">Languages Spoken at Property:</span>
            <span>{overview.languages?.join(", ")}</span>
          </div>
        )}
      </div>
    </section>
  );
}
