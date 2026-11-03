/**
 * NAKKO Platform - Dynamic Search Space Reduction: Stage 1 (Candidate Filtering)
 * 
 * Filters raw worker population into an indexed shortlist using availability metrics,
 * skill index matching, and coarse bounding-box geospatial constraints.
 * 
 * This prevents expensive matrix distance calculations on large worker pools.
 */

import { WorkerService } from '../../modules/workers/worker.service.js';
import { calculateAvailabilityScore } from './availability/availabilityCalculator.js';

export class CandidateFilter {
  /**
   * Pre-filters worker population down to eligible candidates
   * @param {Object} criteria { service, coordinates: [lng, lat], maxRadiusKm, limit }
   * @returns {Promise<Array>} Filtered candidates with availability metrics
   */
  static async filterEligibleCandidates({ service, coordinates, maxRadiusKm = 15, limit = 10 }) {
    // 1. Fetch workers matching service category with available status
    const allWorkers = await WorkerService.getWorkers({
      skill: service,
      availableOnly: true
    });

    const shortlisted = [];
    const [clientLng, clientLat] = coordinates || [77.3910, 28.5355];

    // Approximate bounding box filter (1 deg lat ~= 111km, 1 deg lng ~= 111km * cos(lat))
    const latDelta = maxRadiusKm / 111.0;
    const lngDelta = maxRadiusKm / (111.0 * Math.cos((clientLat * Math.PI) / 180));

    for (const worker of allWorkers) {
      // Must be available and KYC verified
      if (!worker.isAvailable || worker.kycStatus !== 'verified') {
        continue;
      }

      // Check coordinates bounding box
      const workerCoords = worker.location && worker.location.coordinates 
        ? worker.location.coordinates 
        : [77.3300, 28.5800];
      const [wLng, wLat] = workerCoords;

      if (
        wLat >= clientLat - latDelta &&
        wLat <= clientLat + latDelta &&
        wLng >= clientLng - lngDelta &&
        wLng <= clientLng + lngDelta
      ) {
        const availabilityMetric = calculateAvailabilityScore(worker);
        if (availabilityMetric > 0) {
          shortlisted.push({
            ...worker,
            availabilityMetric
          });
        }
      }
    }

    // Sort by availability metric descending and cap at candidate limit
    shortlisted.sort((a, b) => b.availabilityMetric - a.availabilityMetric);
    return shortlisted.slice(0, limit);
  }
}

