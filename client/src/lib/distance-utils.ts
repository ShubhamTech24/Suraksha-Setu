// Distance calculation utilities for accurate location-based features

/**
 * Calculate the distance between two points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param distanceKm Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  } else {
    return `${Math.round(distanceKm)} km`;
  }
}

/**
 * Find the nearest location from a list of locations
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param locations Array of locations with lat/lng properties
 * @returns Object with nearest location and distance
 */
export function findNearest(
  userLat: number, 
  userLon: number, 
  locations: Array<{ lat: number; lng: number; [key: string]: any }>
): { location: any; distance: number } | null {
  if (locations.length === 0) return null;
  
  let nearest = locations[0];
  let shortestDistance = calculateDistance(userLat, userLon, nearest.lat, nearest.lng);
  
  for (let i = 1; i < locations.length; i++) {
    const distance = calculateDistance(userLat, userLon, locations[i].lat, locations[i].lng);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearest = locations[i];
    }
  }
  
  return { location: nearest, distance: shortestDistance };
}

// Known coordinates for Line of Control (LOC) reference points
export const LOC_REFERENCE_POINTS = [
  { lat: 34.0837, lng: 74.7973, name: "Kashmir Sector" },
  { lat: 33.7782, lng: 75.3412, name: "Jammu Sector" },
  { lat: 34.5194, lng: 74.3119, name: "Srinagar Sector" },
  { lat: 32.7767, lng: 74.9014, name: "Central Kashmir" }
];

/**
 * Calculate distance to nearest LOC point
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @returns Distance to nearest LOC point in kilometers
 */
export function calculateDistanceToLOC(userLat: number, userLon: number): number {
  const nearest = findNearest(userLat, userLon, LOC_REFERENCE_POINTS);
  return nearest ? nearest.distance : 0;
}

/**
 * Check if user is in a border region (within 50km of LOC)
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @returns True if user is in border region
 */
export function isInBorderRegion(userLat: number, userLon: number): boolean {
  const distanceToLOC = calculateDistanceToLOC(userLat, userLon);
  return distanceToLOC <= 50; // Within 50km of LOC
}