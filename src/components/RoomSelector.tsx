"use client";

import { useState, useEffect } from "react";
import { Users, Home, Utensils, CheckCircle2 } from "lucide-react";
import { useBookingStore } from "@/store/bookingStore";

export default function RoomSelector({ roomTypes }: { roomTypes: any[] }) {
  const { selectedRoomId, selectedMealPlan, setSelectedRoom } = useBookingStore();
  
  // Local state for radio button management before we decide to use them directly
  
  const handleSelectRoom = (room: any, mealPlan: string | null, price: number) => {
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
        
        return (
          <div 
            key={room.id} 
            className={`bg-white border rounded-2xl p-6 shadow-sm transition-all duration-200 ${
              isRoomSelected ? 'border-orange-500 ring-1 ring-orange-500' : 'border-slate-200 hover:border-orange-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{room.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{room.description}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-slate-900">₹{room.basePrice}</div>
                <div className="text-xs text-slate-500">per night (Base Price)</div>
              </div>
            </div>
            
            <div className="flex gap-4 text-sm text-slate-600 mb-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-1"><Users className="w-4 h-4" /> Up to {room.capacity} {room.capacity === 1 ? 'guest' : 'guests'} / room</div>
              <div className="flex items-center gap-1"><Home className="w-4 h-4" /> {room.totalUnits} {room.totalUnits === 1 ? 'unit' : 'units'}</div>
            </div>

            {/* Base Room Selection (If no meal plans, or just selecting room without meal plan) */}
            <div className="mb-6">
               <label className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-colors ${
                  isRoomSelected && selectedMealPlan === null ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 hover:bg-slate-50'
               }`}>
                  <input 
                    type="radio" 
                    name="roomSelection" 
                    className="w-5 h-5 text-orange-600 focus:ring-orange-500"
                    checked={isRoomSelected && selectedMealPlan === null}
                    onChange={() => handleSelectRoom(room, null, room.basePrice)}
                  />
                  <div>
                    <div className="font-bold text-slate-900">Room Only (Standard)</div>
                    <div className="text-sm text-slate-500">₹{room.basePrice} / night</div>
                  </div>
               </label>
            </div>

            {/* Meal Plans */}
            {(room.priceEP || room.priceCP || room.priceMAP) && (
              <div className="mb-6">
                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-orange-500" /> Meal Plans
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {room.priceEP && (
                    <label className={`cursor-pointer bg-slate-50 rounded-xl p-3 border transition-colors ${
                      isRoomSelected && selectedMealPlan === 'EP' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 hover:border-orange-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        <input 
                          type="radio" 
                          name="roomSelection"
                          className="mt-1 w-4 h-4 text-orange-600 focus:ring-orange-500"
                          checked={isRoomSelected && selectedMealPlan === 'EP'}
                          onChange={() => handleSelectRoom(room, 'EP', room.priceEP)}
                        />
                        <div>
                          <div className="font-bold text-slate-800 text-sm">EP Plan</div>
                          <div className="text-xs text-slate-500 mb-1">Room Only</div>
                          <div className="font-bold text-orange-600">₹{room.priceEP} <span className="text-xs font-normal text-slate-500">/night</span></div>
                        </div>
                      </div>
                    </label>
                  )}
                  {room.priceCP && (
                    <label className={`cursor-pointer bg-slate-50 rounded-xl p-3 border transition-colors ${
                      isRoomSelected && selectedMealPlan === 'CP' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 hover:border-orange-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        <input 
                          type="radio" 
                          name="roomSelection"
                          className="mt-1 w-4 h-4 text-orange-600 focus:ring-orange-500"
                          checked={isRoomSelected && selectedMealPlan === 'CP'}
                          onChange={() => handleSelectRoom(room, 'CP', room.priceCP)}
                        />
                        <div>
                          <div className="font-bold text-slate-800 text-sm">CP Plan</div>
                          <div className="text-xs text-slate-500 mb-1">Breakfast</div>
                          <div className="font-bold text-orange-600">₹{room.priceCP} <span className="text-xs font-normal text-slate-500">/night</span></div>
                        </div>
                      </div>
                    </label>
                  )}
                  {room.priceMAP && (
                    <label className={`cursor-pointer bg-slate-50 rounded-xl p-3 border transition-colors ${
                      isRoomSelected && selectedMealPlan === 'MAP' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 hover:border-orange-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        <input 
                          type="radio" 
                          name="roomSelection"
                          className="mt-1 w-4 h-4 text-orange-600 focus:ring-orange-500"
                          checked={isRoomSelected && selectedMealPlan === 'MAP'}
                          onChange={() => handleSelectRoom(room, 'MAP', room.priceMAP)}
                        />
                        <div>
                          <div className="font-bold text-slate-800 text-sm">MAP Plan</div>
                          <div className="text-xs text-slate-500 mb-1">Breakfast + Dinner</div>
                          <div className="font-bold text-orange-600">₹{room.priceMAP} <span className="text-xs font-normal text-slate-500">/night</span></div>
                        </div>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Extra Charges */}
            {(room.extraBedPriceEP || room.extraBedPriceCP || room.extraBedPriceMAP || room.childNoBedPriceEP || room.childNoBedPriceCP || room.childNoBedPriceMAP) && (
              <div>
                <h4 className="font-bold text-slate-900 mb-3 text-sm">Extra Persons (Optional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(room.extraBedPriceEP || room.extraBedPriceCP || room.extraBedPriceMAP) && (
                    <div className="text-sm">
                      <div className="font-medium text-slate-700 mb-2">Extra Bed</div>
                      <ul className="space-y-1 text-slate-600 text-xs">
                        {room.extraBedPriceEP && <li>EP: ₹{room.extraBedPriceEP}</li>}
                        {room.extraBedPriceCP && <li>CP: ₹{room.extraBedPriceCP}</li>}
                        {room.extraBedPriceMAP && <li>MAP: ₹{room.extraBedPriceMAP}</li>}
                      </ul>
                    </div>
                  )}
                  {(room.childNoBedPriceEP || room.childNoBedPriceCP || room.childNoBedPriceMAP) && (
                    <div className="text-sm">
                      <div className="font-medium text-slate-700 mb-2">Child (No Bed)</div>
                      <ul className="space-y-1 text-slate-600 text-xs">
                        {room.childNoBedPriceEP && <li>EP: ₹{room.childNoBedPriceEP}</li>}
                        {room.childNoBedPriceCP && <li>CP: ₹{room.childNoBedPriceCP}</li>}
                        {room.childNoBedPriceMAP && <li>MAP: ₹{room.childNoBedPriceMAP}</li>}
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
