import React from "react";
import { Users, Bed, Check, Coffee, ArrowRight } from "lucide-react";
import { HotelRoomItem } from "./types";

interface HotelRoomCardProps {
  room: HotelRoomItem;
  hotelName: string;
}

export default function HotelRoomCard({ room, hotelName }: HotelRoomCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white p-5 sm:p-6 shadow-2xs hover:border-[var(--season-primary)] transition-all flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        {/* Room Title */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base sm:text-lg font-bold text-[var(--season-text,#111827)] font-display">
            {room.name}
          </h3>
          {room.mealPlan && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
              <Coffee className="w-3 h-3 text-emerald-600" />
              <span>{room.mealPlan}</span>
            </span>
          )}
        </div>

        {/* Room Description */}
        {room.description && (
          <p className="text-xs text-[var(--season-muted,#4B5563)] leading-relaxed">
            {room.description}
          </p>
        )}

        {/* Specs: Occupancy & Bed */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--season-text,#374151)] font-medium">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[var(--season-primary)]" />
            <span>Up to {room.capacity} Guests</span>
          </div>
          {room.bedType && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-3.5 h-3.5 text-[var(--season-primary)]" />
              <span>{room.bedType}</span>
            </div>
          )}
        </div>

        {/* Room Amenities */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-1.5">
            {room.amenities.map((am, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{am}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pricing & CTA */}
      <div className="pt-4 border-t border-[var(--season-border,#F3F4F6)] flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase font-bold text-[var(--season-muted,#6B7280)]">
            Rate / Night
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[var(--season-text,#111827)] font-display">
            ₹{room.basePrice.toLocaleString()}
          </div>
        </div>

        <a
          href="#booking"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          style={{ backgroundColor: "var(--season-primary)" }}
        >
          <span>Select Room</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
