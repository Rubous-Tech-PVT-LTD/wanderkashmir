"use client";

import { useEffect } from "react";
import { Users, Home, Utensils, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";

const MEAL_PLANS = [
  {
    key: "EP" as const,
    priceField: "priceEP",
    label: "Stay Essentials",
    subtitle: "Accommodation Only",
    badge: "Room Only",
    inclusions: ["Comfortable Room Stay", "Essential Amenities", "High-speed Wi-Fi"],
  },
  {
    key: "CP" as const,
    priceField: "priceCP",
    label: "Stay & Breakfast",
    subtitle: "Breakfast Included",
    badge: "Most Popular",
    inclusions: ["Comfortable Room Stay", "Daily Fresh Breakfast", "Essential Amenities", "High-speed Wi-Fi"],
  },
  {
    key: "MAP" as const,
    priceField: "priceMAP",
    label: "Stay & Dining",
    subtitle: "Breakfast + Dinner Included",
    badge: "Best Value",
    inclusions: ["Comfortable Room Stay", "Daily Breakfast & Dinner", "Essential Amenities", "High-speed Wi-Fi"],
  },
] as const;

interface RoomSelectorProps {
  roomTypes?: any[];
  propertyBasePrice?: number;
  propertyName?: string;
  propertyGuests?: number;
  propertyTotalRooms?: number;
}

export default function RoomSelector({
  roomTypes = [],
  propertyBasePrice,
  propertyName,
  propertyGuests = 2,
  propertyTotalRooms = 1,
}: RoomSelectorProps) {
  const { selectedRoomId, selectedMealPlan, setSelectedRoom, setIsModalOpen } = useBookingStore();

  const hasRoomTypes = Array.isArray(roomTypes) && roomTypes.length > 0;
  const hasValidBasePrice = typeof propertyBasePrice === "number" && propertyBasePrice > 0;

  const handleSelect = (room: any, mealPlan: string | null, price: number) => {
    setSelectedRoom(room.id, room.name, mealPlan, price);
  };

  const handleBookNow = (room: any, mealPlan: string | null, price: number) => {
    setSelectedRoom(room.id, room.name, mealPlan, price);
    setIsModalOpen(true);
  };

  const handleBookNowBase = () => {
    setSelectedRoom(null, "Standard Accommodation", null, propertyBasePrice || 0);
    setIsModalOpen(true);
  };

  // Automatically select the default room on initial load
  useEffect(() => {
    if (hasRoomTypes && !selectedRoomId) {
      const firstRoom = roomTypes[0];
      const firstPlan = MEAL_PLANS.find((p) => {
        const val = firstRoom[p.priceField];
        return typeof val === "number" && val > 0;
      });
      if (firstPlan) {
        setSelectedRoom(firstRoom.id, firstRoom.name, firstPlan.key, firstRoom[firstPlan.priceField]);
      } else {
        setSelectedRoom(firstRoom.id, firstRoom.name, null, Number(firstRoom.basePrice));
      }
    } else if (!hasRoomTypes && hasValidBasePrice && selectedRoomId === null && propertyBasePrice) {
      setSelectedRoom(null, "Standard Accommodation", null, propertyBasePrice);
    }
  }, [hasRoomTypes, hasValidBasePrice, roomTypes, propertyBasePrice, selectedRoomId, setSelectedRoom]);

  // ─── CASE 1: REAL ROOM TYPES CONFIGURED ───
  if (hasRoomTypes) {
    return (
      <div className="space-y-8">
        {roomTypes.map((room: any) => {
          const isRoomSelected = selectedRoomId === room.id;
          const availablePlans = MEAL_PLANS.filter((p) => {
            const val = room[p.priceField];
            return typeof val === "number" && val > 0;
          });
          const hasMealPlans = availablePlans.length > 0;

          return (
            <div
              key={room.id}
              className={`bg-white border rounded-2xl p-6 sm:p-7 shadow-sm transition-all duration-200 ${
                isRoomSelected
                  ? "border-orange-400 ring-1 ring-orange-400 shadow-md"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Room Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{room.name}</h3>
                    {isRoomSelected && (
                      <span className="text-[11px] font-bold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full">
                        Selected Room
                      </span>
                    )}
                  </div>
                  {room.description && (
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {room.description}
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-2xl font-black text-slate-900">
                    ₹{Number(room.basePrice).toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-slate-500">base rate / night</div>
                </div>
              </div>

              {/* Capacity & Units Info */}
              <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-slate-600 mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Users className="w-4 h-4 text-slate-500" /> Up to {room.capacity}{" "}
                  {room.capacity === 1 ? "guest" : "guests"} / room
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                  <Home className="w-4 h-4 text-slate-500" /> {room.totalUnits}{" "}
                  {room.totalUnits === 1 ? "unit" : "units"} available
                </div>
              </div>

              {/* Meal Plan Options */}
              {hasMealPlans ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                      <Utensils className="w-4 h-4 text-orange-500" />
                      Select Meal Plan & Book
                    </h4>
                    <span className="text-xs text-slate-400">Choose your preferred stay option</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {availablePlans.map((plan) => {
                      const price = room[plan.priceField] as number;
                      const isSelected = isRoomSelected && selectedMealPlan === plan.key;

                      return (
                        <div
                          key={plan.key}
                          onClick={() => handleSelect(room, plan.key, price)}
                          className={`relative cursor-pointer rounded-2xl border p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                            isSelected
                              ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-400 shadow-sm"
                              : "border-slate-200 bg-white hover:border-orange-200 hover:bg-slate-50/50"
                          }`}
                        >
                          {/* Plan Details & Inclusions */}
                          <div className="flex items-start gap-3.5 flex-1">
                            <div className="pt-0.5">
                              <input
                                type="radio"
                                name={`room-${room.id}`}
                                id={`plan-${room.id}-${plan.key}`}
                                className="w-4 h-4 accent-orange-500 cursor-pointer"
                                checked={isSelected}
                                onChange={() => handleSelect(room, plan.key, price)}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <label
                                  htmlFor={`plan-${room.id}-${plan.key}`}
                                  className="font-bold text-slate-900 text-base cursor-pointer hover:text-orange-600 transition-colors"
                                >
                                  {plan.label}
                                </label>
                                {plan.badge && (
                                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                    plan.key === "CP" 
                                      ? "bg-amber-100 text-amber-800" 
                                      : plan.key === "MAP" 
                                      ? "bg-emerald-100 text-emerald-800" 
                                      : "bg-slate-100 text-slate-700"
                                  }`}>
                                    {plan.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 font-medium">
                                {plan.subtitle}
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-600">
                                {plan.inclusions.map((inc, i) => (
                                  <span key={i} className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    {inc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Price & Action Button */}
                          <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                            <div className="text-left md:text-right">
                              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                ₹{Number(price).toLocaleString("en-IN")}
                                <span className="text-xs font-normal text-slate-500"> / night</span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium">
                                + applicable Taxes & Fees
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBookNow(room, plan.key, price);
                              }}
                              className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 shrink-0"
                            >
                              Book Now
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* No meal plans configured — real room base selection */
                <div
                  onClick={() => handleSelect(room, null, Number(room.basePrice))}
                  className={`relative cursor-pointer rounded-2xl border p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isRoomSelected && selectedMealPlan === null
                      ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-400 shadow-sm"
                      : "border-slate-200 bg-white hover:border-orange-200 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <input
                      type="radio"
                      name={`room-selection`}
                      id={`room-opt-${room.id}`}
                      className="w-4 h-4 accent-orange-500 mt-0.5 cursor-pointer"
                      checked={isRoomSelected && selectedMealPlan === null}
                      onChange={() => handleSelect(room, null, Number(room.basePrice))}
                    />
                    <div>
                      <label htmlFor={`room-opt-${room.id}`} className="font-bold text-slate-900 text-base cursor-pointer">
                        Standard Room Rate
                      </label>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Accommodation only at verified base pricing
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    <div className="text-left md:text-right">
                      <div className="text-xl sm:text-2xl font-black text-slate-900">
                        ₹{Number(room.basePrice).toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-slate-500"> / night</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        + applicable Taxes & Fees
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookNow(room, null, Number(room.basePrice));
                      }}
                      className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      Book Now
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Extra Charges Breakdown */}
              {(room.extraBedPriceEP ||
                room.extraBedPriceCP ||
                room.extraBedPriceMAP ||
                room.extraBedPrice ||
                room.childNoBedPriceEP ||
                room.childNoBedPriceCP ||
                room.childNoBedPriceMAP ||
                room.childNoBedPrice) && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <h4 className="font-semibold text-slate-700 mb-3 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                    Additional Guest & Child Charges (Optional)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {(room.extraBedPriceEP ||
                      room.extraBedPriceCP ||
                      room.extraBedPriceMAP ||
                      room.extraBedPrice) && (
                      <div className="text-xs">
                        <div className="font-bold text-slate-800 mb-1.5">
                          Extra Bed (Adult/Child with bed)
                        </div>
                        <ul className="space-y-1 text-slate-600">
                          {room.extraBedPriceEP && (
                            <li>Stay Essentials: <strong>₹{room.extraBedPriceEP.toLocaleString("en-IN")}</strong> / night</li>
                          )}
                          {room.extraBedPriceCP && (
                            <li>Stay & Breakfast: <strong>₹{room.extraBedPriceCP.toLocaleString("en-IN")}</strong> / night</li>
                          )}
                          {room.extraBedPriceMAP && (
                            <li>Stay & Dining: <strong>₹{room.extraBedPriceMAP.toLocaleString("en-IN")}</strong> / night</li>
                          )}
                          {!room.extraBedPriceEP && !room.extraBedPriceCP && !room.extraBedPriceMAP && room.extraBedPrice && (
                            <li>Per Night: <strong>₹{room.extraBedPrice.toLocaleString("en-IN")}</strong></li>
                          )}
                        </ul>
                      </div>
                    )}
                    {(room.childNoBedPriceEP ||
                      room.childNoBedPriceCP ||
                      room.childNoBedPriceMAP ||
                      room.childNoBedPrice) && (
                      <div className="text-xs">
                        <div className="font-bold text-slate-800 mb-1.5">
                          Child (No Extra Bed)
                        </div>
                        <ul className="space-y-1 text-slate-600">
                          {room.childNoBedPriceEP && (
                            <li>Stay Essentials: <strong>₹{room.childNoBedPriceEP.toLocaleString("en-IN")}</strong> / night</li>
                          )}
                          {room.childNoBedPriceCP && (
                            <li>Stay & Breakfast: <strong>₹{room.childNoBedPriceCP.toLocaleString("en-IN")}</strong> / night</li>
                          )}
                          {room.childNoBedPriceMAP && (
                            <li>Stay & Dining: <strong>₹{room.childNoBedPriceMAP.toLocaleString("en-IN")}</strong> / night</li>
                          )}
                          {!room.childNoBedPriceEP && !room.childNoBedPriceCP && !room.childNoBedPriceMAP && room.childNoBedPrice && (
                            <li>Per Night: <strong>₹{room.childNoBedPrice.toLocaleString("en-IN")}</strong></li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ─── CASE 2: NO ROOM TYPES, BUT VALID PROPERTY BASE PRICE EXISTS ───
  if (hasValidBasePrice) {
    const isBaseSelected = selectedRoomId === null;

    return (
      <div className="bg-white border border-slate-200 hover:border-orange-200 rounded-2xl p-6 shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900">Standard Accommodation</h3>
            <p className="text-sm text-slate-500 mt-1">
              Standard room booking at {propertyName || "this property"}.
            </p>
          </div>
          <div className="text-left sm:text-right shrink-0">
            <div className="text-2xl font-black text-slate-900">
              ₹{Number(propertyBasePrice).toLocaleString("en-IN")}
            </div>
            <div className="text-xs text-slate-500">per night</div>
          </div>
        </div>

        {/* Capacity & Units from real Property data */}
        <div className="flex gap-4 text-xs sm:text-sm text-slate-600 mb-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" /> Up to {propertyGuests}{" "}
            {propertyGuests === 1 ? "guest" : "guests"}
          </div>
          <div className="flex items-center gap-1">
            <Home className="w-4 h-4" /> {propertyTotalRooms}{" "}
            {propertyTotalRooms === 1 ? "unit" : "units"} available
          </div>
        </div>

        {/* Action card */}
        <div
          onClick={() => setSelectedRoom(null, "Standard Accommodation", null, propertyBasePrice)}
          className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl border transition-all ${
            isBaseSelected
              ? "border-orange-500 bg-orange-50/40 ring-1 ring-orange-400"
              : "border-slate-200 bg-white hover:border-orange-200 hover:bg-slate-50/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="legacy-base-room"
              className="w-4 h-4 accent-orange-500 cursor-pointer"
              checked={isBaseSelected}
              onChange={() => setSelectedRoom(null, "Standard Accommodation", null, propertyBasePrice)}
            />
            <div>
              <div className="font-bold text-slate-900 text-base">
                Standard Stay
              </div>
              <div className="text-xs text-slate-500">
                Direct booking at verified base rate
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="text-left md:text-right">
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                ₹{Number(propertyBasePrice).toLocaleString("en-IN")}
                <span className="text-xs font-normal text-slate-500"> / night</span>
              </div>
              <div className="text-[11px] text-slate-400">
                + applicable Taxes & Fees
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleBookNowBase();
              }}
              className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 shrink-0"
            >
              Book Now
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── CASE 3: NEITHER ROOM TYPES NOR VALID BASE PRICE ───
  return (
    <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 text-center">
      <p className="text-slate-500 font-medium">Room availability is currently being updated.</p>
    </div>
  );
}
