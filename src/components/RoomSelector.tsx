"use client";

import { Users, Home, Utensils, BedDouble } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";

const MEAL_PLANS = [
  {
    key: "EP" as const,
    priceField: "priceEP",
    label: "Stay Essentials",
    subtitle: "Accommodation Only",
  },
  {
    key: "CP" as const,
    priceField: "priceCP",
    label: "Stay & Breakfast",
    subtitle: "Breakfast Included",
  },
  {
    key: "MAP" as const,
    priceField: "priceMAP",
    label: "Stay & Dining",
    subtitle: "Breakfast + Dinner Included",
  },
] as const;

export default function RoomSelector({ roomTypes }: { roomTypes: any[] }) {
  const { selectedRoomId, selectedMealPlan, setSelectedRoom } = useBookingStore();

  const handleSelect = (room: any, mealPlan: string | null, price: number) => {
    setSelectedRoom(room.id, room.name, mealPlan, price);
  };

  if (!roomTypes || roomTypes.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-10 text-center">
        <p className="text-slate-500 font-medium">Rooms information coming soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {roomTypes.map((room: any) => {
        const isRoomSelected = selectedRoomId === room.id;
        const availablePlans = MEAL_PLANS.filter((p) => !!room[p.priceField]);
        const hasMealPlans = availablePlans.length > 0;

        return (
          <div
            key={room.id}
            className={`bg-white border rounded-2xl p-6 shadow-sm transition-all duration-200 ${
              isRoomSelected
                ? "border-orange-500 ring-1 ring-orange-500"
                : "border-slate-200 hover:border-orange-200"
            }`}
          >
            {/* Room Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 pr-4">
                <h3 className="text-xl font-bold text-slate-900">{room.name}</h3>
                {room.description && (
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {room.description}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-black text-slate-900">
                  ₹{room.basePrice.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-slate-500">per night</div>
              </div>
            </div>

            {/* Capacity & Units */}
            <div className="flex gap-4 text-sm text-slate-600 mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" /> Up to {room.capacity}{" "}
                {room.capacity === 1 ? "guest" : "guests"} / room
              </div>
              <div className="flex items-center gap-1">
                <Home className="w-4 h-4" /> {room.totalUnits}{" "}
                {room.totalUnits === 1 ? "unit" : "units"}
              </div>
            </div>

            {/* Meal Plan Options */}
            {hasMealPlans ? (
              <div>
                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm">
                  <Utensils className="w-4 h-4 text-orange-500" />
                  Select a Plan
                </h4>
                <div className="space-y-2">
                  {availablePlans.map((plan) => {
                    const price = room[plan.priceField] as number;
                    const isSelected =
                      isRoomSelected && selectedMealPlan === plan.key;
                    return (
                      <label
                        key={plan.key}
                        className={`flex items-center justify-between gap-3 cursor-pointer p-4 rounded-xl border transition-all ${
                          isSelected
                            ? "border-orange-500 bg-orange-50/60 ring-1 ring-orange-400"
                            : "border-slate-100 bg-slate-50 hover:border-orange-200 hover:bg-orange-50/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`room-${room.id}`}
                            className="w-4 h-4 accent-orange-500"
                            checked={isSelected}
                            onChange={() => handleSelect(room, plan.key, price)}
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {plan.label}
                            </div>
                            <div className="text-xs text-slate-500">
                              {plan.subtitle}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-orange-600">
                            ₹{price.toLocaleString("en-IN")}
                          </div>
                          <div className="text-xs text-slate-400">/ night</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* No meal plans — show base room selection */
              <label
                className={`flex items-center justify-between gap-3 cursor-pointer p-4 rounded-xl border transition-all ${
                  isRoomSelected && selectedMealPlan === null
                    ? "border-orange-500 bg-orange-50/60 ring-1 ring-orange-400"
                    : "border-slate-100 bg-slate-50 hover:border-orange-200 hover:bg-orange-50/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`room-${room.id}`}
                    className="w-4 h-4 accent-orange-500"
                    checked={isRoomSelected && selectedMealPlan === null}
                    onChange={() => handleSelect(room, null, room.basePrice)}
                  />
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      Stay Essentials
                    </div>
                    <div className="text-xs text-slate-500">
                      Accommodation Only
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-orange-600">
                    ₹{room.basePrice.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-slate-400">/ night</div>
                </div>
              </label>
            )}

            {/* Extra Charges (Informational Only) */}
            {(room.extraBedPriceEP ||
              room.extraBedPriceCP ||
              room.extraBedPriceMAP ||
              room.childNoBedPriceEP ||
              room.childNoBedPriceCP ||
              room.childNoBedPriceMAP) && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <h4 className="font-semibold text-slate-700 mb-3 text-xs uppercase tracking-wide">
                  Additional Charges
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(room.extraBedPriceEP ||
                    room.extraBedPriceCP ||
                    room.extraBedPriceMAP) && (
                    <div className="text-sm">
                      <div className="font-medium text-slate-700 mb-1">
                        Extra Bed
                      </div>
                      <ul className="space-y-0.5 text-slate-500 text-xs">
                        {room.extraBedPriceEP && (
                          <li>
                            Stay Essentials: ₹
                            {room.extraBedPriceEP.toLocaleString("en-IN")}
                          </li>
                        )}
                        {room.extraBedPriceCP && (
                          <li>
                            Stay & Breakfast: ₹
                            {room.extraBedPriceCP.toLocaleString("en-IN")}
                          </li>
                        )}
                        {room.extraBedPriceMAP && (
                          <li>
                            Stay & Dining: ₹
                            {room.extraBedPriceMAP.toLocaleString("en-IN")}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                  {(room.childNoBedPriceEP ||
                    room.childNoBedPriceCP ||
                    room.childNoBedPriceMAP) && (
                    <div className="text-sm">
                      <div className="font-medium text-slate-700 mb-1">
                        Child (No Bed)
                      </div>
                      <ul className="space-y-0.5 text-slate-500 text-xs">
                        {room.childNoBedPriceEP && (
                          <li>
                            Stay Essentials: ₹
                            {room.childNoBedPriceEP.toLocaleString("en-IN")}
                          </li>
                        )}
                        {room.childNoBedPriceCP && (
                          <li>
                            Stay & Breakfast: ₹
                            {room.childNoBedPriceCP.toLocaleString("en-IN")}
                          </li>
                        )}
                        {room.childNoBedPriceMAP && (
                          <li>
                            Stay & Dining: ₹
                            {room.childNoBedPriceMAP.toLocaleString("en-IN")}
                          </li>
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

