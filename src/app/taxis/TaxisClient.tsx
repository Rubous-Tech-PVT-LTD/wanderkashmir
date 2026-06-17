"use client";

import { useState, useEffect, useRef } from "react";
import { Car, MapPin, Calendar, Clock, Navigation, CheckCircle2, Navigation2 } from "lucide-react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import CustomDatePicker from "@/components/CustomDatePicker";

import type { ComponentType } from "react";

// Dynamically import Leaflet map to avoid SSR issues
const MapView = dynamic(() => import("./TaxiMapView"), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">Loading Map...</div>
}) as ComponentType<any>;

const MULTIDAY_PRICES: Record<string, number> = {
  "4 Seater": 4000,
  "6 Seater": 5000,
  "12 Seater": 10000,
};

const SINGLEDAY_PRICES: Record<string, number> = {
  "4 Seater": 30, // 30rs per km
  "7 Seater": 45,
  "12 Seater": 70,
  "16 Seater": 80,
};

export default function TaxisClient() {
  const [rideType, setRideType] = useState<"SINGLE" | "MULTI">("SINGLE");
  const [bookingFor, setBookingFor] = useState<"SELF" | "OTHER">("SELF");
  const [timing, setTiming] = useState<"INSTANT" | "SCHEDULED">("SCHEDULED");
  const [vehicle, setVehicle] = useState<string>("4 Seater");
  
  // Locations
  const [pickupText, setPickupText] = useState("");
  const [dropoffText, setDropoffText] = useState("");
  const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<[number, number] | null>(null);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState(false);

  // Multi-day dates
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date(new Date().getTime() + 86400000));
  
  // Single-day scheduling
  const [pickupDate, setPickupDate] = useState<Date | null>(new Date());
  const [pickupTime, setPickupTime] = useState("10:00 AM");

  const [totalFare, setTotalFare] = useState(0);

  // Auto calculate fare
  useEffect(() => {
    if (rideType === "SINGLE") {
      if (distanceKm > 0 && SINGLEDAY_PRICES[vehicle]) {
        // base distance * per km rate + some base fare if needed (currently just multiplying)
        // Minimum distance 10km assumed if very short
        const effectiveDist = Math.max(10, distanceKm);
        setTotalFare(Math.round(effectiveDist * SINGLEDAY_PRICES[vehicle]));
      } else {
        setTotalFare(0);
      }
    } else {
      if (startDate && endDate && MULTIDAY_PRICES[vehicle]) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        setTotalFare(diffDays * MULTIDAY_PRICES[vehicle]);
      }
    }
  }, [rideType, distanceKm, vehicle, startDate, endDate]);

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      toast.loading("Fetching location...", { id: "geo" });
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setPickupCoords([lat, lon]);
          setPickupText("Current Location");
          toast.success("Location found!", { id: "geo" });
        },
        (error) => {
          toast.error("Could not fetch location.", { id: "geo" });
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser");
    }
  };

  const geocodeLocation = async (query: string, isPickup: boolean) => {
    if (!query) return;
    toast.loading(`Searching ${query}...`, { id: "search" });
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        if (isPickup) setPickupCoords(coords);
        else setDropoffCoords(coords);
        toast.success("Location found!", { id: "search" });
        
        // If both coords exist, calculate distance
        const pCoords = isPickup ? coords : pickupCoords;
        const dCoords = !isPickup ? coords : dropoffCoords;
        
        if (pCoords && dCoords) {
          calculateDistance(pCoords, dCoords);
        }
      } else {
        toast.error("Location not found. Try adding 'Kashmir' or 'Srinagar'.", { id: "search" });
      }
    } catch (e) {
      toast.error("Error searching location.", { id: "search" });
    }
  };

  const calculateDistance = async (p1: [number, number], p2: [number, number]) => {
    setIsCalculating(true);
    try {
      // OSRM expects longitude,latitude
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${p1[1]},${p1[0]};${p2[1]},${p2[0]}?overview=false`);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const distKm = data.routes[0].distance / 1000;
        setDistanceKm(distKm);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="pt-24 pb-20 bg-slate-50 min-h-screen">
      <div className="container-custom max-w-6xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Book Your Ride</h1>
          <p className="text-lg text-slate-600">Reliable taxis for local drops and multi-day sightseeing across Kashmir.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Booking Form */}
          <div className="flex-1 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
            {/* Ride Type */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
              <button 
                onClick={() => setRideType("SINGLE")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${rideType === "SINGLE" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Single Ride (Drop)
              </button>
              <button 
                onClick={() => setRideType("MULTI")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${rideType === "MULTI" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Multi-day Ride (Tour)
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              
              {rideType === "SINGLE" && (
                <div className="relative border border-slate-200 rounded-2xl p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1"><MapPin className="w-5 h-5 text-sky-500" /></div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Pick-up Location</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input 
                          type="text" 
                          placeholder="Search pick-up location..." 
                          value={pickupText}
                          onChange={e => setPickupText(e.target.value)}
                          onBlur={() => geocodeLocation(pickupText, true)}
                          className="w-full font-medium text-slate-900 focus:outline-none"
                        />
                        <button onClick={handleGetCurrentLocation} title="Use current location" className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200">
                          <Navigation2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute left-6 top-[38px] w-0.5 h-10 bg-slate-200 border-l border-dashed border-slate-300"></div>
                  
                  <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
                    <div className="mt-1"><MapPin className="w-5 h-5 text-orange-500" /></div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Drop-off Location</label>
                      <input 
                        type="text" 
                        placeholder="Search drop-off destination..." 
                        value={dropoffText}
                        onChange={e => setDropoffText(e.target.value)}
                        onBlur={() => geocodeLocation(dropoffText, false)}
                        className="w-full font-medium text-slate-900 focus:outline-none mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Timing */}
              {rideType === "SINGLE" && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setTiming("INSTANT")}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${timing === "INSTANT" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                    >
                      Instant Ride
                    </button>
                    <button 
                      onClick={() => setTiming("SCHEDULED")}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${timing === "SCHEDULED" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                    >
                      Schedule
                    </button>
                  </div>
                  
                  {timing === "SCHEDULED" && (
                    <div className="flex-1 flex gap-2">
                      <div className="flex-1 border border-slate-200 rounded-xl px-3 py-2">
                        <CustomDatePicker selected={pickupDate} onChange={setPickupDate} minDate={new Date()} className="w-full text-sm font-medium focus:outline-none" />
                      </div>
                      <div className="w-24 border border-slate-200 rounded-xl px-3 py-2">
                        <input type="time" defaultValue="10:00" onChange={e => setPickupTime(e.target.value)} className="w-full text-sm font-medium focus:outline-none" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {rideType === "MULTI" && (
                <div className="flex gap-4">
                  <div className="flex-1 border border-slate-200 rounded-2xl p-4">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar className="w-3 h-3"/> Start Date</label>
                    <CustomDatePicker selected={startDate} onChange={setStartDate} minDate={new Date()} className="w-full text-sm font-bold mt-2 focus:outline-none" />
                  </div>
                  <div className="flex-1 border border-slate-200 rounded-2xl p-4">
                    <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1"><Calendar className="w-3 h-3"/> End Date</label>
                    <CustomDatePicker selected={endDate} onChange={setEndDate} minDate={startDate || new Date()} className="w-full text-sm font-bold mt-2 focus:outline-none" />
                  </div>
                </div>
              )}

              {/* Vehicle Selection */}
              <div>
                <label className="text-sm font-bold text-slate-900 mb-3 block">Preferred Vehicle</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(rideType === "SINGLE" ? Object.keys(SINGLEDAY_PRICES) : Object.keys(MULTIDAY_PRICES)).map(v => (
                    <button
                      key={v}
                      onClick={() => setVehicle(v)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${vehicle === v ? "border-sky-500 bg-sky-50" : "border-slate-100 bg-white hover:border-slate-200"}`}
                    >
                      <Car className={`w-6 h-6 mb-2 ${vehicle === v ? "text-sky-600" : "text-slate-400"}`} />
                      <div className="font-bold text-sm text-slate-900">{v}</div>
                      <div className="text-xs font-semibold text-slate-500">
                        {rideType === "SINGLE" ? `₹${SINGLEDAY_PRICES[v]}/km` : `₹${MULTIDAY_PRICES[v]}/day`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ride For */}
              <div className="pt-4 border-t border-slate-100">
                <label className="text-sm font-bold text-slate-900 mb-3 block">Ride For</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={bookingFor === "SELF"} onChange={() => setBookingFor("SELF")} className="w-4 h-4 accent-sky-600" />
                    <span className="text-sm font-medium text-slate-700">Myself</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={bookingFor === "OTHER"} onChange={() => setBookingFor("OTHER")} className="w-4 h-4 accent-sky-600" />
                    <span className="text-sm font-medium text-slate-700">Someone else</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Price & Submit */}
            <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-slate-400 text-sm font-semibold mb-1">Estimated Fare</p>
                {rideType === "SINGLE" && distanceKm === 0 ? (
                  <p className="text-xl font-bold">Select locations</p>
                ) : (
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-black">₹{totalFare.toLocaleString("en-IN")}</span>
                    {rideType === "SINGLE" && <span className="text-slate-400 text-sm mb-1">for {distanceKm.toFixed(1)} km</span>}
                  </div>
                )}
              </div>
              <button 
                onClick={() => toast.success("Booking confirmed! Details sent to WhatsApp.")}
                disabled={totalFare === 0}
                className="w-full md:w-auto bg-white text-slate-900 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Booking
              </button>
            </div>
          </div>

          {/* Map View */}
          <div className="flex-1 hidden lg:block bg-white p-2 rounded-3xl shadow-sm border border-slate-200">
            <MapView 
              pickup={pickupCoords} 
              dropoff={dropoffCoords} 
              routeDistance={distanceKm} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
