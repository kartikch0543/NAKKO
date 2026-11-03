/**
 * NAKKO Backend - Worker Controller
 * Manages worker lifecycle, real-time availability & cooperative verification
 */

import { Worker, memoryWorkers } from './worker.model.js';
import mongoose from 'mongoose';

export async function getWorkers(req, res) {
  const { trade, available } = req.query;

  if (mongoose.connection.readyState === 1) {
    try {
      const query = {};
      if (trade) query.trade = new RegExp(trade, 'i');
      if (available !== undefined) query.isAvailable = available === 'true';

      const workers = await Worker.find(query);
      if (workers && workers.length > 0) {
        return res.json({ success: true, count: workers.length, data: workers });
      }
    } catch (err) {
      console.warn('[Worker Controller] Mongo query error, falling back:', err.message);
    }
  }

  // In-memory fallback
  let filtered = [...memoryWorkers];
  if (trade) {
    filtered = filtered.filter(w => w.trade.toLowerCase() === trade.toLowerCase());
  }
  if (available !== undefined) {
    const isAvail = available === 'true';
    filtered = filtered.filter(w => w.isAvailable === isAvail);
  }

  return res.json({
    success: true,
    count: filtered.length,
    data: filtered
  });
}

export async function getWorkerById(req, res) {
  const { id } = req.params;

  if (mongoose.connection.readyState === 1) {
    try {
      const worker = await Worker.findById(id);
      if (worker) return res.json({ success: true, data: worker });
    } catch (err) {
      // If not a valid ObjectId, search memory
    }
  }

  const worker = memoryWorkers.find(w => w.id === id || w._id === id);
  if (!worker) {
    return res.status(404).json({ success: false, message: `Worker with id ${id} not found.` });
  }

  return res.json({ success: true, data: worker });
}

export async function updateAvailability(req, res) {
  const { id } = req.params;
  const { isAvailable } = req.body;

  if (isAvailable === undefined) {
    return res.status(400).json({ success: false, message: 'Please provide isAvailable boolean.' });
  }

  const boolVal = Boolean(isAvailable);

  if (mongoose.connection.readyState === 1) {
    try {
      const updated = await Worker.findByIdAndUpdate(id, { isAvailable: boolVal }, { new: true });
      if (updated) {
        return res.json({ success: true, message: `Availability updated to ${boolVal}`, data: updated });
      }
    } catch (err) {
      // Fallback
    }
  }

  const worker = memoryWorkers.find(w => w.id === id || w._id === id);
  if (!worker) {
    return res.status(404).json({ success: false, message: `Worker ${id} not found.` });
  }

  worker.isAvailable = boolVal;

  return res.json({
    success: true,
    message: `Worker ${worker.name} availability updated to ${boolVal ? 'ACTIVE' : 'OFFLINE'}`,
    data: worker
  });
}

export async function updateKyc(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'verified', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid KYC status value.' });
  }

  const worker = memoryWorkers.find(w => w.id === id || w._id === id);
  if (worker) {
    worker.kycStatus = status;
  }

  return res.json({
    success: true,
    message: `Worker KYC status updated to ${status}`,
    data: worker
  });
}
