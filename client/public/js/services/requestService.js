/**
 * NAKKO Platform - Service & Request Service
 * Handles gig services catalog, booking requests, status updates, and tracking.
 */

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./apiClient'));
  } else {
    root.requestService = factory(root.apiClient);
  }
})(typeof self !== 'undefined' ? self : this, function(api) {
  'use strict';

  async function getServices() {
    return api.get('/services');
  }

  async function getBookings(filter = {}) {
    const query = new URLSearchParams();
    if (filter.status) query.append('status', filter.status);
    if (filter.role) query.append('role', filter.role);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return api.get(`/bookings${qs}`);
  }

  async function getBookingById(bookingId) {
    return api.get(`/bookings/${bookingId}`);
  }

  async function createBooking(bookingData) {
    return api.post('/bookings', bookingData);
  }

  async function updateBookingStatus(bookingId, status) {
    return api.patch(`/bookings/${bookingId}/status`, { status });
  }

  return {
    getServices,
    getBookings,
    getBookingById,
    createBooking,
    updateBookingStatus
  };
});
