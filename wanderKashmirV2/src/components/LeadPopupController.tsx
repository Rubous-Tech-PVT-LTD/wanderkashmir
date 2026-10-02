"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import CustomizeTripModal from "@/components/CustomizeTripModal";
import { trackEvent } from "@/lib/analytics";
import { LeadContextPayload } from "@/types/leadPopup";

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
const DEFAULT_DELAY_MS = 15000; // 15 seconds
const DEFAULT_SCROLL_THRESHOLD = 0.55; // 55% scroll depth

const EXCLUDED_ROUTE_PREFIXES = [
  "/admin",
  "/wander-admin",
  "/vendor",
  "/api",
];

const TRAVEL_STYLE_SLUGS = [
  "culture",
  "spiritual",
  "nature",
  "family",
  "adventure",
  "trekking",
];

function formatSlugToTitle(slug: string): string {
  if (!slug) return "";
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

interface ResolvedContext {
  heading: string;
  subtitle: string;
  payload: LeadContextPayload;
}

function resolveRouteContext(pathname: string): ResolvedContext | null {
  if (!pathname) return null;

  // Exclude non-public routes
  for (const prefix of EXCLUDED_ROUTE_PREFIXES) {
    if (pathname.startsWith(prefix)) return null;
  }

  // 1. Homepage
  if (pathname === "/") {
    return {
      heading: "Plan Your Perfect Kashmir Trip",
      subtitle: "Get a personalized itinerary, verified drivers, and handpicked stays direct from Srinagar.",
      payload: {
        sourceType: "homepage",
        sourcePage: "/",
      },
    };
  }

  // 2. Tours Listing
  if (pathname === "/tours") {
    return {
      heading: "Can't Find the Right Kashmir Package?",
      subtitle: "Let our local team in Srinagar customize an itinerary around your dates and budget.",
      payload: {
        sourceType: "tours",
        sourcePage: "/tours",
      },
    };
  }

  // 3. Tour Detail or Travel Style (/tours/[slug])
  if (pathname.startsWith("/tours/")) {
    const slug = pathname.replace("/tours/", "").split("/")[0].toLowerCase().trim();

    // Check if it's one of the 6 verified Travel Styles
    if (TRAVEL_STYLE_SLUGS.includes(slug)) {
      let styleHeading = `Plan Your ${formatSlugToTitle(slug)} Kashmir Trip`;
      if (slug === "family") styleHeading = "Plan Your Family Kashmir Trip";
      else if (slug === "culture") styleHeading = "Plan Your Culture Kashmir Trip";
      else if (slug === "spiritual") styleHeading = "Plan Your Spiritual Kashmir Trip";
      else if (slug === "nature") styleHeading = "Plan Your Nature Kashmir Trip";
      else if (slug === "adventure") styleHeading = "Plan Your Adventure Kashmir Trip";
      else if (slug === "trekking") styleHeading = "Plan Your Trekking Kashmir Trip";

      return {
        heading: styleHeading,
        subtitle: `Explore handpicked ${slug} packages or let us craft a personalized route for you.`,
        payload: {
          sourceType: "travel-style",
          travelStyle: slug,
          sourcePage: pathname,
        },
      };
    }

    // Otherwise it's a specific Tour package
    return {
      heading: "Want to Customize This Trip?",
      subtitle: "Adjust dates, destinations, or hotel categories with our local Srinagar team.",
      payload: {
        sourceType: "tour",
        tourSlug: slug || undefined,
        sourcePage: pathname,
      },
    };
  }

  // 4. Destinations (/destinations/[slug])
  if (pathname.startsWith("/destinations/")) {
    const rawSlug = pathname.replace("/destinations/", "").split("/")[0].trim();
    const destinationName = formatSlugToTitle(rawSlug);

    return {
      heading: "Planning Your Kashmir Trip?",
      subtitle: destinationName
        ? `Explore ${destinationName} with a custom itinerary crafted by local specialists.`
        : "Explore Kashmir with a custom itinerary crafted by local specialists.",
      payload: {
        sourceType: "destination",
        destination: destinationName || undefined,
        sourcePage: pathname,
      },
    };
  }

  // 5. Stays (/stays or /stays/[slug])
  if (pathname.startsWith("/stays")) {
    const rawSlug = pathname.replace(/^\/stays\/?/, "").split("/")[0]?.trim();
    return {
      heading: "Planning a Kashmir Stay?",
      subtitle: "Let us arrange verified heritage houseboats and boutique alpine stays.",
      payload: {
        sourceType: "property",
        propertyId: rawSlug || undefined,
        sourcePage: pathname,
      },
    };
  }

  // 6. Experiences (/experiences or /experiences/[slug])
  if (pathname.startsWith("/experiences")) {
    const rawSlug = pathname.replace(/^\/experiences\/?/, "").split("/")[0]?.trim();
    return {
      heading: "Want to Build This Into Your Kashmir Trip?",
      subtitle: "Add authentic local activities, shikara rides, and guided trails to your journey.",
      payload: {
        sourceType: "experience",
        experienceId: rawSlug || undefined,
        sourcePage: pathname,
      },
    };
  }

  // 7. General public pages (/about, /contact, /safety, etc.)
  return {
    heading: "Plan Your Kashmir Trip",
    subtitle: "Share your travel plans with our Srinagar team for a tailored Kashmir itinerary.",
    payload: {
      sourceType: "general",
      sourcePage: pathname,
    },
  };
}

// Session-level suppression guard: once shown in current browser tab session,
// do not repeatedly auto-trigger on every route change.
let sessionPopupShown = false;

function checkIsSuppressed(): boolean {
  if (typeof window === "undefined") return true;

  // Session guard
  if (sessionPopupShown) return true;

  try {
    // 1. Submitted: never show again
    if (localStorage.getItem("lead_popup_submitted") === "true") {
      return true;
    }

    // 2. Dismissed: 24h cooldown
    const dismissed = localStorage.getItem("lead_popup_dismissed");
    if (dismissed && Date.now() - Number(dismissed) < COOLDOWN_MS) {
      return true;
    }

    // 3. Shown: 24h cooldown
    const lastShown = localStorage.getItem("lead_popup_last_shown");
    if (lastShown && Date.now() - Number(lastShown) < COOLDOWN_MS) {
      return true;
    }
  } catch {
    // If localStorage is unavailable, proceed safely
  }

  return false;
}

/**
 * Global helper for explicit CTA buttons anywhere on the site.
 * Bypasses auto-trigger cooldown and delay.
 */
export function openGlobalCustomizeModal(options?: {
  title?: string;
  subtitle?: string;
  payload?: LeadContextPayload;
}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-customize-trip", { detail: options || {} })
    );
  }
}

export default function LeadPopupController() {
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTrigger, setActiveTrigger] = useState<"time" | "scroll" | "exit_intent" | "cta" | null>(null);
  const [activeContext, setActiveContext] = useState<ResolvedContext | null>(null);

  const hasTriggeredRef = useRef(false);

  // Close handler
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Success handler
  const handleSuccess = useCallback(() => {
    sessionPopupShown = true;
    try {
      localStorage.setItem("lead_popup_submitted", "true");
    } catch (_) {}
  }, []);

  useEffect(() => {
    // Resolve context for the current route
    const resolved = resolveRouteContext(pathname);
    if (!resolved) {
      return;
    }
    setActiveContext(resolved);

    // Reset trigger flag on route change if modal is closed
    hasTriggeredRef.current = false;

    // Trigger helper - first trigger wins
    const executeTrigger = (triggerType: "time" | "scroll" | "exit_intent") => {
      if (hasTriggeredRef.current || isOpen) return;
      hasTriggeredRef.current = true;
      sessionPopupShown = true;

      // Cancel listeners immediately
      clearTimeout(timerId);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);

      try {
        localStorage.setItem("lead_popup_last_shown", Date.now().toString());
      } catch (_) {}

      trackEvent("customize_popup_trigger", {
        triggerType,
        ...resolved.payload,
      });

      setActiveTrigger(triggerType);
      setIsOpen(true);
    };

    // Explicit CTA event listener (always active on public pages)
    const handleCtaOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{
        title?: string;
        subtitle?: string;
        payload?: LeadContextPayload;
      }>;
      const detail = customEvent.detail || {};

      hasTriggeredRef.current = true;
      sessionPopupShown = true;

      // Cancel automatic triggers
      clearTimeout(timerId);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);

      try {
        localStorage.setItem("lead_popup_last_shown", Date.now().toString());
      } catch (_) {}

      if (detail.title || detail.subtitle || detail.payload) {
        setActiveContext({
          heading: detail.title || resolved.heading,
          subtitle: detail.subtitle || resolved.subtitle,
          payload: {
            ...resolved.payload,
            ...(detail.payload || {}),
          },
        });
      }

      trackEvent("customize_popup_trigger", {
        triggerType: "cta",
        ...(detail.payload || resolved.payload),
      });

      setActiveTrigger("cta");
      setIsOpen(true);
    };

    window.addEventListener("open-customize-trip", handleCtaOpen);

    // If suppressed by 24h cooldown or previous submission, only listen for CTA
    if (checkIsSuppressed()) {
      return () => {
        window.removeEventListener("open-customize-trip", handleCtaOpen);
      };
    }

    // 1. Time-based trigger (15s default)
    const timerId = setTimeout(() => {
      executeTrigger("time");
    }, DEFAULT_DELAY_MS);

    // 2. Scroll-based trigger (55% default depth)
    let scrollTicking = false;
    const handleScroll = () => {
      if (scrollTicking || hasTriggeredRef.current) return;
      scrollTicking = true;

      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const winHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;

        if (docHeight > winHeight) {
          const scrollPercent = (scrollTop + winHeight) / docHeight;
          if (scrollPercent >= DEFAULT_SCROLL_THRESHOLD) {
            executeTrigger("scroll");
          }
        }
        scrollTicking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // 3. Desktop Exit-Intent trigger (mouseleave near top boundary)
    const handleMouseLeave = (e: MouseEvent) => {
      if (hasTriggeredRef.current) return;

      // Strictly Desktop only: pointer must be fine and viewport >= 768px
      const isDesktop =
        window.innerWidth >= 768 &&
        window.matchMedia("(pointer: fine)").matches;

      if (!isDesktop) return;

      // Meaningful mouse movement towards top boundary
      if (e.clientY <= 15) {
        executeTrigger("exit_intent");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("open-customize-trip", handleCtaOpen);
    };
  }, [pathname, isOpen]);

  // If on excluded route or context is null, do not render
  if (!activeContext) {
    return null;
  }

  return (
    <CustomizeTripModal
      isOpen={isOpen}
      onClose={handleClose}
      customTitle={activeContext.heading}
      customSubtitle={activeContext.subtitle}
      contextPayload={{
        ...activeContext.payload,
        triggerType: activeTrigger || undefined,
      }}
      onSuccess={handleSuccess}
    />
  );
}
