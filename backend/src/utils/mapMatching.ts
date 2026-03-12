import axios from "axios";

const OSRM_BASE = `${process.env.OSRM_SERVER_URL ?? "https://router.project-osrm.org"}/nearest/v1/driving`;

const EARTH_RADIUS_M = 6_371_000; // metres

/**
 * Calculates the great-circle distance between two GPS points using the
 * Haversine formula. Returns distance in metres.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface SnappedCoords {
  latitude: number;
  longitude: number;
  snapped: boolean;
}

/**
 * Snaps a raw GPS coordinate to the nearest road using the public OSRM nearest API.
 * Falls back to the original coordinates if the request fails.
 */
export async function snapToRoad(
  latitude: number,
  longitude: number
): Promise<SnappedCoords> {
  try {
    // OSRM expects coordinates as lon,lat
    const url = `${OSRM_BASE}/${longitude},${latitude}`;

    const response = await axios.get(url, { timeout: 2000 });

    const waypoint = response.data?.waypoints?.[0];
    if (!waypoint || !waypoint.location) {
      return { latitude, longitude, snapped: false };
    }

    // OSRM returns location as [longitude, latitude]
    const [snappedLng, snappedLat] = waypoint.location;

    return {
      latitude: snappedLat,
      longitude: snappedLng,
      snapped: true,
    };
  } catch (err) {
    // Log but do not throw — tracking must not break if OSRM is unavailable
    console.error(`[snapToRoad] OSRM request failed (lat=${latitude}, lng=${longitude}):`, (err as Error).message);
    return { latitude, longitude, snapped: false };
  }
}
