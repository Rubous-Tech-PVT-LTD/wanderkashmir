"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const CustomDatePicker = dynamic(() => import("./CustomDatePicker"), {
  ssr: false,
  loading: () => <input type="text" readOnly placeholder="Loading..." className="w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-none cursor-wait placeholder:text-slate-400" />,
});

function LazyDatePickerField({ label, selected, onChange, minDate, placeholderText }: any) {
  const [isInteractive, setIsInteractive] = useState(false);

  return (
    <div 
      className="flex-1 w-full p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer px-4"
      onMouseEnter={() => setIsInteractive(true)}
      onClick={() => setIsInteractive(true)}
      onFocus={() => setIsInteractive(true)}
    >
      <label className="block text-[11px] font-bold text-slate-800 mb-1">{label}</label>
      {!isInteractive && !selected ? (
        <input 
          type="text" 
          readOnly 
          placeholder={placeholderText} 
          className="w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer placeholder:text-slate-500" 
        />
      ) : (
        <CustomDatePicker
          selected={selected}
          onChange={onChange}
          minDate={minDate}
          placeholderText={placeholderText}
          className="w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer placeholder:text-slate-500"
        />
      )}
    </div>
  );
}

export default function SearchBar() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Tour Packages");
  const tabs = ["Tour Packages", "Homestays", "Hotels", "Taxis", "Travel Guide"];

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState("2 Guests, 1 Room");

  const handleSearch = () => {
    const queryParams = new URLSearchParams();
    if (destination) queryParams.append("q", destination);
    if (checkIn) queryParams.append("checkIn", checkIn.toISOString().split("T")[0]);
    if (checkOut) queryParams.append("checkOut", checkOut.toISOString().split("T")[0]);
    if (guests) queryParams.append("guests", guests);

    let route = "/stays";
    if (activeTab === "Hotels") route = "/stays?type=Hotel";
    if (activeTab === "Homestays") route = "/stays?type=Homestay";
    if (activeTab === "Taxis") route = "/taxis";
    if (activeTab === "Tour Packages") route = "/tours";
    if (activeTab === "Travel Guide") route = "/guides";

    const queryString = queryParams.toString();
    router.push(`${route}${queryString ? `?${queryString}` : ""}`);
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#f8f9fa] px-4 pt-3 border-b border-slate-100 overflow-x-auto no-scrollbar" role="tablist" aria-label="Search categories">
        {tabs.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-8 py-3.5 text-sm font-bold rounded-t-xl transition-colors relative ${
              activeTab === tab
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[3px] bg-orange-500 rounded-t-md" />
            )}
          </button>
        ))}
      </div>

      {/* Input Fields */}
      <div className="flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white p-2">

        {/* HOMESTAYS & HOTELS */}
        {(activeTab === "Homestays" || activeTab === "Hotels") && (
          <>
            <div className="flex-[1.5] w-full p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-text group">
              <label htmlFor="destination-input" className="block text-[11px] font-bold text-slate-800 ml-8 mb-1">Where are you going?</label>
              <div className="flex items-center gap-3 px-2">
                {/* Icon is decorative — screen readers read the label instead */}
                <Search className="w-4 h-4 text-slate-500 group-focus-within:text-[#0284c7] flex-shrink-0" aria-hidden="true" />
                <input
                  id="destination-input"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Search destinations or properties"
                  className="w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
            <LazyDatePickerField
              label="Check-in"
              selected={checkIn}
              onChange={(date: Date) => {
                setCheckIn(date);
                if (date && checkOut && date > checkOut) setCheckOut(null);
              }}
              minDate={new Date()}
              placeholderText="Add date"
            />
            <LazyDatePickerField
              label="Check-out"
              selected={checkOut}
              onChange={(date: Date) => setCheckOut(date)}
              minDate={checkIn || new Date()}
              placeholderText="Add date"
            />
            <div className="flex-[1.6] w-full p-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors px-4">
              <div className="flex-1 cursor-pointer min-w-[120px]">
                <label htmlFor="guests-input" className="block text-[11px] font-bold text-slate-800 mb-1">Guests</label>
                <input
                  id="guests-input"
                  type="text"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  placeholder="2 Guests, 1 Room"
                  className="w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer placeholder:text-slate-500"
                />
              </div>
              <button
                onClick={handleSearch}
                aria-label="Search stays"
                className="bg-[#0284c7] text-white p-3 md:px-6 md:py-3.5 rounded-xl hover:bg-[#0369a1] transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0 ml-2"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={2.5} aria-hidden="true" />
                <span className="font-bold text-sm hidden lg:inline tracking-wide">Search</span>
              </button>
            </div>
          </>
        )}

        {/* TAXIS */}
        {activeTab === "Taxis" && (
          <>
            <div className="flex-[1.5] w-full p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-text group">
              <label htmlFor="pickup-input" className="block text-[11px] font-bold text-slate-800 ml-8 mb-1">Pick-up Location</label>
              <div className="flex items-center gap-3 px-2">
                <MapPin className="w-4 h-4 text-slate-500 group-focus-within:text-[#0284c7] flex-shrink-0" aria-hidden="true" />
                <input
                  id="pickup-input"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="E.g. Srinagar Airport"
                  className="w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="flex-[1.5] w-full p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-text group">
              <label htmlFor="dropoff-input" className="block text-[11px] font-bold text-slate-800 ml-8 mb-1">Drop-off Location</label>
              <div className="flex items-center gap-3 px-2">
                <MapPin className="w-4 h-4 text-slate-500 group-focus-within:text-[#0284c7] flex-shrink-0" aria-hidden="true" />
                <input
                  id="dropoff-input"
                  type="text"
                  placeholder="E.g. Gulmarg"
                  className="w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
            <LazyDatePickerField
              label="Pick-up Date"
              selected={checkIn}
              onChange={(date: Date) => setCheckIn(date)}
              minDate={new Date()}
              placeholderText="Add date"
            />
            <div className="flex-[1] w-full p-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors px-4">
              <button
                onClick={handleSearch}
                aria-label="Search cabs"
                className="w-full bg-[#0284c7] text-white p-3 md:px-6 md:py-3.5 rounded-xl hover:bg-[#0369a1] transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={2.5} aria-hidden="true" />
                <span className="font-bold text-sm hidden lg:inline tracking-wide">Search Cabs</span>
              </button>
            </div>
          </>
        )}

        {/* TOUR PACKAGES */}
        {activeTab === "Tour Packages" && (
          <>
            <div className="flex-[1.5] w-full p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-text group">
              <label htmlFor="tour-dest-input" className="block text-[11px] font-bold text-slate-800 ml-8 mb-1">Where to?</label>
              <div className="flex items-center gap-3 px-2">
                <Search className="w-4 h-4 text-slate-500 group-focus-within:text-[#0284c7] flex-shrink-0" aria-hidden="true" />
                <input
                  id="tour-dest-input"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Srinagar, Pahalgam..."
                  className="w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
            <div className="flex-1 w-full p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer px-4">
              <label htmlFor="travel-month" className="block text-[11px] font-bold text-slate-800 mb-1">Travel Month</label>
              <select id="travel-month" className="w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer">
                <option>Any Month</option>
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
              </select>
            </div>
            <div className="flex-1 w-full p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer px-4">
              <label htmlFor="tour-duration" className="block text-[11px] font-bold text-slate-800 mb-1">Duration</label>
              <select id="tour-duration" className="w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer">
                <option>Any Duration</option>
                <option>3-5 Days</option>
                <option>6-8 Days</option>
                <option>9+ Days</option>
              </select>
            </div>
            <div className="flex-[1.6] w-full p-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors px-4">
              <div className="flex-1 cursor-pointer min-w-[120px]">
                <label htmlFor="tour-travelers" className="block text-[11px] font-bold text-slate-800 mb-1">Travelers</label>
                <input
                  id="tour-travelers"
                  type="text"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  placeholder="2 Adults"
                  className="w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-none cursor-pointer placeholder:text-slate-500"
                />
              </div>
              <button
                onClick={handleSearch}
                aria-label="Find tour packages"
                className="bg-[#0284c7] text-white p-3 md:px-6 md:py-3.5 rounded-xl hover:bg-[#0369a1] transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0 ml-2"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={2.5} aria-hidden="true" />
                <span className="font-bold text-sm hidden lg:inline tracking-wide">Find Tours</span>
              </button>
            </div>
          </>
        )}

        {/* TRAVEL GUIDE */}
        {activeTab === "Travel Guide" && (
          <>
            <div className="flex-[1.5] w-full p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-text group">
              <label htmlFor="guide-dest-input" className="block text-[11px] font-bold text-slate-800 ml-8 mb-1">Where?</label>
              <div className="flex items-center gap-3 px-2">
                <MapPin className="w-4 h-4 text-slate-500 group-focus-within:text-[#0284c7] flex-shrink-0" aria-hidden="true" />
                <input
                  id="guide-dest-input"
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Srinagar, Gulmarg..."
                  className="w-full text-sm font-medium text-slate-700 bg-transparent focus:outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
            <LazyDatePickerField
              label="Date"
              selected={checkIn}
              onChange={(date: Date) => setCheckIn(date)}
              minDate={new Date()}
              placeholderText="Select date"
            />
            <div className="flex-[1] w-full p-2 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors px-4">
              <button
                onClick={handleSearch}
                aria-label="Find local guides"
                className="w-full bg-[#0284c7] text-white p-3 md:px-6 md:py-3.5 rounded-xl hover:bg-[#0369a1] transition-all shadow-md flex items-center justify-center gap-2 flex-shrink-0"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={2.5} aria-hidden="true" />
                <span className="font-bold text-sm hidden lg:inline tracking-wide">Find Guides</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
