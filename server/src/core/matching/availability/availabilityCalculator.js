/**
 * NAKKO Platform - Dynamic Availability Metric Calculator
 * Computes live worker availability score based on responsiveness, schedule, and recent activity
 */

export function calculateAvailabilityScore(worker) {
  if (!worker.isAvailable || worker.kycStatus !== 'verified') {
    return 0.0;
  }

  // Base score for online status
  let score = 0.5;

  // Completion rate factor (up to +0.3)
  const completionRate = worker.completionRate || 95;
  score += (completionRate / 100) * 0.3;

  // Recency bonus: if active within the last hour (+0.2)
  if (worker.lastActiveAt) {
    const hoursSinceActive = (Date.now() - new Date(worker.lastActiveAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceActive <= 1) {
      score += 0.2;
    } else if (hoursSinceActive <= 4) {
      score += 0.1;
    }
  } else {
    score += 0.1;
  }

  return Math.min(1.0, Math.max(0.0, score));
}

