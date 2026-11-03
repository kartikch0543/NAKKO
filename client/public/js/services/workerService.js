/**
 * NAKKO Platform - Worker Service
 * Handles worker trade management, availability states, and earnings history.
 */

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./apiClient'));
  } else {
    root.workerService = factory(root.apiClient);
  }
})(typeof self !== 'undefined' ? self : this, function(api) {
  'use strict';

  async function getWorkers(params = {}) {
    const query = new URLSearchParams();
    if (params.skill) query.append('skill', params.skill);
    if (params.availableOnly) query.append('availableOnly', 'true');
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/workers${qs}`);
  }

  async function getWorkerById(workerId) {
    return api.get(`/workers/${workerId}`);
  }

  async function setAvailability(workerId, isAvailable) {
    return api.patch(`/workers/${workerId}/availability`, { isAvailable: Boolean(isAvailable) });
  }

  async function getEarnings(workerId) {
    return api.get(`/workers/${workerId}/earnings`);
  }

  return {
    getWorkers,
    getWorkerById,
    setAvailability,
    getEarnings
  };
});

