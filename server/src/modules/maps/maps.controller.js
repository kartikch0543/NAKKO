/**
 * NAKKO Platform - Maps & Geospatial REST Controller
 * 
 * Exposes endpoints for:
 * - Geocoding & Reverse Geocoding
 * - Distance Matrix & Travel Duration
 * - Route Geometry & Waypoints
 * - Live Worker Tracking Telemetry
 */

import { GoogleMapsAdapter } from '../../integrations/maps/googleMapsAdapter.js';
import { ServiceRequestService } from '../serviceRequests/serviceRequest.service.js';
import { WorkerService } from '../workers/worker.service.js';
import { env } from '../../config/environment.js';
import { ValidationError } from '../../shared/errors/AppError.js';

/**
 * Returns platform map configuration and provider status
 */
export async function getMapConfig(req, res) {
  res.status(200).json({
    success: true,
    data: {
      isGoogleMapsConfigured: Boolean(env.MAPS.API_KEY),
      provider: env.MAPS.API_KEY ? 'GOOGLE_MAPS' : 'OPENSTREETMAP_NOMINATIM',
      defaultCenter: {
        lng: 77.3910,
        lat: 28.5355,
        region: 'Noida, National Capital Region (NCR)'
      },
      searchRadiusKm: env.MATCHING.MAX_SEARCH_RADIUS_KM
    }
  });
}

/**
 * Geocodes an address string to coordinates
 * GET /api/maps/geocode?address=Sector+62+Noida
 */
export async function geocode(req, res, next) {
  try {
    const { address } = req.query;
    if (!address) {
      throw new ValidationError("Query parameter 'address' is required.");
    }

    const result = await GoogleMapsAdapter.geocodeAddress(address);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Reverse geocodes coordinates to a street address
 * GET /api/maps/reverse-geocode?lat=28.5800&lng=77.3300
 */
export async function reverseGeocode(req, res, next) {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (isNaN(lat) || isNaN(lng)) {
      throw new ValidationError("Valid numeric 'lat' and 'lng' query parameters are required.");
    }

    const result = await GoogleMapsAdapter.reverseGeocode(lng, lat);
    res.status(200).json({
      success: true,
      data: {
        lat,
        lng,
        ...result
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Computes distance and duration matrix from origin to one or more destinations
 * POST /api/maps/distance-matrix
 * Body: { origin: [lng, lat], destinations: [[lng, lat], ...] }
 */
export async function getDistanceMatrix(req, res, next) {
  try {
    const { origin, destinations } = req.body;
    if (!Array.isArray(origin) || origin.length !== 2) {
      throw new ValidationError("Body 'origin' must be an array of [lng, lat].");
    }
    if (!Array.isArray(destinations) || destinations.length === 0) {
      throw new ValidationError("Body 'destinations' must be a non-empty array of [lng, lat] pairs.");
    }

    const results = await GoogleMapsAdapter.getBatchDistances(origin, destinations);
    res.status(200).json({
      success: true,
      data: {
        origin,
        destinationsCount: destinations.length,
        results
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Computes driving directions and intermediate waypoints
 * GET /api/maps/route?originLng=77.33&originLat=28.58&destLng=77.39&destLat=28.53
 */
export async function getRoute(req, res, next) {
  try {
    const oLng = parseFloat(req.query.originLng || req.query.oLng);
    const oLat = parseFloat(req.query.originLat || req.query.oLat);
    const dLng = parseFloat(req.query.destLng || req.query.dLng);
    const dLat = parseFloat(req.query.destLat || req.query.dLat);

    if (isNaN(oLng) || isNaN(oLat) || isNaN(dLng) || isNaN(dLat)) {
      throw new ValidationError('Valid numeric originLng, originLat, destLng, destLat are required.');
    }

    const route = await GoogleMapsAdapter.getRoute([oLng, oLat], [dLng, dLat]);
    res.status(200).json({
      success: true,
      data: route
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves live worker tracking telemetry for a specific booking
 * GET /api/maps/tracking/:bookingId
 */
export async function getBookingTracking(req, res, next) {
  try {
    const { bookingId } = req.params;
    const booking = await ServiceRequestService.getServiceRequestById(bookingId);

    const clientCoords = booking.clientCoordinates || booking.coordinates || [77.3910, 28.5355];
    let workerCoords = booking.workerCoordinates;

    // Refresh worker coordinates if assigned
    if (booking.workerId && !workerCoords) {
      try {
        const worker = await WorkerService.getWorkerById(booking.workerId);
        if (worker && worker.location && worker.location.coordinates) {
          workerCoords = worker.location.coordinates;
        }
      } catch (e) {}
    }
    workerCoords = workerCoords || [77.3300, 28.5800];

    const route = await GoogleMapsAdapter.getRoute(workerCoords, clientCoords);

    res.status(200).json({
      success: true,
      data: {
        bookingId: booking.id,
        service: booking.service,
        status: booking.status,
        worker: {
          id: booking.workerId,
          name: booking.workerName || 'Assigned Worker',
          phone: booking.workerPhone,
          currentLocation: {
            lng: workerCoords[0],
            lat: workerCoords[1]
          }
        },
        client: {
          name: booking.clientName,
          address: booking.clientAddress,
          destinationLocation: {
            lng: clientCoords[0],
            lat: clientCoords[1]
          }
        },
        etaMinutes: route.durationMinutes,
        distanceKm: route.distanceKm,
        routeSummary: route.summary,
        waypoints: route.waypoints,
        steps: route.steps,
        source: route.source,
        trackingSteps: booking.trackingSteps,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (err) {
    next(err);
  }
}

