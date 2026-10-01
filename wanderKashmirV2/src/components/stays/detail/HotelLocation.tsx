import React from "react";
import Link from "next/link";
import { MapPin, Navigation, ExternalLink, Map } from "lucide-react";
import { HotelLocationInfo } from "./types";
import { SectionEmptyState } from "./HotelEmptyState";

interface HotelLocationProps {
  location: HotelLocationInfo;
  hotelName: string;
}

export default function HotelLocation({ location, hotelName }: HotelLocationProps) {
  const hasCoordinates = location.latitude !== null && location.longitude !== null;
  const hasAddress = Boolean(location.address && location.address.trim());

  // Generate real Google Maps directions link based on real address or coordinates
  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`
    : hasAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${hotelName}, ${location.address}`
      )}`
    : null;

  return (
    <section id="location" className="scroll-mt-28 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-[var(--season-primary)]" />
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--season-text,#111827)] font-display tracking-tight">
          Location & Neighborhood
        </h2>
      </div>

      <div className="rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white p-5 sm:p-6 shadow-2xs space-y-5">
        {/* Address Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--season-border,#F3F4F6)]">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--season-primary)]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{location.destinationHub}, Kashmir</span>
            </div>
            <p className="text-sm font-medium text-[var(--season-text,#111827)] font-sans">
              {location.address || "Address not provided yet"}
            </p>
          </div>

          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[var(--season-primary)] bg-[var(--season-primary-light,#FFF7ED)] border border-[var(--season-primary)]/20 hover:bg-[var(--season-primary)] hover:text-white transition-all shrink-0 cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          )}
        </div>

        {/* Map Shell / Coordinates */}
        {hasCoordinates ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]">
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[var(--season-primary)] shadow-2xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider font-display">
                GPS Coordinates
              </div>
              <div className="text-sm font-mono text-slate-600 mt-0.5">
                {location.latitude?.toFixed(5)}° N, {location.longitude?.toFixed(5)}° E
              </div>
            </div>
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[var(--season-primary)] hover:underline flex items-center gap-1"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        ) : (
          <SectionEmptyState
            icon={Map}
            title="Location Map Is Not Available Yet"
            message="Precise geolocation pins and interactive map view will be activated upon host location verification."
          />
        )}

        {/* Destination Hub Context */}
        {location.destinationSlug && (
          <div className="pt-2 text-xs text-[var(--season-muted,#6B7280)] flex items-center justify-between flex-wrap gap-2">
            <span>
              Planning to explore {location.destinationHub}?
            </span>
            <Link
              href={`/destinations/${location.destinationSlug}`}
              className="font-bold text-[var(--season-primary)] hover:underline"
            >
              Explore {location.destinationHub} Travel Guide →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
