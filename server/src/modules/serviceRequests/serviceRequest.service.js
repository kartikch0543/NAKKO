/**
 * NAKKO Platform - Service Request Business Logic Service
 * Powers booking lifecycle and connects to the Dynamic Search Space Reduction engine
 */

import mongoose from 'mongoose';
import { ServiceRequest, memoryBookings } from './serviceRequest.model.js';
import { AssignmentEngine } from '../../core/matching/assignmentEngine.js';
import { WorkerService } from '../workers/worker.service.js';
import { NotFoundError, ValidationError, StateTransitionError } from '../../shared/errors/AppError.js';
import { SERVICE_STATUS } from '../../shared/constants/status.js';

export class ServiceRequestService {
  /**
   * Creates a service request and assigns the best worker via Dynamic Search Space Reduction
   */
  static async createServiceRequest({
    clientId,
    clientName,
    clientPhone,
    address,
    service,
    scheduledTime,
    notes,
    workerId,
    coordinates
  }) {
    if (!service) {
      throw new ValidationError('Service category is required.');
    }

    const bookingId = `NK-${String(Date.now()).slice(-4)}`;
    let assignedWorker = null;

    // 1. If explicit workerId requested, verify worker
    if (workerId) {
      try {
        assignedWorker = await WorkerService.getWorkerById(workerId);
      } catch (e) {
        console.warn(`[ServiceRequestService] Explicit worker #${workerId} not found, matching automatically.`);
      }
    }

    // 2. If not pre-assigned, execute Innovation 1: Dynamic Search Space Reduction
    if (!assignedWorker) {
      try {
        const matchResult = await AssignmentEngine.matchWorkerForRequest({
          service,
          coordinates: coordinates || [77.3910, 28.5355]
        });
        assignedWorker = matchResult.selectedWorker;
      } catch (err) {
        console.warn('[ServiceRequestService] Matching notice:', err.message);
        // Fallback to first available worker in service
        const fallbacks = await WorkerService.getWorkers({ skill: service, availableOnly: true });
        assignedWorker = fallbacks[0] || null;
      }
    }

    const workerName = assignedWorker ? assignedWorker.name : 'Cooperative Specialist';
    const eta = assignedWorker ? (assignedWorker.etaMinutes || 15) : 15;

    const trackingSteps = [
      { label: 'Booking Confirmed', done: true, time: 'Just now' },
      { label: `Worker Assigned (${workerName})`, done: true, time: 'Just now' },
      { label: `On the Way (${eta} min away)`, done: true, time: `${eta} min` },
      { label: 'Work in Progress', done: false, time: 'Pending' },
      { label: 'Completed & Payment Released', done: false, time: 'Pending' }
    ];

    const newBooking = {
      id: bookingId,
      _id: bookingId,
      bookingNumber: bookingId,
      userId: clientId || 'u-1',
      clientId: clientId || 'u-1',
      userName: clientName || 'NAKKO Client',
      clientName: clientName || 'NAKKO Client',
      userPhone: clientPhone || '+91 98765 43210',
      clientPhone: clientPhone || '+91 98765 43210',
      userAddress: address || 'Noida, Sector 12',
      clientAddress: address || 'Noida, Sector 12',
      service,
      workerId: assignedWorker ? String(assignedWorker._id || assignedWorker.id) : null,
      workerName: assignedWorker ? assignedWorker.name : null,
      workerPhone: assignedWorker ? assignedWorker.phone : null,
      status: 'assigned', // frontend uses lowercase 'assigned'
      amount: 350,
      scheduledTime: scheduledTime || 'Today, 2:30 PM',
      date: 'Today, Just now',
      notes: notes || '',
      trackingSteps,
      createdAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await ServiceRequest.create(newBooking);
      } catch (e) {
        console.warn('[ServiceRequestService] DB insert failed, storing in memory:', e.message);
      }
    }

    memoryBookings.unshift(newBooking);
    return newBooking;
  }

  static async getServiceRequests({ status, role, userId } = {}) {
    let list = [...memoryBookings];

    if (status) {
      list = list.filter(b => b.status.toLowerCase() === status.toLowerCase());
    }

    if (role === 'worker' && userId) {
      list = list.filter(b => String(b.workerId) === String(userId));
    } else if (role === 'user' && userId) {
      list = list.filter(b => String(b.userId || b.clientId) === String(userId));
    }

    return list;
  }

  static async getServiceRequestById(id) {
    if (!id) throw new ValidationError('Booking ID is required');

    if (mongoose.connection.readyState === 1) {
      try {
        const found = await ServiceRequest.findOne({
          $or: [{ bookingNumber: id }, { _id: mongoose.isValidObjectId(id) ? id : null }]
        }).exec();
        if (found) return found;
      } catch (e) {
        console.warn('[ServiceRequestService] DB find failed, checking memory:', e.message);
      }
    }

    const booking = memoryBookings.find(b => b.id === id || b._id === id || b.bookingNumber === id);
    if (!booking) {
      throw new NotFoundError(`Booking #${id} not found.`);
    }
    return booking;
  }

  static async updateStatus(id, newStatus, workerId = null) {
    const booking = await this.getServiceRequestById(id);
    const normalizedStatus = String(newStatus).toLowerCase();

    const allowedTransitions = {
      'requested': ['assigned', 'cancelled'],
      'assigned': ['accepted', 'in_progress', 'cancelled', 'declined'],
      'accepted': ['in_progress', 'cancelled'],
      'in_progress': ['completed', 'cancelled', 'failed'],
      'completed': [],
      'cancelled': [],
      'failed': []
    };

    const currentStatus = booking.status.toLowerCase();
    const validTargets = allowedTransitions[currentStatus] || ['assigned', 'accepted', 'in_progress', 'completed', 'cancelled'];

    if (!validTargets.includes(normalizedStatus) && normalizedStatus !== currentStatus) {
      throw new StateTransitionError(`Cannot transition booking from '${currentStatus}' to '${normalizedStatus}'.`);
    }

    booking.status = normalizedStatus;

    if (workerId && !booking.workerId) {
      booking.workerId = workerId;
    }

    // Update tracking steps progress
    if (booking.trackingSteps) {
      if (['accepted', 'in_progress'].includes(normalizedStatus)) {
        booking.trackingSteps[2].done = true;
        booking.trackingSteps[3].done = true;
      }
      if (normalizedStatus === 'completed') {
        booking.trackingSteps.forEach(s => { s.done = true; });
        booking.trackingSteps[4].time = 'Completed';
        
        // Update worker earnings if worker assigned
        if (booking.workerId) {
          await WorkerService.recordJobCompletion(booking.workerId, booking.amount || 350);
        }
      }
    }

    return booking;
  }

  static async declineBooking(id, workerId) {
    const booking = await this.getServiceRequestById(id);
    
    // Reallocate to a different available worker using Dynamic Search Space Reduction
    const eligibleWorkers = await WorkerService.getWorkers({
      skill: booking.service,
      availableOnly: true
    });

    const alternate = eligibleWorkers.find(w => String(w._id || w.id) !== String(workerId));
    if (alternate) {
      booking.workerId = String(alternate._id || alternate.id);
      booking.workerName = alternate.name;
      booking.workerPhone = alternate.phone;
      booking.status = 'assigned';
      if (booking.trackingSteps) {
        booking.trackingSteps[1].label = `Worker Reassigned (${alternate.name})`;
      }
    } else {
      booking.status = 'searching';
      booking.workerId = null;
      booking.workerName = null;
    }

    return booking;
  }
}

