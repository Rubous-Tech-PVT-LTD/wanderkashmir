"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { HELP_ME_CHOOSE_CONFIG } from "@/components/HelpMeChoose";
import CustomizeTripModal from "@/components/CustomizeTripModal";

// =============================================================================
// MOUNTAIN PEAK LOGO ICON (Clean Kashmiri Snow-capped Silhouette)
// =============================================================================
function KashmirMountainLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Primary High Himalayan Peak */}
      <path
        d="M24 4L37 28H11L24 4Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Snow Cap Highlights on Main Peak */}
      <path
        d="M24 4L28.5 12.5L25 15L23 13.5L20 15L19.5 12.5L24 4Z"
        fill="currentColor"
      />
      {/* Secondary Left Shoulder Peak */}
      <path
        d="M14 14L4 28H18L14 14Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Secondary Right Shoulder Peak */}
      <path
        d="M34 14L44 28H30L34 14Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// =============================================================================
// SOCIAL ICONS
// =============================================================================
function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 01-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 01-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 011.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418zM15.194 12 10 15V9l5.194 3z" clipRule="evenodd" />
    </svg>
  );
}

function XIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.6823 10.6218L20.2391 3h-1.5766l-5.7135 6.6142L8.35 3H3.1829l6.8914 10.0031L3.1829 21h1.5765l6.0229-6.9811L15.65 21h5.1671l-7.1348-10.3782zm-2.1318 2.4718-.6983-.9981L5.1342 4.1196h2.3893l4.4834 6.4181.6983.9981 5.8299 8.3394h-2.3893l-4.7573-6.8035z" />
    </svg>
  );
}

function LinkedinIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
    </svg>
  );
}

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.04 7.5C8.87 7.5 8.6 7.57 8.36 7.83C8.12 8.09 7.44 8.73 7.44 10.03C7.44 11.33 8.39 12.59 8.52 12.76C8.65 12.93 10.37 15.58 13.01 16.72C13.64 16.99 14.13 17.15 14.51 17.27C15.15 17.47 15.73 17.44 16.19 17.37C16.7 17.29 17.76 16.73 17.98 16.11C18.2 15.49 18.2 14.96 18.13 14.85C18.06 14.74 17.89 14.68 17.63 14.55C17.37 14.42 16.1 13.79 15.86 13.71C15.63 13.62 15.46 13.58 15.29 13.84C15.12 14.1 14.64 14.68 14.5 14.85C14.35 15.02 14.21 15.04 13.95 14.91C13.69 14.78 12.85 14.51 11.86 13.62C11.09 12.93 10.57 12.08 10.42 11.82C10.27 11.56 10.4 11.42 10.54 11.29C10.66 11.17 10.8 10.98 10.94 10.83C11.08 10.68 11.12 10.57 11.21 10.39C11.3 10.22 11.25 10.07 11.19 9.94C11.12 9.81 10.61 8.56 10.4 8.04C10.19 7.54 9.98 7.61 9.82 7.6C9.67 7.6 9.5 7.59 9.33 7.59C9.16 7.59 9.04 7.5 9.04 7.5Z" />
    </svg>
  );
}

// =============================================================================
// REAL SITE LINKS FROM VERIFIED DATABASE AND PRODUCTION ROUTES
// =============================================================================
export const REAL_FOOTER_LINKS = {
  Explore: [
    { label: "Tour Packages", href: "/tours" },
    { label: "Hotels & Stays", href: "/stays?type=hotel" },
    { label: "Traditional Homestays", href: "/stays?type=homestay" },
    { label: "Dal Lake Houseboats", href: "/stays?type=houseboat" },
    { label: "Luxury Resorts", href: "/stays?type=resort" },
    { label: "Kashmir Experiences", href: "/experiences" },
  ],
  Destinations: [
    { label: "Srinagar Travel Guide", href: "/destinations/srinagar" },
    { label: "Gulmarg Travel Guide", href: "/destinations/gulmarg" },
    { label: "Pahalgam Travel Guide", href: "/destinations/pahalgam" },
    { label: "Sonamarg Travel Guide", href: "/destinations/sonamarg" },
    { label: "Doodhpathri Travel Guide", href: "/destinations/doodhpathri" },
    { label: "Yusmarg Travel Guide", href: "/destinations/yusmarg" },
  ],
  TravelStyles: [
    { label: "Culture Tours", href: "/tours/culture" },
    { label: "Spiritual Tours", href: "/tours/spiritual" },
    { label: "Nature Tours", href: "/tours/nature" },
    { label: "Family Tours", href: "/tours/family" },
    { label: "Adventure Tours", href: "/tours/adventure" },
    { label: "Trekking Tours", href: "/tours/trekking" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Our Vision", href: "/our-vision" },
    { label: "Kashmir Travel Blog", href: "/blog" },
    { label: "Help Center", href: "/help" },
    { label: "Cancellation Policy", href: "/cancellation" },
    { label: "Contact Us", href: "/contact" },
  ],
};

// =============================================================================
// MAIN COMPONENT: Footer
// =============================================================================
export default function Footer() {
  const [customizeOpen, setCustomizeOpen] = useState(false);

  return (
    <>
        <footer
        role="contentinfo"
        aria-label="Site Footer"
        className="text-white transition-colors duration-300"
        style={{ backgroundColor: "var(--season-footer-bg, #0C2B20)" }}
      >
        {/* ===================================================================
            1. PRE-FOOTER CTA BAND: "Ready to explore Kashmir?"
        =================================================================== */}
        <div className="border-b border-white/10">
          <div
            className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left"
            style={{ maxWidth: HELP_ME_CHOOSE_CONFIG.containerMaxWidth }}
          >
            <div>
              <h2 className="font-display text-xl sm:text-2xl md:text-[26px] font-extrabold text-white tracking-tight leading-snug">
                Ready to explore Kashmir?
              </h2>
              <p className="text-xs sm:text-sm text-white/80 font-sans mt-0.5">
                Kashmir&apos;s first all-in-one travel marketplace. Book verified stays, curated tours, and authentic local experiences.
              </p>
            </div>

            <div className="flex items-center gap-3 sm:gap-3.5 flex-wrap justify-center">
              <Link
                href="/tours"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-slate-100 transition-all duration-200 shadow-xs cursor-pointer group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
                style={{ color: "var(--season-primary)" }}
              >
                <span>Explore Tours</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={() => setCustomizeOpen(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/25 transition-all duration-200 shadow-xs cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Customize Trip</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================
            2. MAIN FOOTER: Brand, Real Contacts, Real Links (4 Columns)
        =================================================================== */}
        <div
          className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12"
          style={{ maxWidth: HELP_ME_CHOOSE_CONFIG.containerMaxWidth }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Column 1: Real Brand Details & Contact Info (Span 4) */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
              <div>
                <Link
                  href="/"
                  aria-label="WanderKashmir - Return to homepage"
                  className="inline-flex items-center gap-2.5 group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white rounded-lg p-0.5"
                >
                  <KashmirMountainLogo className="w-8 h-8 text-white transition-transform duration-200 group-hover:scale-105" />
                  <span className="font-display font-extrabold text-xl sm:text-2xl text-white tracking-tight">
                    WanderKashmir
                  </span>
                </Link>

                <p className="text-xs font-semibold tracking-wide text-white/90 font-sans mt-2">
                  Real Places, Real People, Meaningful Journeys.
                </p>

                <p className="text-xs sm:text-[13px] text-white/70 font-sans mt-2 max-w-sm leading-relaxed">
                  Kashmir&apos;s first all-in-one travel marketplace. Book verified stays, curated tour packages, and authentic local experiences — all in one place.
                </p>

                {/* Real Verified Contacts */}
                <div className="mt-4 space-y-2.5 text-xs text-white/80 font-sans">
                  <a
                    href="tel:+916005888754"
                    aria-label="Call WanderKashmir support at +91 60058 88754"
                    className="flex items-center gap-2.5 hover:text-white transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white rounded-xs"
                  >
                    <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--season-secondary)" }} />
                    <span>+91 60058 88754</span>
                  </a>

                  <a
                    href="mailto:support@wanderkashmir.com"
                    aria-label="Email WanderKashmir support at support@wanderkashmir.com"
                    className="flex items-center gap-2.5 hover:text-white transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-white rounded-xs"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--season-secondary)" }} />
                    <span>support@wanderkashmir.com</span>
                  </a>

                  <div className="flex items-start gap-2.5 text-white/70" aria-label="Registered Office Address">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "var(--season-secondary)" }} />
                    <span>Hati Gam, Anantnag, Jammu and Kashmir, 192401</span>
                  </div>
                </div>
              </div>

              {/* Social Media & WhatsApp Links */}
              <div className="pt-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* WhatsApp Direct */}
                  <a
                    href="https://wa.me/916005888754?text=Hi%20WanderKashmir%2C%20I%20want%20to%20plan%20a%20trip%20to%20Kashmir."
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all hover:scale-110 shadow-xs"
                  >
                    <WhatsAppIcon className="w-4 h-4" />
                  </a>

                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/wanderkashmir__/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-[var(--season-primary)] text-white/80 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                  >
                    <InstagramIcon className="w-3.5 h-3.5" />
                  </a>

                  {/* Facebook */}
                  <a
                    href="https://facebook.com/wanderkashmir"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-[var(--season-primary)] text-white/80 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                  >
                    <FacebookIcon className="w-3.5 h-3.5" />
                  </a>

                  {/* YouTube */}
                  <a
                    href="https://youtube.com/@wanderkashmir"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-[var(--season-primary)] text-white/80 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                  >
                    <YoutubeIcon className="w-3.5 h-3.5" />
                  </a>

                  {/* X / Twitter */}
                  <a
                    href="https://x.com/Wanderkashmir"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter / X"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-[var(--season-primary)] text-white/80 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://www.linkedin.com/company/india-hiles/?viewAsMember=true"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-[var(--season-primary)] text-white/80 hover:text-white flex items-center justify-center transition-all hover:scale-110"
                  >
                    <LinkedinIcon className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Explore (Span 2) */}
            <div className="lg:col-span-2">
              <h3 className="font-display font-extrabold text-sm sm:text-[15px] text-white tracking-wide uppercase mb-3 sm:mb-4">
                Explore
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-white/75 font-sans">
                {REAL_FOOTER_LINKS.Explore.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="hover:text-white transition-colors duration-150 inline-block py-0.5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Destinations (Span 2) */}
            <div className="lg:col-span-2">
              <h3 className="font-display font-extrabold text-sm sm:text-[15px] text-white tracking-wide uppercase mb-3 sm:mb-4">
                Destinations
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-white/75 font-sans">
                {REAL_FOOTER_LINKS.Destinations.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="hover:text-white transition-colors duration-150 inline-block py-0.5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Travel Styles (Span 2) */}
            <div className="lg:col-span-2">
              <h3 className="font-display font-extrabold text-sm sm:text-[15px] text-white tracking-wide uppercase mb-3 sm:mb-4">
                Travel Styles
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-white/75 font-sans">
                {REAL_FOOTER_LINKS.TravelStyles.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="hover:text-white transition-colors duration-150 inline-block py-0.5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 5: Company (Span 2) */}
            <div className="lg:col-span-2">
              <h3 className="font-display font-extrabold text-sm sm:text-[15px] text-white tracking-wide uppercase mb-3 sm:mb-4">
                Company
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-white/75 font-sans">
                {REAL_FOOTER_LINKS.Company.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="hover:text-white transition-colors duration-150 inline-block py-0.5"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ===================================================================
            3. BOTTOM BAR: Real Copyright & Legal Links from Live Main Site
        =================================================================== */}
        <div className="border-t border-white/10">
          <div
            className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/70 font-sans"
            style={{ maxWidth: HELP_ME_CHOOSE_CONFIG.containerMaxWidth }}
          >
            <div>
              © {new Date().getFullYear()} WanderKashmir. All rights reserved. Made with ❤️ in Kashmir.
            </div>

            <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy-policy"
                className="hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/cancellation"
                className="hover:text-white transition-colors"
              >
                Cancellation
              </Link>
              <Link
                href="/safety"
                className="hover:text-white transition-colors"
              >
                Safety
              </Link>
              <Link
                href="/sitemap.xml"
                className="hover:text-white transition-colors"
              >
                Sitemap
              </Link>
              <div className="flex items-center gap-1.5 pl-3 border-l border-white/20 text-white/80">
                <span>🇮🇳</span>
                <span>India</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Customize Trip Modal */}
      <CustomizeTripModal
        isOpen={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
      />
    </>
  );
}
