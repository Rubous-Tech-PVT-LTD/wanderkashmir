"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Compass } from "lucide-react";
import type { DestinationItem } from "@/actions/destinations";

interface StoryDestinationsProps {
  destinations: DestinationItem[];
}

export default function StoryDestinations({ destinations }: StoryDestinationsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!destinations || destinations.length === 0) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full bg-white pt-4 pb-3 border-b border-slate-100 relative md:hidden">
      <div className="container-custom max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-gradient-to-b from-[#f97316] to-[#ea580c] rounded-full" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Destinations
            </h2>
          </div>

          {/* Desktop Arrow Controls */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-200 flex items-center justify-center text-slate-600 hover:text-orange-600 transition-all shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-orange-50 hover:border-orange-200 flex items-center justify-center text-slate-600 hover:text-orange-600 transition-all shadow-sm active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Row Horizontal Scroll Container (Mobile & Desktop) */}
        <div
          ref={scrollRef}
          className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 px-0.5 -mx-1"
        >
          <div className="grid grid-rows-2 grid-flow-col auto-cols-max gap-x-4 sm:gap-x-6 gap-y-3 pb-1">
            {destinations.map((item) => (
              <Link
                key={item.id}
                href={item.link || `/tours?destination=${encodeURIComponent(item.name)}`}
                className="group flex flex-col items-center justify-center select-none cursor-pointer focus:outline-none"
              >
                {/* Story Circle with Brand Gradient Ring */}
                <div className="relative p-[2.5px] rounded-full bg-gradient-to-tr from-amber-400 via-[#f97316] to-rose-500 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-active:scale-95">
                  <div className="w-[66px] h-[66px] sm:w-[74px] sm:h-[74px] rounded-full p-[2px] bg-white">
                    <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 70px, 80px"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-115"
                        unoptimized={item.image.includes("unsplash.com") || item.image.includes("cloudinary.com")}
                      />
                    </div>
                  </div>
                </div>

                {/* Destination Label */}
                <span className="mt-1.5 text-xs sm:text-[13px] font-bold text-slate-800 text-center tracking-tight truncate max-w-[74px] sm:max-w-[82px] group-hover:text-[#f97316] transition-colors">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
