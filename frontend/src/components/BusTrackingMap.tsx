import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useBusTracking } from "../hooks/useBusTracking";
import { apiClient } from "../api/client";

// Fix standard Leaflet marker icons in React
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to recenter map when location changes
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

interface BusTrackingMapProps {
  busId: string | number;
}

export default function BusTrackingMap({ busId }: BusTrackingMapProps) {
  const { location, isConnected } = useBusTracking(busId);
  const [initialLocation, setInitialLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Decoupled state for the React-Leaflet Marker position
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
  const markerRef = useRef<L.Marker>(null);

  // Fetch initial known location from REST API to avoid waiting for the first websocket broadcast
  useEffect(() => {
    async function fetchInitialLocation() {
      try {
        const response = await apiClient.get(`/tracking/bus/${busId}`);
        if (response.data?.data) {
          setInitialLocation({
            lat: response.data.data.latitude,
            lng: response.data.data.longitude,
          });
        }
      } catch (error) {
        console.log("No initial location found or error fetching.");
      }
    }

    if (busId && !location) {
      fetchInitialLocation();
    }
  }, [busId, location]);

  const activeLat = location?.latitude || initialLocation?.lat;
  const activeLng = location?.longitude || initialLocation?.lng;

  // Handle smooth animation of the marker when coordinates update
  useEffect(() => {
    if (activeLat !== undefined && activeLng !== undefined) {
      if (!markerPos) {
        // First ever lock - snap the initial React position
        setMarkerPos([activeLat, activeLng]);
      } else if (markerRef.current) {
        // Subsequent updates - smoothly animate imperatively via Leaflet
        const marker = markerRef.current;
        const startLatLng = marker.getLatLng();
        const targetLatLng = L.latLng(activeLat, activeLng);

        if (startLatLng.lat === targetLatLng.lat && startLatLng.lng === targetLatLng.lng) return;

        const duration = 1000; // Animate over 1 second linearly
        const startTime = performance.now();

        const animateMarker = (time: number) => {
          const elapsed = time - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          const lat = startLatLng.lat + (targetLatLng.lat - startLatLng.lat) * progress;
          const lng = startLatLng.lng + (targetLatLng.lng - startLatLng.lng) * progress;
          
          marker.setLatLng([lat, lng]);
          
          if (progress < 1) {
            requestAnimationFrame(animateMarker);
          }
        };

        requestAnimationFrame(animateMarker);
      }
    }
  }, [activeLat, activeLng]); // Target specific coordinate triggers to avoid loop

  if (!activeLat || !activeLng || !markerPos) {
    return (
      <div className="w-full h-96 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-slate-500 font-medium">
            Acquiring satellite lock for Bus #{busId}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative">
      {/* Connection Status Badge */}
      <div className="absolute top-4 right-4 z-[1000] bg-white px-3 py-1.5 rounded-full shadow-md text-sm font-medium flex items-center gap-2 border border-slate-100">
        <div
          className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
        ></div>
        <span className={isConnected ? "text-emerald-700" : "text-red-700"}>
          {isConnected ? "LIVE" : "DISCONNECTED"}
        </span>
      </div>

      <MapContainer
        center={[activeLat, activeLng]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {location && (
          <RecenterMap lat={location.latitude} lng={location.longitude} />
        )}

        <Marker position={markerPos} ref={markerRef}>
          <Popup>
            <div className="font-sans">
              <strong className="block text-slate-900 mb-1 border-b pb-1">
                Bus #{busId}
              </strong>
              {location?.speed ? (
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-emerald-600">
                    {location.speed} mph
                  </span>
                  <br />
                  Tracking Active
                </div>
              ) : (
                <div className="text-sm text-slate-500">
                  Stationary / Speed unknown
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
