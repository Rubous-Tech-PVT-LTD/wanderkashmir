import React from "react";
import { DoorOpen } from "lucide-react";
import { HotelRoomItem } from "./types";
import HotelRoomCard from "./HotelRoomCard";
import { SectionEmptyState } from "./HotelEmptyState";

interface HotelRoomsProps {
  hotelName: string;
  rooms: HotelRoomItem[];
}

export default function HotelRooms({ hotelName, rooms }: HotelRoomsProps) {
  const hasRooms = rooms && rooms.length > 0;

  return (
    <section id="rooms" className="scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full bg-[var(--season-primary)]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--season-text,#111827)] font-display tracking-tight">
            Rooms & Pricing
          </h2>
        </div>
        {hasRooms && (
          <span className="text-xs text-[var(--season-muted,#6B7280)] font-semibold">
            {rooms.length} room tier{rooms.length === 1 ? "" : "s"} available
          </span>
        )}
      </div>

      {hasRooms ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rooms.map((room) => (
            <HotelRoomCard key={room.id} room={room} hotelName={hotelName} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white p-5 sm:p-6 shadow-2xs">
          <SectionEmptyState
            icon={DoorOpen}
            title="Room Information Will Appear Once Property Is Published"
            message="Detailed room configurations, bed options, and seasonal meal plan tariffs are currently being updated by the local host."
          />
        </div>
      )}
    </section>
  );
}
