/**
 * NAKKO Platform - Worker API Routes
 */

'use strict';

const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET /api/workers - List workers with optional skill filter
router.get('/workers', (req, res) => {
  const { skill, availableOnly } = req.query;
  let workers = store.getWorkers(skill);
  if (availableOnly === 'true') {
    workers = workers.filter(w => w.isAvailable);
  }
  res.json({
    success: true,
    count: workers.length,
    data: workers
  });
});

// GET /api/workers/:id - Single worker details
router.get('/workers/:id', (req, res) => {
  const worker = store.getWorkerById(req.params.id);
  if (!worker) {
    return res.status(404).json({ success: false, message: 'Worker not found' });
  }
  res.json({
    success: true,
    data: worker
  });
});

// PATCH /api/workers/:id/availability - Toggle worker online/offline
router.patch('/workers/:id/availability', (req, res) => {
  const { isAvailable } = req.body;
  if (isAvailable === undefined) {
    return res.status(400).json({ success: false, message: 'isAvailable boolean is required' });
  }

  const updated = store.setWorkerAvailability(req.params.id, isAvailable);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Worker not found' });
  }

  store.addLog('INFO', `Worker ${updated.name} is now ${isAvailable ? '🟢 Online/Available' : '🔴 Offline'}`);

  res.json({
    success: true,
    message: `Availability updated: ${isAvailable ? 'Online' : 'Offline'}`,
    data: updated
  });
});

module.exports = router;

