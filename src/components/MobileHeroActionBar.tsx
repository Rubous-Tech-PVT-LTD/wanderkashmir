"use client";

import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, PhoneCall } from "lucide-react";
import CustomizeTourModal from "@/components/CustomizeTourModal";

export default function MobileHeroActionBar() {
  return (
    <section className="block md:hidden h-auto bg-[#fff8f2] border-y border-[#fed7aa]/60 py-3 px-3 shadow-xs relative z-20">
      <CustomizeTourModal
        renderTrigger={(openModal) => (
          <div className="container-custom flex flex-col items-center gap-2.5">
            {/* 3 Clickable Action Cards: 1. Customization (+ Call) | 2. Instagram | 3. Review (Exact screenshot) */}
            <div className="w-full grid grid-cols-3 gap-2">
              {/* 1. Customization & Call */}
              <button
                type="button"
                onClick={openModal}
                className="flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl bg-white border border-orange-200/80 shadow-xs hover:bg-orange-50/50 active:scale-95 transition-all text-left cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[11px] font-extrabold text-slate-900">Customise</span>
                  <span className="text-[9px] text-orange-600 font-semibold">&amp; Call</span>
                </div>
              </button>

              {/* 2. Instagram Link */}
              <a
                href="https://www.instagram.com/wander____kashmir/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl bg-white border border-orange-200/80 shadow-xs hover:bg-pink-50/50 active:scale-95 transition-all text-left"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[11px] font-extrabold text-slate-900">Instagram</span>
                  <span className="text-[9px] text-pink-600 font-semibold">@wander</span>
                </div>
              </a>

              {/* 3. Review Badge (Exact match to user's attached screenshot) */}
              <a
                href="#reviews"
                className="flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl bg-white border border-orange-200/80 shadow-xs hover:bg-amber-50/50 active:scale-95 transition-all text-left"
              >
                {/* Google Multicolor G Logo */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500 text-xs font-black">★</span>
                    <span className="text-[12px] font-black text-slate-800">4.9</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-medium mt-0.5 whitespace-nowrap">(15,263 reviews)</span>
                </div>
              </a>
            </div>

              {/* Action Bar: Customize Your Tour Package + Call Now */}
              <div className="w-full flex items-center gap-2">
                {/* Customize Tour Package Button */}
                <button
                  type="button"
                  onClick={openModal}
                  className="flex-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 text-center"
                >
                  <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                  <span className="text-xs sm:text-sm font-extrabold tracking-tight">Customize Your Tour Package</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              {/* Instant Call Action */}
              <a
                href="tel:+916005888754"
                className="shrink-0 flex flex-col items-center justify-center bg-white border border-orange-200 py-1.5 px-3 rounded-xl shadow-xs hover:bg-orange-50 active:scale-95 transition-all text-slate-800 text-center"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-0.5">
                  <PhoneCall className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-black text-slate-800 leading-none">Call Now</span>
              </a>
            </div>
          </div>
        )}
      />
    </section>
  );
}
