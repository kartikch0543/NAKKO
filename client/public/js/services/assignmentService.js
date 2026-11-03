/**
 * NAKKO Platform - Cooperative Assignment Service
 * Handles matching daily-wage workers with service opportunities and status transitions.
 */

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./apiClient'));
  } else {
    root.assignmentService = factory(root.apiClient);
  }
})(typeof self !== 'undefined' ? self : this, function(api) {
  'use strict';

  async function findEligibleWorkers(service, location) {
    return api.get(`/workers?skill=${encodeURIComponent(service)}&availableOnly=true`);
  }

  async function acceptJob(bookingId, workerId) {
    return api.patch(`/bookings/${bookingId}/status`, {
      status: 'accepted',
      workerId
    });
  }

  async function declineJob(bookingId, workerId) {
    return api.patch(`/bookings/${bookingId}/decline`, {
      workerId
    });
  }

  return {
    findEligibleWorkers,
    acceptJob,
    declineJob
  };
});

