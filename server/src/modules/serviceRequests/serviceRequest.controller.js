/**
 * NAKKO Platform - Service Request Controller
 */

import { ServiceRequestService } from './serviceRequest.service.js';

export async function createBooking(req, res, next) {
  try {
    const { service, address, scheduledTime, notes, workerId, coordinates } = req.body;
    const clientId = req.user ? req.user.id : 'u-1';
    const clientName = req.user ? req.user.name : 'NAKKO Client';
    const clientPhone = req.user ? req.user.phone : '+91 98765 43210';

    const newBooking = await ServiceRequestService.createServiceRequest({
      clientId,
      clientName,
      clientPhone,
      address,
      service,
      scheduledTime,
      notes,
      workerId,
      coordinates
    });

    res.status(201).json({
      success: true,
      message: `${service} booking confirmed! Worker has been assigned.`,
      data: newBooking
    });
  } catch (err) {
    next(err);
  }
}

export async function getBookings(req, res, next) {
  try {
    const { status, role } = req.query;
    const userId = req.user ? req.user.id : null;
    const userRole = req.user ? (req.user.role === 'WORKER' ? 'worker' : 'user') : role;

    const list = await ServiceRequestService.getServiceRequests({
      status,
      role: userRole,
      userId
    });

    res.status(200).json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err) {
    next(err);
  }
}

export async function getBookingById(req, res, next) {
  try {
    const booking = await ServiceRequestService.getServiceRequestById(req.params.id);
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
}

export async function updateBookingStatus(req, res, next) {
  try {
    const { status, workerId } = req.body;
    const updated = await ServiceRequestService.updateStatus(req.params.id, status, workerId);
    res.status(200).json({
      success: true,
      message: `Booking #${req.params.id} updated to ${status}`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function declineBooking(req, res, next) {
  try {
    const { workerId } = req.body;
    const effectiveWorkerId = workerId || (req.user ? req.user.id : null);
    const updated = await ServiceRequestService.declineBooking(req.params.id, effectiveWorkerId);
    res.status(200).json({
      success: true,
      message: `Booking #${req.params.id} declined and rescheduled for reallocation.`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

