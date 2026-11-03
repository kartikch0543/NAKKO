/**
 * NAKKO Platform - Unit Test: Dynamic Search Space Reduction & Fair Allocation
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CandidateFilter } from '../../src/core/matching/candidateFilter.js';
import { GeoService } from '../../src/core/matching/geoService.js';
import { RankingService } from '../../src/core/matching/rankingService.js';
import { AssignmentEngine } from '../../src/core/matching/assignmentEngine.js';

describe('Matching & Search Space Reduction Tests', () => {
  test('CandidateFilter should prune ineligible/offline workers based on indexed skills', async () => {
    const candidates = await CandidateFilter.filterEligibleCandidates({
      service: 'Plumbing',
      coordinates: [77.3910, 28.5355],
      maxRadiusKm: 15
    });

    assert.ok(candidates.length > 0);
    for (const c of candidates) {
      assert.equal(c.isAvailable, true);
      assert.equal(c.kycStatus, 'verified');
      assert.ok(c.skill.toLowerCase().includes('plumb') || (c.skills && c.skills.some(s => s.toLowerCase().includes('plumb'))));
    }
  });

  test('GeoService should calculate correct Haversine distance', () => {
    // Noida Sector 18 (28.5700, 77.3200) to Sector 62 (28.6200, 77.3600)
    const distanceKm = GeoService.calculateHaversineDistance(28.5700, 77.3200, 28.6200, 77.3600);
    assert.ok(distanceKm > 6 && distanceKm < 9);

    const eta = GeoService.estimateDurationMinutes(distanceKm);
    assert.ok(eta >= 15 && eta <= 40);
  });

  test('Fair Work Allocation should balance workload over pure proximity', () => {
    // Worker A: Very close (0.8 km) but has 8 jobs this week (overloaded)
    const workerA = {
      id: 'w-overloaded',
      name: 'Overloaded Worker',
      distanceKm: 0.8,
      rating: 4.8,
      recentJobsLast7Days: 8,
      cooperativeId: 'coop-1'
    };

    // Worker B: Slightly farther (2.2 km) but has only 1 job this week (underutilized)
    const workerB = {
      id: 'w-underutilized',
      name: 'Underutilized Worker',
      distanceKm: 2.2,
      rating: 4.9,
      recentJobsLast7Days: 1,
      cooperativeId: 'coop-1'
    };

    const scoreA = RankingService.calculateCandidateScore(workerA);
    const scoreB = RankingService.calculateCandidateScore(workerB);

    assert.ok(scoreB.breakdown.workloadEqualization > scoreA.breakdown.workloadEqualization);
    assert.ok(scoreB.totalScore > scoreA.totalScore, 'Fairness engine should prioritize underutilized cooperative worker over overloaded closer worker');
  });

  test('AssignmentEngine should return recommended worker and reduction metrics', async () => {
    const result = await AssignmentEngine.matchWorkerForRequest({
      service: 'Plumbing',
      coordinates: [77.3910, 28.5355]
    });

    assert.ok(result.selectedWorker);
    assert.ok(result.rankedCandidates.length > 0);
    assert.ok(result.executionTimeMs < 50, 'Matching execution should be fast and sub-50ms');
    assert.ok(result.metrics.matchScore > 0);
  });
});

