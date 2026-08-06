"use client";

import { useState, useEffect } from "react";
import { Tag, X, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface Promo {
  id: string;
  code: string;
  discountPercent: number;
  tour?: { title: string } | null;
  property?: { name: string } | null;
  vehicle?: { make: string; model: string } | null;
  guideProfile?: { vendorProfile?: { user?: { name: string | null } | null } | null } | null;
}

export default function PromoPopup({ promos }: { promos: Promo[] }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!promos || promos.length === 0) return;

    // Check if user already dismissed the promo popup for these specific codes
    const dismissedCodes = JSON.parse(localStorage.getItem("dismissedPromos") || "[]");
    
    // If we only have 1 active promo, check if it's dismissed
    const activePromo = promos[0];
    if (dismissedCodes.includes(activePromo.code)) {
      return;
    }

    const handleScroll = () => {
      // Show popup after scrolling down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
        window.removeEventListener("scroll", handleScroll);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [promos]);

  if (!isVisible || !promos || promos.length === 0) return null;

  const promo = promos[0]; // Display the most recent active promo

  const handleDismiss = () => {
    setIsVisible(false);
    
    // Save to local storage so we don't show this specific promo again
    const dismissedCodes = JSON.parse(localStorage.getItem("dismissedPromos") || "[]");
    if (!dismissedCodes.includes(promo.code)) {
      dismissedCodes.push(promo.code);
      localStorage.setItem("dismissedPromos", JSON.stringify(dismissedCodes));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(promo.code);
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-in slide-in-from-top-2 fade-in duration-300' : 'animate-out slide-out-to-top-2 fade-out duration-300'
        } max-w-sm w-full bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex border border-white/10 overflow-hidden`}
      >
        <div className="flex-1 p-3 px-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 bg-orange-500/20 text-orange-400 p-2 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Promo code copied!
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste at checkout to claim your discount.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-white/10">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full p-4 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    ), { duration: 4000 });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-8 fade-in duration-500 max-w-sm w-full">
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-2xl p-1 pb-4 relative overflow-hidden group">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors z-50 bg-white/10 hover:bg-white/20 rounded-full p-1 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative z-10 px-5 pt-5 pb-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-orange-500 text-white p-1.5 rounded-lg shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-white font-bold text-lg">Special Offer!</h3>
          </div>
          
          <p className="text-indigo-100 text-sm mb-4 leading-relaxed">
            Get <span className="font-bold text-orange-400">{promo.discountPercent}% OFF</span>{" "}
            {promo.tour ? (
              <span>on the <strong>{promo.tour.title}</strong> package!</span>
            ) : promo.property ? (
              <span>on your stay at <strong>{promo.property.name}</strong>!</span>
            ) : promo.vehicle ? (
              <span>on bookings for <strong>{promo.vehicle.make} {promo.vehicle.model}</strong>!</span>
            ) : promo.guideProfile ? (
              <span>on tours with guide <strong>{promo.guideProfile.vendorProfile?.user?.name || 'this guide'}</strong>!</span>
            ) : (
              <span>on all tours, hotels, and taxis!</span>
            )}
          </p>

          <div 
            onClick={copyToClipboard}
            className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-400" />
              <span className="font-mono font-bold text-white tracking-widest">{promo.code}</span>
            </div>
            <span className="text-xs font-bold text-white bg-white/20 px-2 py-1 rounded-md">COPY</span>
          </div>
        </div>
      </div>
    </div>
  );
}
