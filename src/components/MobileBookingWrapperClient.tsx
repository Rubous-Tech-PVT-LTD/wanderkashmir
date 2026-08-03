"use client";

import { useState } from "react";
import { X } from "lucide-react";
import BookingSidebar from "./BookingSidebar";

interface MobileBookingWrapperProps {
  propertyId: string;
  pricePerNight: number;
  rating: number;
  isLoggedIn: boolean;
  propertyType?: string;
  maxGuests?: number;
}

export default function MobileBookingWrapperClient({
  propertyId,
  pricePerNight,
  rating,
  isLoggedIn,
  propertyType = "HOTEL",
  maxGuests = 2
}: MobileBookingWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Rough estimation of taxes & fees (e.g. 15% combined)
  const taxesAndFees = Math.round(pricePerNight * 0.15);

  return (
    <>
      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#18181B] text-white p-4 flex items-center justify-between z-40 lg:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.15)] border-t border-slate-800 pb-safe">
        <div className="flex flex-col">
          <div className="flex items-end gap-2">
            <span className="text-xl font-bold">₹ {pricePerNight.toLocaleString('en-IN')}</span>
          </div>
          <span className="text-xs text-zinc-400 mt-1">
            + ₹ {taxesAndFees.toLocaleString('en-IN')} taxes & fees
          </span>
          <span className="text-xs text-zinc-500 mt-0.5">
            Per Night ({maxGuests} Adults)
          </span>
        </div>
        
        <button
          onClick={() => setIsOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-lg active:scale-95 transition-all text-sm"
        >
          SELECT ROOM
        </button>
      </div>

      {/* Modal/Drawer containing BookingSidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200">
          <div className="bg-slate-50 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto relative animate-in slide-in-from-bottom-full duration-300">
            {/* Mobile handle & Close Button */}
            <div className="sticky top-0 bg-slate-50/90 backdrop-blur z-10 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900">Select Dates & Rooms</span>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 pb-24">
              <BookingSidebar 
                propertyId={propertyId}
                pricePerNight={pricePerNight}
                rating={rating}
                isLoggedIn={isLoggedIn}
                propertyType={propertyType}
                maxGuests={maxGuests}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
