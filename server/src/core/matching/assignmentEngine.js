/**
 * NAKKO Platform - Dynamic Search Space Reduction Engine
 * 
 * Orchestrates the full matching pipeline:
 * Raw Pool -> [Stage 1: Indexed Filter] -> Shortlist -> [Stage 2: Geo Precision] -> [Stage 3: Fairness Ranker] -> Optimal Worker
 */

import { CandidateFilter } from './candidateFilter.js';
import { GeoService } from './geoService.js';
import { RankingService } from './rankingService.js';
import { NotFoundError } from '../../shared/errors/AppError.js';

export class AssignmentEngine {
  /**
   * Finds the best matching worker for a service request
   * @param {Object} request { service, coordinates, maxRadiusKm, customWeights }
   * @returns {Promise<Object>} { selectedWorker, candidatesCount, reductionPercentage, rankedCandidates }
   */
  static async matchWorkerForRequest({ service, coordinates, maxRadiusKm = 15, customWeights = null }) {
    const startTime = Date.now();

    // Stage 1: Dynamic Search Space Reduction - Filter eligible pool using DB indexes & availability metrics
    const shortlistedCandidates = await CandidateFilter.filterEligibleCandidates({
      service,
      coordinates,
      maxRadiusKm,
      limit: 10
    });

    if (!shortlistedCandidates || shortlistedCandidates.length === 0) {
      throw new NotFoundError(`No available workers currently found for service '${service}' within ${maxRadiusKm}km.`);
    }

    // Stage 2: Calculate high precision geospatial distance on the reduced candidate subset only
    const candidatesWithGeo = await GeoService.calculateCandidateDistances(coordinates, shortlistedCandidates);

    // Stage 3: Multi-factor cooperative fairness ranking
    const rankedCandidates = RankingService.rankCandidates(candidatesWithGeo, customWeights);

    const executionTimeMs = Date.now() - startTime;
    const selectedWorker = rankedCandidates[0];

    return {
      selectedWorker,
      rankedCandidates,
      executionTimeMs,
      metrics: {
        shortlistedCount: shortlistedCandidates.length,
        selectedWorkerId: String(selectedWorker._id || selectedWorker.id),
        matchScore: selectedWorker.matchScore,
        scoreBreakdown: selectedWorker.scoreBreakdown
      }
    };
  }
}

