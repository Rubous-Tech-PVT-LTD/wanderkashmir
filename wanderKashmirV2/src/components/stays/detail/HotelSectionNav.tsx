"use client";

import React, { useState, useEffect } from "react";

interface HotelSectionNavProps {
  hasRooms: boolean;
  hasAmenities: boolean;
  hasDining: boolean;
  hasExperiences: boolean;
  hasPhotos: boolean;
  hasLocation: boolean;
  hasReviews: boolean;
  hasPolicies: boolean;
}

export default function HotelSectionNav({
  hasRooms,
  hasAmenities,
  hasDining,
  hasExperiences,
  hasPhotos,
  hasLocation,
  hasReviews,
  hasPolicies,
}: HotelSectionNavProps) {
  const [activeSection, setActiveSection] = useState<string>("overview");

  const navItems = [
    { id: "overview", label: "Overview", show: true },
    { id: "rooms", label: "Rooms & Pricing", show: hasRooms },
    { id: "amenities", label: "Amenities", show: hasAmenities },
    { id: "dining", label: "Dining", show: hasDining },
    { id: "experiences", label: "Experiences", show: hasExperiences },
    { id: "photos", label: "Photos", show: hasPhotos },
    { id: "location", label: "Location & Map", show: hasLocation },
    { id: "reviews", label: "Guest Reviews", show: hasReviews },
    { id: "policies", label: "Policies", show: hasPolicies },
  ].filter((item) => item.show);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const el = document.getElementById(navItems[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [navItems]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveSection(id);
    }
  };

  return (
    <nav
      aria-label="Hotel section navigation"
      className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-y border-[var(--season-border,#E5E7EB)] shadow-2xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5 no-scrollbar scroll-smooth">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-[var(--season-primary-light,#FFF7ED)] text-[var(--season-primary)] border border-[var(--season-primary)]/20"
                    : "text-[var(--season-text,#4B5563)] hover:text-[var(--season-primary)] hover:bg-slate-50"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
