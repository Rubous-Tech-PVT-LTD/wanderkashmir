import React from "react";
import { UtensilsCrossed, Coffee, Check } from "lucide-react";
import { HotelDiningInfo } from "./types";
import { SectionEmptyState } from "./HotelEmptyState";

interface HotelDiningProps {
  dining: HotelDiningInfo;
}

export default function HotelDining({ dining }: HotelDiningProps) {
  const hasDiningData = dining.hasDining || dining.mealPlans.length > 0;

  return (
    <section id="dining" className="scroll-mt-28 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-[var(--season-primary)]" />
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--season-text,#111827)] font-display tracking-tight">
          Dining & Food
        </h2>
      </div>

      <div className="rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white p-5 sm:p-6 shadow-2xs">
        {hasDiningData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dining.breakfastIncluded && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                  <Coffee className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-950 font-display">
                      Complimentary Breakfast Included
                    </h3>
                    <p className="text-xs text-emerald-800/80 mt-0.5">
                      Freshly prepared local and continental breakfast served daily.
                    </p>
                  </div>
                </div>
              )}

              {dining.dinnerIncluded && (
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex items-start gap-3">
                  <UtensilsCrossed className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-blue-950 font-display">
                      Dinner Included (MAP Plan)
                    </h3>
                    <p className="text-xs text-blue-800/80 mt-0.5">
                      Evening buffet or table d'hôte dinner included with your stay.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {dining.mealPlans.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold text-[var(--season-text,#111827)] uppercase tracking-wider mb-2">
                  Meal Plan Inclusions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {dining.mealPlans.map((plan, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{plan}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <SectionEmptyState
            icon={UtensilsCrossed}
            title="Dining Information Is Not Available Yet"
            message="On-site dining options, room service menus, and breakfast packages will appear once provided by the property."
          />
        )}
      </div>
    </section>
  );
}
