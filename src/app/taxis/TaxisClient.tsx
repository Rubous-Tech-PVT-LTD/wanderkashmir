"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Car, MapPin, Info, ArrowRight, UserCircle2, ChevronDown, ChevronLeft, ChevronRight, CheckCircle2, Search, Star } from "lucide-react";

const DEFAULT_IMAGES: Record<string, string> = {
  "CRYSTA": "https://imgd.aeplcdn.com/664x374/n/cw/ec/139651/innova-crysta-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80",
  "INNOVA": "https://imgd.aeplcdn.com/664x374/n/cw/ec/140809/innova-hycross-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80",
  "ERTIGA": "https://imgd.aeplcdn.com/664x374/n/cw/ec/115025/ertiga-exterior-right-front-three-quarter-3.jpeg?isig=0&q=80",
  "TAVEERA": "https://imgd.aeplcdn.com/664x374/ec/30/16/10271/img/m/Chevrolet-Tavera-Neo-3-Right-Front-Three-Quarter-48419_ol.jpg?v=201711021421&q=80",
  "ETIOS GLANZA": "https://imgd.aeplcdn.com/664x374/ec/4B/7D/10398/img/m/Toyota-Platinum-Etios-Right-Front-Three-Quarter-83344_ol.jpg?v=201711021421&q=80",
  "SWIFT DZIRE": "https://imgd.aeplcdn.com/664x374/n/cw/ec/170173/swift-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80",
  "ECCO": "https://imgd.aeplcdn.com/664x374/n/cw/ec/131151/eeco-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80",
  "ALTO K10": "https://imgd.aeplcdn.com/664x374/n/cw/ec/127563/alto-k10-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80",
  "SUMO": "https://imgd.aeplcdn.com/664x374/ec/14/C8/10410/img/m/Tata-Sumo-Gold-Right-Front-Three-Quarter-51206_ol.jpg?v=201711021421&q=80",
  "BOLERO": "https://imgd.aeplcdn.com/664x374/n/cw/ec/131131/bolero-exterior-right-front-three-quarter-2.jpeg?isig=0&q=80"
};

const VEHICLE_TYPES = Object.keys(DEFAULT_IMAGES);

export default function TaxisClient({ rateCards, imagesMap = {}, verifiedDrivers = [] }: { rateCards: any[], imagesMap?: Record<string, string>, verifiedDrivers?: any[] }) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("INNOVA");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [searchRoute, setSearchRoute] = useState("");

  const filteredRoutes = rateCards.filter(r => r.place.toLowerCase().includes(searchRoute.toLowerCase()));
  
  // Filter verified drivers for the selected vehicle type
  const activeVerifiedDrivers = verifiedDrivers.filter(driver => {
    if (!driver.vehicles || driver.vehicles.length === 0) return false;

    const matchVehicle = selectedVehicle.toUpperCase();
    const dType = driver.vehicleType?.toUpperCase() || "";
    
    if (dType && (dType.includes(matchVehicle) || matchVehicle.includes(dType))) return true;
    
    if (driver.vehicles && driver.vehicles.some((v: any) => {
      const vModel = v.model?.toUpperCase() || "";
      const vType = v.type?.toUpperCase() || "";
      return vModel.includes(matchVehicle) || matchVehicle.includes(vModel) || 
             vType === matchVehicle || matchVehicle.includes(vType);
    })) return true;
    
    return false;
  });

  type ProviderType = {
    id: string;
    name: string;
    isOfficial: boolean;
    vehicleType: string;
    description?: string;
    vehicleRegistration?: string;
    experienceYears?: number;
    rating?: number;
    trips?: number;
    rateOverrides?: any[];
  };

  const allProviders: ProviderType[] = [
    {
      id: "wanderkashmir_official",
      name: "WanderKashmir",
      isOfficial: true,
      vehicleType: selectedVehicle,
      description: "Official standard rates provided directly by WanderKashmir.",
    },
    ...activeVerifiedDrivers
      .map((d, i) => {
        // Fallbacks if rating/trips are not yet in backend
        const mockRating = parseFloat((4.5 + (i % 5) * 0.1).toFixed(1));
        const mockTrips = 50 + (i * 23) % 200;
        
        const primaryVehicle = d.vehicles && d.vehicles.length > 0 ? d.vehicles[0] : null;
        
        return {
          id: d.id,
          name: d.businessName || "Wander Verified Driver",
          isOfficial: false,
          vehicleType: d.vehicleType || primaryVehicle?.model || selectedVehicle,
          vehicleRegistration: d.vehicleRegistration || primaryVehicle?.registrationNum,
          experienceYears: d.experienceYears || 0,
          rating: d.rating || mockRating,
          trips: d.trips || mockTrips,
          rateOverrides: d.rateOverrides
        };
      })
      .sort((a, b) => {
        // Sort by Rating first, then Trips, then Experience
        if (b.rating !== a.rating) return (b.rating || 0) - (a.rating || 0);
        if (b.trips !== a.trips) return (b.trips || 0) - (a.trips || 0);
        return (b.experienceYears || 0) - (a.experienceYears || 0);
      })
  ];

  const [providerPage, setProviderPage] = useState(1);
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const [isVehicleDropdownOpen, setIsVehicleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const providersPerPage = 5;

  const [vehiclePage, setVehiclePage] = useState(1);
  const [searchVehicle, setSearchVehicle] = useState("");
  const vehiclesPerPage = 5;

  const filteredVehicles = VEHICLE_TYPES.filter(vt => vt.toLowerCase().includes(searchVehicle.toLowerCase()));
  const totalVehiclePages = Math.max(1, Math.ceil(filteredVehicles.length / vehiclesPerPage));
  const paginatedVehicles = filteredVehicles.slice((vehiclePage - 1) * vehiclesPerPage, vehiclePage * vehiclesPerPage);

  // Reset page when search changes
  useEffect(() => {
    setVehiclePage(1);
  }, [searchVehicle]);

  const totalProviderPages = Math.max(1, Math.ceil(allProviders.length / providersPerPage));
  const paginatedProviders = allProviders.slice((providerPage - 1) * providersPerPage, providerPage * providersPerPage);

  // Reset page when vehicle changes
  useEffect(() => {
    setProviderPage(1);
  }, [selectedVehicle]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProviderDropdownOpen(false);
      }
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(event.target as Node)) {
        setIsVehicleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="pt-24 pb-20">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Kashmir Taxi Rates</h1>
          <p className="text-lg text-slate-600">Standard union rates for sightseeing, airport drops, and full-day tours across Kashmir. Select a vehicle to view its prices.</p>
        </div>

        {/* Vehicle Selection */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Car className="w-6 h-6 text-orange-500" />
            1. Select Your Vehicle
          </h2>
          
          <div className="relative w-full md:max-w-md lg:max-w-lg" ref={vehicleDropdownRef}>
            <button 
              onClick={() => setIsVehicleDropdownOpen(!isVehicleDropdownOpen)}
              className="w-full bg-white border-2 border-slate-200 hover:border-orange-400 rounded-2xl p-4 flex items-center justify-between transition-colors focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-sm"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0 border border-orange-200">
                  <Car className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 truncate">
                    {selectedVehicle}
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    Selected Vehicle Type
                  </div>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isVehicleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isVehicleDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 border-b border-slate-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search vehicles..."
                      value={searchVehicle}
                      onChange={(e) => setSearchVehicle(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-shadow"
                    />
                  </div>
                </div>
                <div className="max-h-[320px] overflow-y-auto hide-scrollbar divide-y divide-slate-100">
                  {paginatedVehicles.map(vt => (
                    <button
                      key={vt}
                      onClick={() => {
                        setSelectedVehicle(vt);
                        setSelectedProvider(null);
                        setIsVehicleDropdownOpen(false);
                      }}
                      className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center gap-4 ${selectedVehicle === vt ? 'bg-orange-50/50' : ''}`}
                    >
                      <div className="w-12 h-8 rounded shrink-0 overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center relative">
                        {imagesMap[vt] || DEFAULT_IMAGES[vt] ? (
                           <Image src={imagesMap[vt] || DEFAULT_IMAGES[vt]} alt={vt} fill className="object-cover" sizes="48px" />
                        ) : (
                           <Car className="w-4 h-4 text-slate-400 z-10" />
                        )}
                      </div>
                      
                      <div className="flex-1 font-bold text-slate-800">
                        {vt}
                      </div>
                      
                      {selectedVehicle === vt && (
                        <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
                      )}
                    </button>
                  ))}
                  {paginatedVehicles.length === 0 && (
                     <div className="p-6 text-center text-slate-500 text-sm">
                       No vehicles found matching "{searchVehicle}".
                     </div>
                  )}
                </div>

                {/* Pagination Controls */}
                {totalVehiclePages > 1 && (
                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setVehiclePage(Math.max(1, vehiclePage - 1)) }}
                      disabled={vehiclePage === 1}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-semibold text-slate-500">
                      Page {vehiclePage} of {totalVehiclePages}
                    </span>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setVehiclePage(Math.min(totalVehiclePages, vehiclePage + 1)) }}
                      disabled={vehiclePage === totalVehiclePages}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Provider Selection */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <UserCircle2 className="w-6 h-6 text-sky-500" />
            2. Choose a Provider for <span className="text-orange-600">{selectedVehicle}</span>
          </h2>
          
          <div className="relative w-full md:max-w-md lg:max-w-lg" ref={dropdownRef}>
            <button 
              onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
              className="w-full bg-white border-2 border-slate-200 hover:border-orange-400 rounded-2xl p-4 flex items-center justify-between transition-colors focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-sm"
            >
              {selectedProvider ? (
                <div className="flex items-center gap-3 text-left">
                  {allProviders.find(p => p.id === selectedProvider)?.isOfficial ? (
                    <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center shrink-0 border border-sky-200">
                      <MapPin className="w-5 h-5 text-sky-600" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0 border border-green-200">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[250px]">
                      {allProviders.find(p => p.id === selectedProvider)?.name}
                    </div>
                    <div className="text-xs font-semibold text-slate-500">
                      {allProviders.find(p => p.id === selectedProvider)?.isOfficial ? 'Official Taxi Stand' : 'Verified Driver'}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-slate-500 font-medium pl-2">Select a provider...</span>
              )}
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isProviderDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProviderDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-[320px] overflow-y-auto hide-scrollbar divide-y divide-slate-100">
                  {paginatedProviders.map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        setSelectedProvider(provider.id);
                        setIsProviderDropdownOpen(false);
                      }}
                      className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-4 ${selectedProvider === provider.id ? 'bg-orange-50/50' : ''}`}
                    >
                      {provider.isOfficial ? (
                        <div className="w-10 h-10 mt-1 bg-sky-100 rounded-full flex items-center justify-center shrink-0 border border-sky-200">
                          <MapPin className="w-5 h-5 text-sky-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 mt-1 bg-green-100 rounded-full flex items-center justify-center shrink-0 border border-green-200">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className={`font-bold truncate ${provider.isOfficial ? 'text-sky-700' : 'text-slate-800'}`}>
                            {provider.name}
                          </div>
                          <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${provider.isOfficial ? 'bg-sky-100 text-sky-700' : 'bg-green-100 text-green-700'}`}>
                            {provider.isOfficial ? 'OFFICIAL' : 'VERIFIED'}
                          </span>
                        </div>
                        {provider.isOfficial ? (
                          <div className="text-xs text-slate-500 leading-relaxed pr-2">
                            {provider.description}
                          </div>
                        ) : (
                          <div className="space-y-1.5 mt-1.5">
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1 text-amber-500 font-bold">
                                <Star className="w-3.5 h-3.5 fill-current" />
                                {provider.rating}
                              </div>
                              <div className="flex items-center gap-1 text-slate-600 font-medium border-l border-slate-300 pl-3">
                                {provider.trips} Trips
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                              <span>Exp: <span className="font-medium text-slate-700">{provider.experienceYears ? `${provider.experienceYears}+ Yrs` : 'Proven'}</span></span>
                              <span>RC: <span className="font-medium text-slate-700">{provider.vehicleRegistration || 'Verified'}</span></span>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                  {paginatedProviders.length === 0 && (
                     <div className="p-6 text-center text-slate-500 text-sm">
                       No providers available for this vehicle.
                     </div>
                  )}
                </div>
                
                {/* Pagination Controls */}
                {totalProviderPages > 1 && (
                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setProviderPage(Math.max(1, providerPage - 1)) }}
                      disabled={providerPage === 1}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-semibold text-slate-500">
                      Page {providerPage} of {totalProviderPages}
                    </span>
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setProviderPage(Math.min(totalProviderPages, providerPage + 1)) }}
                      disabled={providerPage === totalProviderPages}
                      className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Rate Card Display (Only shown if a provider is selected) */}
        {selectedProvider && (
          <div className="mt-12 pt-8 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-sky-500" />
                3. Explore Rates & Book
              </h2>
              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  placeholder="Search route (e.g. Pahalgam)"
                  value={searchRoute}
                  onChange={e => setSearchRoute(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Route / Destination</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-40 text-right">Standard Rate</th>
                    <th className="px-6 py-4 w-32"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRoutes.map((rate) => {
                    const standardPrice = rate.rates[selectedVehicle];
                    
                    const provider = allProviders.find(p => p.id === selectedProvider);
                    let displayPrice = standardPrice;
                    
                    if (provider && provider.rateOverrides) {
                       const override = provider.rateOverrides.find((ro: any) => ro.routePlace === rate.place);
                       if (override) displayPrice = override.customPrice;
                    }
                    
                    return (
                      <tr key={rate.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-semibold text-slate-800 text-sm md:text-base">
                          {rate.place}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">
                          {displayPrice && displayPrice > 0 ? `₹${displayPrice.toLocaleString('en-IN')}` : <span className="text-slate-400 font-normal">N/A</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {displayPrice && displayPrice > 0 && (
                            <Link 
                              href={`/checkout?type=taxi&vehicle=${selectedVehicle}&route=${encodeURIComponent(rate.place)}${selectedProvider !== "wanderkashmir_official" ? `&driverId=${selectedProvider}` : ''}`} 
                              className="inline-flex items-center gap-1 text-sm font-bold text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Book <ArrowRight className="w-4 h-4" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRoutes.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                        No routes found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex items-start gap-2 text-sm text-slate-500 bg-sky-50 p-4 rounded-xl mb-12">
              <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              <p>
                These are standard union rates. Actual booking prices may have slight variations depending on exact pickup/drop locations and seasonal demand. Tolls and parking are extra unless specified.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
