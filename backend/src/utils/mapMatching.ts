import axios from "axios";

const OSRM_BASE = "https://router.project-osrm.org/nearest/v1/driving";

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

    const response = await axios.get(url, { timeout: 5000 });

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
  } catch {
    // Fall back to original coordinates on any network/parse error
    return { latitude, longitude, snapped: false };
  }
}
