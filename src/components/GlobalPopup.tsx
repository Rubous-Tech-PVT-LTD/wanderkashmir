"use client";

import { useState, useEffect } from "react";
import { X, Gift, LogIn, AlertTriangle, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { getActivePopup } from "@/actions/site-popups";

export default function GlobalPopup() {
  const [popup, setPopup] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Do not show global popups on admin or vendor dashboards
    if (pathname && (pathname.startsWith('/wander-admin') || pathname.startsWith('/vendor'))) {
      return;
    }

    // Determine which popup to fetch based on path
    const fetchActivePopup = async () => {
      try {
        const res = await getActivePopup(pathname);
        
        if (res.success && res.popup) {
          const activePopup = res.popup;
          
          // Check if user already dismissed this specific popup
          const dismissedPopups = JSON.parse(localStorage.getItem("dismissedGlobalPopups") || "[]");
          if (dismissedPopups.includes(activePopup.id)) {
            return; // Don't show if already dismissed
          }

          setPopup(activePopup);

          // Handle Trigger Rule
          if (activePopup.triggerRule === "IMMEDIATE") {
            setIsVisible(true);
          } else if (activePopup.triggerRule === "DELAY_3S") {
            setTimeout(() => setIsVisible(true), 3000);
          } else if (activePopup.triggerRule === "DELAY_10S") {
            setTimeout(() => setIsVisible(true), 10000);
          } else if (activePopup.triggerRule === "ON_SCROLL") {
            const handleScroll = () => {
              if (window.scrollY > 300) {
                setIsVisible(true);
                window.removeEventListener("scroll", handleScroll);
              }
            };
            window.addEventListener("scroll", handleScroll);
            return () => window.removeEventListener("scroll", handleScroll);
          }
        }
      } catch (err) {
        console.error("Failed to load global popup", err);
      }
    };

    fetchActivePopup();
  }, [pathname]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (popup) {
      const dismissedPopups = JSON.parse(localStorage.getItem("dismissedGlobalPopups") || "[]");
      if (!dismissedPopups.includes(popup.id)) {
        dismissedPopups.push(popup.id);
        localStorage.setItem("dismissedGlobalPopups", JSON.stringify(dismissedPopups));
      }
    }
  };

  if (!isVisible || !popup) return null;

  // Determine styling based on type
  let ThemeIcon = Gift;
  let bgClass = "bg-gradient-to-br from-orange-500 to-amber-600";
  let iconBgClass = "bg-white/20 text-white";
  let textClass = "text-white";
  let buttonClass = "bg-white text-orange-600 hover:bg-orange-50";

  if (popup.type === "SIGN_IN") {
    ThemeIcon = LogIn;
    bgClass = "bg-gradient-to-br from-indigo-900 to-slate-900";
    iconBgClass = "bg-indigo-500/30 text-indigo-300";
    buttonClass = "bg-indigo-500 text-white hover:bg-indigo-600";
  } else if (popup.type === "UPDATE") {
    ThemeIcon = AlertTriangle;
    bgClass = "bg-gradient-to-br from-rose-600 to-red-800";
    iconBgClass = "bg-white/20 text-white";
    buttonClass = "bg-white text-rose-700 hover:bg-rose-50";
  }

  // Determine layout based on displayStyle
  if (popup.displayStyle === "BANNER") {
    return (
      <div className={`fixed top-0 left-0 right-0 z-50 ${bgClass} shadow-lg animate-in slide-in-from-top-full duration-500`}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${iconBgClass}`}>
              <ThemeIcon className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-sm font-bold ${textClass}`}>
                {popup.title}
              </p>
              <p className={`text-xs opacity-90 ${textClass} hidden sm:block`}>
                {popup.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {popup.buttonText && (
              <a 
                href={popup.buttonLink || "#"} 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${buttonClass}`}
              >
                {popup.buttonText}
              </a>
            )}
            <button 
              onClick={handleDismiss}
              className={`p-1.5 rounded-full hover:bg-white/20 transition-colors ${textClass} opacity-80 hover:opacity-100`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (popup.displayStyle === "TOAST") {
    return (
      <div className="fixed bottom-4 right-4 z-50 w-[320px] sm:w-[380px] animate-in slide-in-from-right-8 fade-in duration-500">
        <div className={`${bgClass} rounded-2xl shadow-2xl p-4 relative overflow-hidden group border border-white/10`}>
          <button 
            onClick={handleDismiss}
            className={`absolute top-3 right-3 z-50 rounded-full p-1 transition-colors ${iconBgClass} hover:bg-white/30`}
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex gap-4">
            <div className={`shrink-0 p-3 rounded-xl h-fit ${iconBgClass}`}>
              <ThemeIcon className="w-6 h-6" />
            </div>
            <div className="pr-4">
              <h3 className={`font-bold text-lg leading-tight ${textClass}`}>{popup.title}</h3>
              <p className={`text-sm mt-1 opacity-90 ${textClass}`}>{popup.description}</p>
              
              {popup.buttonText && (
                <a 
                  href={popup.buttonLink || "#"} 
                  className={`mt-3 inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${buttonClass}`}
                >
                  {popup.buttonText} <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default to MODAL (Centered)
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`${bgClass} rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-500 border border-white/10`}>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <button 
          onClick={handleDismiss}
          className={`absolute top-4 right-4 z-50 rounded-full p-1.5 transition-colors ${iconBgClass} hover:bg-white/30`}
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-8 text-center relative z-10 flex flex-col items-center">
          <div className={`p-4 rounded-2xl mb-5 shadow-inner ${iconBgClass}`}>
            <ThemeIcon className="w-10 h-10" />
          </div>
          
          <h2 className={`text-2xl font-black mb-3 ${textClass}`}>{popup.title}</h2>
          <p className={`text-base mb-8 opacity-90 ${textClass}`}>{popup.description}</p>
          
          {popup.buttonText && (
            <a 
              href={popup.buttonLink || "#"} 
              className={`w-full py-3.5 rounded-xl text-base font-bold transition-colors flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5 transform ${buttonClass}`}
            >
              {popup.buttonText} <ArrowRight className="w-5 h-5" />
            </a>
          )}
          
          <button 
            onClick={handleDismiss}
            className={`mt-4 text-sm font-medium opacity-70 hover:opacity-100 transition-opacity ${textClass} underline decoration-white/30 underline-offset-4`}
          >
            No thanks, maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
