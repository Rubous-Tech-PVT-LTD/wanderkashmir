"use client";

import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { Building2, Car, Map as MapIcon, Info } from "lucide-react";

// Fix for default Leaflet marker icon issue in Next.js
const createCustomIcon = (color: string) => {
  return new L.DivIcon({
    className: "custom-leaflet-icon",
    html: `
      <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
        <div class="animate-ping" style="position: absolute; width: 100%; height: 100%; background-color: ${color}; border-radius: 50%; opacity: 0.9; animation-duration: 2s;"></div>
        <div style="position: relative; width: 16px; height: 16px; background-color: ${color}; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 0 20px ${color}, 0 0 40px ${color};"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const hotelIcon = createCustomIcon("#0ea5e9"); // Neon Blue
const homestayIcon = createCustomIcon("#d946ef"); // Neon Fuchsia/Pink
const taxiIcon = createCustomIcon("#eab308"); // Neon Yellow
const guideIcon = createCustomIcon("#10b981"); // Neon Emerald

export default function AdminMapView({ vendors, onExit }: { vendors: any[], onExit?: () => void }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[600px] bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">Loading Map...</div>;

  // Center on Srinagar roughly
  const defaultCenter: [number, number] = [34.0836, 74.7973];

  // Restrict map bounds to Jammu & Kashmir and Ladakh
  const jkBounds: L.LatLngBoundsExpression = [
    [32.0, 73.0], // South West roughly around Kathua/Pathankot border
    [36.0, 80.5]  // North East roughly around Aksai Chin / Siachen
  ];

  return (
    <div className="w-full h-full relative bg-slate-900">
      
      {/* Overlay UI */}
      <div className="absolute top-6 left-6 right-6 z-[1000] flex flex-wrap items-start justify-between gap-4 pointer-events-none">
        <div className="bg-[#0f172a]/80 backdrop-blur-md p-4 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-slate-700 pointer-events-auto flex items-center gap-6">
          <div>
            <h2 className="text-xl font-black text-white">Platform Map</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">Live Vendor Tracking</p>
          </div>
          <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-200">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#0ea5e9] shadow-[0_0_8px_#0ea5e9]"></div> Hotel</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#d946ef] shadow-[0_0_8px_#d946ef]"></div> Homestay</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#eab308] shadow-[0_0_8px_#eab308]"></div> Taxi</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"></div> Guide</div>
          </div>
        </div>

        {onExit && (
          <button 
            onClick={onExit}
            className="bg-[#0f172a]/90 text-white border border-slate-700 px-5 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:bg-[#1e293b] hover:shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all pointer-events-auto flex items-center gap-2"
          >
            Exit Map View
          </button>
        )}
      </div>

      {/* Cyberpunk Glow Overlay */}
      <div className="absolute inset-0 pointer-events-none z-[400] bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-fuchsia-900/30 mix-blend-color"></div>
      <div className="absolute inset-0 pointer-events-none z-[400] shadow-[inset_0_0_100px_rgba(76,29,149,0.5)]"></div>

      <div className="w-full h-full relative z-0 bg-[#0a0a1a]">
        <MapContainer 
          center={defaultCenter} 
          zoom={8} 
          minZoom={7}
          maxBounds={jkBounds}
          maxBoundsViscosity={1.0}
          style={{ height: "100%", width: "100%" }}
          className="cyberpunk-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            className="filter invert-[.95] hue-rotate-[200deg] saturate-[1.5] brightness-[0.9] contrast-[1.1]"
          />

          {vendors.filter(v => v.status !== "SUSPENDED").map((vendor) => {
            // Determine coordinate and icon
            let lat = vendor.latitude;
            let lng = vendor.longitude;
            let title = vendor.businessName;
            let icon = hotelIcon;
            let rate = "N/A";
            let typeLabel = "Hotel";

            if (vendor.type === "HOTEL") {
              icon = hotelIcon;
              typeLabel = "Hotel";
              if (vendor.properties && vendor.properties.length > 0) {
                // If vendor has no lat/lng, fallback to property lat/lng
                if (!lat && vendor.properties[0].latitude) lat = vendor.properties[0].latitude;
                if (!lng && vendor.properties[0].longitude) lng = vendor.properties[0].longitude;
                rate = `₹${vendor.properties[0].pricePerNight} / night`;
                title = vendor.properties[0].name;
              }
            } else if (vendor.type === "HOMESTAY") {
              icon = homestayIcon;
              typeLabel = "Homestay";
              if (vendor.properties && vendor.properties.length > 0) {
                if (!lat && vendor.properties[0].latitude) lat = vendor.properties[0].latitude;
                if (!lng && vendor.properties[0].longitude) lng = vendor.properties[0].longitude;
                rate = `₹${vendor.properties[0].pricePerNight} / night`;
                title = vendor.properties[0].name;
              }
            } else if (vendor.type === "TAXI") {
              icon = taxiIcon;
              typeLabel = "Taxi Service";
              // Taxis usually use the vendor's lat/lng registered base
            } else if (vendor.type === "GUIDE") {
              icon = guideIcon;
              typeLabel = "Guide";
              if (vendor.guideProfiles && vendor.guideProfiles.length > 0) {
                rate = `₹${vendor.guideProfiles[0].pricePerDay} / day`;
              }
            }

            // Only render if we have coordinates
            if (!lat || !lng) return null;

            return (
              <Marker key={vendor.id} position={[lat, lng] as [number, number]} icon={icon}>
                <Tooltip direction="top" offset={[0, -12]} opacity={1} className="custom-leaflet-tooltip !p-0 !border-none !bg-transparent !shadow-none">
                  <div className="bg-[#0f172a]/90 backdrop-blur-md rounded-xl shadow-[0_0_25px_rgba(0,0,0,0.8)] border border-slate-700 p-3 min-w-[180px] font-sans">
                    <h3 className="font-bold text-white text-base leading-tight mb-1">{title}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2">{typeLabel}</p>
                    
                    <div className="bg-slate-900/50 rounded p-2 text-sm border border-slate-800/50">
                      <div className="flex justify-between items-center mb-1 gap-4">
                        <span className="text-slate-400">Rate:</span>
                        <span className="font-bold text-emerald-400">{rate}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-slate-400">Owner:</span>
                        <span className="font-medium text-slate-300 truncate max-w-[100px]">{vendor.user?.name || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
