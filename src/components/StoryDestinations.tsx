"use client";

import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { DestinationItem } from "@/actions/destinations";

interface StoryDestinationsProps {
  destinations: DestinationItem[];
}

export default function StoryDestinations({ destinations }: StoryDestinationsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!destinations || destinations.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white pt-3.5 pb-2.5 border-b border-slate-100 relative md:hidden">
      <div className="px-3">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-4 bg-gradient-to-b from-[#f97316] to-[#ea580c] rounded-full" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Destinations
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Swipe for more →
          </span>
        </div>

        {/* 1-Row Horizontal Story Scroller (5 rings visible on landing, swipe left for more) */}
        <div
          ref={scrollRef}
          className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-1 px-0.5 -mx-1 scroll-smooth"
        >
          <div className="flex items-start gap-2.5 sm:gap-3.5 w-max">
            {destinations.map((item) => (
              <Link
                key={item.id}
                href={item.link || `/tours?destination=${encodeURIComponent(item.name)}`}
                className="group flex flex-col items-center justify-center select-none cursor-pointer focus:outline-none shrink-0 w-[58px] sm:w-[64px]"
              >
                {/* Story Highlight Circle with Saffron Ring */}
                <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-amber-400 via-[#f97316] to-rose-500 shadow-sm transition-all duration-200 group-hover:scale-105 group-active:scale-95">
                  <div className="w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] rounded-full p-[1.5px] bg-white">
                    <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="60px"
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
                        unoptimized={item.image.includes("unsplash.com") || item.image.includes("cloudinary.com")}
                      />
                    </div>
                  </div>
                </div>

                {/* Destination Name */}
                <span className="mt-1 text-[11px] font-semibold text-slate-800 text-center tracking-tight truncate w-full group-hover:text-[#f97316] transition-colors">
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
