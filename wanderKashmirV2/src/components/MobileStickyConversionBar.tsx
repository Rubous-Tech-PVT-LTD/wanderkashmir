"use client";

import React, { useEffect, useState } from "react";
import { PhoneCall, Sparkles } from "lucide-react";
import CustomizeTripModal from "@/components/CustomizeTripModal";

export default function MobileStickyConversionBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setVisible(window.scrollY > 420);
    };
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!visible) return null;

  return (
    <aside
      aria-label="Quick Contact and Trip Planning"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]"
      style={{ borderColor: "var(--season-border)" }}
    >
      <CustomizeTripModal
        customTitle="Plan Your Perfect Kashmir Trip"
        customSubtitle="Get a personalized itinerary, verified drivers, and handpicked stays direct from Srinagar."
        contextPayload={{
          sourceType: "homepage",
          sourcePage: "/",
        }}
        renderTrigger={(openModal) => (
          <div className="max-w-lg mx-auto flex items-center gap-2">
            {/* WhatsApp */}
            <a
              href="https://wa.me/916005888754?text=Hi%20WanderKashmir%2C%20I%20want%20to%20plan%20a%20trip%20to%20Kashmir."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with WanderKashmir on WhatsApp"
              className="min-h-[44px] px-3 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform shrink-0"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.042 21.848h-.008a9.837 9.837 0 0 1-5.01-1.378l-.359-.214-3.725.976.994-3.633-.235-.374a9.86 9.86 0 0 1-1.512-5.26c.003-5.446 4.436-9.878 9.886-9.878 2.64 0 5.12 1.028 6.985 2.894a9.827 9.827 0 0 1 2.89 6.986c-.003 5.447-4.436 9.88-9.911 9.88zM20.52 3.483A11.93 11.93 0 0 0 12.04 0C5.402 0 .01 5.393 0 12.032a11.98 11.98 0 0 0 1.63 6.02L0 24l6.102-1.602a11.93 11.93 0 0 0 5.938 1.57h.005c6.634 0 12.03-5.393 12.033-12.032a11.906 11.906 0 0 0-3.556-8.453z" />
              </svg>
              <span>WhatsApp</span>
            </a>

            {/* Customize Trip */}
            <button
              type="button"
              onClick={openModal}
              aria-label="Customize your Kashmir trip"
              className="min-h-[44px] flex-1 px-3 rounded-xl text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-transform cursor-pointer"
              style={{ backgroundColor: "var(--season-primary, #D62828)" }}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">Customize Trip</span>
            </button>

            {/* Call */}
            <a
              href="tel:+916005888754"
              aria-label="Call WanderKashmir now"
              className="min-h-[44px] px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform shrink-0"
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Call</span>
            </a>
          </div>
        )}
      />
    </aside>
  );
}
