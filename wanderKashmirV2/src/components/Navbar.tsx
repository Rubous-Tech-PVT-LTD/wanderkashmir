"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  ChevronDown,
  Package,
  Hotel,
  Palmtree,
  Anchor,
  Home,
  Car,
  UserCheck,
} from "lucide-react";
import CustomizeTripModal from "@/components/CustomizeTripModal";

// Approved Cloudinary Brand Logo URL
export const BRAND_LOGO_SRC =
  "https://res.cloudinary.com/dcmoseix9/image/upload/v1790838648/My%20Brand/WhatsApp_Image_2026-09-27_at_12.47.53_PM_1_aptjs2.jpg";

// =========================================================================
// 🎛️ HEADER SPACING & SIZING CONTROLS (MakeMyTrip Spacious & Clear Scale)
// =========================================================================
export const HEADER_SPACING = {
  // 1. Screen ke LEFT edge se Logo ka distance
  logoLeftPadding: "27px",

  // 🎯 Logo Scale Factor (scale ratio without changing width/height)
  logoScale: 1.4,

  // 2. Screen ke RIGHT edge se WhatsApp ka distance
  whatsappRightPadding: "27px",

  // 3. 🎯 Center Navigation items ke beech ka gap (Open & spacious like MakeMyTrip)
  centerNavGap: "18px",

  // 4. 🎯 SVG VECTOR ICONS KA SIZE (Scaled to 32px for crisp MakeMyTrip-grade visibility & zero clutter)
  navIconSize: "32px",

  // 🏖️ CUSTOMIZE TRIP SVG ICON KA SPECIFIC SIZE
  customizeIconSize: "32px",

  // 5. 🎯 Center Container Position (Left/Right Move karne ke liye)
  centerContainerShiftX: "40px",

  // 🎯 Navigation Elements & Hero Search Bar Shared Width
  navElementsWidth: "760px",

  // 6. Header Width ("100%" = screen ke bilkul corners tak, ya "1440px", "1280px")
  containerMaxWidth: "100%",

  // 7. 🎯 MAKEMYTRIP STYLE GROUND SHADOW (Soft, subtle & consistent floor shadow)
  groundShadowColor: "rgba(100, 116, 139, 0.28)",
};

// =========================================================================
// 🧭 BESPOKE 3D ISOMETRIC TRAVEL SVG ICONS (MakeMyTrip Bold, Spacious Aesthetic)
// =========================================================================

// 1. EXPLORE: 3D Isometric Compass Puck with Bezel Depth & Ground Shadow
function CompassVectorIcon({
  size = HEADER_SPACING.navIconSize,
  groundShadow = HEADER_SPACING.groundShadowColor,
  className = "",
  style,
}: {
  size?: string;
  groundShadow?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      style={{ width: size, height: size, ...style }}
      className={className}
      aria-hidden="true"
    >
      {/* 1. Consistent MMT Ground Shadow */}
      <ellipse cx="16" cy="27" rx="10" ry="2.2" fill={groundShadow} stroke="none" />

      {/* 2. 3D Compass Bezel / Cylinder Depth */}
      <path
        d="M6 14.5V17.5C6 21.8 10.5 24.8 16 24.8C21.5 24.8 26 21.8 26 17.5V14.5"
        fill="#CBD5E1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* 3. Top Dial Face (Solid White Surface with Room to Breathe) */}
      <ellipse
        cx="16"
        cy="14.5"
        rx="10"
        ry="7.5"
        fill="#FFFFFF"
        stroke="currentColor"
        strokeWidth="1.6"
      />

      {/* 4. Cardinal Tick Marks */}
      <line x1="16" y1="8.5" x2="16" y2="10.5" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="16" y1="18.5" x2="16" y2="20.5" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="7.5" y1="14.5" x2="9.5" y2="14.5" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="22.5" y1="14.5" x2="24.5" y2="14.5" stroke="#64748B" strokeWidth="1.3" strokeLinecap="round" />

      {/* 5. 3D Bold Faceted Magnetic Needle */}
      <polygon
        points="16,14.5 13.2,13.2 21.5,10.2"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.8"
      />
      <polygon
        points="16,14.5 18.8,15.8 10.5,18.8"
        fill="#94A3B8"
        stroke="currentColor"
        strokeWidth="0.8"
      />

      {/* Center Jewel Dot */}
      <circle cx="16" cy="14.5" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

// 2. DESTINATIONS: 3D Isometric Map Pin & Scenic Trail (Sharp, Proud Pin Tip - No Submersion)
function DestinationsRouteVectorIcon({
  size = HEADER_SPACING.navIconSize,
  groundShadow = HEADER_SPACING.groundShadowColor,
  className = "",
  style,
}: {
  size?: string;
  groundShadow?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      style={{ width: size, height: size, ...style }}
      className={className}
      aria-hidden="true"
    >
      {/* 1. Consistent MMT Ground Shadow */}
      <ellipse cx="16" cy="27" rx="10" ry="2.2" fill={groundShadow} stroke="none" />

      {/* 2. Scenic Route Trailing from Pin to Right (Tip remains 100% exposed and sharp on left) */}
      <path
        d="M16 24.8C18.5 24.8 21 26.2 24.5 25.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="24.5" cy="25.8" r="1.4" fill="currentColor" stroke="none" />

      {/* 3. Razor-Sharp 3D Map Pin (Zero Dab / Zero Submersion into Line) */}
      <path
        d="M16 24.8L9.8 11.2A6.4 6.4 0 1 1 22.2 11.2Z"
        fill="#FFFFFF"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="miter"
      />

      {/* Center Jewel Core */}
      <circle cx="16" cy="9.8" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

// 3. TRAVEL GUIDE: 3D Standing Field Journal (MakeMyTrip Visa/Booklet Style)
function TravelGuideVectorIcon({
  size = HEADER_SPACING.navIconSize,
  groundShadow = HEADER_SPACING.groundShadowColor,
  className = "",
  style,
}: {
  size?: string;
  groundShadow?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      style={{ width: size, height: size, ...style }}
      className={className}
      aria-hidden="true"
    >
      {/* 1. Consistent MMT Ground Shadow */}
      <ellipse cx="16" cy="27" rx="10" ry="2.3" fill={groundShadow} stroke="none" />

      {/* 2. 3D Booklet Spine & Paper Depth Edge */}
      <polygon
        points="20.5,6.5 24.5,5 24.5,22.5 20.5,24.2"
        fill="#CBD5E1"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* 3. Solid White Front Cover (Isometric Angle) */}
      <polygon
        points="9.5,8 20.5,6.5 20.5,24.2 9.5,25.8"
        fill="#FFFFFF"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* 4. Clean Guidebook Crest & Title Lines */}
      <circle cx="15" cy="14" r="3" stroke="currentColor" strokeWidth="1.3" fill="#F1F5F9" />
      <path d="M12.8 14H17.2M15 11.8V16.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="12.5" y1="19.5" x2="17.5" y2="18.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="12.5" y1="22" x2="16" y2="21.5" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// 4. CUSTOMIZE TRIP: Exact MakeMyTrip Reference 3D Icon (Tilted Umbrella + Curved Crook + Beach Ball)
function CustomizeTripVectorIcon({
  size = HEADER_SPACING.customizeIconSize || HEADER_SPACING.navIconSize,
  groundShadow = HEADER_SPACING.groundShadowColor,
  className = "",
  style,
}: {
  size?: string;
  groundShadow?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      style={{ width: size, height: size, ...style }}
      className={className}
      aria-hidden="true"
    >
      {/* 1. MMT Consistent Ground Shadow */}
      <ellipse cx="14" cy="28.5" rx="11" ry="2.6" fill={groundShadow} stroke="none" />

      {/* 2. Umbrella Shaft with Crook Curve around Beach Ball */}
      <path
        d="M19 12L15 20C14.2 21.8 13.2 23.5 12 24.8C10.8 25.8 9.5 26.2 8 26"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* 3. Beach Ball (Sphere with Signature MMT Black Curved Crescent) */}
      <circle cx="10" cy="23" r="4.2" fill="#FFFFFF" stroke="currentColor" strokeWidth="1.4" />
      {/* MMT Signature Solid Black Curved Crescent */}
      <path
        d="M6.5 24.5C7.2 22.5 8.8 21 11 20.5C11.5 22.2 10.8 24.2 8.5 25.5C7.5 25.2 6.8 24.8 6.5 24.5Z"
        fill="currentColor"
      />
      <path
        d="M7.8 20.8C9.2 19.8 11.2 20.2 12.5 21.2"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />

      {/* 4. Umbrella Finial Peg */}
      <line x1="21.8" y1="2.2" x2="20.5" y2="4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />

      {/* 5. Umbrella Canopy (Shallow Elliptical Dome with Alternating MMT Panels) */}
      {/* Panel 1 (Left Grey) */}
      <path
        d="M7.5 11.5C9.5 6.5 14.5 4 20.5 4.5L13.5 12.8C11.5 12.2 9.5 11.8 7.5 11.5Z"
        fill="#CBD5E1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* Panel 2 (Center-Left White) */}
      <path
        d="M20.5 4.5C22.5 4.8 24.5 5.8 26.2 7.2L19.5 13.8L13.5 12.8L20.5 4.5Z"
        fill="#FFFFFF"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* Panel 3 (Center-Right Grey) */}
      <path
        d="M26.2 7.2C28.5 9 30 11 31 13.2L25.2 14.2L19.5 13.8L26.2 7.2Z"
        fill="#CBD5E1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* Panel 4 (Far-Right White) */}
      <path
        d="M31 13.2C31.5 13.8 31 14.2 30 14.5L25.2 14.2L31 13.2Z"
        fill="#FFFFFF"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      {/* Outer Rim Outline */}
      <path
        d="M7.5 11.5C9.5 6 15 3.5 24 5.8C28 7.8 30 10.8 31 13.2C24.5 15.5 15.5 14.8 7.5 11.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 5. WHATSAPP: Official WhatsApp Speech Bubble with Grounded Shadow
function WhatsAppOfficialVectorIcon({
  size = HEADER_SPACING.navIconSize,
  groundShadow = HEADER_SPACING.groundShadowColor,
  className = "",
}: {
  size?: string;
  groundShadow?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      style={{ width: size, height: size }}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* 1. Consistent MMT Ground Shadow */}
      <ellipse cx="16" cy="27" rx="10" ry="2.4" fill={groundShadow} stroke="none" />

      {/* 2. WhatsApp Official Speech Bubble Grounded on Baseline */}
      <g transform="translate(3.5, 3) scale(1.05)">
        <path
          fill="#25D366"
          d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 20.5L7.3 19.3C8.75 20.1 10.38 20.5 12.04 20.5C17.5 20.5 21.96 16.05 21.96 11.91C21.96 6.45 17.5 2 12.04 2Z"
        />
        <path
          fill="#FFFFFF"
          d="M17.51 14.88C17.21 14.73 15.74 14.01 15.47 13.91C15.2 13.81 15 13.76 14.8 14.06C14.6 14.36 14.03 15.03 13.86 15.23C13.69 15.43 13.51 15.45 13.21 15.3C12.91 15.15 11.95 14.84 10.82 13.83C9.93 13.04 9.33 12.07 9.16 11.77C8.99 11.47 9.14 11.31 9.29 11.16C9.42 11.03 9.58 10.82 9.73 10.65C9.88 10.48 9.93 10.35 10.03 10.15C10.13 9.95 10.08 9.78 10.01 9.63C9.93 9.48 9.33 8.01 9.08 7.41C8.84 6.83 8.59 6.91 8.41 6.9C8.24 6.89 8.04 6.89 7.84 6.89C7.64 6.89 7.32 6.96 7.04 7.26C6.77 7.56 6 8.28 6 9.73C6 11.18 7.06 12.58 7.21 12.78C7.36 12.98 9.3 15.98 12.27 17.26C12.98 17.57 13.53 17.75 13.97 17.89C14.68 18.12 15.33 18.08 15.84 18C16.41 17.91 17.6 17.28 17.85 16.58C18.1 15.88 18.1 15.28 18.02 15.15C17.95 15.03 17.81 14.98 17.51 14.88Z"
        />
      </g>
    </svg>
  );
}

const exploreLinks = [
  { label: "Tour Packages", href: "/tours", desc: "Curated all-inclusive & private itineraries", icon: Package },
  { label: "Hotels", href: "/stays?type=hotel", desc: "Handpicked boutique & luxury stays across the valley", icon: Hotel },
  { label: "Resorts", href: "/stays?type=resort", desc: "Alpine retreats & scenic valley resorts", icon: Palmtree },
  { label: "Dal Lake Houseboats", href: "/stays?type=houseboat", desc: "Heritage cedar wood living on Dal & Nigeen", icon: Anchor },
  { label: "Traditional Homestays", href: "/stays?type=homestay", desc: "Authentic Kashmiri village hospitality", icon: Home },
  { label: "Cabs & Airport Transfers", href: "/taxis", desc: "Direct commercial fleet with mountain drivers", icon: Car },
  { label: "Verified Local Guides", href: "/guides", desc: "Certified alpine & cultural specialists", icon: UserCheck },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav
        aria-label="Main Navigation"
        className={`site-header fixed top-0 left-0 right-0 z-50 transition-all duration-200 bg-white/95 backdrop-blur-md h-[64px] min-h-[64px] md:h-[64px] md:min-h-[64px] lg:h-[64px] lg:min-h-[64px] flex items-center ${
          scrolled ? "shadow-2xs" : ""
        }`}
      >
        <div
          className="relative w-full mx-auto h-full flex items-center justify-between"
          style={{
            maxWidth: HEADER_SPACING.containerMaxWidth,
            paddingLeft: HEADER_SPACING.logoLeftPadding,
            paddingRight: HEADER_SPACING.whatsappRightPadding,
          }}
        >
          {/* 1. LEFT: Brand Logo (Anchored to Left, Scale Factor Controlled) */}
          <Link
            href="/"
            className="flex items-center group shrink-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--season-primary)] rounded-lg transition-transform duration-200"
            style={{
              transform: `scale(${HEADER_SPACING.logoScale || 1})`,
              transformOrigin: "left center",
            }}
          >
            <Image
              src={BRAND_LOGO_SRC}
              alt="WanderKashmir - Local Kashmir Marketplace"
              width={140}
              height={44}
              style={{ width: "auto" }}
              className="h-9 md:h-10 lg:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              priority
            />
          </Link>

          {/* 2. CENTER: Navigation Elements with SVG Vector Icons (Centered & Width-Synced) */}
          <div
            className="hidden lg:flex items-center justify-between font-medium absolute top-1/2"
            style={{
              left: "50%",
              width: HEADER_SPACING.navElementsWidth,
              transform: `translate(calc(-50% + ${HEADER_SPACING.centerContainerShiftX || "0px"}), -50%)`,
            }}
          >
            {/* Explore Dropdown with Bespoke Travel Compass Vector Icon */}
            <div
              ref={exploreRef}
              className="relative group flex items-center shrink-0"
              onMouseEnter={() => setExploreOpen(true)}
              onMouseLeave={() => setExploreOpen(false)}
            >
              <button
                type="button"
                onClick={() => setExploreOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#17211D] hover:text-[var(--season-primary)] hover:bg-[var(--season-primary-light)] transition-all duration-200 tracking-wider uppercase leading-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--season-primary)] whitespace-nowrap shrink-0 group cursor-pointer"
                aria-expanded={exploreOpen}
              >
                <CompassVectorIcon
                  className="transition-transform duration-300 group-hover:rotate-45 shrink-0"
                  style={{ color: "var(--season-secondary)" }}
                />
                <span>Explore</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#56635E] group-hover:text-[var(--season-primary)] transition-transform duration-200 stroke-[2] ${
                    exploreOpen ? "rotate-180 text-[var(--season-primary)]" : ""
                  }`}
                />
              </button>

              {exploreOpen && (
                <div className="absolute top-full left-0 pt-2 z-50 animate-fade-in">
                  <div
                    className="w-84 bg-white border shadow-xl rounded-2xl p-2"
                    style={{ borderColor: "var(--season-border)" }}
                  >
                    <div className="grid grid-cols-1 gap-1">
                      {exploreLinks.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setExploreOpen(false)}
                            className="group/item flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--season-primary-light)] transition-all duration-200"
                          >
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 shadow-2xs group-hover/item:text-white"
                              style={{
                                backgroundColor: "var(--season-primary-light)",
                                color: "var(--season-secondary)",
                              }}
                            >
                              <ItemIcon className="w-4 h-4 stroke-[1.8]" />
                            </div>
                            <span className="text-xs font-bold text-[#17211D] group-hover/item:text-[var(--season-primary)] transition-colors">
                              {item.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Destinations with Southall-style Route & Pin Vector Icon */}
            <Link
              href="/destinations"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#17211D] hover:text-[var(--season-primary)] hover:bg-[var(--season-primary-light)] transition-all duration-200 tracking-wider uppercase leading-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--season-primary)] whitespace-nowrap shrink-0 group"
            >
              <DestinationsRouteVectorIcon
                className="transition-transform duration-200 group-hover:-translate-y-0.5 shrink-0"
                style={{ color: "var(--season-secondary)" }}
              />
              <span>Destinations</span>
            </Link>

            {/* Travel Guide with Field Guide Journal Vector Icon */}
            <Link
              href="/blog"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#17211D] hover:text-[var(--season-primary)] hover:bg-[var(--season-primary-light)] transition-all duration-200 tracking-wider uppercase leading-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--season-primary)] whitespace-nowrap shrink-0 group"
            >
              <TravelGuideVectorIcon
                className="transition-transform duration-200 group-hover:scale-105 shrink-0"
                style={{ color: "var(--season-secondary)" }}
              />
              <span>Travel Guide</span>
            </Link>

            {/* Customize Trip (Direct button in nav, 100% consistent gap with Travel Guide) */}
            <button
              type="button"
              onClick={() => setCustomizeOpen(true)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#17211D] hover:text-[var(--season-primary)] hover:bg-[var(--season-primary-light)] transition-all duration-200 tracking-wider uppercase leading-none focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--season-primary)] whitespace-nowrap shrink-0 group cursor-pointer"
            >
              <CustomizeTripVectorIcon
                className="transition-transform duration-200 group-hover:-translate-y-0.5 shrink-0"
                style={{ color: "var(--season-secondary)" }}
              />
              <span>Customize Trip</span>
            </button>
          </div>

          {/* 3. RIGHT: WhatsApp Action Anchor (No Background, No Border, Clean Like Southall Travel) */}
          <div className="hidden lg:flex items-center shrink-0">
            <a
              href="https://wa.me/916005888754?text=Hi%20WanderKashmir%2C%20I%20want%20to%20plan%20a%20trip%20to%20Kashmir."
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 px-1 py-1 rounded-xl hover:opacity-85 transition-opacity duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--season-primary)]"
              title="Chat with Srinagar Local Expert"
            >
              <div className="flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <WhatsAppOfficialVectorIcon className="shrink-0" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-[#17211D] tracking-wide leading-none group-hover:text-[var(--season-primary)] transition-colors">
                  WhatsApp
                </span>
                <span className="text-[9px] uppercase font-bold text-[#56635E] tracking-wider mt-1 leading-none">
                  Srinagar Team 24/7
                </span>
              </div>
            </a>
          </div>

          {/* Mobile Menu Toggle - Vertically Centered */}
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
            className="lg:hidden h-10 w-10 flex items-center justify-center text-[#17211D] hover:bg-neutral-100 rounded-xl transition-colors shrink-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--season-primary)]"
          >
            <Menu className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-50 bg-white flex flex-col"
        >
          <div
            className="h-[64px] min-h-[64px] flex items-center justify-between px-4 border-b"
            style={{ borderColor: "var(--season-border)" }}
          >
            <Link href="/" className="flex items-center" onClick={() => setMobileOpen(false)}>
              <Image
                src={BRAND_LOGO_SRC}
                alt="WanderKashmir - Local Kashmir Marketplace"
                width={120}
                height={38}
                style={{ width: "auto" }}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="p-2 text-[#56635E] hover:bg-[#F7F7F3] rounded-xl"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-xs uppercase font-bold tracking-wider text-[#56635E] px-2 pt-2 flex items-center gap-2">
              <CompassVectorIcon className="w-4 h-4" style={{ color: "var(--season-secondary)" }} />
              <span>Explore Kashmir</span>
            </div>
            <div className="space-y-1">
              {exploreLinks.map((link) => {
                const MobileItemIcon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#17211D] hover:bg-neutral-50 hover:text-[var(--season-primary)] transition-colors"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: "var(--season-primary-light)",
                        color: "var(--season-secondary)",
                      }}
                    >
                      <MobileItemIcon className="w-3.5 h-3.5 stroke-[1.8]" />
                    </div>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>

            <div
              className="border-t pt-3 space-y-1"
              style={{ borderColor: "var(--season-border)" }}
            >
              <Link
                href="/destinations"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#17211D] hover:bg-neutral-50 hover:text-[var(--season-primary)]"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--season-primary-light)",
                    color: "var(--season-secondary)",
                  }}
                >
                  <DestinationsRouteVectorIcon className="w-4 h-4" />
                </div>
                <span>Destinations</span>
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#17211D] hover:bg-neutral-50 hover:text-[var(--season-primary)]"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--season-primary-light)",
                    color: "var(--season-secondary)",
                  }}
                >
                  <TravelGuideVectorIcon className="w-4 h-4" />
                </div>
                <span>Travel Guide</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setCustomizeOpen(true);
                }}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-bold transition-opacity flex items-center gap-3 cursor-pointer hover:opacity-90"
                style={{
                  color: "var(--season-primary)",
                  backgroundColor: "var(--season-primary-light)",
                }}
              >
                <div
                  className="w-7 h-7 rounded-lg bg-white shadow-2xs flex items-center justify-center shrink-0"
                  style={{ color: "var(--season-secondary)" }}
                >
                  <CustomizeTripVectorIcon className="w-4 h-4" />
                </div>
                <span>Customize Trip</span>
              </button>
            </div>

            <div
              className="border-t pt-3"
              style={{ borderColor: "var(--season-border)" }}
            >
              <a
                href="https://wa.me/916005888754?text=Hi%20WanderKashmir%2C%20I%20want%20to%20plan%20a%20trip%20to%20Kashmir."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3 bg-[#25D366] text-white rounded-xl font-bold text-sm shadow-sm"
              >
                <WhatsAppOfficialVectorIcon className="w-5 h-5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Customize Trip Modal rendered outside navigation layout */}
      <CustomizeTripModal
        isOpen={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
      />
    </>
  );
}
