/**
 * NAKKO Platform - Worker Controller
 */

import { WorkerService } from './worker.service.js';

export async function getWorkers(req, res, next) {
  try {
    const { skill, availableOnly, cooperativeId } = req.query;
    const workers = await WorkerService.getWorkers({ skill, availableOnly, cooperativeId });
    res.status(200).json({
      success: true,
      count: workers.length,
      data: workers
    });
  } catch (err) {
    next(err);
  }
}

export async function getWorkerById(req, res, next) {
  try {
    const worker = await WorkerService.getWorkerById(req.params.id);
    res.status(200).json({
      success: true,
      data: worker
    });
  } catch (err) {
    next(err);
  }
}

export async function setAvailability(req, res, next) {
  try {
    const { isAvailable } = req.body;
    const updated = await WorkerService.setAvailability(req.params.id, isAvailable);
    res.status(200).json({
      success: true,
      message: `Availability updated: ${isAvailable ? 'Online' : 'Offline'}`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function updateKycStatus(req, res, next) {
  try {
    const { kycStatus } = req.body;
    const updated = await WorkerService.updateKycStatus(req.params.id, kycStatus);
    res.status(200).json({
      success: true,
      message: `Worker KYC status updated to ${kycStatus}`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

export async function getEarnings(req, res, next) {
  try {
    const earnings = await WorkerService.getEarnings(req.params.id);
    res.status(200).json({
      success: true,
      data: earnings
    });
  } catch (err) {
    next(err);
  }
}
