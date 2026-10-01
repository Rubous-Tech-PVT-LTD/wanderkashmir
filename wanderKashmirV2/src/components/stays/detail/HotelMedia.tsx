import React from "react";
import Image from "next/image";
import { Camera, Image as ImageIcon } from "lucide-react";
import { HotelMediaInfo } from "./types";
import { SectionEmptyState } from "./HotelEmptyState";

interface HotelMediaProps {
  media: HotelMediaInfo;
  hotelName: string;
}

export default function HotelMedia({ media, hotelName }: HotelMediaProps) {
  const hasImages = media.images && media.images.length > 0;

  return (
    <section id="photos" className="scroll-mt-28 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full bg-[var(--season-primary)]" />
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--season-text,#111827)] font-display tracking-tight">
            Photos & Visual Media
          </h2>
        </div>
        {hasImages && (
          <span className="text-xs text-[var(--season-muted,#6B7280)] font-semibold">
            {media.images.length} verified photo{media.images.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white p-5 sm:p-6 shadow-2xs">
        {hasImages ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {media.images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 group border border-slate-200/60"
              >
                <Image
                  src={img}
                  alt={`${hotelName} - View ${idx + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        ) : (
          <SectionEmptyState
            icon={ImageIcon}
            title="Visual Gallery Not Available Yet"
            message="High-definition guest rooms, exterior views, and common area photos are currently being verified."
          />
        )}
      </div>
    </section>
  );
}
