"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

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

const pickupIcon = createCustomIcon("#0ea5e9"); // Sky 500
const dropoffIcon = createCustomIcon("#f97316"); // Orange 500

// Helper component to adjust map bounds to fit points
function MapBoundsUpdater({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [points, map]);
  return null;
}

export default function TaxiMapView({ 
  pickup, 
  dropoff, 
  routeDistance 
}: { 
  pickup: [number, number] | null;
  dropoff: [number, number] | null;
  routeDistance: number;
}) {
  const defaultCenter: [number, number] = [34.0837, 74.7973]; // Srinagar
  const [routeLine, setRouteLine] = useState<[number, number][]>([]);

  useEffect(() => {
    async function fetchRoute() {
      if (pickup && dropoff) {
        try {
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${pickup[1]},${pickup[0]};${dropoff[1]},${dropoff[0]}?geometries=geojson`);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            // OSRM returns coordinates as [lng, lat], leaflet needs [lat, lng]
            const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
            setRouteLine(coords);
          }
        } catch (e) {
          console.error("Error fetching OSRM route:", e);
          // Fallback to straight line
          setRouteLine([pickup, dropoff]);
        }
      } else {
        setRouteLine([]);
      }
    }
    fetchRoute();
  }, [pickup, dropoff]);

  const points: [number, number][] = [];
  if (pickup) points.push(pickup);
  if (dropoff) points.push(dropoff);

  return (
    <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden relative z-0">
      <MapContainer 
        center={pickup || defaultCenter} 
        zoom={pickup ? 13 : 9} 
        scrollWheelZoom={false} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {points.length > 0 && <MapBoundsUpdater points={points} />}

        {pickup && (
          <Marker position={pickup} icon={pickupIcon}>
            <Popup>Pick-up Location</Popup>
          </Marker>
        )}
        
        {dropoff && (
          <Marker position={dropoff} icon={dropoffIcon}>
            <Popup>Drop-off Location</Popup>
          </Marker>
        )}

        {routeLine.length > 0 && (
          <Polyline 
            positions={routeLine} 
            color="#0ea5e9" 
            weight={4} 
            opacity={0.8} 
            dashArray="10, 10" 
          />
        )}
      </MapContainer>

      {/* Stats Overlay */}
      {routeDistance > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-white px-6 py-3 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 text-sm font-bold text-slate-900">
          📍 Estimated Distance: <span className="text-sky-600">{routeDistance.toFixed(1)} km</span>
        </div>
      )}
    </div>
  );
}
