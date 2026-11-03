/**
 * NAKKO Platform - Developer & Admin API Routes
 */

'use strict';

const express = require('express');
const router = express.Router();
const store = require('../data/store');

// GET /api/dev/metrics - Platform performance & system metrics
router.get('/metrics', (req, res) => {
  res.json({
    success: true,
    data: store.getMetrics()
  });
});

// GET /api/dev/logs - System log stream
router.get('/logs', (req, res) => {
  const { level } = req.query;
  let logs = store.getLogs();
  if (level && level !== 'ALL') {
    logs = logs.filter(l => l.level === level.toUpperCase());
  }
  res.json({
    success: true,
    count: logs.length,
    data: logs
  });
});

// GET /api/dev/config - Get platform settings
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: store.getConfig()
  });
});

// POST /api/dev/config - Update platform settings
router.post('/config', (req, res) => {
  const updated = store.updateConfig(req.body);
  store.addLog('INFO', `Platform configuration updated by admin: ${JSON.stringify(req.body)}`);
  res.json({
    success: true,
    message: 'Configuration successfully updated',
    data: updated
  });
});

module.exports = router;

