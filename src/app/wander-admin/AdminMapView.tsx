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
        <div class="animate-ping" style="position: absolute; width: 100%; height: 100%; background-color: ${color}; border-radius: 50%; opacity: 0.8;"></div>
        <div style="position: relative; width: 16px; height: 16px; background-color: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const hotelIcon = createCustomIcon("#3b82f6"); // blue-500
const homestayIcon = createCustomIcon("#8b5cf6"); // violet-500
const taxiIcon = createCustomIcon("#f59e0b"); // amber-500
const guideIcon = createCustomIcon("#10b981"); // emerald-500

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
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-slate-200 pointer-events-auto flex items-center gap-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">Platform Map</h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">Live Vendor Tracking</p>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-700">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div> Hotel</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-violet-500 shadow-sm shadow-violet-500/50"></div> Homestay</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></div> Taxi</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></div> Guide</div>
          </div>
        </div>

        {onExit && (
          <button 
            onClick={onExit}
            className="bg-slate-900 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors pointer-events-auto flex items-center gap-2"
          >
            Exit Map View
          </button>
        )}
      </div>

      <div className="w-full h-full relative z-0 bg-slate-100">
        <MapContainer 
          center={defaultCenter} 
          zoom={8} 
          minZoom={7}
          maxBounds={jkBounds}
          maxBoundsViscosity={1.0}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
                  <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-3 min-w-[180px] font-sans">
                    <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">{title}</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">{typeLabel}</p>
                    
                    <div className="bg-slate-50 rounded p-2 text-sm border border-slate-100">
                      <div className="flex justify-between items-center mb-1 gap-4">
                        <span className="text-slate-500">Rate:</span>
                        <span className="font-bold text-slate-900">{rate}</span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-slate-500">Owner:</span>
                        <span className="font-medium text-slate-700 truncate max-w-[100px]">{vendor.user?.name || "N/A"}</span>
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
