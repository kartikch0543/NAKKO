/**
 * NAKKO Platform - Google Maps & Geospatial Adapter
 * 
 * Provides production-grade integration for:
 * 1. Google Maps Distance Matrix API (single & batch)
 * 2. Google Maps Geocoding & Reverse Geocoding API
 * 3. Google Maps Directions API (route geometry & waypoints)
 * 
 * Resilient Architecture:
 * Automatically falls back to OpenStreetMap Nominatim and high-precision
 * internal Haversine / Geodesic algorithms when API keys are absent,
 * network is disconnected, or rate limits are encountered.
 */

import { env } from '../../config/environment.js';
import {
  calculateHaversineDistance,
  estimateDurationMinutes,
  interpolateRouteWaypoints
} from '../../shared/utils/geoMath.js';

// In-memory cache for geocoded addresses and route calculations
const geocodeCache = new Map();
const routeCache = new Map();

// Local pre-indexed coordinate database for Delhi-NCR metro regions (instant offline fallback)
const KNOWN_NCR_LOCATIONS = [
  { match: /sector\s*62/i, lng: 77.3600, lat: 28.6200, formatted: 'Sector 62, Noida, Uttar Pradesh, India' },
  { match: /sector\s*18/i, lng: 77.3200, lat: 28.5700, formatted: 'Sector 18, Noida, Uttar Pradesh, India' },
  { match: /sector\s*12/i, lng: 77.3300, lat: 28.5800, formatted: 'Sector 12, Noida, Uttar Pradesh, India' },
  { match: /sector\s*15/i, lng: 77.3100, lat: 28.5800, formatted: 'Sector 15, Noida, Uttar Pradesh, India' },
  { match: /sector\s*128/i, lng: 77.3750, lat: 28.5150, formatted: 'Sector 128, Noida, Uttar Pradesh, India' },
  { match: /indirapuram/i, lng: 77.3700, lat: 28.6400, formatted: 'Indirapuram, Ghaziabad, Uttar Pradesh, India' },
  { match: /connaught\s*place/i, lng: 77.2167, lat: 28.6315, formatted: 'Connaught Place, New Delhi, Delhi, India' },
  { match: /karol\s*bagh/i, lng: 77.1906, lat: 28.6514, formatted: 'Karol Bagh, New Delhi, Delhi, India' },
  { match: /saket/i, lng: 77.2100, lat: 28.5200, formatted: 'Saket, New Delhi, Delhi, India' },
  { match: /cyber\s*city|gurgaon|gurugram/i, lng: 77.0878, lat: 28.4952, formatted: 'DLF Cyber City, Gurugram, Haryana, India' },
  { match: /lajpat\s*nagar/i, lng: 77.2400, lat: 28.5700, formatted: 'Lajpat Nagar, New Delhi, Delhi, India' }
];

export class GoogleMapsAdapter {
  /**
   * Calculates driving distance and transit duration between two coordinates.
   * @param {Array<number>} originCoords [lng, lat]
   * @param {Array<number>} destCoords [lng, lat]
   * @returns {Promise<{ distanceKm: number, durationMinutes: number, source: string }>}
   */
  static async getDistanceAndDuration(originCoords, destCoords) {
    const [oLng, oLat] = originCoords;
    const [dLng, dLat] = destCoords;

    // Check Google Maps Distance Matrix API if key is present
    if (env.MAPS.API_KEY) {
      try {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${oLat},${oLng}&destinations=${dLat},${dLng}&key=${env.MAPS.API_KEY}&mode=driving`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && data.rows && data.rows[0] && data.rows[0].elements[0].status === 'OK') {
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

    // High performance internal calculation fallback
    const distanceKm = calculateHaversineDistance(oLat, oLng, dLat, dLng);
    const durationMinutes = estimateDurationMinutes(distanceKm);

    return {
      distanceKm,
      durationMinutes,
      source: 'INTERNAL_HAVERSINE_ESTIMATOR'
    };
  }

  /**
   * Calculates batch driving distances from a single origin to multiple destination coordinates.
   * Used in Stage 2 of Dynamic Search Space Reduction.
   * @param {Array<number>} originCoords [lng, lat]
   * @param {Array<Array<number>>} destinationsList Array of [lng, lat]
   * @returns {Promise<Array<{ distanceKm: number, durationMinutes: number, source: string }>>}
   */
  static async getBatchDistances(originCoords, destinationsList) {
    if (!destinationsList || destinationsList.length === 0) return [];
    const [oLng, oLat] = originCoords;

    // Call Google Maps batch distance matrix if API key configured
    if (env.MAPS.API_KEY && destinationsList.length > 0) {
      try {
        const destString = destinationsList.map(([dLng, dLat]) => `${dLat},${dLng}`).join('|');
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${oLat},${oLng}&destinations=${destString}&key=${env.MAPS.API_KEY}&mode=driving`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && data.rows && data.rows[0] && data.rows[0].elements) {
          return data.rows[0].elements.map((el, i) => {
            if (el.status === 'OK') {
              return {
                distanceKm: parseFloat((el.distance.value / 1000).toFixed(2)),
                durationMinutes: Math.round(el.duration.value / 60),
                source: 'GOOGLE_MAPS_API'
              };
            }
            const [dLng, dLat] = destinationsList[i];
            const dist = calculateHaversineDistance(oLat, oLng, dLat, dLng);
            return {
              distanceKm: dist,
              durationMinutes: estimateDurationMinutes(dist),
              source: 'INTERNAL_HAVERSINE_ESTIMATOR'
            };
          });
        }
      } catch (err) {
        console.warn('[GoogleMapsAdapter] Batch API call failed, using internal calculation:', err.message);
      }
    }

    // Internal fallback for all destinations
    return destinationsList.map(([dLng, dLat]) => {
      const dist = calculateHaversineDistance(oLat, oLng, dLat, dLng);
      return {
        distanceKm: dist,
        durationMinutes: estimateDurationMinutes(dist),
        source: 'INTERNAL_HAVERSINE_ESTIMATOR'
      };
    });
  }

  /**
   * Geocodes an address string into [longitude, latitude] coordinates.
   * @param {string} address Human-readable address
   * @returns {Promise<{ lat: number, lng: number, coordinates: [number, number], formattedAddress: string, source: string }>}
   */
  static async geocodeAddress(address) {
    if (!address || typeof address !== 'string') {
      const defaultCoords = [77.3910, 28.5355];
      return {
        lat: defaultCoords[1],
        lng: defaultCoords[0],
        coordinates: defaultCoords,
        formattedAddress: 'NAKKO Center, Noida, Uttar Pradesh, India',
        source: 'DEFAULT_FALLBACK'
      };
    }

    const cleanAddress = address.trim();
    const cacheKey = cleanAddress.toLowerCase();
    if (geocodeCache.has(cacheKey)) {
      return geocodeCache.get(cacheKey);
    }

    // 1. Check local instant NCR locations database
    for (const loc of KNOWN_NCR_LOCATIONS) {
      if (loc.match.test(cleanAddress)) {
        const result = {
          lat: loc.lat,
          lng: loc.lng,
          coordinates: [loc.lng, loc.lat],
          formattedAddress: loc.formatted,
          source: 'LOCAL_GEO_INDEX'
        };
        geocodeCache.set(cacheKey, result);
        return result;
      }
    }

    // 2. Google Maps Geocoding API if key provided
    if (env.MAPS.API_KEY) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanAddress)}&key=${env.MAPS.API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const loc = data.results[0].geometry.location;
          const result = {
            lat: parseFloat(loc.lat.toFixed(6)),
            lng: parseFloat(loc.lng.toFixed(6)),
            coordinates: [parseFloat(loc.lng.toFixed(6)), parseFloat(loc.lat.toFixed(6))],
            formattedAddress: data.results[0].formatted_address,
            source: 'GOOGLE_MAPS_GEOCODE'
          };
          geocodeCache.set(cacheKey, result);
          return result;
        }
      } catch (err) {
        console.warn('[GoogleMapsAdapter] Google Geocoding API failed:', err.message);
      }
    }

    // 3. OpenStreetMap Nominatim API (Open Web Service)
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanAddress)}&format=json&limit=1`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'NAKKO-Cooperative-Platform/1.0' },
        signal: AbortSignal.timeout(2500)
      });

      if (res.ok) {
        const list = await res.json();
        if (Array.isArray(list) && list.length > 0) {
          const lat = parseFloat(parseFloat(list[0].lat).toFixed(6));
          const lng = parseFloat(parseFloat(list[0].lon).toFixed(6));
          const result = {
            lat,
            lng,
            coordinates: [lng, lat],
            formattedAddress: list[0].display_name,
            source: 'OPENSTREETMAP_NOMINATIM'
          };
          geocodeCache.set(cacheKey, result);
          return result;
        }
      }
    } catch (e) {
      // Nominatim timeout or offline; continue to deterministic fallback
    }

    // 4. Deterministic fallback centered on Noida / NCR with hash-based coordinate variance
    let hash = 0;
    for (let i = 0; i < cleanAddress.length; i++) {
      hash = (hash << 5) - hash + cleanAddress.charCodeAt(i);
      hash |= 0;
    }
    const latOffset = ((Math.abs(hash) % 100) - 50) * 0.001;
    const lngOffset = ((Math.abs(hash >> 2) % 100) - 50) * 0.001;
    const fallbackLat = parseFloat((28.5355 + latOffset).toFixed(5));
    const fallbackLng = parseFloat((77.3910 + lngOffset).toFixed(5));

    const fallbackResult = {
      lat: fallbackLat,
      lng: fallbackLng,
      coordinates: [fallbackLng, fallbackLat],
      formattedAddress: `${cleanAddress}, NCR, India`,
      source: 'SYNTHETIC_GEO_ESTIMATOR'
    };
    geocodeCache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }

  /**
   * Reverse geocodes [longitude, latitude] into a human-readable street address.
   * @param {number} lng Longitude
   * @param {number} lat Latitude
   * @returns {Promise<{ formattedAddress: string, source: string }>}
   */
  static async reverseGeocode(lng, lat) {
    if (env.MAPS.API_KEY) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${env.MAPS.API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          return {
            formattedAddress: data.results[0].formatted_address,
            source: 'GOOGLE_MAPS_REVERSE'
          };
        }
      } catch (err) {
        console.warn('[GoogleMapsAdapter] Reverse geocoding failed:', err.message);
      }
    }

    // Reverse lookup against known local locations
    for (const loc of KNOWN_NCR_LOCATIONS) {
      const dist = calculateHaversineDistance(lat, lng, loc.lat, loc.lng);
      if (dist < 1.5) {
        return {
          formattedAddress: loc.formatted,
          source: 'LOCAL_GEO_INDEX'
        };
      }
    }

    return {
      formattedAddress: `Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (Noida Sector, NCR)`,
      source: 'SYNTHETIC_REVERSE_ESTIMATOR'
    };
  }

  /**
   * Generates driving directions, route waypoints, and ETA between origin and destination.
   * Powers live vehicle tracking visualization on the user dashboard.
   * @param {Array<number>} originCoords [lng, lat]
   * @param {Array<number>} destCoords [lng, lat]
   * @returns {Promise<Object>} Route payload including waypoints, polyline, distance, and duration
   */
  static async getRoute(originCoords, destCoords) {
    const [oLng, oLat] = originCoords;
    const [dLng, dLat] = destCoords;
    const cacheKey = `${oLng.toFixed(4)},${oLat.toFixed(4)}->${dLng.toFixed(4)},${dLat.toFixed(4)}`;

    if (routeCache.has(cacheKey)) {
      return routeCache.get(cacheKey);
    }

    // 1. Google Directions API if key configured
    if (env.MAPS.API_KEY) {
      try {
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${oLat},${oLng}&destination=${dLat},${dLng}&key=${env.MAPS.API_KEY}&mode=driving`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const leg = route.legs[0];
          const distanceKm = parseFloat((leg.distance.value / 1000).toFixed(2));
          const durationMinutes = Math.round(leg.duration.value / 60);

          const waypoints = leg.steps.map(s => [s.end_location.lng, s.end_location.lat]);
          waypoints.unshift([oLng, oLat]);

          const result = {
            distanceKm,
            durationMinutes,
            summary: route.summary || 'Fastest driving route via main arterial roads',
            polyline: route.overview_polyline.points,
            waypoints,
            steps: leg.steps.map(s => ({
              instruction: s.html_instructions ? s.html_instructions.replace(/<[^>]+>/g, '') : 'Drive forward',
              distance: s.distance.text,
              duration: s.duration.text
            })),
            source: 'GOOGLE_DIRECTIONS_API'
          };
          routeCache.set(cacheKey, result);
          return result;
        }
      } catch (err) {
        console.warn('[GoogleMapsAdapter] Google Directions API failed:', err.message);
      }
    }

    // 2. High performance geodesic route interpolation fallback
    const distanceKm = calculateHaversineDistance(oLat, oLng, dLat, dLng);
    const durationMinutes = estimateDurationMinutes(distanceKm);
    const waypoints = interpolateRouteWaypoints(originCoords, destCoords, 10);

    const steps = [
      { instruction: 'Depart worker cooperative hub', distance: `${(distanceKm * 0.2).toFixed(1)} km`, duration: '3 mins' },
      { instruction: 'Merge onto Metro Sector Arterial Road', distance: `${(distanceKm * 0.5).toFixed(1)} km`, duration: `${Math.round(durationMinutes * 0.5)} mins` },
      { instruction: 'Turn toward destination sector complex', distance: `${(distanceKm * 0.2).toFixed(1)} km`, duration: '3 mins' },
      { instruction: 'Arrive at client service address', distance: `${(distanceKm * 0.1).toFixed(1)} km`, duration: '2 mins' }
    ];

    const result = {
      distanceKm,
      durationMinutes,
      summary: 'Direct urban transit corridor via local sector grid',
      polyline: null,
      waypoints,
      steps,
      source: 'INTERNAL_ROUTE_GENERATOR'
    };

    routeCache.set(cacheKey, result);
    return result;
  }
}
