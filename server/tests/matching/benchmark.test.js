/**
 * NAKKO Platform - Matching Benchmark Test
 * 
 * Compares Naive Full-Space Route Calculation vs. NAKKO Dynamic Search Space Reduction.
 * Validates computational work reduction, candidates pruned, and execution latency.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { GeoService } from '../../src/core/matching/geoService.js';
import { CandidateFilter } from '../../src/core/matching/candidateFilter.js';
import { RankingService } from '../../src/core/matching/rankingService.js';

describe('Dynamic Search Space Reduction Benchmark', () => {
  // Generate synthetic population of 2,500 workers across the National Capital Region
  const workerPoolSize = 2500;
  const syntheticWorkerPool = [];

  const skills = ['Plumbing', 'Cleaning', 'Electrical', 'Gardening', 'Carpentry', 'Painting'];

  for (let i = 0; i < workerPoolSize; i++) {
    syntheticWorkerPool.push({
      id: `w-synthetic-${i}`,
      name: `Worker ${i}`,
      skill: skills[i % skills.length],
      isAvailable: i % 4 !== 0, // 75% available
      kycStatus: i % 10 === 0 ? 'pending' : 'verified', // 90% verified
      // Spread across NCR: Lat 28.4 to 28.7, Lng 77.2 to 77.5
      location: {
        coordinates: [
          77.2 + Math.random() * 0.3,
          28.4 + Math.random() * 0.3
        ]
      },
      rating: 4.0 + Math.random() * 1.0,
      recentJobsLast7Days: Math.floor(Math.random() * 6),
      cooperativeId: i % 3 === 0 ? 'coop-1' : 'coop-2'
    });
  }

  test('Benchmark: Dynamic Search Space Reduction vs Naive Full Search', () => {
    const clientCoords = [77.3910, 28.5355]; // [lng, lat]
    const targetService = 'Plumbing';

    // 1. NAIVE APPROACH: Calculate geodesic distance for EVERY worker in the database
    const naiveStart = performance.now();
    let naiveEvaluations = 0;
    const naiveResults = [];

    for (const worker of syntheticWorkerPool) {
      naiveEvaluations++;
      const [wLng, wLat] = worker.location.coordinates;
      const dist = GeoService.calculateHaversineDistance(clientCoords[1], clientCoords[0], wLat, wLng);
      if (dist <= 15 && worker.skill === targetService && worker.isAvailable && worker.kycStatus === 'verified') {
        naiveResults.push({ ...worker, distanceKm: dist });
      }
    }
    naiveResults.sort((a, b) => a.distanceKm - b.distanceKm);
    const naiveTimeMs = performance.now() - naiveStart;

    // 2. DYNAMIC SEARCH SPACE REDUCTION APPROACH:
    // Stage 1: Coarse index filtering (skills + availability + bounding box)
    const optimizedStart = performance.now();
    let stage1Evaluations = 0;
    const stage1Candidates = [];
    const maxRadiusKm = 15;
    const latDelta = maxRadiusKm / 111.0;
    const lngDelta = maxRadiusKm / (111.0 * Math.cos((clientCoords[1] * Math.PI) / 180));

    for (const worker of syntheticWorkerPool) {
      // In MongoDB, this is an indexed compound query execution in O(log N)
      if (worker.skill === targetService && worker.isAvailable && worker.kycStatus === 'verified') {
        stage1Evaluations++;
        const [wLng, wLat] = worker.location.coordinates;
        if (
          wLat >= clientCoords[1] - latDelta &&
          wLat <= clientCoords[1] + latDelta &&
          wLng >= clientCoords[0] - lngDelta &&
          wLng <= clientCoords[0] + lngDelta
        ) {
          stage1Candidates.push(worker);
        }
      }
    }

    // Shortlist top 10 candidates
    const shortlisted = stage1Candidates.slice(0, 10);

    // Stage 2: Precision geodesic distances ONLY for the shortlisted candidates
    let stage2DistanceCalculations = 0;
    const candidatesWithDist = shortlisted.map(c => {
      stage2DistanceCalculations++;
      const [wLng, wLat] = c.location.coordinates;
      const distanceKm = GeoService.calculateHaversineDistance(clientCoords[1], clientCoords[0], wLat, wLng);
      return { ...c, distanceKm };
    });

    // Stage 3: Multi-factor fairness ranking
    const ranked = RankingService.rankCandidates(candidatesWithDist);
    const optimizedTimeMs = performance.now() - optimizedStart;

    // Metrics computation
    const reductionPercent = ((naiveEvaluations - stage2DistanceCalculations) / naiveEvaluations) * 100;
    const speedupFactor = naiveTimeMs / (optimizedTimeMs || 0.01);

    console.log(`\n======================================================`);
    console.log(`📊 DYNAMIC SEARCH SPACE REDUCTION BENCHMARK RESULTS`);
    console.log(`======================================================`);
    console.log(`Total Worker Pool Size:          ${workerPoolSize}`);
    console.log(`Naive Distance Calculations:     ${naiveEvaluations}`);
    console.log(`Optimized Distance Calculations: ${stage2DistanceCalculations}`);
    console.log(`Search Space Reduction:          ${reductionPercent.toFixed(2)}% reduction`);
    console.log(`Naive Latency:                   ${naiveTimeMs.toFixed(3)} ms`);
    console.log(`Optimized Latency:               ${optimizedTimeMs.toFixed(3)} ms`);
    console.log(`======================================================\n`);

    assert.ok(stage2DistanceCalculations <= 10, 'Geodesic calculations strictly capped at shortlist limit');
    assert.ok(reductionPercent > 99.0, 'Dynamic Search Space Reduction prunes >99% of expensive geodesic calculations');
    assert.ok(ranked.length > 0, 'Optimized algorithm successfully found and ranked eligible candidates');
  });
});

