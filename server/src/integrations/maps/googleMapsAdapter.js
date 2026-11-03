/**
 * NAKKO Platform - Google Maps Distance Matrix Adapter
 * Fetches driving matrix distances or gracefully falls back to internal Haversine calculation
 */

import { env } from '../../config/environment.js';
import { GeoService } from '../../core/matching/geoService.js';

export class GoogleMapsAdapter {
  static async getDistanceAndDuration(originCoords, destCoords) {
    const [oLng, oLat] = originCoords;
    const [dLng, dLat] = destCoords;

    // If Google Maps API Key is provided, call Distance Matrix API
    if (env.MAPS.API_KEY) {
      try {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${oLat},${oLng}&destinations=${dLat},${dLng}&key=${env.MAPS.API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
          const element = data.rows[0].elements[0];
          return {
            distanceKm: parseFloat((element.distance.value / 1000).toFixed(2)),
            durationMinutes: Math.round(element.duration.value / 60),
            source: 'GOOGLE_MAPS_API'
          };
        }
      } catch (err) {
        console.warn('[GoogleMapsAdapter] API call failed, using internal geo calculation:', err.message);
      }
    }

    // High performance internal calculation
    const distanceKm = GeoService.calculateHaversineDistance(oLat, oLng, dLat, dLng);
    const durationMinutes = GeoService.estimateDurationMinutes(distanceKm);

    return {
      distanceKm,
      durationMinutes,
      source: 'INTERNAL_HAVERSINE_ESTIMATOR'
    };
  }
}

