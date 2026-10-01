"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  MapPin,
  BookOpen,
} from "lucide-react";
import { HELP_ME_CHOOSE_CONFIG } from "@/components/HelpMeChoose";

// =============================================================================
// DATA TYPES & CATALOG
// =============================================================================
export interface FeaturedDestinationItem {
  id?: string;
  name: string;
  slug: string;
  href: string;
  imageUrl: string;
  placesCount?: number;
  subtitle?: string;
  description?: string | null;
}

export interface TravelGuideItem {
  id?: string;
  title: string;
  imageUrl: string;
  href: string;
}

export interface DestinationGuidesAndFAQProps {
  featuredDestinations?: FeaturedDestinationItem[];
  travelGuides?: TravelGuideItem[];
}

export const FEATURED_DESTINATIONS: FeaturedDestinationItem[] = [];

export const TRAVEL_GUIDES: TravelGuideItem[] = [];

export const FAQS_DATA = [
  {
    id: "faq-1",
    question: "What is the best time to visit Kashmir?",
    answer:
      "Kashmir is a magical year-round destination. March to May brings blooming tulip gardens and fresh green valleys; June to August offers pleasant mountain temperatures away from mainland heat; September to November features golden autumn Chinar foliage; and December to February offers snow wonderlands in Gulmarg and Sonamarg.",
  },
  {
    id: "faq-2",
    question: "Can we customize a tour package?",
    answer:
      "Yes, 100% of our itineraries can be personalized! You can adjust the trip length, choose private boutique hotels or heritage Dal Lake houseboats, add local culinary experiences, and request special activities like Gulmarg Gondola passes or pony treks.",
  },
  {
    id: "faq-3",
    question: "Are flights included in the package?",
    answer:
      "Our core packages cover comprehensive on-ground logistics across Kashmir: private dedicated cab (sedan or SUV), verified hotel stays with meals, shikara rides, and 24/7 local ground support. Flight assistance from your home airport is available upon request.",
  },
  {
    id: "faq-4",
    question: "Is it safe to travel to Kashmir?",
    answer:
      "Yes, Kashmir is very safe and celebrated for its warm hospitality. Millions of families, honeymoon couples, and solo travelers visit every year without hesitation. Our Srinagar-based support team remains on call 24/7 for complete peace of mind.",
  },
];

// =============================================================================
// MAIN COMPONENT: DestinationGuidesAndFAQ
// =============================================================================
export default function DestinationGuidesAndFAQ({
  featuredDestinations = [],
  travelGuides = [],
}: DestinationGuidesAndFAQProps = {}) {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setOpenFaq((prev) => (prev === id ? null : id));
  };

  const destinations =
    featuredDestinations && featuredDestinations.length > 0
      ? featuredDestinations
      : FEATURED_DESTINATIONS;

  const guides =
    travelGuides && travelGuides.length > 0 ? travelGuides : TRAVEL_GUIDES;

  return (
    <section
      aria-labelledby="featured-destinations-heading"
      data-analytics-section="destinations-guides-faq"
      className="bg-white border-b transition-colors duration-200"
      style={{
        borderColor: "var(--season-border)",
        paddingTop: "24px",
        paddingBottom: "36px",
      }}
    >
      <div
        className="w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-7 sm:space-y-8"
        style={{ maxWidth: HELP_ME_CHOOSE_CONFIG.containerMaxWidth }}
      >
        {/* ===================================================================
            1. FEATURED DESTINATIONS
        =================================================================== */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-3.5">
            <h2
              id="featured-destinations-heading"
              className="font-display text-lg sm:text-xl font-extrabold text-[#17211D] tracking-tight"
            >
              Featured Destinations
            </h2>
            <Link
              href="/destinations"
              className="group inline-flex items-center gap-1 text-xs font-bold transition-all duration-200 hover:translate-x-0.5 cursor-pointer"
              style={{ color: "var(--season-primary)" }}
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          {destinations.length === 0 ? (
            <div
              className="bg-slate-50 border border-dashed rounded-xl p-8 text-center text-sm text-[#56635E]"
              style={{ borderColor: "var(--season-border)" }}
            >
              <MapPin className="w-6 h-6 mx-auto mb-2 text-[#56635E]/60" />
              <p className="font-medium text-[#17211D]">No destinations available</p>
              <p className="text-xs text-[#56635E] mt-1">Check back soon for newly published destination guides.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
              {destinations.map((dest) => (
                <Link
                  key={dest.slug || dest.name}
                  href={dest.href}
                  className="group flex flex-col bg-white rounded-xl overflow-hidden border transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--season-primary)] focus:outline-hidden"
                  style={{ borderColor: "var(--season-border)" }}
                >
                  {/* Destination Image Banner */}
                  <div className="relative w-full h-24 sm:h-28 overflow-hidden bg-slate-100">
                    <Image
                      src={dest.imageUrl || "/placeholder-image.jpg"}
                      alt={dest.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-106"
                    />
                  </div>

                  {/* Destination Details */}
                  <div className="p-2.5 sm:p-3">
                    <h3 className="font-display font-extrabold text-[13.5px] sm:text-[14px] text-[#17211D] group-hover:text-[var(--season-primary)] transition-colors leading-tight truncate">
                      {dest.name}
                    </h3>
                    <span className="text-[11px] text-[#56635E] font-medium block mt-0.5">
                      {dest.subtitle ||
                        (dest.placesCount && dest.placesCount > 0
                          ? `${dest.placesCount} ${dest.placesCount === 1 ? "Place" : "Places"}`
                          : "Travel Guide")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ===================================================================
            2. KASHMIR TRAVEL GUIDES
        =================================================================== */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-3.5">
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#17211D] tracking-tight">
              Kashmir Travel Guides
            </h2>
            {guides.length > 0 && (
              <Link
                href="/guides"
                className="group inline-flex items-center gap-1 text-xs font-bold transition-all duration-200 hover:translate-x-0.5 cursor-pointer"
                style={{ color: "var(--season-primary)" }}
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            )}
          </div>

          {guides.length === 0 ? (
            <div
              className="bg-slate-50 border border-dashed rounded-xl p-8 text-center text-sm text-[#56635E]"
              style={{ borderColor: "var(--season-border)" }}
            >
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-[#56635E]/60" />
              <p className="font-medium text-[#17211D]">Travel guides coming soon</p>
              <p className="text-xs text-[#56635E] mt-1">Our comprehensive Kashmir travel guides and packing tips are currently in preparation.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
              {guides.map((guide) => (
                <Link
                  key={guide.title}
                  href={guide.href}
                  className="group flex flex-col bg-white rounded-xl overflow-hidden border transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-[var(--season-primary)] focus:outline-hidden"
                  style={{ borderColor: "var(--season-border)" }}
                >
                  {/* Guide Image Banner */}
                  <div className="relative w-full h-28 sm:h-32 overflow-hidden bg-slate-100">
                    <Image
                      src={guide.imageUrl}
                      alt={guide.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-106"
                    />
                  </div>

                  {/* Guide Title */}
                  <div className="p-3">
                    <h3 className="font-display font-extrabold text-[13px] sm:text-[13.5px] text-[#17211D] group-hover:text-[var(--season-primary)] transition-colors leading-snug line-clamp-1">
                      {guide.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ===================================================================
            3. FREQUENTLY ASKED QUESTIONS (2-Column Interactive Accordion)
        =================================================================== */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-3 sm:mb-3.5">
            <h2 className="font-display text-lg sm:text-xl font-extrabold text-[#17211D] tracking-tight">
              Frequently Asked Questions
            </h2>
            <Link
              href="/faqs"
              className="group inline-flex items-center gap-1 text-xs font-bold transition-all duration-200 hover:translate-x-0.5 cursor-pointer"
              style={{ color: "var(--season-primary)" }}
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            {FAQS_DATA.map((faq) => {
              const isOpen = openFaq === faq.id;

              return (
                <div
                  key={faq.id}
                  className="bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-2xs"
                  style={{
                    borderColor: isOpen
                      ? "var(--season-primary)"
                      : "var(--season-border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(faq.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-2.5 p-3 sm:p-3.5 text-left cursor-pointer transition-colors focus:outline-hidden hover:bg-[var(--season-primary-light)]/30"
                  >
                    <span className="font-display font-bold text-[13px] sm:text-[13.5px] text-[#17211D] leading-snug">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#56635E] shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-[var(--season-primary)]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-3.5 pb-3.5 pt-0 text-xs text-[#56635E] font-sans leading-relaxed border-t border-slate-100 mt-0.5 pt-2">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
