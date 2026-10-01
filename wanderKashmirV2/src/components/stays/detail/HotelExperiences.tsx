import React from "react";
import { Compass, Sparkles } from "lucide-react";
import { HotelExperienceItem } from "./types";
import { SectionEmptyState } from "./HotelEmptyState";

interface HotelExperiencesProps {
  experiences: HotelExperienceItem[];
  destinationHub: string;
}

export default function HotelExperiences({
  experiences,
  destinationHub,
}: HotelExperiencesProps) {
  const hasExperiences = experiences && experiences.length > 0;

  return (
    <section id="experiences" className="scroll-mt-28 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-[var(--season-primary)]" />
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--season-text,#111827)] font-display tracking-tight">
          Experiences & Local Services
        </h2>
      </div>

      <div className="rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white p-5 sm:p-6 shadow-2xs">
        {hasExperiences ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {experiences.map((exp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[var(--season-primary)]" />
                  <h3 className="text-sm font-bold text-slate-800 font-display">
                    {exp.title}
                  </h3>
                </div>
                {exp.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <SectionEmptyState
            icon={Compass}
            title="Curated Services Being Configured"
            message={`Local guided excursions, transfers, and seasonal activities in ${destinationHub} can be arranged upon request with WanderKashmir's local team.`}
          />
        )}
      </div>
    </section>
  );
}
