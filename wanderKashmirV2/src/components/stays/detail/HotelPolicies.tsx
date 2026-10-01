import React from "react";
import { Clock, ShieldAlert, FileText, CheckCircle2 } from "lucide-react";
import { HotelPoliciesInfo } from "./types";

interface HotelPoliciesProps {
  policies: HotelPoliciesInfo;
  hotelName: string;
}

export default function HotelPolicies({ policies, hotelName }: HotelPoliciesProps) {
  return (
    <section id="policies" className="scroll-mt-28 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-[var(--season-primary)]" />
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--season-text,#111827)] font-display tracking-tight">
          Policies & House Rules
        </h2>
      </div>

      <div className="rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white p-5 sm:p-6 shadow-2xs space-y-6">
        {/* Timing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-[var(--season-border,#F3F4F6)]">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
            <Clock className="w-5 h-5 text-[var(--season-primary)] shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Standard Check-In
              </div>
              <div className="text-sm font-extrabold text-slate-800 font-display">
                From {policies.checkIn || "12:00 PM"}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center gap-3">
            <Clock className="w-5 h-5 text-[var(--season-primary)] shrink-0" />
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Standard Check-Out
              </div>
              <div className="text-sm font-extrabold text-slate-800 font-display">
                Until {policies.checkOut || "11:00 AM"}
              </div>
            </div>
          </div>
        </div>

        {/* House Rules */}
        <div>
          <h3 className="text-xs font-bold text-[var(--season-text,#111827)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[var(--season-primary)]" />
            <span>House Rules & Identification</span>
          </h3>
          <ul className="space-y-2 text-xs text-[var(--season-text,#374151)] font-medium">
            {policies.houseRules.map((rule, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cancellation Notice */}
        <div className="pt-4 border-t border-[var(--season-border,#F3F4F6)] flex items-start gap-2.5 text-xs text-[var(--season-muted,#6B7280)]">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Standard seasonal cancellation policies apply. Peak seasons (such as snowfall and tulip periods) may require advance confirmation. Please inquire during booking.
          </p>
        </div>
      </div>
    </section>
  );
}
