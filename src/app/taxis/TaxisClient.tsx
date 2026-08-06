"use client";

import { useState, useEffect, useRef } from "react";
import { Car, MapPin, Calendar, Clock, Navigation, CheckCircle2, Navigation2, XCircle, Users, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import CustomDatePicker from "@/components/CustomDatePicker";
import { useUser } from "@clerk/nextjs";
import CheckoutButton from "@/components/CheckoutButton";

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

export default function TaxisClient({ 
  rateCards = [], 
  imagesMap = {}, 
  verifiedDrivers = [] 
}: { 
  rateCards?: any[]; 
  imagesMap?: Record<string, string>; 
  verifiedDrivers?: any[]; 
}) {
  const { isSignedIn } = useUser();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [otherGuests, setOtherGuests] = useState<{name: string, age: string}[]>([]);
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
  const [isLocating, setIsLocating] = useState(false);

  // Autocomplete
  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<any[]>([]);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);
  const pickupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropoffTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleGetCurrentLocation = (isPickup: boolean = true) => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const coords: [number, number] = [lat, lon];
          
          if (isPickup) {
            setPickupCoords(coords);
            setPickupText("Current Location");
          } else {
            setDropoffCoords(coords);
            setDropoffText("Current Location");
          }

          const pCoords = isPickup ? coords : pickupCoords;
          const dCoords = !isPickup ? coords : dropoffCoords;
          if (pCoords && dCoords) {
            calculateDistance(pCoords, dCoords);
          }

          setIsLocating(false);
          toast.success("Location found!", { id: "geo" });
        },
        (error) => {
          setIsLocating(false);
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
      let enhancedQuery = query;
      if (!query.toLowerCase().includes("kashmir") && !query.toLowerCase().includes("srinagar") && !query.toLowerCase().includes("jammu")) {
        enhancedQuery = `${query}, Kashmir, India`;
      }

      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(enhancedQuery)}&format=json&limit=1&countrycodes=in`);
      const data = await res.json();
      if (data && data.length > 0) {
        const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        if (isPickup) setPickupCoords(coords);
        else setDropoffCoords(coords);
        toast.success("Location found!", { id: "search" });
        
        const pCoords = isPickup ? coords : pickupCoords;
        const dCoords = !isPickup ? coords : dropoffCoords;
        
        if (pCoords && dCoords) {
          calculateDistance(pCoords, dCoords);
        }
      } else {
        toast.error("Location not found", { id: "search" });
      }
    } catch (error) {
      toast.error("Error searching location", { id: "search" });
    }
  };

  const searchLocationAutocomplete = async (query: string, isPickup: boolean) => {
    if (!query || query.length < 3) {
      if (isPickup) setPickupSuggestions([]);
      else setDropoffSuggestions([]);
      return;
    }
    try {
      let enhancedQuery = query;
      if (!query.toLowerCase().includes("kashmir") && !query.toLowerCase().includes("srinagar") && !query.toLowerCase().includes("jammu")) {
        enhancedQuery = `${query}, Kashmir, India`;
      }
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(enhancedQuery)}&format=json&limit=5&countrycodes=in`);
      const data = await res.json();
      if (isPickup) {
        setPickupSuggestions(data);
        setShowPickupDropdown(true);
      } else {
        setDropoffSuggestions(data);
        setShowDropoffDropdown(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePickupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPickupText(val);
    setPickupCoords(null);
    setDistanceKm(0);
    if (pickupTimeoutRef.current) clearTimeout(pickupTimeoutRef.current);
    pickupTimeoutRef.current = setTimeout(() => searchLocationAutocomplete(val, true), 500);
  };

  const handleDropoffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDropoffText(val);
    setDropoffCoords(null);
    setDistanceKm(0);
    if (dropoffTimeoutRef.current) clearTimeout(dropoffTimeoutRef.current);
    dropoffTimeoutRef.current = setTimeout(() => searchLocationAutocomplete(val, false), 500);
  };

  const selectSuggestion = (suggestion: any, isPickup: boolean) => {
    const coords: [number, number] = [parseFloat(suggestion.lat), parseFloat(suggestion.lon)];
    const nameParts = suggestion.display_name.split(',');
    const shortName = nameParts[0].trim() + (nameParts[1] ? `, ${nameParts[1].trim()}` : '');
    
    if (isPickup) {
      setPickupText(shortName);
      setPickupCoords(coords);
      setShowPickupDropdown(false);
      setPickupSuggestions([]);
    } else {
      setDropoffText(shortName);
      setDropoffCoords(coords);
      setShowDropoffDropdown(false);
      setDropoffSuggestions([]);
    }
    
    const pCoords = isPickup ? coords : pickupCoords;
    const dCoords = !isPickup ? coords : dropoffCoords;
    if (pCoords && dCoords) {
      calculateDistance(pCoords, dCoords);
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
                    <div className="mt-1"><MapPin className="w-5 h-5 text-orange-500" /></div>
                    <div className="flex-1 relative">
                      <label className="text-xs font-bold text-slate-500 uppercase">Pick-up Location</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input 
                          type="text" 
                          placeholder="Search pick-up location..." 
                          value={pickupText}
                          onChange={handlePickupChange}
                          onFocus={() => { if (pickupSuggestions.length > 0) setShowPickupDropdown(true); }}
                          onBlur={() => setTimeout(() => {
                            setShowPickupDropdown(false);
                            if (pickupText && !pickupCoords) geocodeLocation(pickupText, true);
                          }, 200)}
                          className="w-full font-medium text-slate-900 focus:outline-none"
                        />
                        <button onClick={() => handleGetCurrentLocation(true)} title="Use current location" className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 flex-shrink-0">
                          <Navigation2 className="w-4 h-4" />
                        </button>
                      </div>
                      {showPickupDropdown && pickupSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {pickupSuggestions.map((s, i) => (
                            <div key={i} onClick={() => selectSuggestion(s, true)} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                              <div className="text-sm">
                                <div className="font-semibold text-slate-800">{s.display_name.split(',')[0]}</div>
                                <div className="text-xs text-slate-500 truncate">{s.display_name.split(',').slice(1).join(',')}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute left-6 top-[38px] w-0.5 h-10 bg-slate-200 border-l border-dashed border-slate-300"></div>
                  
                  <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
                    <div className="mt-1"><MapPin className="w-5 h-5 text-orange-500" /></div>
                    <div className="flex-1 relative">
                      <label className="text-xs font-bold text-slate-500 uppercase">Drop-off Location</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input 
                          type="text" 
                          placeholder="Search drop-off destination..." 
                          value={dropoffText}
                          onChange={handleDropoffChange}
                          onFocus={() => { if (dropoffSuggestions.length > 0) setShowDropoffDropdown(true); }}
                          onBlur={() => setTimeout(() => {
                            setShowDropoffDropdown(false);
                            if (dropoffText && !dropoffCoords) geocodeLocation(dropoffText, false);
                          }, 200)}
                          className="w-full font-medium text-slate-900 focus:outline-none"
                        />
                        <button onClick={() => handleGetCurrentLocation(false)} title="Use current location" className="p-2 bg-slate-100 rounded-lg text-slate-600 hover:bg-slate-200 flex-shrink-0">
                          <Navigation2 className="w-4 h-4" />
                        </button>
                      </div>
                      {showDropoffDropdown && dropoffSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {dropoffSuggestions.map((s, i) => (
                            <div key={i} onClick={() => selectSuggestion(s, false)} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                              <div className="text-sm">
                                <div className="font-semibold text-slate-800">{s.display_name.split(',')[0]}</div>
                                <div className="text-xs text-slate-500 truncate">{s.display_name.split(',').slice(1).join(',')}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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
                      className={`p-3 rounded-xl border-2 text-left transition-all ${vehicle === v ? "border-orange-500 bg-orange-500" : "border-slate-100 bg-white hover:border-slate-200"}`}
                    >
                      <Car className={`w-6 h-6 mb-2 ${vehicle === v ? "text-orange-500" : "text-slate-400"}`} />
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
                    <input type="radio" checked={bookingFor === "SELF"} onChange={() => setBookingFor("SELF")} className="w-4 h-4 accent-orange-" />
                    <span className="text-sm font-medium text-slate-700">Myself</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={bookingFor === "OTHER"} onChange={() => setBookingFor("OTHER")} className="w-4 h-4 accent-orange-" />
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
                onClick={() => {
                  if (!isSignedIn) {
                    toast.error("Please sign in to book a ride.");
                    return;
                  }
                  setShowBookingModal(true);
                  setBookingStep(1);
                }}
                disabled={totalFare === 0}
                className="w-full md:w-auto bg-white text-slate-900 px-8 py-3.5 rounded-xl font-bold hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Booking
              </button>
            </div>
          </div>

          {/* Map View */}
          <div className="flex-1 hidden lg:block relative z-0">
            <div className="bg-white p-2 rounded-3xl shadow-sm border border-slate-200 h-[calc(100vh-140px)] min-h-[500px]">
              <MapView 
                pickup={pickupCoords} 
                dropoff={dropoffCoords} 
                routeDistance={distanceKm} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Complete Your Booking</h3>
                <p className="text-sm text-slate-500">
                  {bookingStep === 1 ? "Step 1: Traveller Details" : "Step 2: Review & Pay"}
                </p>
              </div>
              <button 
                onClick={() => setShowBookingModal(false)} 
                className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 flex-shrink-0">
              <div 
                className="h-full bg-orange-500 transition-all duration-300" 
                style={{ width: bookingStep === 1 ? '50%' : '100%' }}
              ></div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {bookingStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Lead Guest Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={guestName} 
                        onChange={e => setGuestName(e.target.value)} 
                        placeholder="John Doe" 
                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-900" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                      <input 
                        type="tel" 
                        value={guestPhone} 
                        onChange={e => setGuestPhone(e.target.value)} 
                        placeholder="+91 9876543210" 
                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-900" 
                      />
                    </div>
                    
                    {/* Other Guests */}
                    {bookingFor === "OTHER" && (
                      <div className="md:col-span-2 mt-2 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-px bg-slate-200 flex-1"></div>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Other Passengers</span>
                          <div className="h-px bg-slate-200 flex-1"></div>
                        </div>
                        {otherGuests.length === 0 && (
                          <button onClick={() => setOtherGuests([{name: "", age: ""}])} className="text-sm font-bold text-orange-500 hover:text-orange-500">
                            + Add Passenger Details
                          </button>
                        )}
                        {otherGuests.map((guest, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex-1">
                              <input 
                                type="text" 
                                value={guest.name} 
                                onChange={(e) => {
                                  const newArr = [...otherGuests];
                                  newArr[index].name = e.target.value;
                                  setOtherGuests(newArr);
                                }}
                                placeholder={`Passenger ${index + 1} Name`}
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-900"
                              />
                            </div>
                            <div className="w-24">
                              <input 
                                type="number" 
                                value={guest.age} 
                                onChange={(e) => {
                                  const newArr = [...otherGuests];
                                  newArr[index].age = e.target.value;
                                  setOtherGuests(newArr);
                                }}
                                placeholder="Age"
                                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-slate-900"
                              />
                            </div>
                            {index === otherGuests.length - 1 && (
                              <button onClick={() => setOtherGuests([...otherGuests, {name: "", age: ""}])} className="text-orange-500 p-2 hover:bg-orange-500 rounded-lg">
                                +
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Special Requests</label>
                      <textarea 
                        value={specialRequests} 
                        onChange={e => setSpecialRequests(e.target.value)} 
                        placeholder="e.g. Extra luggage space needed..." 
                        className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none h-24 resize-none transition-all text-slate-900" 
                      />
                    </div>
                  </div>
                  
                  <button 
                    disabled={!guestName || !guestPhone}
                    onClick={() => setBookingStep(2)}
                    className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 mt-4 text-lg"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {bookingStep === 2 && (
                <div className="space-y-6">
                  {/* Summary Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-orange-500 rounded-lg flex items-center justify-center text-orange-500 flex-shrink-0">
                        <Car className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 line-clamp-1">{vehicle}</h4>
                        <div className="text-sm text-slate-500 mt-1 space-y-0.5">
                          <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {(rideType === "SINGLE" ? pickupDate : startDate)?.toDateString()}</p>
                          <p className="flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5" /> 
                            {rideType === "SINGLE" ? `${distanceKm.toFixed(1)} km Drop` : `${Math.max(1, Math.ceil(((endDate?.getTime() || 0) - (startDate?.getTime() || 0)) / (1000 * 60 * 60 * 24)))} Days Tour`}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-200 mt-4 pt-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-slate-600 font-medium">Estimated Fare</span>
                        <span className="font-black text-lg text-slate-900">₹{totalFare.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Policy */}
                  <div className="flex items-start gap-3 bg-orange-500 p-4 rounded-xl border border-orange-500">
                    <input 
                      type="checkbox" 
                      id="policy-modal-taxi" 
                      checked={agreedToPolicy} 
                      onChange={(e) => setAgreedToPolicy(e.target.checked)}
                      className="mt-1 flex-shrink-0 w-4 h-4 text-orange-500 rounded border-orange-500 focus:ring-orange-500" 
                    />
                    <label htmlFor="policy-modal-taxi" className="text-sm text-slate-700 leading-relaxed cursor-pointer select-none">
                      I agree to WanderKashmir's <span className="text-orange-500 font-semibold hover:underline">Taxi Booking Policy</span>. 
                      (Free cancellation up to 24 hours before pickup time. Additional kms will be charged directly by the driver.)
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setBookingStep(1)} 
                      className="px-6 py-3.5 rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      Back
                    </button>
                    <div className="flex-1">
                      {!agreedToPolicy ? (
                        <button disabled className="w-full bg-slate-200 text-slate-400 font-bold py-3.5 rounded-xl text-lg transition-all">
                          Agree to continue
                        </button>
                      ) : (
                        <CheckoutButton 
                          propertyId=""
                          pricePerNight={0}
                          isLoggedIn={isSignedIn || false}
                          checkIn={(rideType === "SINGLE" ? pickupDate : startDate)?.toISOString() || new Date().toISOString()}
                          checkOut={(rideType === "SINGLE" ? pickupDate : endDate)?.toISOString() || new Date().toISOString()}
                          guests={bookingFor === "SELF" ? 1 : otherGuests.length + 1}
                          adults={bookingFor === "SELF" ? 1 : otherGuests.length + 1}
                          childrenCount={0}
                          nights={rideType === "SINGLE" ? 1 : Math.max(1, Math.ceil(((endDate?.getTime() || 0) - (startDate?.getTime() || 0)) / (1000 * 60 * 60 * 24)))}
                          guestName={guestName}
                          guestPhone={guestPhone}
                          specialRequests={specialRequests}
                          otherGuests={otherGuests.filter(g => g.name)}
                          baseAmount={0}
                          taxiAmount={totalFare}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fetching Location Card */}
      {isLocating && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-orange-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-orange-500 w-24 h-24 rounded-full flex items-center justify-center text-orange-500 shadow-inner">
                <Navigation2 className="w-10 h-10 animate-bounce" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Locating You</h3>
            <p className="text-slate-500 text-sm">Please wait while we fetch your exact coordinates...</p>
          </div>
        </div>
      )}

    </div>
  );
}
