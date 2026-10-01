import React from "react";
import { Hotel, Clock, MapPin, Coffee, DoorClosed, ShieldCheck } from "lucide-react";
import { HotelDetailViewModel } from "./types";

interface HotelQuickFactsProps {
  hotel: HotelDetailViewModel;
}

export default function HotelQuickFacts({ hotel }: HotelQuickFactsProps) {
  const { basic, location, dining } = hotel;

  const facts = [
    {
      icon: Hotel,
      label: "Property Type",
      value: basic.propertyType,
    },
    {
      icon: MapPin,
      label: "Destination",
      value: location.destinationHub,
    },
    {
      icon: Clock,
      label: "Check-in / Out",
      value: `${basic.checkInTime || "12:00 PM"} / ${basic.checkOutTime || "11:00 AM"}`,
    },
    ...(basic.totalRooms
      ? [
          {
            icon: DoorClosed,
            label: "Total Units",
            value: `${basic.totalRooms} Rooms`,
          },
        ]
      : []),
    {
      icon: Coffee,
      label: "Breakfast",
      value: dining.breakfastIncluded ? "Breakfast Included" : "Available On-Site",
    },
    ...(basic.isVerified
      ? [
          {
            icon: ShieldCheck,
            label: "Trust Status",
            value: "WanderKashmir Verified",
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 sm:p-5 rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white shadow-2xs">
      {facts.map((fact, idx) => {
        const Icon = fact.icon;
        return (
          <div key={idx} className="flex flex-col space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--season-muted,#6B7280)] uppercase tracking-wider">
              <Icon className="w-3.5 h-3.5 text-[var(--season-primary)] shrink-0" />
              <span>{fact.label}</span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-[var(--season-text,#111827)] font-display truncate">
              {fact.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
