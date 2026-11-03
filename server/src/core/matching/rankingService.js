/**
 * NAKKO Platform - Dynamic Search Space Reduction: Stage 3 (Multi-Factor Fairness Ranking)
 * 
 * Ranks shortlisted candidates using a weighted fairness function that balances
 * physical proximity with cooperative workload equalization.
 */

import { env } from '../../config/environment.js';

export class RankingService {
  /**
   * Computes the fairness score for a single candidate
   * @param {Object} candidate Candidate with distanceKm, rating, recentJobsLast7Days
   * @param {Object} weights Configurable weight parameters
   * @returns {Object} Score breakdown and composite score
   */
  static calculateCandidateScore(candidate, weights = env.MATCHING) {
    const {
      WEIGHT_PROXIMITY = 0.40,
      WEIGHT_WORKLOAD = 0.30,
      WEIGHT_RATING = 0.15,
      WEIGHT_COOPERATIVE = 0.15,
      MAX_SEARCH_RADIUS_KM = 15
    } = weights;

    // 1. Proximity Score (0.0 to 1.0): 1.0 at 0km, decays to 0.0 at MAX_SEARCH_RADIUS_KM
    const distance = Math.min(candidate.distanceKm || 2.0, MAX_SEARCH_RADIUS_KM);
    const proximityScore = Math.max(0.0, 1.0 - (distance / MAX_SEARCH_RADIUS_KM));

    // 2. Workload Equalization Score (0.0 to 1.0):
    // Workers with fewer jobs recently receive higher priority to distribute opportunities fairly
    const recentJobs = candidate.recentJobsLast7Days !== undefined ? candidate.recentJobsLast7Days : 2;
    const maxReferenceWeeklyJobs = 8;
    const workloadScore = Math.max(0.1, 1.0 - Math.min(recentJobs / maxReferenceWeeklyJobs, 0.9));

    // 3. Rating Score (0.0 to 1.0)
    const rating = candidate.rating || 4.5;
    const ratingScore = Math.min(1.0, Math.max(0.2, (rating - 1.0) / 4.0));

    // 4. Cooperative Alignment Score (0.0 to 1.0)
    // Verified cooperative members receive full score
    const isCoopMember = Boolean(candidate.cooperativeId);
    const cooperativeScore = isCoopMember ? 1.0 : 0.4;

    // Composite Fairness Score
    const totalScore = (
      WEIGHT_PROXIMITY * proximityScore +
      WEIGHT_WORKLOAD * workloadScore +
      WEIGHT_RATING * ratingScore +
      WEIGHT_COOPERATIVE * cooperativeScore
    );

    return {
      totalScore: parseFloat(totalScore.toFixed(4)),
      breakdown: {
        proximity: parseFloat(proximityScore.toFixed(2)),
        workloadEqualization: parseFloat(workloadScore.toFixed(2)),
        rating: parseFloat(ratingScore.toFixed(2)),
        cooperative: parseFloat(cooperativeScore.toFixed(2))
      }
    };
  }

  /**
   * Evaluates and sorts candidate list by composite fairness score descending
   */
  static rankCandidates(candidates, customWeights = null) {
    const weights = customWeights || env.MATCHING;

    const scored = candidates.map(candidate => {
      const { totalScore, breakdown } = this.calculateCandidateScore(candidate, weights);
      return {
        ...candidate,
        matchScore: totalScore,
        scoreBreakdown: breakdown
      };
    });

    // Sort highest score first
    return scored.sort((a, b) => b.matchScore - a.matchScore);
  }
}

