import { useState, useEffect } from "react";
import { socket } from "../services/socket";

export interface BusLocationData {
  busId: string | number;
  latitude: number;
  longitude: number;
  speed?: number;
  updatedAt?: string;
}

export function useBusTracking(busId: string | number | undefined) {
  const [location, setLocation] = useState<BusLocationData | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

  useEffect(() => {
    // Connection state handlers
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    // Fallback sync initial state
    setIsConnected(socket.connected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  useEffect(() => {
    if (!busId) return;

    // 1. Subscribe to the specific bus room
    socket.emit("bus:subscribe", { busId: String(busId) });

    // 2. Listen for location updates
    const onLocationUpdate = (data: BusLocationData) => {
      if (String(data.busId) === String(busId)) {
        setLocation(data);
      }
    };

    socket.on("bus:location:broadcast", onLocationUpdate);

    return () => {
      // Cleanup listener when the component unmounts or busId changes
      socket.off("bus:location:broadcast", onLocationUpdate);
    };
  }, [busId]);

  // 3. Update state with new coordinates (returned here)
  return { location, isConnected };
}
