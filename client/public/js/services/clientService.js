/**
 * NAKKO Platform - Client / User Service
 * Handles client-specific actions: profile management, service history, and payments.
 */

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./apiClient'));
  } else {
    root.clientService = factory(root.apiClient);
  }
})(typeof self !== 'undefined' ? self : this, function(api) {
  'use strict';

  async function getProfile() {
    return api.get('/auth/me');
  }

  async function updateProfile(profileData) {
    return api.patch('/auth/profile', profileData);
  }

  async function getPayments() {
    return api.get('/client/payments');
  }

  return {
    getProfile,
    updateProfile,
    getPayments
  };
});
