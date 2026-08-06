"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Car, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export default function FeaturedTaxisClient({ taxis }: { taxis: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [taxis]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth : clientWidth;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!taxis || taxis.length === 0) return null;

  return (
    <section className="py-12 bg-slate-50">
      <div className="container-custom">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Popular Taxi Drivers</h2>
            <p className="text-sm text-slate-500 mt-1">Verified and trusted local drivers for your journey</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-2">
              <button 
                onClick={() => scroll("left")} 
                disabled={!canScrollLeft}
                aria-label="Scroll taxi list left"
                className={`p-2 rounded-full border border-slate-200 transition-colors ${canScrollLeft ? 'bg-white text-slate-700 hover:bg-slate-100' : 'bg-slate-50 text-slate-300'}`}
              >
                <ChevronLeft className="w-5 h-5" aria-hidden="true" />
              </button>
              <button 
                onClick={() => scroll("right")} 
                disabled={!canScrollRight}
                aria-label="Scroll taxi list right"
                className={`p-2 rounded-full border border-slate-200 transition-colors ${canScrollRight ? 'bg-white text-slate-700 hover:bg-slate-100' : 'bg-slate-50 text-slate-300'}`}
              >
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <Link
              href="/taxis"
              className="text-sm font-semibold text-slate-600 border border-slate-200 px-4 py-2 rounded-full hover:bg-slate-50 transition-colors bg-white"
            >
              View All
            </Link>
          </div>
        </div>

        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {taxis.map((taxi) => (
            <Link 
              key={taxi.id} 
              href={`/taxis`} 
              className="group snap-start flex-none w-[85vw] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 block"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <Image 
                  src={taxi.image} 
                  alt={taxi.name} 
                  fill 
                  sizes="(max-width: 768px) 100vw, 25vw" 
                  className="object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                <div className="absolute top-3 right-3 bg-emerald-100/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold text-emerald-700 flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 text-lg mb-1 truncate">{taxi.name}</h3>
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-3 font-medium">
                  <Car className="w-4 h-4 text-orange-500" /> {taxi.vehicleType}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
                    <Star className="w-4 h-4 text-orange-400 fill-orange-400" /> 
                    {taxi.rating.toFixed(1)} <span className="text-slate-400 font-normal ml-1">({taxi.trips} Trips)</span>
                  </div>
                  <span className="bg-orange-500 text-orange-500 text-xs font-bold px-3 py-1.5 rounded-full">Book Now</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
