/**
 * NAKKO Platform - Dynamic Search Space Reduction: Stage 2 (Geospatial Service)
 * 
 * Performs high-precision route calculations ONLY on candidates that successfully
 * passed the Stage 1 Candidate Filter.
 */

import { env } from '../../config/environment.js';

// Internal distance matrix cache: 'originLng,lat:destLng,lat' -> { distanceKm, durationMinutes }
const distanceCache = new Map();

export class GeoService {
  /**
   * Great-circle Haversine formula for exact distance
   */
  static calculateHaversineDistance(lat1, lon1, lat2, lon2) {
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
   * Estimates urban travel time assuming realistic traffic speeds
   */
  static estimateDurationMinutes(distanceKm) {
    const avgUrbanSpeedKmh = 18; // 18 km/h average Indian metro urban transit speed
    const transitHours = distanceKm / avgUrbanSpeedKmh;
    const prepMinutes = 4; // Dispatch + gear check buffer
    return Math.max(8, Math.round(transitHours * 60 + prepMinutes));
  }

  /**
   * Calculates route metrics for shortlisted candidates
   * @param {Array} originCoords [lng, lat] of client
   * @param {Array} candidates List of Stage-1 filtered candidates
   * @returns {Promise<Array>} Candidates enriched with distanceKm and etaMinutes
   */
  static async calculateCandidateDistances(originCoords, candidates) {
    const [cLng, cLat] = originCoords || [77.3910, 28.5355];

    return candidates.map(candidate => {
      const coords = candidate.location && candidate.location.coordinates
        ? candidate.location.coordinates
        : [77.3300, 28.5800];
      const [wLng, wLat] = coords;

      const cacheKey = `${cLng.toFixed(4)},${cLat.toFixed(4)}:${wLng.toFixed(4)},${wLat.toFixed(4)}`;
      let route = distanceCache.get(cacheKey);

      if (!route) {
        const distanceKm = candidate.distanceKm || this.calculateHaversineDistance(cLat, cLng, wLat, wLng);
        const etaMinutes = candidate.etaMinutes || this.estimateDurationMinutes(distanceKm);
        route = { distanceKm, etaMinutes };
        distanceCache.set(cacheKey, route);
      }

      return {
        ...candidate,
        distanceKm: route.distanceKm,
        etaMinutes: route.etaMinutes
      };
    });
  }
}

