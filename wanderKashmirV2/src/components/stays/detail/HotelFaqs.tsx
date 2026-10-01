"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { HotelFaqItem } from "./types";

interface HotelFaqsProps {
  faqs: HotelFaqItem[];
  hotelName: string;
}

export default function HotelFaqs({ faqs, hotelName }: HotelFaqsProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-[var(--season-primary)]" />
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--season-text,#111827)] font-display tracking-tight">
          Frequently Asked Questions About {hotelName}
        </h2>
      </div>

      <div className="rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white p-5 sm:p-6 shadow-2xs divide-y divide-slate-100">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between text-left gap-3 group cursor-pointer"
              >
                <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[var(--season-primary)] transition-colors">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-[var(--season-primary)]" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans pr-6">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
