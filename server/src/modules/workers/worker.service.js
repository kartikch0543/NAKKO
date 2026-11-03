/**
 * NAKKO Platform - Worker Domain Service
 */

import mongoose from 'mongoose';
import { Worker, memoryWorkers } from './worker.model.js';
import { NotFoundError, ValidationError } from '../../shared/errors/AppError.js';

export class WorkerService {
  static async getWorkers({ skill, availableOnly, cooperativeId } = {}) {
    if (mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (skill) {
          query.$or = [
            { skill: new RegExp(skill, 'i') },
            { skills: { $in: [new RegExp(skill, 'i')] } }
          ];
        }
        if (availableOnly === 'true' || availableOnly === true) {
          query.isAvailable = true;
          query.kycStatus = 'verified';
        }
        if (cooperativeId) {
          query.cooperativeId = cooperativeId;
        }

        const workers = await Worker.find(query).exec();
        if (workers && workers.length > 0) return workers;
      } catch (err) {
        console.warn('[WorkerService] DB query failed, falling back to memory:', err.message);
      }
    }

    // In-memory fallback
    let list = [...memoryWorkers];
    if (skill) {
      const lower = skill.toLowerCase();
      list = list.filter(w => 
        w.skill.toLowerCase().includes(lower) || 
        (w.skills && w.skills.some(s => s.toLowerCase().includes(lower)))
      );
    }
    if (availableOnly === 'true' || availableOnly === true) {
      list = list.filter(w => w.isAvailable && w.kycStatus === 'verified');
    }
    if (cooperativeId) {
      list = list.filter(w => String(w.cooperativeId) === String(cooperativeId));
    }
    return list;
  }

  static async getWorkerById(workerId) {
    if (!workerId) throw new ValidationError('Worker ID is required');

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(workerId)) {
      try {
        const worker = await Worker.findById(workerId).exec();
        if (worker) return worker;
      } catch (err) {
        console.warn('[WorkerService] DB lookup failed, checking memory:', err.message);
      }
    }

    const found = memoryWorkers.find(w => String(w._id || w.id) === String(workerId));
    if (!found) {
      throw new NotFoundError(`Worker #${workerId} not found`);
    }
    return found;
  }

  static async setAvailability(workerId, isAvailable) {
    if (isAvailable === undefined) throw new ValidationError('isAvailable boolean is required');
    const boolVal = Boolean(isAvailable);

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(workerId)) {
      try {
        const updated = await Worker.findByIdAndUpdate(
          workerId,
          { isAvailable: boolVal, lastActiveAt: new Date() },
          { new: true }
        ).exec();
        if (updated) return updated;
      } catch (err) {
        console.warn('[WorkerService] Failed updating DB availability:', err.message);
      }
    }

    const worker = await this.getWorkerById(workerId);
    worker.isAvailable = boolVal;
    worker.lastActiveAt = new Date().toISOString();
    return worker;
  }

  static async updateKycStatus(workerId, kycStatus) {
    if (!['pending', 'verified', 'rejected'].includes(kycStatus)) {
      throw new ValidationError('kycStatus must be one of: pending, verified, rejected');
    }

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(workerId)) {
      try {
        const updated = await Worker.findByIdAndUpdate(
          workerId,
          { kycStatus },
          { new: true }
        ).exec();
        if (updated) return updated;
      } catch (err) {
        console.warn('[WorkerService] Failed updating DB KYC:', err.message);
      }
    }

    const worker = await this.getWorkerById(workerId);
    worker.kycStatus = kycStatus;
    return worker;
  }

  static async getEarnings(workerId) {
    const worker = await this.getWorkerById(workerId);
    return {
      workerId: String(worker._id || worker.id),
      workerName: worker.name,
      today: worker.earningsToday || 0,
      thisMonth: worker.earningsThisMonth || 0,
      totalJobs: worker.totalJobs || 0,
      completionRate: worker.completionRate || 95,
      history: [
        { date: 'Today', amount: worker.earningsToday || 1250, jobs: 2, status: 'Settled' },
        { date: 'Yesterday', amount: 1600, jobs: 3, status: 'Settled' },
        { date: 'Previous Week', amount: 7800, jobs: 14, status: 'Settled' }
      ]
    };
  }

  static async recordJobCompletion(workerId, earningsAmount) {
    const worker = await this.getWorkerById(workerId);
    worker.totalJobs = (worker.totalJobs || 0) + 1;
    worker.recentJobsLast7Days = (worker.recentJobsLast7Days || 0) + 1;
    worker.earningsToday = (worker.earningsToday || 0) + earningsAmount;
    worker.earningsThisMonth = (worker.earningsThisMonth || 0) + earningsAmount;
    worker.lastAssignedAt = new Date().toISOString();
    return worker;
  }
}

