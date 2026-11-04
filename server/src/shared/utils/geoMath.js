/**
 * NAKKO Platform - Geospatial Mathematical Utilities
 * 
 * Provides Haversine distance calculations, urban transit speed estimations,
 * coordinate bearing, and route waypoint interpolation.
 */

/**
 * Calculates the great-circle Haversine distance between two coordinates in kilometers.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers (rounded to 2 decimal places)
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Estimates urban travel duration assuming realistic traffic speeds in Indian metro areas.
 * @param {number} distanceKm Distance in kilometers
 * @param {number} avgSpeedKmh Average transit speed in km/h (default: 18 km/h)
 * @param {number} prepMinutes Buffer for dispatch and gear preparation (default: 4 minutes)
 * @returns {number} Estimated duration in minutes (minimum 8 minutes)
 */
export function estimateDurationMinutes(distanceKm, avgSpeedKmh = 18, prepMinutes = 4) {
  const transitHours = distanceKm / avgSpeedKmh;
  return Math.max(8, Math.round(transitHours * 60 + prepMinutes));
}

/**
 * Generates intermediate route waypoints between origin and destination coordinates.
 * Simulates road bends and turns for realistic route rendering and live vehicle tracking.
 * @param {Array<number>} origin [lng, lat]
 * @param {Array<number>} destination [lng, lat]
 * @param {number} steps Number of intermediate points
 * @returns {Array<Array<number>>} Array of [lng, lat] coordinate pairs along the route
 */
export function interpolateRouteWaypoints(origin, destination, steps = 10) {
  const [oLng, oLat] = origin;
  const [dLng, dLat] = destination;
  const waypoints = [];

  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    // Base linear interpolation
    let lng = oLng + (dLng - oLng) * fraction;
    let lat = oLat + (dLat - oLat) * fraction;

    // Add gentle sinusoidal deviation to simulate realistic urban street curves
    if (i > 0 && i < steps) {
      const curveFactor = Math.sin(fraction * Math.PI) * 0.003;
      lng += curveFactor * (i % 2 === 0 ? 1 : -0.7);
      lat += curveFactor * (i % 2 === 0 ? -0.6 : 0.8);
    }

    waypoints.push([parseFloat(lng.toFixed(5)), parseFloat(lat.toFixed(5))]);
  }

  return waypoints;
}

