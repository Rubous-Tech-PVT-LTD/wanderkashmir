"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, MapPin, Users, Wifi, Flame, Mountain, Coffee, ArrowRight, ShieldCheck, Hotel, Anchor, Home, Palmtree } from "lucide-react";

export interface StayPropertyItem {
  id: string;
  name: string;
  location: string;
  description: string | null;
  pricePerNight: number;
  images: string[];
  amenities: string[];
  bedrooms: number;
  beds: number;
  guests: number;
  breakfastIncluded: boolean;
  dinnerIncluded: boolean;
  vendorType: string;
  propertyType?: string;
  rating?: number | null;
}

interface StayCardProps {
  property: StayPropertyItem;
}

export default function StayCard({ property }: StayCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  // Normalize stay type strictly from Property.propertyType
  const pt = (property.propertyType || "HOTEL").toUpperCase();
  const stayCategory =
    pt === "RESORT"
      ? "Resort"
      : pt === "HOUSEBOAT"
      ? "Houseboat"
      : pt === "HOMESTAY"
      ? "Homestay"
      : "Hotel";

  const CategoryIcon =
    stayCategory === "Resort"
      ? Palmtree
      : stayCategory === "Houseboat"
      ? Anchor
      : stayCategory === "Homestay"
      ? Home
      : Hotel;

  // Clean location (extract primary town/hub)
  const locLower = property.location.toLowerCase();
  let primaryLocation = "Kashmir Valley";
  if (locLower.includes("pahalgam")) primaryLocation = "Pahalgam";
  else if (locLower.includes("srinagar") || locLower.includes("dal lake") || locLower.includes("nigeen")) primaryLocation = "Srinagar";
  else if (locLower.includes("gulmarg")) primaryLocation = "Gulmarg";
  else if (locLower.includes("sonamarg")) primaryLocation = "Sonamarg";
  else if (locLower.includes("gurez")) primaryLocation = "Gurez Valley";
  else if (locLower.includes("doodhpathri")) primaryLocation = "Doodhpathri";
  else if (locLower.includes("kupwara") || locLower.includes("keran")) primaryLocation = "Kupwara";

  // First 3 amenities to display as compact tags
  const displayAmenities = property.amenities.slice(0, 3);

  const mainImage = property.images && property.images.length > 0 && property.images[0].startsWith("http")
    ? property.images[0]
    : "/images/dal-lake-hero.png";

  return (
    <article className="group flex flex-col rounded-2xl border border-[var(--season-border,#E5E7EB)] bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-[var(--season-primary)] transition-all duration-300">
      {/* 1. Image Header */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <Image
          src={mainImage}
          alt={property.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15 pointer-events-none" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-slate-800 shadow-xs backdrop-blur-xs border border-white/40">
          <CategoryIcon className="w-3 h-3 text-[var(--season-primary)]" />
          <span>{stayCategory}</span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setIsSaved(!isSaved);
          }}
          aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-transform duration-200 hover:scale-110 cursor-pointer ${
            isSaved ? "bg-rose-500 text-white shadow-sm" : "bg-black/35 text-white hover:bg-black/55"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
        </button>

        {/* Location Overlay Badge */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium pointer-events-none">
          <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-md">
            <MapPin className="w-3 h-3 text-[var(--season-secondary,#F4A261)] shrink-0" />
            <span className="truncate max-w-[180px]">{primaryLocation}</span>
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300 font-semibold bg-black/50 px-2 py-0.5 rounded-md">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified
          </span>
        </div>
      </div>

      {/* 2. Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Guest & Capacity Specs */}
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[var(--season-muted,#6B7280)] mb-1">
            <Users className="w-3 h-3" />
            <span>Up to {property.guests || 2} Guests</span>
            <span>•</span>
            <span>{property.bedrooms || 1} Bed{property.bedrooms > 1 ? "s" : ""}</span>
            {property.breakfastIncluded && (
              <>
                <span>•</span>
                <span className="text-emerald-700 font-bold">Breakfast Free</span>
              </>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-[var(--season-text,#111827)] font-display group-hover:text-[var(--season-primary)] transition-colors line-clamp-1">
            <Link href={`/stays/${property.id}`} className="focus:outline-hidden">
              {property.name}
            </Link>
          </h3>

          {/* Specific Location snippet */}
          <p className="mt-1 text-xs text-[var(--season-muted,#4B5563)] line-clamp-1">
            {property.location}
          </p>

          {/* Amenities Chips */}
          {displayAmenities.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {displayAmenities.map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60"
                >
                  {amenity}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 3. Bottom Pricing & CTA */}
        <div className="pt-3 border-t border-[var(--season-border,#F3F4F6)] flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-[var(--season-muted,#6B7280)]">
              Starting from
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-extrabold text-[var(--season-text,#111827)] font-display">
                ₹{property.pricePerNight.toLocaleString()}
              </span>
              <span className="text-xs text-[var(--season-muted,#6B7280)] font-medium">
                / night
              </span>
            </div>
          </div>

          <Link
            href={`/stays/${property.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all duration-200 shadow-2xs hover:shadow-xs group-hover:gap-2"
            style={{
              backgroundColor: "var(--season-primary)",
            }}
          >
            <span>Explore</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
