/**
 * NAKKO Platform - Unit Test: Google Maps & Geospatial Adapter
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { GoogleMapsAdapter } from '../../src/integrations/maps/googleMapsAdapter.js';
import { NotificationAdapter } from '../../src/integrations/notifications/notificationAdapter.js';
import { GeoService } from '../../src/core/matching/geoService.js';

describe('Google Maps Adapter & Geospatial Unit Tests', () => {
  const origin = [77.3910, 28.5355]; // Noida Sector Center
  const destination = [77.3200, 28.5700]; // Sector 18

  test('getDistanceAndDuration should calculate accurate transit distance and ETA', async () => {
    const result = await GoogleMapsAdapter.getDistanceAndDuration(origin, destination);
    assert.ok(result.distanceKm > 0, 'Distance should be greater than 0');
    assert.ok(result.durationMinutes >= 8, 'Duration should reflect urban travel buffer');
    assert.ok(result.source, 'Source provider should be reported');
  });

  test('getBatchDistances should calculate distances for multiple worker candidates', async () => {
    const destinations = [
      [77.3200, 28.5700], // Worker 1
      [77.3600, 28.6200], // Worker 2
      [77.3300, 28.5800]  // Worker 3
    ];

    const results = await GoogleMapsAdapter.getBatchDistances(origin, destinations);
    assert.equal(results.length, 3);
    for (const r of results) {
      assert.ok(r.distanceKm > 0);
      assert.ok(r.durationMinutes >= 8);
    }
  });

  test('geocodeAddress should resolve known NCR address into precise coordinates', async () => {
    const res = await GoogleMapsAdapter.geocodeAddress('Sector 62, Noida');
    assert.ok(res.coordinates, 'Coordinates should be returned');
    assert.equal(res.coordinates[0], 77.3600);
    assert.equal(res.coordinates[1], 28.6200);
    assert.ok(res.formattedAddress.includes('Sector 62'));
  });

  test('geocodeAddress should gracefully handle unknown address without crashing', async () => {
    const res = await GoogleMapsAdapter.geocodeAddress('Some Random Unknown Street 999');
    assert.ok(res.coordinates, 'Fallback coordinates should be returned');
    assert.ok(Array.isArray(res.coordinates));
    assert.equal(res.coordinates.length, 2);
  });

  test('reverseGeocode should return human-readable street address', async () => {
    const res = await GoogleMapsAdapter.reverseGeocode(77.3600, 28.6200);
    assert.ok(res.formattedAddress);
    assert.ok(res.formattedAddress.includes('Sector 62'));
  });

  test('getRoute should generate waypoints and turn steps between coordinates', async () => {
    const route = await GoogleMapsAdapter.getRoute(origin, destination);
    assert.ok(route.distanceKm > 0);
    assert.ok(route.durationMinutes > 0);
    assert.ok(Array.isArray(route.waypoints), 'Waypoints should be an array');
    assert.ok(route.waypoints.length >= 2, 'Should have start and end waypoints');
    assert.ok(Array.isArray(route.steps), 'Route turn steps should be provided');
  });

  test('GeoService should calculateCandidateDistances using adapter batch processing', async () => {
    const candidates = [
      { id: 'w-1', name: 'Candidate 1', location: { coordinates: [77.3200, 28.5700] } },
      { id: 'w-2', name: 'Candidate 2', location: { coordinates: [77.3600, 28.6200] } }
    ];

    const enriched = await GeoService.calculateCandidateDistances(origin, candidates);
    assert.equal(enriched.length, 2);
    assert.ok(enriched[0].distanceKm > 0);
    assert.ok(enriched[0].etaMinutes > 0);
    assert.ok(enriched[1].distanceKm > 0);
    assert.ok(enriched[1].etaMinutes > 0);
  });

  test('NotificationAdapter should dispatch booking and worker alerts', async () => {
    const clientAlert = await NotificationAdapter.sendBookingConfirmation({
      bookingId: 'NK-9999',
      clientPhone: '+91 98765 43210',
      workerName: 'Ramesh Kumar',
      service: 'Plumbing',
      scheduledTime: 'Today, 3:00 PM'
    });
    assert.ok(clientAlert.success);
    assert.ok(clientAlert.messageId);

    const workerAlert = await NotificationAdapter.sendWorkerAssignment({
      bookingId: 'NK-9999',
      workerPhone: '+91 91234 56789',
      clientName: 'Aarav Mehta',
      clientAddress: 'Sector 62, Noida',
      service: 'Plumbing'
    });
    assert.ok(workerAlert.success);
  });
});

