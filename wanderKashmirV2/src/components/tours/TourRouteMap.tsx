import { MapPin } from "lucide-react";
import { TourItineraryDay } from "@/data/liveToursData";

interface TourRouteMapProps {
  destinations: string[];
  itinerary: TourItineraryDay[];
}

export default function TourRouteMap({ destinations, itinerary }: TourRouteMapProps) {
  return (
    <section className="space-y-3 pt-2">
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--season-text,#111827)] font-display tracking-tight">
        Route Map
      </h2>

      <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs grid grid-cols-1 md:grid-cols-12">
        {/* Left: Visual Route Map Graphic */}
        <div className="md:col-span-7 bg-[#E8F0E8] relative min-h-[260px] sm:min-h-[300px] flex items-center justify-center p-6 overflow-hidden">
          {/* Subtle topographical map background texture */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `radial-gradient(#065F46 0.75px, transparent 0.75px), radial-gradient(#065F46 0.75px, #E8F0E8 0.75px)`,
              backgroundSize: "24px 24px",
              backgroundPosition: "0 0, 12px 12px",
            }}
          />

          {/* SVG Route Line connecting the 4 main destinations */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" fill="none">
            {/* Mountain contour subtle lines */}
            <path
              d="M20 280 Q 80 200, 160 220 T 320 180 T 400 240"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <path
              d="M0 120 Q 120 80, 240 100 T 380 60"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Main Scenic Connecting Route Curve: Gulmarg(100, 230) -> Srinagar(160, 140) -> Sonamarg(240, 70) -> Pahalgam(300, 190) */}
            <path
              d="M 100 230 Q 130 180, 160 140 Q 200 90, 240 70 Q 280 120, 300 190 Q 230 220, 100 230"
              stroke="#065F46"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="6 3"
              className="opacity-80"
            />
          </svg>

          {/* Destination Map Markers dynamically rendered from tour destinations */}
          <div className="relative w-full h-[240px]">
            {destinations.map((destName, index) => {
              const key = destName.toLowerCase().trim();
              const KNOWN_COORDS: Record<string, { left: string; top: string }> = {
                srinagar: { left: "38%", top: "42%" },
                gulmarg: { left: "20%", top: "78%" },
                sonamarg: { left: "64%", top: "18%" },
                pahalgam: { left: "78%", top: "65%" },
                doodhpathri: { left: "25%", top: "50%" },
                yusmarg: { left: "32%", top: "70%" },
              };
              const coords = KNOWN_COORDS[key] || {
                left: `${30 + ((index * 20) % 50)}%`,
                top: `${40 + ((index * 25) % 40)}%`,
              };
              const isHub = key.includes("srinagar");

              return (
                <div
                  key={destName}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10"
                  style={{ left: coords.left, top: coords.top }}
                >
                  {isHub ? (
                    <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md ring-2 ring-white">
                      <MapPin className="w-3 h-3 fill-current" />
                    </div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-[var(--season-primary,#065F46)] ring-2 ring-white shadow-xs" />
                  )}
                  <span className="text-xs sm:text-sm font-bold text-slate-900 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-2xs border border-slate-200/80 whitespace-nowrap">
                    {destName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Day-wise Route Table */}
        <div className="md:col-span-5 p-4 sm:p-5 border-t md:border-t-0 md:border-l border-slate-200/90 flex flex-col justify-center bg-white">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display mb-3 pb-2 border-b border-slate-100">
            Day-wise Route
          </h3>
          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            {itinerary.map((day, idx) => {
              const dayLabel = typeof day.day === "string" && day.day.toLowerCase().startsWith("day")
                ? day.day
                : `Day ${day.day}`;
              return (
                <div key={idx} className="py-2 flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-900 shrink-0">
                    {dayLabel}
                  </span>
                  <span className="text-slate-600 text-right truncate font-medium">
                    {day.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
